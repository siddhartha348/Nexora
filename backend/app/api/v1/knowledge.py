from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from typing import List, Optional
from app.models.knowledge import (
    DocumentCategory,
    ApprovalStatus,
    KnowledgeDocumentResponse,
    DocumentDetailResponse,
    ApproveDocumentRequest,
    RejectDocumentRequest,
    KnowledgeSearchQuery,
    KnowledgeSearchResult,
    VersionDiffResponse
)
from app.models.auth import UserRole, UserProfileResponse
from app.services.knowledge_service import KnowledgeService
from app.api.deps import get_current_user, require_roles

router = APIRouter(prefix="/knowledge", tags=["Brand Knowledge Hub & RAG"])

@router.post("/upload", response_model=KnowledgeDocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    title: str = Form(...),
    category: DocumentCategory = Form(...),
    product_association: Optional[str] = Form(None),
    effective_date: Optional[str] = Form(None),
    version_tag: Optional[str] = Form(None),
    existing_doc_id: Optional[str] = Form(None),
    current_user: UserProfileResponse = Depends(get_current_user)
):
    """
    Ingest a new specification sheet, guideline, or terminology document.
    Uploaded content is placed in quarantine (PENDING approval) and will not be
    indexed as RAG evidence until an Administrator approves it.
    """
    return await KnowledgeService.upload_document(
        file=file,
        title=title,
        category=category,
        org_id=current_user.organization_id,
        user_id=current_user.id,
        user_name=current_user.full_name,
        product_association=product_association,
        effective_date=effective_date,
        version_tag=version_tag,
        existing_doc_id=existing_doc_id
    )

@router.get("/documents", response_model=List[KnowledgeDocumentResponse])
async def list_documents(
    category: Optional[DocumentCategory] = None,
    status_filter: Optional[ApprovalStatus] = None,
    product: Optional[str] = None,
    search: Optional[str] = None,
    current_user: UserProfileResponse = Depends(get_current_user)
):
    """List all documents belonging to the user's organisation with filtering."""
    return await KnowledgeService.list_documents(
        org_id=current_user.organization_id,
        category=category,
        status_filter=status_filter,
        product=product,
        search=search
    )

@router.get("/documents/{doc_id}", response_model=DocumentDetailResponse)
async def get_document_detail(
    doc_id: str,
    current_user: UserProfileResponse = Depends(get_current_user)
):
    """Retrieve full document detail, text preview, extracted facts, and version history."""
    return await KnowledgeService.get_document_detail(doc_id, current_user.organization_id)

@router.post("/documents/{doc_id}/approve", response_model=KnowledgeDocumentResponse)
async def approve_document(
    doc_id: str,
    req: ApproveDocumentRequest = ApproveDocumentRequest(),
    current_user: UserProfileResponse = Depends(require_roles([UserRole.ADMIN]))
):
    """
    ADMIN GATE: Approve an ingested document version into Official Brand Knowledge.
    Activates RAG indexing into ChromaDB and promotes facts to authoritative evidence.
    """
    return await KnowledgeService.approve_document(
        doc_id=doc_id,
        org_id=current_user.organization_id,
        admin_id=current_user.id,
        admin_name=current_user.full_name,
        notes=req.notes
    )

@router.post("/documents/{doc_id}/reject", response_model=KnowledgeDocumentResponse)
async def reject_document(
    doc_id: str,
    req: RejectDocumentRequest,
    current_user: UserProfileResponse = Depends(require_roles([UserRole.ADMIN]))
):
    """ADMIN GATE: Reject an unverified or draft document."""
    return await KnowledgeService.reject_document(
        doc_id=doc_id,
        org_id=current_user.organization_id,
        admin_id=current_user.id,
        reason=req.reason
    )

@router.get("/documents/{doc_id}/diff", response_model=VersionDiffResponse)
async def compare_document_versions(
    doc_id: str,
    v_old: str = Query(..., description="Old version tag, e.g. v1.0"),
    v_new: str = Query(..., description="New version tag, e.g. v1.1"),
    current_user: UserProfileResponse = Depends(get_current_user)
):
    """Compare two versions of a document to inspect modified specs, added terms, and retired values."""
    return await KnowledgeService.compare_versions(
        doc_id=doc_id,
        org_id=current_user.organization_id,
        v_old_tag=v_old,
        v_new_tag=v_new
    )

@router.post("/search", response_model=List[KnowledgeSearchResult])
async def search_approved_knowledge(
    query: KnowledgeSearchQuery,
    current_user: UserProfileResponse = Depends(get_current_user)
):
    """
    RAG Semantic Retrieval:
    Queries ONLY approved knowledge chunks from ChromaDB and exact facts from MongoDB.
    Unapproved or quarantined documents are mathematically excluded.
    """
    return await KnowledgeService.search_approved_knowledge(
        org_id=current_user.organization_id,
        query=query.query,
        category=query.category,
        limit=query.limit
    )

