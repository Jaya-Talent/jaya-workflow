# Jaya Talent — Web3 Recruitment & Intelligent Talent Matching Platform

**Jaya Talent** is an enterprise-grade recruitment and candidate matching platform built specifically for Web3 startups supported by top-tier venture capital firms. Rather than functioning as a standard employer Applicant Tracking System (ATS), Jaya Talent acts as an automated talent network: candidates create structured profiles, an intelligent 8-factor scoring engine pairs them with active job opportunities, and multi-channel notifications (Telegram & Email) keep job seekers connected with relevant roles in real time.

---

## 🌟 Key Features & Capabilities

- **Structured Candidate Onboarding & Application Wizard**:
  - 4-step guided application flow (`/apply`) capturing skills, experience, target roles, preferred work locations, and salary expectations.
  - Resume / CV upload with secure file storage.
  - Granular notification frequency preferences (Instant, Daily Digest, Weekly Digest, or Muted).

- **Deterministic 8-Factor Talent Matching Engine**:
  - Custom weighted scoring algorithm evaluating:
    - **Skills Alignment (30%)** — Includes alias normalization (e.g., `React.js` → `React`, `TS` → `TypeScript`).
    - **Experience Match (20%)** — Years of professional experience verification.
    - **Job Title Relevance (15%)** — Direct and fuzzy title overlap.
    - **Seniority Level (10%)** — Mapping candidate level to job expectations.
    - **Location & Remote Preference (10%)** — Remote vs. onsite and timezone overlap.
    - **Employment Type (5%)** — Full-time, part-time, or contract options.
    - **Salary Expectation (5%)** — Budget constraint verification.
    - **Other Requirements (5%)** — Domain-specific Web3 keywords & qualifiers.

- **AI-Powered Match Rationale Generation**:
  - LLM-assisted explanation module powered by **xAI / OpenAI** to generate natural language match summaries explaining *why* a candidate was paired with a specific role.

- **Multi-Channel Notification Dispatcher**:
  - **Telegram Bot Integration**: Delivers real-time notifications with interactive inline keyboard actions (Apply, Save for Later, Not Relevant).
  - **Transactional & Digest Email**: Formatted HTML notification emails with direct application tracking links.
  - **Channel-Specific Thresholds**: Independent scoring cutoffs for instant sends vs. digests.
  - **Resilient Delivery**: Automatic retry queue (up to 3 attempts) for failed notification deliveries.

- **Dual Database Architecture (Neon + PGLite)**:
  - **Production**: Serverless PostgreSQL via **Neon** with Kysely query execution.
  - **Local/Preview**: Zero-dependency embedded WebAssembly PostgreSQL via **PGlite** (`@electric-sql/pglite`) with auto-applied migrations on startup.
  - **Legacy/Backup Sync**: Abstracted repository pattern allowing simultaneous CSV data export and file backup (`ApplicantRepository`).

- **Enterprise Admin Management Portal**:
  - Secured administrative dashboard (`/admin`) for talent operations teams.
  - Applicant pipeline search, filtering, and private CV downloading.
  - Job posting management and manual matching batch execution.
  - Audit logging and notification retry controls.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Clients["Clients & Interfaces"]
        Applicant["Candidate (/apply, /profile)"]
        Admin["Recruiter / Admin (/admin)"]
        TelegramUser["Telegram User (Inline Bot Buttons)"]
    end

    subgraph AppLayer["TanStack Start Application (React 19 + Vite)"]
        Routes["Router & Page Views"]
        API["REST API Endpoints (/api/*)"]
        AuthGate["Session & Gate Identity Guard"]
    end

    subgraph CoreEngine["Matching & Notification Engine"]
        Engine["Deterministic 8-Factor Engine"]
        Normalizer["Skill Alias Normalizer"]
        AIExplainer["LLM Match Rationale Generator (xAI)"]
        Dispatcher["Notification Dispatcher"]
        Worker["Background Matching Worker"]
    end

    subgraph DataLayer["Persistence & Storage Layer"]
        Neon["Neon PostgreSQL (Production)"]
        PGLite["PGlite WASM DB (Local / Preview)"]
        CSV["CSV Storage Backup (data/)"]
        S3["Private CV Storage (AWS S3 / Local FS)"]
    end

    subgraph ExternalServices["External Channels"]
        TelegramAPI["Telegram Bot API"]
        EmailProvider["Transactional Email Service"]
    end

    Applicant --> Routes
    Admin --> AuthGate --> Routes
    TelegramUser --> API

    Routes --> API
    API --> Engine
    Worker --> Engine

    Engine --> Normalizer
    Engine --> AIExplainer
    Engine --> Dispatcher

    Dispatcher --> TelegramAPI
    Dispatcher --> EmailProvider

    API --> DataLayer
    Engine --> DataLayer
    DataLayer --> S3
