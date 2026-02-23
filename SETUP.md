# Using QHSE Forms with the Main Oceane-Marine App

This app (QHSE_Forms) is the **external forms** entry point. External users open links here, fill forms, and submissions are stored in the **main Oceane-Marine** app. You view and manage submissions in the main app’s list views.

---

## How it works

1. **QHSE_Forms** (this app) – Public form pages. Users open a link, fill the form, and submit.
2. **Oceane-Marine** (main app) – Backend API and list/view screens. Submissions from external forms go to the same API and appear in the same lists as forms filled inside the main app.

```
External user → QHSE_Forms (form UI) → /api/proxy/... → Oceane-Marine API → Database
                                                              ↓
Internal user → Oceane-Marine app → List/View pages (same data)
```

---

## 1. Run both apps

### Main app (Oceane-Marine) – backend + list views

- Run the main project (e.g. `npm run dev` on port **4000** or whatever it uses).
- Ensure MongoDB and any env the main app needs are configured.

### This app (QHSE_Forms) – external forms

- In **QHSE_Forms** root, copy env and set the main app URL:

```bash
cp .env.example .env.local
```

- Edit **`.env.local`**:

```env
# Main Oceane-Marine app URL (no trailing slash). Use the URL where the main app is running.
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

- Start this app (e.g. `npm run dev`). It often runs on port **3000**.

---

## 2. Links to share with external users

Use the **base URL of this app** (QHSE_Forms). Replace `https://your-qhse-forms-domain.com` with your actual URL (e.g. `http://localhost:3000` in dev).

| Form | Link to share |
|------|-------------------------------|
| Subcontractor Audit | `https://your-qhse-forms-domain.com/forms/audit-form` |
| HSE Induction Checklist | `https://your-qhse-forms-domain.com/forms/hse-induction-checklist` |
| Near Miss / Incident Reporting | `https://your-qhse-forms-domain.com/forms/near-miss` |
| POAC Cross Competency | `https://your-qhse-forms-domain.com/forms/poac-cross-competency` |
| Supplier Questionnaire | `https://your-qhse-forms-domain.com/forms/supplier-questionnaire` |
| STS Transfer Audit Report | `https://your-qhse-forms-domain.com/forms/transfer-audit-report` |

Example for local dev:

- `http://localhost:3000/forms/supplier-questionnaire`
- `http://localhost:3000/forms/poac-cross-competency`

---

## 3. Where to view submissions in the main app

Log into the **Oceane-Marine** app and open the matching list page. Submissions from external links appear in the same list.

| External form | Main app list URL (path under your main app domain) |
|----------------|------------------------------------------------------|
| Subcontractor Audit | `/qhse/due-diligence-subconstructor/audit-sub-contractor/list-admin` |
| Supplier Questionnaire | `/qhse/due-diligence-subconstructor/due-diligence-questionnaire/questionnaire-list-admin` |
| Near Miss | `/qhse/near-miss` |
| POAC Cross Competency | `/qhse/poac/cross-competency/list` |
| HSE Induction Checklist | `/qhse/forms-checklist/hse-induction-checklist/list` |
| STS Transfer Audit | `/qhse/forms-checklist/transfer-audit/list` |

Example (main app on `http://localhost:4000`):

- Subcontractor list: `http://localhost:4000/qhse/due-diligence-subconstructor/audit-sub-contractor/list-admin`
- POAC list: `http://localhost:4000/qhse/poac/cross-competency/list`

---

## 4. Production / deployed setup

1. **Deploy Oceane-Marine** and note its public URL (e.g. `https://api.yourapp.com` or `https://main.yourapp.com`).
2. **Deploy QHSE_Forms** (e.g. Vercel, same server, or another host).
3. In the **QHSE_Forms** deployment, set:

```env
NEXT_PUBLIC_API_BASE_URL=https://your-main-app-url.com
```

(Use the full base URL of the main app, no trailing slash.)

4. Share links using the **QHSE_Forms** domain, e.g.:

- `https://forms.yourapp.com/forms/supplier-questionnaire`

5. View and manage submissions in the main app using the list URLs above (on the main app domain).

---

## 5. Troubleshooting

- **“Backend request failed” / “fetch failed”**  
  - Main app must be running and reachable.  
  - `NEXT_PUBLIC_API_BASE_URL` in QHSE_Forms must point to that main app (and be set where the app is built, e.g. in the deployment env).  
  - Restart the QHSE_Forms dev server after changing `.env.local`.

- **Submissions not in main app list**  
  - Confirm the main app is the one that uses the same API (same database).  
  - Check the correct list URL in the table above.  
  - Ensure the main app’s create API and list API are working (e.g. test from the main app first).

- **CORS**  
  - External forms call the main app only via the QHSE_Forms **proxy** (`/api/proxy/...`), so the browser talks to the same origin as QHSE_Forms. CORS is not required for the external user’s browser to the main app.
