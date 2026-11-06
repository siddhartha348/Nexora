import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from fastapi import HTTPException, status

from app.db.mongo import db_manager
from app.core.audit import log_audit_event
from app.models.auth import UserProfileResponse, UserRole
from app.models.review import (
    AdvertisementReview,
    FindingResolution,
    FindingDecisionType,
    ReviewDecisionStatus,
    ReviewComment,
    ResolveFindingRequest,
    FinalizeReviewRequest,
    BrandMemoryEntry
)

class ReviewService:
    @staticmethod
    async def get_or_create_review(
        advertisement_id: str,
        organization_id: str,
        user: UserProfileResponse
    ) -> Dict[str, Any]:
        db = db_manager.get_db()

        # Check for existing review
        existing = await db["advertisement_reviews"].find_one({
            "advertisement_id": advertisement_id,
            "organization_id": organization_id
        })
        if existing:
            # Also attach report details for UI rendering
            report = await db["consolidated_reports"].find_one({
                "advertisement_id": advertisement_id
            })
            existing["report"] = report
            return existing

        # Locate advertisement
        ad = await db["advertisements"].find_one({
            "id": advertisement_id,
            "organization_id": organization_id
        })
        if not ad:
            # Check advertisement jobs if advertisement document isn't standalone yet
            job = await db["advertisement_jobs"].find_one({
                "advertisement_id": advertisement_id,
                "organization_id": organization_id
            })
            if not job:
                # Also try matching by job id directly
                job = await db["advertisement_jobs"].find_one({
                    "id": advertisement_id,
                    "organization_id": organization_id
                })
            if not job:
                raise HTTPException(status_code=404, detail="Advertisement creative not found")
            ad = {
                "id": job.get("advertisement_id", job["id"]),
                "organization_id": organization_id,
                "title": job["title"],
                "report_id": job.get("report_id") or (job.get("report", {}).get("report_id") if isinstance(job.get("report"), dict) else None),
                "extracted_data": job.get("extracted_data", {})
            }

        # Locate report
        report_id = ad.get("report_id")
        report = None
        if report_id:
            report = await db["consolidated_reports"].find_one({"report_id": report_id}) or \
                     await db["advertisement_reports"].find_one({"report_id": report_id})
        if not report:
            report = await db["consolidated_reports"].find_one({"advertisement_id": ad["id"]}) or \
                     await db["advertisement_reports"].find_one({"advertisement_id": ad["id"]})

        # If report still not found, check if background job is still processing and await completion
        if not report:
            from app.services.ad_service import AdvertisementService
            job = await db["advertisement_jobs"].find_one({"id": ad["id"]})
            if job:
                await AdvertisementService.process_job(job["id"], organization_id)
                report = await db["consolidated_reports"].find_one({"advertisement_id": ad["id"]}) or \
                         await db["advertisement_reports"].find_one({"advertisement_id": ad["id"]})
                if report:
                    ad["report_id"] = report.get("report_id")

        if not report:
            raise HTTPException(
                status_code=400, 
                detail="Consolidated report not yet generated for this advertisement. Run analysis first."
            )

        # Extract text content (from extracted_data or reconstructed from findings)
        extracted = ad.get("extracted_data") or {}
        original_text = extracted.get("raw_text") or extracted.get("text") or ""
        if not original_text and "findings" in report:
            # Assemble text summary from candidate findings if raw text wasn't recorded
            original_text = "\n\n".join([f["original_claim"] for f in report.get("findings", []) if f.get("original_claim")])

        if not original_text:
            original_text = f"Advertisement: {ad.get('title', 'Creative Asset')}"

        # Initialize pending resolutions for every finding
        resolutions = {}
        for finding in report.get("findings", []):
            f_id = finding.get("id")
            if f_id:
                resolutions[f_id] = {
                    "finding_id": f_id,
                    "decision": FindingDecisionType.PENDING.value,
                    "custom_replacement": None,
                    "reviewer_comment": None,
                    "reviewed_by": None,
                    "reviewed_by_name": None,
                    "reviewed_at": None
                }

        now = datetime.now(timezone.utc).isoformat()
        review_id = f"REV-{uuid.uuid4().hex[:8].upper()}"

        review_doc = {
            "id": review_id,
            "organization_id": organization_id,
            "advertisement_id": ad["id"],
            "report_id": report["report_id"],
            "advertisement_title": ad.get("title", "Advertisement Creative"),
            "overall_risk": report.get("overall_severity", "YELLOW"),
            "status": ReviewDecisionStatus.UNDER_REVIEW.value,
            "original_content": original_text,
            "proposed_content": original_text,
            "finding_resolutions": resolutions,
            "general_comments": [],
            "final_decision": None,
            "final_decision_by": None,
            "final_decision_by_name": None,
            "final_decision_at": None,
            "created_at": now,
            "updated_at": now
        }

        await db["advertisement_reviews"].insert_one(review_doc)

        await log_audit_event(
            user_id=user.id,
            organization_id=organization_id,
            action="REVIEW_INITIALIZED",
            resource_type="advertisement_review",
            resource_id=review_id,
            details={"advertisement_id": ad["id"], "report_id": report["report_id"]}
        )

        review_doc["report"] = report
        return review_doc

    @staticmethod
    async def get_review_by_id(
        review_id: str,
        organization_id: str
    ) -> Dict[str, Any]:
        db = db_manager.get_db()
        review = await db["advertisement_reviews"].find_one({
            "id": review_id,
            "organization_id": organization_id
        })
        if not review:
            raise HTTPException(status_code=404, detail="Review record not found")

        report = await db["consolidated_reports"].find_one({
            "report_id": review["report_id"]
        })
        review["report"] = report
        return review

    @staticmethod
    async def resolve_finding(
        review_id: str,
        finding_id: str,
        req: ResolveFindingRequest,
        user: UserProfileResponse
    ) -> Dict[str, Any]:
        db = db_manager.get_db()
        review = await db["advertisement_reviews"].find_one({
            "id": review_id,
            "organization_id": user.organization_id
        })
        if not review:
            raise HTTPException(status_code=404, detail="Review not found")

        # Verify permissions: REVIEWER, APPROVER, ADMIN
        if user.role not in [UserRole.REVIEWER, UserRole.APPROVER, UserRole.ADMIN]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only Reviewers, Approvers, and Administrators may resolve findings."
            )

        report = await db["consolidated_reports"].find_one({"report_id": review["report_id"]})
        if not report:
            raise HTTPException(status_code=404, detail="Associated report not found")

        # Find target finding
        target_finding = next((f for f in report.get("findings", []) if f["id"] == finding_id), None)
        if not target_finding:
            raise HTTPException(status_code=404, detail=f"Finding '{finding_id}' not found in report")

        now = datetime.now(timezone.utc).isoformat()

        # Determine replacement text
        custom_replacement = None
        if req.decision == FindingDecisionType.ACCEPTED:
            custom_replacement = target_finding.get("suggested_correction") or target_finding.get("original_claim")
        elif req.decision == FindingDecisionType.EDITED:
            if not req.custom_replacement or not req.custom_replacement.strip():
                raise HTTPException(status_code=400, detail="Edited decision requires a custom replacement text.")
            custom_replacement = req.custom_replacement.strip()
        elif req.decision == FindingDecisionType.REJECTED:
            custom_replacement = None

        resolution_entry = {
            "finding_id": finding_id,
            "decision": req.decision.value,
            "custom_replacement": custom_replacement,
            "reviewer_comment": req.comment.strip() if req.comment else None,
            "reviewed_by": user.id,
            "reviewed_by_name": user.full_name,
            "reviewed_at": now
        }

        # Update in dictionary
        review["finding_resolutions"][finding_id] = resolution_entry

        # Recalculate proposed_content while preserving original_content completely immutable
        proposed = review["original_content"]
        for f in report.get("findings", []):
            f_res = review["finding_resolutions"].get(f["id"])
            if f_res and f_res.get("decision") in [FindingDecisionType.ACCEPTED.value, FindingDecisionType.EDITED.value]:
                rep = f_res.get("custom_replacement")
                orig = f.get("original_claim")
                if rep and orig and orig in proposed:
                    proposed = proposed.replace(orig, rep)

        review["proposed_content"] = proposed
        review["updated_at"] = now

        await db["advertisement_reviews"].update_one(
            {"id": review_id},
            {"$set": {
                "finding_resolutions": review["finding_resolutions"],
                "proposed_content": proposed,
                "updated_at": now
            }}
        )

        # Store decision in Brand Memory Engine
        # Brand Memory rule: Brand Memory is not official policy and never overrides approved knowledge
        memory_id = f"MEM-{uuid.uuid4().hex[:8].upper()}"
        memory_entry = {
            "id": memory_id,
            "organization_id": user.organization_id,
            "product_name": target_finding.get("evidence", {}).get("source_document") if target_finding.get("evidence") else None,
            "category": target_finding.get("category", "General"),
            "finding_agent": target_finding.get("agent", "Unknown"),
            "original_text": target_finding.get("original_claim", ""),
            "decision": req.decision.value,
            "suggested_correction": target_finding.get("suggested_correction"),
            "final_replacement": custom_replacement,
            "reviewer_comment": req.comment,
            "context": {
                "review_id": review_id,
                "advertisement_id": review["advertisement_id"],
                "finding_id": finding_id,
                "severity": target_finding.get("severity")
            },
            "created_at": now,
            "created_by": user.id,
            "created_by_name": user.full_name,
            "is_official_policy": False # Guaranteed: Brand Memory is never official policy
        }

        await db["brand_memory"].insert_one(memory_entry)

        await log_audit_event(
            user_id=user.id,
            organization_id=user.organization_id,
            action="FINDING_RESOLVED",
            resource_type="advertisement_finding",
            resource_id=finding_id,
            details={
                "review_id": review_id,
                "decision": req.decision.value,
                "memory_id": memory_id
            }
        )

        review["report"] = report
        return review

    @staticmethod
    async def add_comment(
        review_id: str,
        comment: str,
        user: UserProfileResponse
    ) -> Dict[str, Any]:
        if not comment.strip():
            raise HTTPException(status_code=400, detail="Comment cannot be empty")

        db = db_manager.get_db()
        review = await db["advertisement_reviews"].find_one({
            "id": review_id,
            "organization_id": user.organization_id
        })
        if not review:
            raise HTTPException(status_code=404, detail="Review not found")

        now = datetime.now(timezone.utc).isoformat()
        new_comment = {
            "id": f"CMT-{uuid.uuid4().hex[:6].upper()}",
            "user_id": user.id,
            "user_name": user.full_name,
            "user_role": user.role.value,
            "comment": comment.strip(),
            "created_at": now
        }

        comments = review.get("general_comments", [])
        comments.append(new_comment)

        await db["advertisement_reviews"].update_one(
            {"id": review_id},
            {"$set": {
                "general_comments": comments,
                "updated_at": now
            }}
        )

        review["general_comments"] = comments
        return review

    @staticmethod
    async def finalize_review(
        review_id: str,
        req: FinalizeReviewRequest,
        user: UserProfileResponse
    ) -> Dict[str, Any]:
        db = db_manager.get_db()
        review = await db["advertisement_reviews"].find_one({
            "id": review_id,
            "organization_id": user.organization_id
        })
        if not review:
            raise HTTPException(status_code=404, detail="Review not found")

        # RBAC Enforcement:
        # APPROVE and REJECT require APPROVER or ADMIN
        # REQUEST_CHANGES can be done by REVIEWER, APPROVER, ADMIN
        if req.decision in [ReviewDecisionStatus.APPROVED, ReviewDecisionStatus.REJECTED]:
            if user.role not in [UserRole.APPROVER, UserRole.ADMIN]:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Only users with role APPROVER or ADMIN can finalize advertisement decision '{req.decision.value}'."
                )
        elif req.decision == ReviewDecisionStatus.CHANGES_REQUESTED:
            if user.role not in [UserRole.REVIEWER, UserRole.APPROVER, UserRole.ADMIN]:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Insufficient permissions to request revisions."
                )

        now = datetime.now(timezone.utc).isoformat()
        comments = review.get("general_comments", [])
        if req.comment and req.comment.strip():
            comments.append({
                "id": f"CMT-{uuid.uuid4().hex[:6].upper()}",
                "user_id": user.id,
                "user_name": user.full_name,
                "user_role": user.role.value,
                "comment": f"[{req.decision.value}] {req.comment.strip()}",
                "created_at": now
            })

        update_fields = {
            "status": req.decision.value,
            "final_decision": req.decision.value,
            "final_decision_by": user.id,
            "final_decision_by_name": user.full_name,
            "final_decision_at": now,
            "general_comments": comments,
            "updated_at": now
        }

        await db["advertisement_reviews"].update_one(
            {"id": review_id},
            {"$set": update_fields}
        )

        # Update advertisement state in registry
        await db["advertisements"].update_one(
            {"id": review["advertisement_id"]},
            {"$set": {
                "approval_status": req.decision.value,
                "updated_at": now
            }}
        )

        await log_audit_event(
            user_id=user.id,
            organization_id=user.organization_id,
            action=f"ADVERTISEMENT_{req.decision.value}",
            resource_type="advertisement",
            resource_id=review["advertisement_id"],
            details={
                "review_id": review_id,
                "decision": req.decision.value,
                "finalized_by": user.full_name
            }
        )

        review.update(update_fields)
        report = await db["consolidated_reports"].find_one({"report_id": review["report_id"]})
        review["report"] = report
        return review

    @staticmethod
    async def query_brand_memory(
        organization_id: str,
        category: Optional[str] = None,
        search_query: Optional[str] = None,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        db = db_manager.get_db()
        filter_query: Dict[str, Any] = {"organization_id": organization_id}

        if category and category.lower() != "all":
            filter_query["category"] = category

        cursor = db["brand_memory"].find(filter_query).sort("created_at", -1).limit(limit)
        entries = await cursor.to_list(length=limit)

        if search_query and search_query.strip():
            q = search_query.lower()
            entries = [
                e for e in entries
                if q in e.get("original_text", "").lower()
                or q in e.get("reviewer_comment", "").lower()
                or q in e.get("final_replacement", "").lower()
            ]

        return entries