```

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend Framework** | [React 19](https://react.dev/), [TanStack Start](https://tanstack.com/start), [TanStack Router](https://tanstack.com/router) |
| **Styling & UI Components** | [Tailwind CSS v4](https://tailwindcss.com/), [Radix UI](https://www.radix-ui.com/), [Lucide Icons](https://lucide.dev/), [Recharts](https://recharts.org/), [Sonner Toast](https://sonner.emilkowal.ski/) |
| **Form Handling & Validation** | [React Hook Form](https://react-hook-form.com/), [Zod v4](https://zod.dev/) |
| **Backend & API Runtime** | Nitro / Node.js Server Routes, TanStack Server Functions |
| **Database & ORM** | [Kysely](https://kysely.dev/), [Neon PostgreSQL](https://neon.tech/), [`@electric-sql/pglite`](https://pglite.dev/) |
| **Authentication & Security** | Better-Auth, HTTP-Only Signed Cookies, Custom Identity Gates |
| **AI & NLP** | xAI / OpenAI API SDK for Match Rationale Generation |
| **Storage & Messaging** | AWS S3 SDK (`@aws-sdk/client-s3`), Telegram Bot API, Node Mailer/Transactional Email |

---

## 📁 Repository Structure

```
├── migrations/                # Database SQL migration files (0001_initial.sql, etc.)
├── scripts/                   # CLI execution & build utilities
│   ├── migrate.mjs            # Standalone migration executor
│   ├── matching.mjs           # Manual matching CLI trigger
│   └── check-auth-invariant.mjs
├── src/
│   ├── components/            # React UI components
│   │   ├── admin-shell.tsx    # Admin dashboard layout & navigation
│   │   ├── apply/             # Multi-step applicant onboarding wizard
│   │   ├── job-card.tsx       # Standardized job listing card
│   │   └── site-chrome.tsx    # Header, footer, and navigation
│   ├── lib/                   # Core business logic & server services
│   │   ├── applicants/        # Applicant profiles, validation, and CV storage
│   │   ├── app-data/          # Core application data context & state
│   │   ├── auth/              # Better-Auth, session gates, and admin security
│   │   ├── jobs/              # Job posting repository & formatters
│   │   ├── matching/          # 8-factor scoring engine, normalizer, and AI rationale
│   │   ├── notifications/     # Telegram bot, email dispatcher, and digests
│   │   ├── workers/           # Background interval matching task worker
│   │   ├── db.ts              # Neon & PGLite database client selector
│   │   └── site.ts            # Site metadata configuration (Jaya Talent)
│   └── routes/                # Page routes and API handlers (/api/*)
├── data/                      # Local CSV backup storage & private CV directory
└── vite.config.ts             # Vite, TanStack, and Tailwind CSS configuration
```

---

## ⚡ Environment Configuration

Copy `.env.example` to create your local `.env` file before running the project:

```bash
cp .env.example .env
```

### Key Environment Variables

| Variable | Description | Default / Example |
|---|---|---|
| `DATABASE_URL` | Neon PostgreSQL Connection String (if unset, PGLite local DB is used) | `postgresql://user:pass@ep-xyz.neon.tech/neondb` |
| `ADMIN_PASSWORD` | Access password for `/admin` portal | `meridian-admin` |
| `ADMIN_SECRET` | Secret key used to sign admin session cookies | `your-secure-secret-key` |
| `DATA_DIR` | Directory for local file storage (CSV backup & CV files) | `./data` |
| `PUBLIC_APP_URL` | Canonical URL used for notification links | `https://jayatalent.com` |
| `MATCH_NOTIFICATION_THRESHOLD` | Overall default score cutoff for notifications | `75` |
| `TELEGRAM_NOTIFICATION_THRESHOLD` | Telegram alert score cutoff | `75` |
| `EMAIL_NOTIFICATION_THRESHOLD` | Email alert score cutoff | `80` |
| `MATCH_INSTANT_THRESHOLD` | Score cutoff triggering immediate notification | `90` |
| `MATCHING_INTERVAL_MINUTES` | Frequency of background matching runs (in minutes) | `30` |
| `TELEGRAM_BOT_TOKEN` | Telegram Bot API Token | `123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ` |
| `TELEGRAM_WEBHOOK_SECRET` | Secret key for Telegram webhook validation | `your-webhook-secret` |
| `EMAIL_API_KEY` | Transactional email provider API key | `re_123456789` |
| `EMAIL_FROM` | Sender email address | `notifications@jayatalent.com` |
| `XAI_API_KEY` | xAI / OpenAI API key for AI match explanations | `xai-123456789` |
| `S3_BUCKET` | AWS S3 Bucket Name for private CV uploads | `jaya-talent-cvs` |
| `AWS_REGION` | AWS Region for S3 storage | `us-east-1` |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v20.0.0 or higher
- **npm**: v10.0.0 or higher

