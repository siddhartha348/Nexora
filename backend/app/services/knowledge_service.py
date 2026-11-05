import os
import uuid
import shutil
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from fastapi import UploadFile, HTTPException, status
from app.db.mongo import db_manager
from app.db.chroma import chroma_manager
from app.services.document_parser import DocumentParser
from app.core.audit import log_audit_event
from app.models.knowledge import (
    DocumentCategory,
    ApprovalStatus,
    ExtractedFact,
    DocumentVersionResponse,
    KnowledgeDocumentResponse,
    DocumentDetailResponse,
    VersionDiffResponse,
    KnowledgeSearchResult
)

ALLOWED_EXTENSIONS = {"pdf", "docx", "doc", "pptx", "ppt", "txt", "md", "png", "jpg", "jpeg"}
MAX_FILE_SIZE = 25 * 1024 * 1024  # 25 MB

class KnowledgeService:
    @staticmethod
    def _sanitize_filename(filename: str) -> str:
        # Strip directory path separators to prevent path traversal
        clean = os.path.basename(filename)
        return "".join(c for c in clean if c.isalnum() or c in "._- ")

    @staticmethod
    async def upload_document(
        file: UploadFile,
        title: str,
        category: DocumentCategory,
        org_id: str,
        user_id: str,
        user_name: str,
        product_association: Optional[str] = None,
        effective_date: Optional[str] = None,
        version_tag: Optional[str] = None,
        existing_doc_id: Optional[str] = None
    ) -> KnowledgeDocumentResponse:
        filename = KnowledgeService._sanitize_filename(file.filename or "uploaded_doc")
        ext = filename.split(".")[-1].lower() if "." in filename else ""

        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file format '.{ext}'. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
            )

        # Tenant-isolated secure storage path
        storage_dir = os.path.join(".", "data", "uploads", org_id)
        os.makedirs(storage_dir, exist_ok=True)
        unique_file_id = f"{uuid.uuid4().hex}_{filename}"
        file_path = os.path.join(storage_dir, unique_file_id)

        # Write file securely to disk with size check
        total_size = 0
        with open(file_path, "wb") as buffer:
            while chunk := await file.read(1024 * 64):
                total_size += len(chunk)
                if total_size > MAX_FILE_SIZE:
                    buffer.close()
                    os.remove(file_path)
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail="Uploaded file exceeds the maximum 25MB limit."
                    )
                buffer.write(chunk)

        # Process document through extraction engine
        try:
            pages = DocumentParser.extract_text_from_file(file_path, ext)
            raw_text = "\n\n".join([f"--- Page {p['page_number']} ---\n{p['text']}" for p in pages])
            facts = DocumentParser.extract_candidate_facts(pages, category.value)
        except Exception as e:
            if os.path.exists(file_path):
                os.remove(file_path)
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Failed to extract document contents: {str(e)}"
            )

        db = db_manager.get_db()
        now_iso = datetime.now(timezone.utc).isoformat()
        eff_date = effective_date or now_iso

        # Determine if this is a new document or a new version of an existing document
        if existing_doc_id:
            existing_doc = await db["documents"].find_one({"_id": existing_doc_id, "organization_id": org_id})
            if not existing_doc:
                raise HTTPException(status_code=404, detail="Target document for new version not found.")
            doc_id = existing_doc["_id"]
            title = existing_doc["title"]
            category = DocumentCategory(existing_doc["category"])
            product_association = product_association or existing_doc.get("product_association")

            # Determine next version tag (e.g. v1.1 -> v1.2)
            cur_v = existing_doc.get("current_version", "v1.0")
            try:
                major, minor = cur_v.replace("v", "").split(".")
                computed_version = f"v{major}.{int(minor) + 1}"
            except Exception:
                computed_version = f"v{uuid.uuid4().hex[:4]}"
            final_version_tag = version_tag or computed_version
        else:
            doc_id = str(uuid.uuid4())
            final_version_tag = version_tag or "v1.0"

        version_id = str(uuid.uuid4())

        # Generate text chunks retaining exact document and version metadata
        chunks = DocumentParser.chunk_text(
            pages=pages,
            document_id=doc_id,
            version_id=version_id,
            category=category.value
        )

        # Store version record
        version_doc = {
            "_id": version_id,
            "document_id": doc_id,
            "organization_id": org_id,
            "version_tag": final_version_tag,
            "file_path": file_path,
            "file_type": ext,
            "file_size_bytes": total_size,
            "uploaded_by": user_id,
            "uploaded_by_name": user_name,
            "uploaded_at": now_iso,
            "effective_date": eff_date,
            "approval_status": ApprovalStatus.PENDING.value, # Initially PENDING / UNAPPROVED
            "approved_by": None,
            "approved_at": None,
            "rejection_reason": None,
            "extracted_text": raw_text,
            "facts": facts,
            "chunks": chunks
        }
        await db["document_versions"].insert_one(version_doc)

        # Store granular facts in knowledge_facts collection
        for f in facts:
            fact_doc = {
                "_id": f["id"],
                "organization_id": org_id,
                "document_id": doc_id,
                "version_id": version_id,
                "version_tag": final_version_tag,
                "subject": f["subject"],
                "predicate": f["predicate"],
                "object_value": f["object_value"],
                "unit": f.get("unit"),
                "page_number": f["page_number"],
                "verbatim_quote": f["verbatim_quote"],
                "category": category.value,
                "is_approved": False, # Enforced false until admin approves
                "created_at": now_iso
            }
            await db["knowledge_facts"].insert_one(fact_doc)

        # Insert or update root document record
        if existing_doc_id:
            await db["documents"].update_one(
                {"_id": doc_id},
                {
                    "$set": {
                        "current_version": final_version_tag,
                        "approval_status": ApprovalStatus.PENDING.value,
                        "updated_at": now_iso
                    }
                }
            )
        else:
            doc_record = {
                "_id": doc_id,
                "organization_id": org_id,
                "title": title.strip(),
                "category": category.value,
                "product_association": product_association.strip() if product_association else None,
                "current_version": final_version_tag,
                "approval_status": ApprovalStatus.PENDING.value,
                "uploaded_by": user_id,
                "uploaded_by_name": user_name,
                "uploaded_at": now_iso,
                "effective_date": eff_date,
                "file_type": ext,
                "file_size_bytes": total_size
            }
            await db["documents"].insert_one(doc_record)

        # Log audit trail
        await log_audit_event(
            action="DOCUMENT_UPLOADED",
            org_id=org_id,
            user_id=user_id,
            resource_type="KNOWLEDGE_DOCUMENT",
            resource_id=doc_id,
            details={
                "title": title,
                "version": final_version_tag,
                "facts_count": len(facts),
                "chunks_count": len(chunks)
            }
        )

        return await KnowledgeService.get_document(doc_id, org_id)

    @staticmethod
    async def approve_document(
        doc_id: str,
        org_id: str,
        admin_id: str,
        admin_name: str,
        notes: Optional[str] = None
    ) -> KnowledgeDocumentResponse:
        """
        ADMIN APPROVAL GATE:
        1. Validates document exists in organisation.
        2. Sets document & current version to APPROVED.
        3. Archives previous versions.
        4. Indexes approved chunks into ChromaDB for RAG.
        5. Updates knowledge_facts is_approved=True.
        """
        db = db_manager.get_db()
        doc = await db["documents"].find_one({"_id": doc_id, "organization_id": org_id})
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found.")

        # Find current version record
        version_doc = await db["document_versions"].find_one({
            "document_id": doc_id,
            "version_tag": doc["current_version"]
        })
        if not version_doc:
            raise HTTPException(status_code=404, detail="Current document version record not found.")

        now_iso = datetime.now(timezone.utc).isoformat()

        # Archive any older versions
        await db["document_versions"].update_one(
            {
                "document_id": doc_id,
                "_id": {"$ne": version_doc["_id"]},
                "approval_status": ApprovalStatus.APPROVED.value
            },
            {"$set": {"approval_status": ApprovalStatus.ARCHIVED.value}}
        )

        # Approve version
        await db["document_versions"].update_one(
            {"_id": version_doc["_id"]},
            {
                "$set": {
                    "approval_status": ApprovalStatus.APPROVED.value,
                    "approved_by": admin_id,
                    "approved_at": now_iso
                }
            }
        )

        # Update root document
        await db["documents"].update_one(
            {"_id": doc_id},
            {
                "$set": {
                    "approval_status": ApprovalStatus.APPROVED.value,
                    "approved_by": admin_id,
                    "approved_at": now_iso
                }
            }
        )

        # Update facts to approved
        await db["knowledge_facts"].update_one(
            {"version_id": version_doc["_id"]},
            {"$set": {"is_approved": True}}
        )

        # RAG Ingestion: Index approved chunks into ChromaDB
        chunks = version_doc.get("chunks", [])
        chroma_manager.index_approved_chunks(
            org_id=org_id,
            document_id=doc_id,
            document_title=doc["title"],
            version_tag=doc["current_version"],
            chunks=chunks
        )

        # Log audit event
        await log_audit_event(
            action="DOCUMENT_APPROVED",
            org_id=org_id,
            user_id=admin_id,
            resource_type="KNOWLEDGE_DOCUMENT",
            resource_id=doc_id,
            details={"version": doc["current_version"], "indexed_chunks": len(chunks), "notes": notes}
        )

        return await KnowledgeService.get_document(doc_id, org_id)

    @staticmethod
    async def reject_document(
        doc_id: str,
        org_id: str,
        admin_id: str,
        reason: str
    ) -> KnowledgeDocumentResponse:
        db = db_manager.get_db()
        doc = await db["documents"].find_one({"_id": doc_id, "organization_id": org_id})
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found.")

        now_iso = datetime.now(timezone.utc).isoformat()

        await db["documents"].update_one(
            {"_id": doc_id},
            {"$set": {"approval_status": ApprovalStatus.REJECTED.value}}
        )

        await db["document_versions"].update_one(
            {"document_id": doc_id, "version_tag": doc["current_version"]},
            {
                "$set": {
                    "approval_status": ApprovalStatus.REJECTED.value,
                    "rejection_reason": reason,
                    "rejected_by": admin_id,
                    "rejected_at": now_iso
                }
            }
        )

        # Ensure no unapproved chunks remain in vector store
        chroma_manager.remove_document_chunks(org_id, doc_id)

        await log_audit_event(
            action="DOCUMENT_REJECTED",
            org_id=org_id,
            user_id=admin_id,
            resource_type="KNOWLEDGE_DOCUMENT",
            resource_id=doc_id,
            details={"reason": reason}
        )

        return await KnowledgeService.get_document(doc_id, org_id)

    @staticmethod
    async def get_document(doc_id: str, org_id: str) -> KnowledgeDocumentResponse:
        db = db_manager.get_db()
        doc = await db["documents"].find_one({"_id": doc_id, "organization_id": org_id})
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found in organisation.")

        # Fetch versions
        versions_cursor = db["document_versions"].find({"document_id": doc_id})
        raw_versions = await versions_cursor.to_list(50)
        
        version_objs = [
            DocumentVersionResponse(
                version_id=v["_id"],
                version_tag=v["version_tag"],
                uploaded_by=v["uploaded_by"],
                uploaded_by_name=v.get("uploaded_by_name", "Staff"),
                uploaded_at=v["uploaded_at"],
                effective_date=v.get("effective_date", v["uploaded_at"]),
                approval_status=ApprovalStatus(v["approval_status"]),
                approved_by=v.get("approved_by"),
                approved_at=v.get("approved_at"),
                rejection_reason=v.get("rejection_reason"),
                change_summary=v.get("change_summary"),
                extracted_facts_count=len(v.get("facts", [])),
                chunks_count=len(v.get("chunks", []))
            )
            for v in raw_versions
        ]

        return KnowledgeDocumentResponse(
            id=doc["_id"],
            organization_id=doc["organization_id"],
            title=doc["title"],
            category=DocumentCategory(doc["category"]),
            product_association=doc.get("product_association"),
            current_version=doc["current_version"],
            approval_status=ApprovalStatus(doc["approval_status"]),
            uploaded_by=doc["uploaded_by"],
            uploaded_by_name=doc.get("uploaded_by_name", "Staff"),
            uploaded_at=doc["uploaded_at"],
            effective_date=doc.get("effective_date", doc["uploaded_at"]),
            file_type=doc["file_type"],
            file_size_bytes=doc["file_size_bytes"],
            versions=version_objs
        )

    @staticmethod
    async def get_document_detail(doc_id: str, org_id: str) -> DocumentDetailResponse:
        base_doc = await KnowledgeService.get_document(doc_id, org_id)
        db = db_manager.get_db()
        
        current_version_doc = await db["document_versions"].find_one({
            "document_id": doc_id,
            "version_tag": base_doc.current_version
        })

        preview_text = current_version_doc.get("extracted_text", "")[:2500] if current_version_doc else ""
        raw_facts = current_version_doc.get("facts", []) if current_version_doc else []

        facts_list = [
            ExtractedFact(
                id=f["id"],
                subject=f["subject"],
                predicate=f["predicate"],
                object_value=f["object_value"],
                unit=f.get("unit"),
                page_number=f["page_number"],
                verbatim_quote=f["verbatim_quote"],
                category=f["category"]
            )
            for f in raw_facts
        ]

        return DocumentDetailResponse(
            **base_doc.model_dump(),
            extracted_text_preview=preview_text,
            extracted_facts=facts_list
        )

    @staticmethod
    async def list_documents(
        org_id: str,
        category: Optional[DocumentCategory] = None,
        status_filter: Optional[ApprovalStatus] = None,
        product: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[KnowledgeDocumentResponse]:
        db = db_manager.get_db()
        filter_dict: Dict[str, Any] = {"organization_id": org_id}

        if category:
            filter_dict["category"] = category.value
        if status_filter:
            filter_dict["approval_status"] = status_filter.value
        if product:
            filter_dict["product_association"] = product

        cursor = db["documents"].find(filter_dict)
        docs = await cursor.to_list(100)

        results = []
        for d in docs:
            if search and search.lower() not in d["title"].lower():
                continue
            res = await KnowledgeService.get_document(d["_id"], org_id)
            results.append(res)
        return results

    @staticmethod
    async def compare_versions(
        doc_id: str,
        org_id: str,
        v_old_tag: str,
        v_new_tag: str
    ) -> VersionDiffResponse:
        """
        Calculates factual and textual delta between two document versions.
        Used by the Advertisement Recall Engine and Admin review UI.
        """
        db = db_manager.get_db()
        doc = await db["documents"].find_one({"_id": doc_id, "organization_id": org_id})
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found.")

        v_old = await db["document_versions"].find_one({"document_id": doc_id, "version_tag": v_old_tag})
        v_new = await db["document_versions"].find_one({"document_id": doc_id, "version_tag": v_new_tag})

        if not v_old or not v_new:
            raise HTTPException(status_code=404, detail="One or both version tags not found.")

        old_facts = v_old.get("facts", [])
        new_facts = v_new.get("facts", [])

        # Match facts by (subject, predicate) to detect modified values
        old_map = {(f["subject"], f["predicate"]): f for f in old_facts}
        new_map = {(f["subject"], f["predicate"]): f for f in new_facts}

        modified = []
        added = []
        removed = []

        for key, n_fact in new_map.items():
            if key in old_map:
                o_fact = old_map[key]
                if o_fact["object_value"] != n_fact["object_value"]:
                    modified.append({
                        "subject": key[0],
                        "predicate": key[1],
                        "old_value": o_fact["object_value"],
                        "new_value": n_fact["object_value"],
                        "old_quote": o_fact["verbatim_quote"],
                        "new_quote": n_fact["verbatim_quote"],
                        "page": n_fact["page_number"]
                    })
            else:
                added.append({
                    "subject": key[0],
                    "predicate": key[1],
                    "value": n_fact["object_value"],
                    "quote": n_fact["verbatim_quote"]
                })

        for key, o_fact in old_map.items():
            if key not in new_map:
                removed.append({
                    "subject": key[0],
                    "predicate": key[1],
                    "old_value": o_fact["object_value"]
                })

        summary = f"Detected {len(modified)} modified specifications, {len(added)} newly added facts, and {len(removed)} retired terms between {v_old_tag} and {v_new_tag}."

        return VersionDiffResponse(
            document_id=doc_id,
            document_title=doc["title"],
            old_version=v_old_tag,
            new_version=v_new_tag,
            modified_facts=modified,
            added_facts=added,
            removed_facts=removed,
            text_diff_summary=summary
        )

    @staticmethod
    async def search_approved_knowledge(
        org_id: str,
        query: str,
        category: Optional[DocumentCategory] = None,
        limit: int = 5
    ) -> List[KnowledgeSearchResult]:
        """
        RAG RETRIEVAL GATE:
        Queries ChromaDB for approved chunks. If vector DB has no matches or offline,
        performs hybrid exact fact matching in MongoDB knowledge_facts.
        """
        cat_str = category.value if category else None
        vector_results = chroma_manager.query_approved_knowledge(
            org_id=org_id,
            query_text=query,
            n_results=limit,
            category=cat_str
        )

        results = []
        for r in vector_results:
            results.append(KnowledgeSearchResult(
                chunk_id=r["chunk_id"],
                document_id=r["document_id"],
                document_title=r["document_title"],
                version_tag=r["version_tag"],
                page_number=r["page_number"],
                category=r["category"],
                content=r["content"],
                score=r["score"],
                is_approved=True
            ))

        # Hybrid exact fact matching in approved MongoDB knowledge_facts
        db = db_manager.get_db()
        exact_filter = {"organization_id": org_id, "is_approved": True}
        if cat_str:
            exact_filter["category"] = cat_str
        
        # Query words
        query_words = [w.lower() for w in query.split() if len(w) > 3]
        if query_words:
            facts_cursor = db["knowledge_facts"].find(exact_filter)
            facts = await facts_cursor.to_list(100)
            for f in facts:
                # If fact subject, predicate or value matches query words
                fact_text = f"{f.get('subject', '')} {f.get('predicate', '')} {f.get('object_value', '')}".lower()
                if any(qw in fact_text for qw in query_words):
                    results.append(KnowledgeSearchResult(
                        chunk_id=f["_id"],
                        document_id=f["document_id"],
                        document_title="Verified Fact Registry",
                        version_tag=f.get("version_tag", "v1.0"),
                        page_number=f["page_number"],
                        category=f["category"],
                        content=f"{f['subject']} - {f['predicate']}: {f['object_value']} (Source quote: {f['verbatim_quote']})",
                        score=0.99,
                        is_approved=True
                    ))

        return results[:limit]
