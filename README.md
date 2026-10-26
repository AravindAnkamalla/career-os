# CareerOS

A self-hosted web app for tracking software engineering job searches, technical interview preparation, and daily engineering tasks.

## Features

- **Job Discovery & Matching**: Aggregates job postings from external APIs (JSearch / Google Jobs) with fallback fixtures. Deterministic scoring algorithm evaluates role alignment, skill overlap, experience level, and preferred stack.
- **Application Tracker**: Kanban pipeline tracking stages from discovery through offer. Records interview dates, follow-up deadlines, and stage history.
- **Daily Task Planner**: Task management categorized by job search, system design, backend engineering, DSA, and interview prep.
- **Project Portfolio**: Records project architecture, problems solved, technical challenges, repository links, and live URLs.
- **DSA Practice Log**: Logs Java data structure and algorithm problems with pattern tags, time/space complexity, and solution approach notes.
- **Interview Prep**: Outlines talking points, STAR behavioral notes, and reflection logs for recruiter screens and technical rounds.
- **Upskilling Tracks**: Checklists across backend engineering, database internals, API reliability, distributed systems, and DSA.

## Tech Stack

- **Framework**: Next.js 15 (App Router, Server Components, Route Handlers)
- **Language**: TypeScript
- **Database**: SQLite (via Prisma ORM; compatible with PostgreSQL)
- **UI**: Tailwind CSS, Lucide React
- **Testing**: Vitest

## Quick Start

### 1. Install dependencies

```bash
git clone https://github.com/AravindAnkamalla/career-os.git
cd career-os
npm install
```

### 2. Configure environment variables

Copy the example file:

```bash
cp .env.example .env
```

Default variables:

```env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional: JSearch (RapidAPI) for live job listings
JSEARCH_API_KEY=""
JSEARCH_API_HOST="jsearch.p.rapidapi.com"
```

*If no API key is provided, the application runs using local development fixtures.*

### 3. Initialize the database

```bash
npx prisma db push
```

### 4. Start the development server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

To populate initial profile preferences and sample data, click **Seed Profile** in the top navigation or run:

```bash
curl -X POST http://localhost:3000/api/seed
```

## Running Tests

```bash
npm run test:run
```

Runs unit tests for the job matching algorithm and integration tests for the discovery, application, and task workflows.

## Project Structure

```text
career-os/
├── prisma/
│   └── schema.prisma         # Database schema (User, Job, Application, Task, Project, DSA)
├── src/
│   ├── app/                  # Next.js App Router pages and API routes
│   │   ├── api/              # REST route handlers
│   │   ├── applications/     # Application Kanban pipeline
│   │   ├── dsa/              # DSA practice tracker
│   │   ├── interviews/       # Interview prep & talking points
│   │   ├── jobs/             # Job discovery & scoring
│   │   ├── learning/         # Upskilling tracks
│   │   ├── profile/          # Profile & algorithm preferences
│   │   ├── projects/         # Engineering project portfolio
│   │   └── tasks/            # Daily planner
│   ├── components/           # Reusable UI and layout components
│   └── lib/
│       ├── db.ts             # Prisma client instance
│       ├── integrations/     # Job API providers (JSearch, Fixture)
│       ├── matching/         # Scoring and fit calculation logic
│       └── services/         # Job discovery, deduplication, and seed services
└── vitest.config.ts          # Test runner configuration
```

## License

MIT
