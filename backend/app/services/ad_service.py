import os
import uuid
import asyncio
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

from app.models.advertisement import (
    AdvertisementJob, 
    JobStatus, 
    ConsolidatedReport
)
from app.services.ad_extractor import AdExtractor
from app.services.arbiter import RiskArbiter
from app.db.mongo import get_database

class AdvertisementService:
    """
    Manages asynchronous ingestion jobs, extraction, and arbiter execution.
    """

    @classmethod
    async def create_file_job(
        cls, 
        organization_id: str, 
        title: str, 
        file_path: str, 
        file_type: str
    ) -> AdvertisementJob:
        job_id = f"JOB-{uuid.uuid4().hex[:8].upper()}"
        now = datetime.now(timezone.utc).isoformat()

        job = AdvertisementJob(
            id=job_id,
            organization_id=organization_id,
            title=title,
            source_type="FILE",
            file_type=file_type,
            file_path=file_path,
            status=JobStatus.PENDING,
            progress=5,
            created_at=now
        )

        db = get_database()
        await db["advertisement_jobs"].insert_one(job.model_dump())

        # Launch async processing in background task
        asyncio.create_task(cls.process_job(job_id, organization_id))

        return job

    @classmethod
    async def create_url_job(
        cls, 
        organization_id: str, 
        title: str, 
        url: str
    ) -> AdvertisementJob:
        job_id = f"JOB-{uuid.uuid4().hex[:8].upper()}"
        now = datetime.now(timezone.utc).isoformat()

        job = AdvertisementJob(
            id=job_id,
            organization_id=organization_id,
            title=title,
            source_type="URL",
            target_url=url,
            status=JobStatus.PENDING,
            progress=5,
            created_at=now
        )

        db = get_database()
        await db["advertisement_jobs"].insert_one(job.model_dump())

        # Launch async processing in background task
        asyncio.create_task(cls.process_job(job_id, organization_id))

        return job

    @classmethod
    async def process_job(cls, job_id: str, organization_id: str):
        """
        Full asynchronous processing pipeline:
        Extraction -> 6 Guardians -> Arbiter Synthesis -> Report Storage
        """
        db = get_database()
        job_doc = await db["advertisement_jobs"].find_one({"id": job_id})
        if not job_doc:
            return

        try:
            # 1. Update status to EXTRACTING
            await db["advertisement_jobs"].update_one(
                {"id": job_id},
                {"$set": {"status": JobStatus.EXTRACTING.value, "progress": 25}}
            )

            # 2. Extract Multimodal Assets
            if job_doc.get("source_type") == "URL":
                extracted = await AdExtractor.extract_from_url(job_doc["target_url"])
            else:
                extracted = await AdExtractor.extract_from_file(job_doc["file_path"], job_doc.get("file_type", "pdf"))

            ad_text = extracted.get("raw_text", "")

            # 3. Update status to REVIEWING
            await db["advertisement_jobs"].update_one(
                {"id": job_id},
                {"$set": {
                    "status": JobStatus.REVIEWING.value, 
                    "progress": 55,
                    "extracted_data": extracted
                }}
            )

            # 4. Update status to CONSOLIDATING
            await db["advertisement_jobs"].update_one(
                {"id": job_id},
                {"$set": {
                    "status": JobStatus.CONSOLIDATING.value,
                    "progress": 80
                }}
            )

            # 5. Execute Guardians + Risk Arbiter
            report = await RiskArbiter.evaluate_advertisement(
                organization_id=organization_id,
                advertisement_id=job_id,
                ad_text=ad_text,
                extracted_data=extracted
            )

            # 6. Store Completed Report and update Job to READY / COMPLETED
            now = datetime.now(timezone.utc).isoformat()
            report_dict = report.model_dump()
            await db["advertisement_reports"].insert_one(report_dict)
            await db["consolidated_reports"].insert_one(report_dict)

            # Register in advertisements inventory
            await db["advertisements"].update_one(
                {"id": job_id},
                {"$set": {
                    "id": job_id,
                    "organization_id": organization_id,
                    "title": job_doc.get("title", "Untitled Ad"),
                    "source_type": job_doc.get("source_type", "URL"),
                    "report_id": report.report_id,
                    "overall_severity": report.overall_severity,
                    "approval_status": "DRAFT",
                    "extracted_data": extracted,
                    "created_at": job_doc.get("created_at", now),
                    "updated_at": now
                }},
                upsert=True
            )

            await db["advertisement_jobs"].update_one(
                {"id": job_id},
                {"$set": {
                    "status": JobStatus.COMPLETED.value,
                    "progress": 100,
                    "completed_at": now,
                    "report_id": report.report_id,
                    "report": report_dict
                }}
            )

        except Exception as e:
            await db["advertisement_jobs"].update_one(
                {"id": job_id},
                {"$set": {
                    "status": JobStatus.FAILED.value,
                    "error_message": str(e)
                }}
            )

    @classmethod
    async def get_job(cls, job_id: str, organization_id: str) -> Optional[AdvertisementJob]:
        db = get_database()
        doc = await db["advertisement_jobs"].find_one({"id": job_id, "organization_id": organization_id})
        if doc:
            doc.pop("_id", None)
            return AdvertisementJob(**doc)
        return None

    @classmethod
    async def get_report(cls, report_id: str) -> Optional[ConsolidatedReport]:
        db = get_database()
        doc = await db["advertisement_reports"].find_one({"report_id": report_id})
        if doc:
            doc.pop("_id", None)
            return ConsolidatedReport(**doc)
        return None

    @classmethod
    async def list_jobs(cls, organization_id: str, limit: int = 50) -> List[AdvertisementJob]:
        db = get_database()
        cursor = db["advertisement_jobs"].find({"organization_id": organization_id}).sort("created_at", -1).limit(limit)
        docs = await cursor.to_list(length=limit)
        results = []
        for d in docs:
            d.pop("_id", None)
            results.append(AdvertisementJob(**d))
        return results

