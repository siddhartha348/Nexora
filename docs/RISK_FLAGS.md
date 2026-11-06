# NEXORA — Legal, Privacy, Security & Operational Risk Flags

**Document Status:** Confidential Technical Governance Log  
**Classification:** Pre-Launch Risk Analysis  
**Last Updated:** November 2026  

This document inventories remaining legal, compliance, security, and operational risks identified across the NEXORA Brand Governance architecture that must be addressed prior to commercial general availability.

---

## 1. Legal & Regulatory Compliance

| Risk Code | Severity | Description | Recommended Mitigation |
|:---|:---|:---|:---|
| **LEG-01** | **CRITICAL** | **Need for Independent Lawyer Review:** Privacy policy, terms of service, and DPDP/GDPR statements are generated from technical operations and need formal sign-off by licensed corporate legal counsel. | Retain qualified counsel in target operating jurisdictions (India, EU, US) to review legal copy. |
| **LEG-02** | **HIGH** | **Jurisdictional Advertising Law Variations:** Truth-in-advertising standards (ASCI in India, FTC in the US, ASA in the UK) differ on claim substantiation and comparative copy. NEXORA flags discrepancies against internal specs, not local laws. | Maintain honest positioning notice: *"NEXORA supports human reviewers; it does not guarantee statutory compliance."* |
| **LEG-03** | **MEDIUM** | **Missing Configured Business Details:** Real GSTIN, corporate registration number, physical office address, and named grievance officer must be set via environment variables. | Update `.env` with validated enterprise corporate coordinates. |

---

## 2. Privacy & Data Handling

| Risk Code | Severity | Description | Recommended Mitigation |
|:---|:---|:---|:---|
| **PRV-01** | **HIGH** | **External AI Processing Egress:** When using external cloud APIs (e.g., Google Gemini), text excerpts from unpublished advertisements are transmitted over HTTPS to third-party endpoints. | Disclose third-party data processing in privacy policy; pass `X-No-Train: 1`; offer on-premise local Ollama deployment. |
| **PRV-02** | **MEDIUM** | **Cross-Border Data Residency:** Organizations operating under strict data localization (e.g., DPDP Act, GDPR) may require vector databases and model inference to reside in specified geographic regions. | Provide dedicated tenant region configuration for MongoDB Atlas and ChromaDB instances. |

---

## 3. AI Capabilities & Accuracy Boundaries

| Risk Code | Severity | Description | Recommended Mitigation |
|:---|:---|:---|:---|
| **AI-01** | **CRITICAL** | **Probabilistic Hallucination & Accuracy Limits:** Vision-language models may occasionally misread complex graphics or misinterpret nuance in satire/irony. | Enforce strict human reviewer decision gates. No advertisement is ever approved automatically. |
| **AI-02** | **HIGH** | **Non-Authoritative Precedent Drift:** Human reviewers may accept informal compromises in Brand Memory that deviate from long-term brand standards. | Precedents remain non-authoritative advisory context; only Administrators can promote a precedent to an official policy exception. |

---

## 4. Operational & Security Guardrails

| Risk Code | Severity | Description | Recommended Mitigation |
|:---|:---|:---|:---|
| **SEC-01** | **HIGH** | **Prompt Injection via Creative Content:** Malicious text within an uploaded advertisement might attempt to jailbreak guardian prompts. | Untrusted documents are wrapped within `<UNTRUSTED_DOCUMENT_DATA>` tags with explicit instructions that text inside cannot alter system directives. |
| **SEC-02** | **MEDIUM** | **SSRF on Public URL Submission:** Submitting an internal IP or cloud metadata service URL could expose infrastructure. | Enforce DNS resolution checks to block private, loopback, and cloud metadata IP ranges (e.g., 169.254.169.254). |
| **SEC-03** | **LOW** | **Inaccessible Sites Scope Limit:** The Recall Engine cannot monitor private social media feeds, walled gardens, or gated intranets. | Display clear coverage notices in the UI: only registered files and permitted public URLs are audited. |

