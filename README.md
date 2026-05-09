# MediFile v3.0 — Digital Record Management System

**Gweru Specialist Children's Hospital**

> Developer: devntando

A modern, paperless document and patient management system built for hospital operations.

---

## Features

### Core System
- **Dynamic Departments** — Create, edit, and manage departments from the admin panel
- **Document Management** — Create, track, and approve documents with priority levels
- **Task Board** — Kanban-style task management with assignment and due dates
- **Digital Forms** — Department-specific forms with submission tracking
- **Maintenance Tracking** — Submit and track facility maintenance requests
- **Internal Messaging** — Department-based communication channels
- **Admin-Created Users** — No self-registration; admin creates all accounts
- **Department Boards** — Each department posts their own notices, procedures, announcements
- **Admin Panel** — Hidden superadmin panel for full system monitoring
- **Real-Time Dashboard** — Live stats from actual system data

### Patient Care Module (v3.0)
- **Patient Registry** — Register patients with ID auto-generation (GSCH-00001), blood type, allergies, gender, guardian info
- **Care Type Tracking** — Each patient is automatically tagged: `Admitted`, `Observation`, `Day Care`, or `Outpatient`
- **Admissions** — Full admission workflow: ward, bed, doctor, diagnosis, dietary notes, discharge with timestamp
- **Observation Ward** — Track patients under observation: area, reason, vitals (JSON), escalate to full admission or mark complete
- **Day Care** — Check-in/check-out for day care children with dietary needs and scheduling
- **Kitchen & Meal Requests** — Nurses submit meal/dietary/special requests per patient per meal time (Breakfast/Lunch/Dinner/Snack). Requests auto-post to the Kitchen department channel
- **Patient-Kitchen Messaging** — Direct message channel between ward staff and Kitchen department, linked to individual patients. Messages mirror to the Kitchen dept channel in real time
- **Patient Messages** — Per-patient message history across Kitchen, Nursing, and General channels

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** PostgreSQL with Prisma ORM
- **Auth:** NextAuth.js (JWT)
- **Styling:** Tailwind CSS
- **Deployment:** Docker / Render

---

## Getting Started

```bash
git clone https://github.com/mr-ntando-dev/gsch-paperless
npm install
cp .env.example .env
# Edit .env with your DATABASE_URL and NEXTAUTH_SECRET
npx prisma db push
npx prisma db seed
npm run dev
```

## Environment Variables

```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

## Default Accounts (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@gsch.co.zw | admin2026 |

---

## API Endpoints (v3.0 additions)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/patients` | Patient registry |
| GET/POST/PATCH | `/api/admissions` | Admissions management |
| GET/POST/PATCH | `/api/observations` | Observation ward |
| GET/POST/PATCH | `/api/daycare` | Day care records |
| GET/POST/PATCH | `/api/kitchen` | Kitchen meal requests |
| GET/POST | `/api/patient-messages` | Patient-channel messaging |

---

## Source Protection

Production builds have source maps disabled (`productionBrowserSourceMaps: false`) and webpack minification enabled. Run `npm run obfuscate` before pushing sensitive logic to strip comments and mangle local identifiers.

---

© 2026 Gweru Specialist Children's Hospital · devntando
