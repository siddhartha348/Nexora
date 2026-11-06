from pydantic import BaseModel, Field
from enum import Enum
from typing import Optional, List, Dict, Any
from datetime import datetime

class DocumentCategory(str, Enum):
    GUIDELINES = "GUIDELINES"
    SPECIFICATIONS = "SPECIFICATIONS"
    TERMINOLOGY = "TERMINOLOGY"
    CLAIMS = "CLAIMS"
    VISUAL_IDENTITY = "VISUAL_IDENTITY"
    MARKETING_POLICY = "MARKETING_POLICY"

class ApprovalStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    ARCHIVED = "ARCHIVED"

class ExtractedFact(BaseModel):
    id: str
    subject: str
    predicate: str
    object_value: str
    unit: Optional[str] = None
    page_number: int
    verbatim_quote: str
    category: str

class DocumentVersionResponse(BaseModel):
    version_id: str
    version_tag: str
    uploaded_by: str
    uploaded_by_name: str
    uploaded_at: str
    effective_date: str
    approval_status: ApprovalStatus
    approved_by: Optional[str] = None
    approved_at: Optional[str] = None
    rejection_reason: Optional[str] = None
    change_summary: Optional[str] = None
    extracted_facts_count: int
    chunks_count: int

class KnowledgeDocumentResponse(BaseModel):
    id: str
    organization_id: str
    title: str
    category: DocumentCategory
    product_association: Optional[str] = None
    current_version: str
    approval_status: ApprovalStatus
    uploaded_by: str
    uploaded_by_name: str
    uploaded_at: str
    effective_date: str
    file_type: str
    file_size_bytes: int
    versions: List[DocumentVersionResponse]

class DocumentDetailResponse(KnowledgeDocumentResponse):
    extracted_text_preview: str
    extracted_facts: List[ExtractedFact]

class ApproveDocumentRequest(BaseModel):
    notes: Optional[str] = None

class RejectDocumentRequest(BaseModel):
    reason: str = Field(..., min_length=3, max_length=500)

class KnowledgeSearchQuery(BaseModel):
    query: str = Field(..., min_length=2)
    category: Optional[DocumentCategory] = None
    product_association: Optional[str] = None
    limit: int = 5

class KnowledgeSearchResult(BaseModel):
    chunk_id: str
    document_id: str
    document_title: str
    version_tag: str
    page_number: int
    category: str
    content: str
    score: float
    is_approved: bool

class VersionDiffResponse(BaseModel):
    document_id: str
    document_title: str
    old_version: str
    new_version: str
    modified_facts: List[Dict[str, Any]]
    added_facts: List[Dict[str, Any]]
    removed_facts: List[Dict[str, Any]]
    text_diff_summary: str

