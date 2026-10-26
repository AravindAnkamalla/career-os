# CareerOS — Personal Career Operating System

CareerOS is a private, single-user **Career Operating System** designed for software engineers to organize their entire career development, job search, interview preparation, and daily execution in one unified workspace.

---

## Key Capabilities

1. **Deterministic Job Matching Engine**:
   - Transparent, multi-factor scoring (Role relevance, Technical skill overlap, Experience bounds, Location/Remote mode, Preferred stack alignment, Seniority fit).
   - Multi-dimensional breakdown with explainable recommendations — no black-box scores.

2. **Job Discovery & Provider Architecture**:
   - Provider interface supporting live API feeds (JSearch via RapidAPI, Adzuna) and built-in development fixtures.
   - Idempotent deduplication using stable external IDs, URLs, and time-windowed title/company matches.
   - Run history tracking: durations, new jobs, skipped duplicates, and error summaries.

3. **Application Pipeline & Kanban Tracker**:
   - Visual Kanban tracking across stages: *Discovered → Shortlisted → Preparing → Applied → Recruiter Screen → Technical Interview → Final Interview → Offer*.
   - Direct stage transition controls, timeline history, and follow-up deadline reminders.

4. **Daily Execution & Task Planning**:
   - Task manager organized across categories: *Job Search, Backend Engineering, System Design, DSA, Interview Prep, Career Admin*.
   - Filter views for *Today, Upcoming (7 Days), Overdue*, and priority ordering (*Urgent, High, Medium, Low*).
   - Deep bi-directional linking between Applications, Discovered Jobs, and Preparation Tasks.

5. **Dynamic Career Profile & Preferences**:
   - Editable target roles, preferred locations, remote work preferences, experience bounds, and preferred tech stack.
   - Calibrates the job matching algorithm dynamically without hardcoding.

---

## Tech Stack

- **Framework**: Next.js 15 (App Router, Server Components & Route Handlers)
- **Language**: TypeScript (strict mode)
- **Styling & UI**: Tailwind CSS v4, Lucide React, shadcn/ui patterns
- **Data & ORM**: Prisma ORM with SQLite for local development (seamless migration path to PostgreSQL for deployment)
- **Testing**: Vitest with unit and integration test coverage
- **Validation**: Zod schema validation at external and input boundaries

---

## Getting Started

### 1. Prerequisites
- Node.js >= 18
- npm >= 9

### 2. Installation
```bash
git clone https://github.com/AravindAnkamalla/career-os.git
cd career-os
npm install
```

### 3. Environment Setup
Copy the environment example template:
```bash
cp .env.example .env
```

Configuration parameters:
```env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional Live Job Discovery (RapidAPI JSearch)
JSEARCH_API_KEY=""
JSEARCH_API_HOST="jsearch.p.rapidapi.com"
```
*Note: If no API key is configured, CareerOS automatically runs in Development Fixture mode with clearly labeled sample jobs.*

### 4. Database Setup & Seeding
```bash
npx prisma generate
npx prisma db push
```

To seed initial profile data, career preferences, and verified technical skills:
```bash
curl -X POST http://localhost:3000/api/seed
# or click "Seed Profile" in the application header
```

### 5. Running the Application
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Running Automated Tests
```bash
npm run test:run
```

All core workflows (Deterministic matching engine, multi-dimensional scoring, job discovery normalization, deduplication, application creation, and task linking) are covered with unit and integration tests.

---

## Architecture & Principles
- **Forward Deployed Engineer Mindset**: Build small, practical, working vertical slices connected end-to-end.
- **Explainability Over Magic**: Match scores provide actionable reasons and identify missing skills.
- **Zero Mock Pretending**: Fixture data is explicitly labeled as dev data. Live data is integrated through typed provider interfaces.
- **Privacy by Default**: Career data stays private on your local machine / database.
