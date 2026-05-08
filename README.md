# MediFile - Digital Document Management System

**Gweru Specialist Children's Hospital**

A modern, paperless document management system built for hospital operations. Manage documents, tasks, forms, maintenance requests, and internal communications across all departments.

## Features

- 🏥 **Dynamic Departments** — Create, edit, and manage departments from the admin panel
- 📄 **Document Management** — Create, track, and approve documents with priority levels
- ✅ **Task Board** — Kanban-style task management with assignment and due dates
- 📝 **Digital Forms** — Department-specific forms with submission tracking
- 🔧 **Maintenance Tracking** — Submit and track facility maintenance requests
- 💬 **Internal Messaging** — Department-based communication channels
- 🔐 **Admin-Created Users** — No self-registration; admin creates all accounts
- 📌 **Department Boards** — Each department posts their own notices, procedures, announcements
- 👁 **Admin Panel** — Hidden superadmin panel for full system monitoring
- 📊 **Real-Time Dashboard** — Live stats from actual system data

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** PostgreSQL with Prisma ORM
- **Auth:** NextAuth.js (JWT)
- **Styling:** Tailwind CSS
- **Deployment:** Docker / Render

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see below)
4. Push database schema: `npx prisma db push`
5. Seed admin accounts: `npx prisma db seed`
6. Run development server: `npm run dev`

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

## User Management

All user accounts are created by administrators only. There is no self-registration. Admins create accounts at `/dashboard/users` and share credentials directly with the staff member.

## Department Management

Departments are fully dynamic and managed from the admin panel. You can create, edit, activate, and deactivate departments without touching code.

## Deployment

### Render

1. Connect your GitHub repo
2. Set environment variables: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
3. Deploy

---

© 2026 Gweru Specialist Children's Hospital
