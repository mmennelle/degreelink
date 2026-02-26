# Articulation Matrix — Deployment & Migration Procedure

Quick-reference for deploying the Louisiana BoR CCN articulation feature.

---

## Prerequisites

| Item | Detail |
|------|--------|
| Python | 3.10+ (type-hint syntax used) |
| PostgreSQL | Running, accessible via `DATABASE_URL` |
| PDF file | `docs/FINAL-Proposed-Articulation-Matrix-AY-2022-2023-sent-for-BoR-Review.pdf` |
| Admin token | `ADMIN_API_TOKEN` env var configured |

---

## Step-by-Step

### 1. Pull latest code

```bash
git pull origin main
```

### 2. Install new Python dependency

```bash
cd backend
pip install -r requirements.txt
# pdfplumber was added for PDF extraction
```

### 3. Apply database migrations (if any pending)

The articulation feature uses the **existing** `courses` and `equivalencies` tables — no new migrations are needed. Verify your DB is current:

```bash
cd backend
flask db upgrade
```

If you see `Already at head`, you're good. If you have pending migrations from earlier features (OTP, catalog year lock, etc.), they'll be applied first.

### 4. Extract the PDF into CSV

```bash
cd backend
python scripts/extract_articulation_matrix.py
```

This reads the PDF and writes `docs/articulation_matrix.csv`. You only need to do this once per PDF version. Verify the output:

```bash
head -3 ../docs/articulation_matrix.csv
# Should show: ccn,ccn_title,BPCC,BRCC,CLTCC,...,SUSLA
```

### 5. Seed the database

**Option A — Dry run (preview what would happen):**

```bash
python scripts/import_articulation_matrix.py --dry-run
```

**Option B — Commit to DB:**

```bash
python scripts/import_articulation_matrix.py
```

This will:
- Create/update CCN courses (institution = `Louisiana Board of Regents`)
- Create/update local courses at all 27 institutions
- Create `articulation` and `subject_area` equivalency links
- Run an equivalency consistency validation at the end

**Option C — Validate only (no imports, just check existing data):**

```bash
python scripts/import_articulation_matrix.py --validate-only
```

### 6. Start the backend

```bash
flask run
# or: gunicorn app:create_app()
```

Verify the articulation endpoints are live:

```bash
curl http://localhost:5000/api/articulation/institutions
# Should return {"institutions": [...27 items...]}
```

### 7. Start the frontend

```bash
cd frontend
npm install   # only needed first time
npm run dev
```

Navigate to the **Transfer Lookup** tab in the app.

### 8. (Optional) Upload via admin UI instead of CLI

If you prefer the web UI over the CLI seeder:

1. Log in as admin/advisor
2. Go to **Upload Data** → select **Articulation Matrix (Louisiana CCN)**
3. Upload `docs/articulation_matrix.csv`
4. Review the preview and confirm

---

## What Changed (Files)

### New files
| File | Purpose |
|------|---------|
| `backend/scripts/extract_articulation_matrix.py` | PDF → CSV extraction |
| `backend/scripts/import_articulation_matrix.py` | CSV → DB seeder with upsert & validation |
| `backend/routes/articulation.py` | Blueprint: 5 API endpoints |
| `frontend/src/components/ArticulationLookup.jsx` | Transfer lookup UI |
| `frontend/src/pages/ArticulationPage.jsx` | Page wrapper |

### Modified files
| File | Change |
|------|--------|
| `backend/routes/__init__.py` | Registered articulation blueprint |
| `backend/requirements.txt` | Added `pdfplumber` |
| `frontend/src/services/api.js` | 6 new API methods |
| `frontend/src/controllers/useAppController.js` | Transfer Lookup tab |
| `frontend/src/views/AppShell.jsx` | ArrowRightLeft icon |
| `frontend/src/App.jsx` | `/articulation` route |
| `frontend/src/components/CSVUpload.jsx` | Articulation upload type |

### No schema migrations required
The feature stores data in the existing `courses` and `equivalencies` tables using:
- **New `equivalency_type` values:** `'articulation'`, `'subject_area'`
- **New `institution` value:** `'Louisiana Board of Regents'` (for CCN courses)
- **New courses** with `course_number='***'` for wildcard subject-area credits

---

## API Endpoints Reference

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/articulation/institutions` | Public | List all 27 institutions |
| GET | `/api/articulation/ccn` | Public | Paginated CCN course list |
| GET | `/api/articulation/lookup` | Public | Course ↔ CCN lookup |
| GET | `/api/articulation/validate` | Admin | Full DB consistency check |
| POST | `/api/articulation/upload/preview` | Admin | Preview matrix upload |
| POST | `/api/articulation/upload` | Admin | Commit matrix upload |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `ModuleNotFoundError: pdfplumber` | `pip install pdfplumber` or `pip install -r requirements.txt` |
| `ImportError: articulation` in startup | Ensure `backend/routes/articulation.py` exists and is syntactically valid |
| Preview shows 0 equivalencies | Expected — equivalency counting only works in commit mode |
| `Course.query.get()` deprecation warning | Already fixed — using `db.session.get()` |
| Extraction gives empty CSV | Check PDF filename matches the path in the script's defaults |

---

## Re-running / Updating

The import script uses **upsert** logic — safe to re-run:
- CCN courses: updates title if changed
- Local courses: updates department if missing, credits if 0
- Equivalencies: skips if link already exists

To import a newer matrix (e.g., AY 2024-2025):
1. Place the new PDF in `docs/`
2. `python scripts/extract_articulation_matrix.py path/to/new.pdf`
3. `python scripts/import_articulation_matrix.py docs/articulation_matrix.csv`
