# Meridian — Talent matching network

Meridian is a job-seeker talent network: applicants create a structured profile, we score them against a jobs dataset, and we notify people about strong matches. This is not an employer ATS.

The stack is TanStack Start (React + Vite) with server routes that expose a small REST API. Storage is CSV files so no SQL database is required.

## Run

```bash
npm install
npm run dev
```

The app listens on port 8080. Frontend pages and `/api/*` are served together.

```bash
npm run matching      # score all active applicants against active jobs
npm run test:matching # matching engine unit tests
npm run build
```

## Environment variables

Copy `.env.example`. Do not commit real secrets. If Telegram, email or xAI keys are missing, matching still runs and those channels are skipped.

| Variable | Purpose | Default |
|---|---|---|
| `ADMIN_PASSWORD` | Password for `/admin` | `meridian-admin` |
| `ADMIN_SECRET` | Signs the admin session cookie | falls back to the password |
| `DATA_DIR` | Directory for CSV + CV files | `./data` |
| `PUBLIC_APP_URL` | Origin used in notification links | empty |
| `MATCH_NOTIFICATION_THRESHOLD` | Default notify cutoff | `75` |
| `TELEGRAM_NOTIFICATION_THRESHOLD` | Telegram cutoff | `75` |
| `EMAIL_NOTIFICATION_THRESHOLD` | Email cutoff | `80` |
| `MATCH_INSTANT_THRESHOLD` | Instant send cutoff | `90` |
| `MATCHING_INTERVAL_MINUTES` | Background matching interval | `30` |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token | empty (skip) |
| `TELEGRAM_WEBHOOK_SECRET` | Telegram webhook validation | empty |
| `EMAIL_PROVIDER` | Email provider label | empty |
| `EMAIL_API_KEY` | Transactional email API key | empty (skip) |
| `EMAIL_FROM` | From address | empty |
| `MATCH_WEIGHT_*` | Scoring weights | see `.env.example` |

## Data files

| File | Purpose |
|---|---|
| `data/applicants.csv` | Job seeker profiles |
| `data/jobs.csv` | Structured jobs dataset |
| `data/matches.csv` | One row per applicant/job pair |
| `data/notifications.csv` | Telegram/email send history |
| `data/interactions.csv` | Apply / save / not relevant events |
| `data/cvs/` | Private CV files |

`/data` is not a public static folder. CVs are only downloadable from the authenticated admin area.

## Product flow

1. A job seeker creates a profile at `/apply`.
2. Matching scores the profile against active jobs (0–100) with a human-readable explanation.
3. Matches at or above the threshold are queued for Telegram and/or email according to the applicant’s preferences.
4. The applicant can apply, save, or mark a job not relevant from `/profile/:id` or Telegram buttons.
5. Admins inspect applicants, jobs and match explanations at `/admin`.

New applicants and new jobs trigger matching automatically. A process-local worker also runs on `MATCHING_INTERVAL_MINUTES` after `/api/health` is hit.

## API

| Method | Path | Notes |
|---|---|---|
| `GET` | `/api/health` | Health check; starts the matching worker |
| `POST` | `/api/applicants` | Create a profile |
| `GET` | `/api/applicants/:id` | Fetch a profile |
| `PATCH` | `/api/applicants/:id` | Update a profile / notification prefs |
| `GET` | `/api/jobs` | List active jobs |
| `GET` | `/api/jobs/:id` | Job detail |
| `POST` | `/api/jobs` | Create a job (admin) |
| `POST` | `/api/matching/run` | Score everyone (admin) |
| `POST` | `/api/matching/applicant/:id` | Score one applicant (admin) |
| `POST` | `/api/matching/job/:id` | Score one job (admin) |
| `GET` | `/api/matches/applicant/:id` | Applicant matches |
| `GET` | `/api/matches/job/:id` | Job-side candidates (admin) |
| `POST` | `/api/matches/actions` | Apply / save / not relevant |
| `POST` | `/api/telegram/webhook` | Telegram callback buttons |
| `POST` | `/api/admin/login` | `{ "password": "…" }` |
| `GET` | `/api/admin/applicants` | Applicant list (admin) |
| `GET` | `/api/admin/jobs` | Job list (admin) |
| `GET` | `/api/admin/matching` | Match table + stats (admin) |
| `POST` | `/api/admin/notifications/retry` | Retry failed sends (admin) |

## Matching

The engine is deterministic and independent of Telegram/email. Weights default to skills 30, experience 20, title 15, seniority 10, location 10, employment 5, salary 5, other 5. Skills are normalized through aliases (React.js → React, TS → TypeScript). If `XAI_API_KEY` is set, explanations for high scores may be enhanced, with a small per-run budget. Scoring never depends on the model.

Notifications respect opt-in flags, per-channel thresholds, ignored jobs, and frequency (instant / daily / weekly). Failed sends are logged and can be retried up to 3 times.

## Admin

Open `/admin` and sign in with `ADMIN_PASSWORD` (preview default: `meridian-admin`). From there:

- Applicants — search, filters, CVs
- Jobs — dataset plus best matching candidates
- Matching — stats, explanations, notification status, run matching, retry failures

## Replacing CSV later

Applicant storage is behind `ApplicantRepository`. Jobs, matches, notifications and interactions have the same file-backed pattern. Swap the repository implementations without changing the frontend.

## Project map

- `src/routes/` — pages and API routes
- `src/components/` — landing, form, jobs, admin UI
- `src/lib/applicants/` — validation, completeness, repository
- `src/lib/jobs/` — jobs dataset
- `src/lib/matching/` — scoring engine, pipeline, match store
- `src/lib/notifications/` — Telegram, email, digest, interactions
- `src/lib/workers/` — interval matching worker
- `data/` — CSV database and private CV files
