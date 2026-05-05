# MediFile - Digital Document Management System

**Gweru Specialist Children's Hospital**

A modern, paperless document management system built for hospital operations. Manage documents, tasks, forms, maintenance requests, and internal communications across all departments.

## Features

- 🏥 **Department-Based Access** - 9 hospital departments with role-based permissions
- 📄 **Document Management** - Create, track, and approve documents with priority levels
- ✅ **Task Board** - Kanban-style task management with assignment and due dates
- 📝 **Digital Forms** - Create and manage paperless forms for any department
- 🔧 **Maintenance Tracking** - Submit and track facility maintenance requests
- 💬 **Internal Messaging** - Department-based communication channels
- 🔐 **Self-Registration** - Staff register with an organisation secret code
- 📊 **Real-Time Dashboard** - Live stats from actual system data

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** PostgreSQL with Prisma ORM
- **Auth:** NextAuth.js with credentials provider
- **Styling:** Tailwind CSS
- **Deployment:** Docker / Render

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see below)
4. Push database schema: `npx prisma db push`
5. Seed admin account: `npx prisma db seed`
6. Run development server: `npm run dev`

## Environment Variables

```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
REGISTRATION_SECRET=devntando2026
```

## Default Admin Account

After seeding:
- **Email:** admin@gsch.co.zw
- **Password:** admin123

## User Registration

Staff members register at `/register` using the organisation secret code. Each person selects their department during registration.

## Deployment

### Render

1. Connect your GitHub repo
2. Set environment variables:
   - `DATABASE_URL` - PostgreSQL connection string
   - `NEXTAUTH_SECRET` - Random secret key
   - `NEXTAUTH_URL` - Your Render app URL
   - `REGISTRATION_SECRET` - Organisation code for registration
3. Deploy

## Departments

| Department | Description |
|---|---|
| Client Relations (CRD) | Patient/family relationships, complaints, feedback |
| Patient Care | Clinical documentation, records, treatment plans |
| Billing | Invoicing, payments, insurance claims |
| Accounts | Financial management, budgets, payroll |
| Kitchen | Meal planning, dietary management |
| Safety & Maintenance | Facility maintenance, safety audits |
| IT | System management, asset tracking |
| Management | Strategic planning, policies, HR |
| Hospital Relations | External partnerships, referrals |

---

© 2026 Gweru Specialist Children's Hospital
