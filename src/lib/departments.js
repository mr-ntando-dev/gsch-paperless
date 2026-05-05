export const departments = {
  CRD: {
    name: "Client Relations Department",
    shortName: "CRD",
    color: "blue",
    description: "Managing patient and family relationships, complaints, feedback",
    modules: ["Complaints", "Feedback Forms", "Patient Surveys", "Visitor Logs", "Communication Templates"]
  },
  PATIENT_CARE: {
    name: "Patient Care",
    shortName: "Patient Care",
    color: "teal",
    description: "Clinical documentation, patient records, treatment plans",
    modules: ["Patient Records", "Admissions", "Day Care", "Baby Clinic", "Discharge Notes", "Treatment Plans", "Medication Logs", "Ward Rounds"]
  },
  BILLING: {
    name: "Billing",
    shortName: "Billing",
    color: "green",
    description: "Patient invoicing, payment tracking, insurance claims",
    modules: ["Invoices", "Payment Records", "Insurance Claims", "Quotations", "Receipts"]
  },
  ACCOUNTS: {
    name: "Accounts",
    shortName: "Accounts",
    color: "purple",
    description: "Financial management, budgets, payroll, procurement",
    modules: ["Budgets", "Expense Reports", "Payroll", "Procurement", "Financial Reports", "Petty Cash"]
  },
  KITCHEN: {
    name: "Kitchen",
    shortName: "Kitchen",
    color: "orange",
    description: "Meal planning, dietary management, food inventory",
    modules: ["Meal Plans", "Dietary Requirements", "Food Inventory", "Menu Templates", "Special Diets", "Hygiene Checklists"]
  },
  SAFETY_MAINTENANCE: {
    name: "Safety & Maintenance",
    shortName: "Safety & Maint.",
    color: "yellow",
    description: "Facility maintenance, safety audits, incident reports",
    modules: ["Maintenance Requests", "Safety Audits", "Incident Reports", "Equipment Logs", "Inspection Schedules"]
  },
  IT: {
    name: "Information Technology",
    shortName: "IT",
    color: "indigo",
    description: "IT support, system management, asset tracking",
    modules: ["Support Tickets", "Asset Register", "Change Requests", "System Logs", "User Management"]
  },
  MANAGEMENT: {
    name: "Management",
    shortName: "Management",
    color: "red",
    description: "Strategic planning, policies, board reports, HR",
    modules: ["Policies", "Meeting Minutes", "Strategic Plans", "HR Documents", "Performance Reviews", "Board Reports"]
  },
  HOSPITAL_RELATIONS: {
    name: "Hospital Relations",
    shortName: "Hospital Relations",
    color: "pink",
    description: "External partnerships, referrals, community engagement",
    modules: ["Referral Letters", "Partnership Agreements", "Community Programs", "Event Planning", "Donor Relations"]
  }
}

export const departmentList = Object.entries(departments).map(([key, value]) => ({
  id: key,
  ...value
}))
