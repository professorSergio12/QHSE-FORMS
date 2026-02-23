# QHSE Forms (Merged)

Single Next.js app for all QHSE external forms used by the Oceane Marine / QHSE module. The main app can open any form by changing only the form code in the URL.

## URL pattern

- **Home:** `/`
- **Form by code:** `/forms/[formCode]`

| Form code | Form |
|-----------|------|
| `audit-form` | Due Diligence Subcontractor Audit |
| `hse-induction-checklist` | HSE Induction Checklist |
| `near-miss` | Near Miss / Incident & Injury Reporting |
| `supplier-questionnaire` | Supplier Due Diligence Questionnaire |
| `transfer-audit-report` | STS Transfer Audit Report |
| `poac-cross-competency` | POAC Cross Competency |

Examples:
- `https://your-domain.com/forms/audit-form`
- `https://your-domain.com/forms/near-miss`

## Using with the main Oceane-Marine app (share link → view in main app)

External users open form links from this app; submissions are saved to the main app’s API and appear in the main app’s list views. For:

- **Which link to share** with external users (per form)
- **Where to view submissions** in the main app (list URLs)
- **Local and production setup**

see **[SETUP.md](./SETUP.md)**.

## Setup

1. Install: `npm install`
2. Copy `.env.example` to `.env.local` and set:
   - `NEXT_PUBLIC_API_BASE_URL` – base URL of the Oceane-Marine backend (e.g. `http://localhost:4000` in dev)
3. Run the main Oceane-Marine app (backend), then run this app: `npm run dev`

## Project structure

- `src/app/` – Next.js App Router (layout, home, dynamic `/forms/[formCode]`)
- `src/components/` – shared Navigation
- `src/forms/` – one folder per form; each form is self-contained and loaded by form code

## Merged from

- Due-Diligence-Subcontractor-Audit → `audit-form`
- HSE-Induction-Checklist → `hse-induction-checklist`
- Near-Miss-Form → `near-miss`
- Supplier-Due-Diligence-Questionnaire → `supplier-questionnaire`
- STS-Transfer-Audit-Report → `transfer-audit-report`

API endpoints and behaviour are unchanged; only the host app is unified.
