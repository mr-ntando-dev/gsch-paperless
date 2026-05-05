# GSCH Paperless - Digital Document Management System

**Gweru Specialist Children's Hospital** - Paperless Management System

A comprehensive digital system to eliminate paper across all hospital departments.

## 🏥 Departments

| Department | Modules |
|-----------|---------|
| **CRD** (Client Relations) | Complaints, Feedback, Patient Surveys, Visitor Logs |
| **Patient Care** | Patient Records, Admissions, Discharge Notes, Treatment Plans |
| **Billing** | Invoices, Payments, Insurance Claims, Quotations |
| **Accounts** | Budgets, Expenses, Payroll, Procurement |
| **Kitchen** | Meal Plans, Dietary Requirements, Food Inventory |
| **Safety & Maintenance** | Maintenance Requests, Safety Audits, Incident Reports |
| **IT** | Support Tickets, Asset Register, Change Requests |
| **Management** | Policies, Meeting Minutes, Strategic Plans, HR |
| **Hospital Relations** | Referrals, Partnerships, Community Programs |

## 🚀 Tech Stack

- **Frontend:** Next.js 14, React 18, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL with Prisma ORM
- **Auth:** NextAuth.js with JWT
- **Deployment:** Render.com

## 📦 Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (copy `.env.example` to `.env`)
4. Push database schema: `npx prisma db push`
5. Seed the database: `npx prisma db seed`
6. Run development server: `npm run dev`

## 🔐 Default Login

- **Email:** admin@gsch.co.zw
- **Password:** admin123

## 🌐 Deployment on Render.com

1. Connect your GitHub repository on Render
2. Create a new PostgreSQL database
3. Create a new Web Service pointing to this repo
4. Set environment variables:
   - `DATABASE_URL` - from your Render PostgreSQL
   - `NEXTAUTH_SECRET` - auto-generated or set a secure random string
   - `NEXTAUTH_URL` - your Render app URL (e.g., https://gsch-paperless.onrender.com)
5. Build Command: `npm install && npx prisma generate && npx prisma db push && npm run build`
6. Start Command: `npm run start`

## 📞 Contact

Gweru Specialist Children's Hospital
- 📍 74-9th Street, Gweru
- 📞 0542229751 | 0542229650
- 📧 admin@gsch.co.zw
- 🌐 https://gsch.co.zw
