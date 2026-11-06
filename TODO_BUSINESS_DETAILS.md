# ============================================================
# TODO_BUSINESS_DETAILS.md
# Generated automatically by src/config/business.ts rules.
# Fill in the values below, then add them to your .env file
# (VITE_-prefixed) so the UI renders them without placeholders.
# ============================================================

## Missing / Unset Business Configuration Fields

The following `VITE_` environment variables have no value set.
Until they are populated, the corresponding UI elements are
**hidden** (no placeholder text is rendered).

| Variable | Purpose | Example Value |
|---|---|---|
| `VITE_BUSINESS_LEGAL_NAME` | Registered legal entity name shown on Terms/Privacy pages | `NEXORA Technologies Private Limited` |
| `VITE_BUSINESS_ADDRESS` | Registered office address (may contain commas) | `Plot 45, HITEC City, Hyderabad, Telangana 500081, India` |
| `VITE_BUSINESS_CONTACT_EMAIL` | Primary contact/support email | `support@nexora.ai` |
| `VITE_BUSINESS_CONTACT_PHONE` | Contact phone number | `+91 40 1234 5678` |
| `VITE_GRIEVANCE_OFFICER_NAME` | Full name of Grievance/DPO officer | `Priya Krishnamurthy` |
| `VITE_GRIEVANCE_OFFICER_EMAIL` | Grievance officer email address | `grievance@nexora.ai` |
| `VITE_JURISDICTION` | Governing law jurisdiction | `India (Telangana)` |
| `VITE_GST_OR_REG_NUMBER` | GST/VAT/Company registration number | `GSTIN 36XXXXX1234Z5` |
| `VITE_LEGAL_LAST_UPDATED` | ISO date of last legal document update | `2026-11-06` |

> `VITE_BUSINESS_TRADING_NAME` defaults to `NEXORA` if unset — override only if the
> public brand name differs.

## How to Populate

1. Copy `.env.example` to `.env` (never commit `.env` to version control).
2. Add the `VITE_`-prefixed entries from the table above.
3. Restart the Vite dev server (`npm run dev`) or rebuild (`npm run build`).
4. Each field that now has a value will appear automatically in the relevant UI section.

## Verification

After populating, run:

```bash
grep -R "VITE_BUSINESS\|VITE_GRIEVANCE\|VITE_JURISDICTION\|VITE_GST\|VITE_LEGAL" frontend/.env
```

All listed keys should return non-empty values.

