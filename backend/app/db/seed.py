import uuid
from datetime import datetime, timezone
from app.db.mongo import db_manager
from app.core.security import hash_password

async def seed_demo_data():
    """
    Seeds comprehensive synthetic demo data for the fictional brand 'AuraTech Global'.
    Provides four role-delineated users, approved knowledge documents, registered advertisements,
    human review precedents, reports, and a triggered recall alert.
    """
    db = db_manager.get_db()
    now = datetime.now(timezone.utc).isoformat()
    org_id = "demo-org-auratech-001"

    # 1. Organization
    org = await db["organisations"].find_one({"id": org_id})
    if not org:
        await db["organisations"].insert_one({
            "id": org_id,
            "name": "AuraTech Global",
            "tier": "ENTERPRISE",
            "settings": {
                "default_ai_provider": "gemini",
                "enforce_admin_gate": True,
                "recall_auto_scan": True,
                "min_contrast_ratio": 4.5
            },
            "created_at": now,
            "updated_at": now
        })

    # 2. Users (Admin, Approver, Reviewer, Creator)
    demo_users = [
        {
            "id": "usr-admin-001",
            "email": "admin@nexora.com",
            "password_hash": hash_password("NexoraAdmin2026!"),
            "full_name": "Audrey Vance",
            "role": "ADMIN",
            "organization_id": org_id,
            "is_active": True,
            "email_verified": True,
            "created_at": now
        },
        {
            "id": "usr-approver-001",
            "email": "approver@nexora.com",
            "password_hash": hash_password("NexoraAdmin2026!"),
            "full_name": "Marcus Kane",
            "role": "APPROVER",
            "organization_id": org_id,
            "is_active": True,
            "email_verified": True,
            "created_at": now
        },
        {
            "id": "usr-reviewer-001",
            "email": "reviewer@nexora.com",
            "password_hash": hash_password("NexoraAdmin2026!"),
            "full_name": "Elena Rostova",
            "role": "REVIEWER",
            "organization_id": org_id,
            "is_active": True,
            "email_verified": True,
            "created_at": now
        },
        {
            "id": "usr-creator-001",
            "email": "creator@nexora.com",
            "password_hash": hash_password("NexoraAdmin2026!"),
            "full_name": "Liam Chen",
            "role": "CREATOR",
            "organization_id": org_id,
            "is_active": True,
            "email_verified": True,
            "created_at": now
        }
    ]

    for u in demo_users:
        existing_user = await db["users"].find_one({"email": u["email"]})
        if not existing_user:
            await db["users"].insert_one(u)
        else:
            await db["users"].update_one(
                {"email": u["email"]},
                {"$set": {"organization_id": org_id, "role": u["role"]}}
            )

    # 3. Approved Knowledge Documents
    doc_specs_id = "doc-aurora-spec-v32"
    doc_voice_id = "doc-brand-voice-v20"
    doc_terms_id = "doc-trademark-v21"

    existing_doc = await db["document_versions"].find_one({"id": doc_specs_id})
    if not existing_doc:
        docs = [
            {
                "id": doc_specs_id,
                "organization_id": org_id,
                "title": "Aurora X2 Ultra-Book Technical Specification Sheet",
                "category": "SPECIFICATIONS",
                "version_tag": "v3.2",
                "file_type": "pdf",
                "is_approved": True,
                "approved_by": "Audrey Vance",
                "approved_at": now,
                "summary": "Authoritative engineering specifications for Aurora X2: 5-day tested battery life, 2-year manufacturer warranty, UltraGlide Recycled Alloy chassis.",
                "created_at": now
            },
            {
                "id": doc_voice_id,
                "organization_id": org_id,
                "title": "Global Brand Voice & Messaging Standard",
                "category": "BRAND_VOICE",
                "version_tag": "v2.0",
                "file_type": "docx",
                "is_approved": True,
                "approved_by": "Audrey Vance",
                "approved_at": now,
                "summary": "Defines voice pillars (Empowering, Precise, Grounded). Strictly prohibits unsubstantiated sensationalism ('unbeatable', 'industry-crushing', 'buy now or miss out').",
                "created_at": now
            },
            {
                "id": doc_terms_id,
                "organization_id": org_id,
                "title": "Brand Trademark & Terminology Registry",
                "category": "TERMINOLOGY",
                "version_tag": "v2.1",
                "file_type": "pdf",
                "is_approved": True,
                "approved_by": "Audrey Vance",
                "approved_at": now,
                "summary": "Mandatory canonical product nomenclature. Deprecates informal terms like 'eco-magic chassis' in favour of 'UltraGlide Recycled Alloy'.",
                "created_at": now
            }
        ]
        await db["document_versions"].insert_many(docs)

    # 4. Structured Approved Knowledge Facts
    existing_fact = await db["knowledge_facts"].find_one({"organization_id": org_id})
    if not existing_fact:
        facts = [
            {
                "id": "fact-aurora-battery",
                "organization_id": org_id,
                "document_id": doc_specs_id,
                "document_title": "Aurora X2 Ultra-Book Technical Specification Sheet",
                "version_tag": "v3.2",
                "page_number": 4,
                "category": "SPECIFICATIONS",
                "subject": "Aurora X2",
                "predicate": "battery_life",
                "object_value": "5 days",
                "verbatim_quote": "Battery life is tested up to 5 days under standard operating benchmark.",
                "is_approved": True,
                "created_at": now
            },
            {
                "id": "fact-aurora-warranty",
                "organization_id": org_id,
                "document_id": doc_specs_id,
                "document_title": "Aurora X2 Ultra-Book Technical Specification Sheet",
                "version_tag": "v3.2",
                "page_number": 2,
                "category": "SPECIFICATIONS",
                "subject": "Aurora X2",
                "predicate": "warranty",
                "object_value": "2 years",
                "verbatim_quote": "Standard manufacturer warranty is 2 years.",
                "is_approved": True,
                "created_at": now
            },
            {
                "id": "fact-term-chassis",
                "organization_id": org_id,
                "document_id": doc_terms_id,
                "document_title": "Brand Trademark & Terminology Registry",
                "version_tag": "v2.1",
                "page_number": 1,
                "category": "TERMINOLOGY",
                "subject": "eco-magic chassis",
                "predicate": "canonical_term",
                "object_value": "UltraGlide Recycled Alloy",
                "verbatim_quote": "Replace colloquial 'eco-magic chassis' with canonical 'UltraGlide Recycled Alloy'.",
                "is_approved": True,
                "created_at": now
            },
            {
                "id": "fact-voice-sensationalism",
                "organization_id": org_id,
                "document_id": doc_voice_id,
                "document_title": "Global Brand Voice & Messaging Standard",
                "version_tag": "v2.0",
                "page_number": 3,
                "category": "BRAND_VOICE",
                "subject": "Sensationalism Policy",
                "predicate": "prohibited_terms",
                "object_value": "unbeatable, industry-crushing, buy now or miss out",
                "verbatim_quote": "Sensational hyperbole and aggressive urgency ('unbeatable', 'industry-crushing', 'buy now or miss out') are strictly prohibited.",
                "is_approved": True,
                "created_at": now
            }
        ]
        await db["knowledge_facts"].insert_many(facts)

    # 5. Registered Advertisements & Reports
    existing_ad = await db["advertisements"].find_one({"organization_id": org_id})
    if not existing_ad:
        ad1_id = "AD-AURORA-RECALL-01"
        ad2_id = "AD-APEX-DRONE-02"
        ad3_id = "AD-NOVA-WATCH-03"
        ad4_id = "AD-FLEET-DECK-04"

        # Reports
        rep1_id = "REP-AURORA-001"
        rep2_id = "REP-APEX-002"
        rep3_id = "REP-NOVA-003"

        reports = [
            {
                "report_id": rep1_id,
                "advertisement_id": ad1_id,
                "overall_severity": "RED",
                "created_at": now,
                "findings": [
                    {
                        "id": "find-rep1-1",
                        "agent": "Fact Guardian",
                        "category": "Specifications",
                        "severity": "RED",
                        "status": "Contradicted",
                        "original_claim": "Up to 7 days battery life",
                        "explanation": "Contradicts approved technical specification v3.2 stating battery life is up to 5 days.",
                        "suggested_correction": "Up to 5 days tested battery life",
                        "evidence": {
                            "source_document": "Aurora X2 Ultra-Book Technical Specification Sheet",
                            "version": "v3.2",
                            "page_number": 4,
                            "verbatim_quote": "Battery life is tested up to 5 days under standard operating benchmark."
                        }
                    }
                ]
            },
            {
                "report_id": rep2_id,
                "advertisement_id": ad2_id,
                "overall_severity": "RED",
                "created_at": now,
                "findings": [
                    {
                        "id": "find-rep2-1",
                        "agent": "Voice Guardian",
                        "category": "Tone Drift",
                        "severity": "RED",
                        "status": "Tone Violation",
                        "original_claim": "Delivers an industry-crushing 55-minute flight time with unbreakable titanium wings",
                        "explanation": "Contains prohibited sensationalist language ('industry-crushing') and unapproved nomenclature ('titanium wings').",
                        "suggested_correction": "Delivers up to 38 minutes of tested aerial operation encased in a CarbonMatrix Aerofoil Frame",
                        "evidence": {
                            "source_document": "Global Brand Voice & Messaging Standard",
                            "version": "v2.0",
                            "page_number": 3,
                            "verbatim_quote": "Sensational hyperbole and aggressive urgency ('unbeatable', 'industry-crushing', 'buy now or miss out') are strictly prohibited."
                        }
                    },
                    {
                        "id": "find-rep2-2",
                        "agent": "Terminology Guardian",
                        "category": "Terminology",
                        "severity": "YELLOW",
                        "status": "Deprecated Nomenclature",
                        "original_claim": "eco-magic chassis",
                        "explanation": "Informal phrase detected; must use canonical registered trademark 'UltraGlide Recycled Alloy'.",
                        "suggested_correction": "UltraGlide Recycled Alloy",
                        "evidence": {
                            "source_document": "Brand Trademark & Terminology Registry",
                            "version": "v2.1",
                            "page_number": 1,
                            "verbatim_quote": "Replace colloquial 'eco-magic chassis' with canonical 'UltraGlide Recycled Alloy'."
                        }
                    }
                ]
            },
            {
                "report_id": rep3_id,
                "advertisement_id": ad3_id,
                "overall_severity": "GREEN",
                "created_at": now,
                "findings": [
                    {
                        "id": "find-rep3-1",
                        "agent": "Fact Guardian",
                        "category": "Specifications",
                        "severity": "GREEN",
                        "status": "Verified",
                        "original_claim": "Water resistant up to 50 meters under ISO standard 22810",
                        "explanation": "No critical issues detected by the automated checks performed.",
                        "suggested_correction": None,
                        "evidence": {
                            "source_document": "Nova Smartwatch Technical Guide",
                            "version": "v1.2",
                            "page_number": 1,
                            "verbatim_quote": "ISO standard 22810 water resistance up to 50 meters."
                        }
                    }
                ]
            }
        ]
        await db["advertisement_reports"].insert_many(reports)
        await db["consolidated_reports"].insert_many(reports)

        ads = [
            {
                "id": ad1_id,
                "organization_id": org_id,
                "title": "Aurora X2 - Executive Q4 Digital Campaign",
                "channel": "Social Media (LinkedIn & Web)",
                "approval_status": "RECALLED",
                "overall_severity": "RED",
                "report_id": rep1_id,
                "recall_flag": True,
                "recall_alert_id": "RCL-AURORA-SPEC-01",
                "extracted_data": {
                    "raw_text": "Experience Aurora X2: up to 7 days battery life with our standard 2-year warranty and lightweight construction."
                },
                "created_at": now,
                "updated_at": now
            },
            {
                "id": ad2_id,
                "organization_id": org_id,
                "title": "Apex Drone Pro - Industrial Inspection Launch",
                "channel": "Web Landing Page",
                "approval_status": "CHANGES_REQUESTED",
                "overall_severity": "RED",
                "report_id": rep2_id,
                "recall_flag": False,
                "extracted_data": {
                    "raw_text": "Introducing the Apex Drone Pro. Priced at only $899 (previously $1200). Delivers an industry-crushing 55-minute continuous flight time with unbreakable titanium wings. BUY NOW OR MISS OUT on the world's most unbeatable surveillance experience!"
                },
                "created_at": now,
                "updated_at": now
            },
            {
                "id": ad3_id,
                "organization_id": org_id,
                "title": "Nova Smartwatch Active - Minimalist Spring Print Ad",
                "channel": "Print & Out-of-Home",
                "approval_status": "APPROVED",
                "overall_severity": "GREEN",
                "report_id": rep3_id,
                "recall_flag": False,
                "extracted_data": {
                    "raw_text": "The Nova Smartwatch Active. Water resistant up to 50 meters under ISO standard 22810. Precision health monitoring for elite athletes."
                },
                "created_at": now,
                "updated_at": now
            },
            {
                "id": ad4_id,
                "organization_id": org_id,
                "title": "Aurora X2 - Enterprise Fleet Presentation",
                "channel": "Sales Collateral (PPTX)",
                "approval_status": "UNDER_REVIEW",
                "overall_severity": "YELLOW",
                "report_id": rep1_id,
                "recall_flag": False,
                "extracted_data": {
                    "raw_text": "Aurora X2 built with eco-magic chassis and tested 5 days battery life."
                },
                "created_at": now,
                "updated_at": now
            }
        ]
        await db["advertisements"].insert_many(ads)

        # 6. Active Recall Alert
        recall_alert = {
            "id": "RCL-AURORA-SPEC-01",
            "organization_id": org_id,
            "advertisement_id": ad1_id,
            "advertisement_title": "Aurora X2 - Executive Q4 Digital Campaign",
            "severity": "RED",
            "status": "ACTIVE",
            "source_document": "Aurora X2 Ultra-Book Technical Specification Sheet",
            "new_version": "v3.2",
            "previous_version": "v3.1",
            "reason": "Approved specification changed battery life benchmark to '5 days' (v3.2), but active advertisement claims '7 days'.",
            "invalidated_claim": "Up to 7 days battery life",
            "approved_benchmark": "5 days",
            "verbatim_evidence": "Battery life is tested up to 5 days under standard operating benchmark.",
            "suggested_remediation": "Update advertisement copy to state 'Battery life is tested up to 5 days under standard operating benchmark' and re-submit for guardian audit.",
            "created_at": now,
            "updated_at": now
        }
        await db["recall_alerts"].insert_one(recall_alert)

        # 7. Brand Memory Review Precedents
        memories = [
            {
                "id": "MEM-TERM-001",
                "organization_id": org_id,
                "product_name": "Brand Trademark Registry",
                "category": "Terminology",
                "finding_agent": "Terminology Guardian",
                "original_text": "eco-magic chassis",
                "decision": "ACCEPTED",
                "suggested_correction": "UltraGlide Recycled Alloy",
                "final_replacement": "UltraGlide Recycled Alloy",
                "reviewer_comment": "Enforced canonical trademark registered in Trademark Hub v2.1.",
                "context": {"review_id": "REV-DEMO-01", "severity": "YELLOW"},
                "created_at": now,
                "created_by": "usr-reviewer-001",
                "created_by_name": "Elena Rostova",
                "is_official_policy": False
            },
            {
                "id": "MEM-VOICE-002",
                "organization_id": org_id,
                "product_name": "Global Brand Voice",
                "category": "Tone Drift",
                "finding_agent": "Voice Guardian",
                "original_text": "Delivers an industry-crushing 55-minute continuous flight time",
                "decision": "EDITED",
                "suggested_correction": "Delivers up to 38 minutes flight duration",
                "final_replacement": "Delivers up to 38 minutes of tested aerial operation",
                "reviewer_comment": "Replaced aggressive sensationalism with conservative engineering benchmark.",
                "context": {"review_id": "REV-DEMO-02", "severity": "RED"},
                "created_at": now,
                "created_by": "usr-approver-001",
                "created_by_name": "Marcus Kane",
                "is_official_policy": False
            }
        ]
        await db["brand_memory"].insert_many(memories)

    print("[DATABASE SEED] Enterprise synthetic demo data initialized for AuraTech Global.")