### 1. Installation
```bash
git clone git@github.com:<YOUR-ORGANIZATION>/<YOUR-REPO-NAME>.git
cd "job seeker "
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
The application will launch on **http://localhost:8080** (or `http://localhost:8081` if port 8080 is occupied).

### 3. Database Migrations
Migrations execute automatically when running the application on PGLite. To manually run database migrations against a Neon PostgreSQL database:

```bash
npm run db:migrate
```

### 4. Running the Matching Engine Manually
To score all active candidates against active job listings on demand:

```bash
npm run matching
```

To run unit tests for the matching engine:
```bash
npm run test:matching
```

---

## 🔌 REST API Documentation

### Public & Candidate Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | System health check; triggers background matching worker initialization |
| `POST` | `/api/applicants` | Register a new job seeker profile |
| `GET` | `/api/applicants/:id` | Retrieve an applicant profile |
| `PATCH` | `/api/applicants/:id` | Update profile information or notification preferences |
| `POST` | `/api/applicants/:id/cv` | Upload candidate resume / CV file |
| `GET` | `/api/jobs` | Retrieve list of active Web3 job postings |
| `GET` | `/api/jobs/:id` | Retrieve details for a specific job |
| `GET` | `/api/matches/applicant/:id` | Fetch top job matches for an applicant |
| `POST` | `/api/matches/actions` | Perform candidate action on a job (`apply`, `save`, `not_relevant`) |
| `POST` | `/api/telegram/webhook` | Webhook callback listener for Telegram bot button actions |

### Admin & Administrative Endpoints *(Requires Admin Auth)*

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/admin/login` | Authenticate admin session (`{ "password": "..." }`) |
| `POST` | `/api/admin/logout` | Terminate admin session |
| `GET` | `/api/admin/applicants` | List and search all registered applicants |
| `GET` | `/api/admin/applicants/:id/cv` | Securely stream/download candidate CV |
| `GET` | `/api/admin/jobs` | Retrieve full job database with candidate metrics |
| `POST` | `/api/admin/jobs` | Create a new job posting |
| `GET` | `/api/admin/matching` | Fetch overall matching table, scoring metrics, and logs |
| `POST` | `/api/admin/matching/run` | Execute matching engine across all active candidates and jobs |
| `POST` | `/api/matching/applicant/:id` | Run matching engine for a single candidate |
| `POST` | `/api/matching/job/:id` | Run matching engine for a single job posting |
| `POST` | `/api/admin/notifications/retry` | Retry failed Telegram or Email notification sends |

---

## 🔒 Security & Data Privacy

1. **Private Candidate CV Storage**: Resumes are stored outside public static directories and are accessible **only** through authenticated administrative API endpoints (`/api/admin/applicants/:id/cv`).
2. **Environment Secret Protection**: Secret keys (`ADMIN_SECRET`, `TELEGRAM_BOT_TOKEN`, `EMAIL_API_KEY`) are kept strictly server-side and never exposed in client bundles.
3. **Session Guards**: Administrative routes implement HTTP-only signed cookie verification to prevent cross-site request forgery (CSRF) and unauthorized pipeline access.

---

## 📄 License

This project is proprietary software belonging to **Jaya Talent**. All rights reserved.
