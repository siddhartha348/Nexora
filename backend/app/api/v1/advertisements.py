import os
import shutil
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from pydantic import BaseModel, HttpUrl

from app.models.advertisement import AdvertisementJob, ConsolidatedReport
from app.services.ad_service import AdvertisementService
from app.models.auth import UserProfileResponse
from app.api.deps import get_current_user
from app.core.upload_validator import validate_and_save_upload
from app.core.ssrf import validate_url_safe_for_ssrf, SSRFSecurityError

router = APIRouter(prefix="/ads", tags=["Advertisement Analysis Engine"])

UPLOAD_DIR = "./data/uploads/advertisements"
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {"pdf", "docx", "pptx", "png", "jpg", "jpeg"}
MAX_FILE_SIZE = 25 * 1024 * 1024  # 25 MB

class SubmitUrlRequest(BaseModel):
    title: str
    url: str

@router.post("/submit-file", response_model=AdvertisementJob, status_code=status.HTTP_201_CREATED)
async def submit_advertisement_file(
    file: UploadFile = File(...),
    title: str = Form(...),
    current_user: UserProfileResponse = Depends(get_current_user)
):
    """
    Upload an advertisement creative (PDF, DOCX, PPTX, PNG, JPG) for asynchronous multi-agent audit.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename missing")

    # Read file content for cryptographic MIME verification by magic bytes
    file_bytes = await file.read()
    header_bytes = file_bytes[:64]

    file_path, ext, _ = validate_and_save_upload(
        header_bytes=header_bytes,
        file_bytes=file_bytes,
        original_filename=file.filename,
        target_dir=UPLOAD_DIR
    )

    job = await AdvertisementService.create_file_job(
        organization_id=current_user.organization_id,
        title=title,
        file_path=file_path,
        file_type=ext
    )

    return job

@router.post("/submit-url", response_model=AdvertisementJob, status_code=status.HTTP_201_CREATED)
async def submit_advertisement_url(
    req: SubmitUrlRequest,
    current_user: UserProfileResponse = Depends(get_current_user)
):
    """
    Submit a public advertisement URL for asynchronous scraping and multi-agent audit.
    """
    try:
        validate_url_safe_for_ssrf(req.url)
    except SSRFSecurityError as e:
        raise HTTPException(status_code=400, detail=f"SSRF Protection blocked URL: {str(e)}")

    job = await AdvertisementService.create_url_job(
        organization_id=current_user.organization_id,
        title=req.title,
        url=req.url
    )

    return job

@router.get("/jobs/{job_id}", response_model=AdvertisementJob)
async def get_advertisement_job_status(
    job_id: str,
    current_user: UserProfileResponse = Depends(get_current_user)
):
    """
    Check status, progress, and report payload of an advertisement analysis job.
    """
    job = await AdvertisementService.get_job(job_id, current_user.organization_id)
    if not job:
        raise HTTPException(status_code=404, detail="Advertisement job not found")
    return job

@router.get("/reports/{report_id}", response_model=ConsolidatedReport)
async def get_governance_report(
    report_id: str,
    current_user: UserProfileResponse = Depends(get_current_user)
):
    """
    Retrieve consolidated multi-agent governance report with detailed guardian findings.
    """
    report = await AdvertisementService.get_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report

@router.get("", response_model=List[AdvertisementJob])
async def list_advertisement_audits(
    limit: int = Query(50, ge=1, le=100),
    current_user: UserProfileResponse = Depends(get_current_user)
):
    """
    List all audited advertisements and active jobs for the user's organization.
    """
    return await AdvertisementService.list_jobs(current_user.organization_id, limit=limit)
