# Brightloop
### Subscription Management & Automated Billing Platform

<p align="center">
  **Manage subscriptions. Automate billing. Simplify finances.**
</p>

<p align="center">
  A full-stack platform designed to simplify subscription management, automate recurring billing, and give businesses better visibility into their finances.
</p>

<p align="center">
  **Built for Make-a-ton 9.0 | 24-Hour Hackathon**
</p>

---

## Overview

**Brightloop** is a subscription management platform that brings customers, products, subscription plans, recurring billing, invoices, discounts, and payments together in one centralized system.

Businesses that manage recurring services often face challenges such as missed billing cycles, duplicate invoices, manual calculations, and difficulty tracking outstanding payments.

Brightloop aims to simplify these processes through automated billing workflows, structured financial records, role-based access, and an intuitive dashboard.

## The Problem We're Solving

Managing recurring subscriptions manually can become complicated as a business grows.

Common challenges include:

- Keeping track of multiple customer subscriptions.
- Managing recurring billing schedules.
- Generating accurate invoices on time.
- Applying discounts and taxes consistently.
- Preventing duplicate invoice generation.
- Tracking overdue invoices and outstanding payments.
- Understanding revenue and subscription performance.

**Our solution:** Brightloop centralizes these operations and introduces an automated billing workflow to make subscription-based business management simpler and more reliable.

---

## Key Features

### 1. Authentication & Role-Based Access
- User registration and authentication.
- Role-based access control.
- Organization-level data isolation.
- Separate permissions for administrative and operational users.

### 2. Product & Plan Management
- Manage products and product variants.
- Create and manage subscription plans.
- Configure billing periods.
- Set applicable tax rates.

### 3. Subscription Management
- Create subscriptions for customers.
- Manage the subscription lifecycle.
- Activate, pause, resume, close, and renew subscriptions.
- Track upcoming billing dates.
- Manage subscription line items.

### 4. Automated Billing Engine
- Identify subscriptions due for billing.
- Calculate subtotals, discounts, taxes, and invoice totals.
- Generate invoices for billing periods.
- Prevent duplicate invoice generation.
- Advance subscription billing dates.
- Process subscriptions in batches.
- Handle individual failures without stopping the entire billing run.

### 5. Invoice Management
- Generate invoices from subscriptions.
- View invoice details and line items.
- Track invoice statuses.
- Monitor outstanding and overdue invoices.

### 6. Payment Management
- Record payments against invoices.
- Track paid and outstanding amounts.
- Monitor payment status.

### 7. Dashboard & Analytics
- View subscription and invoice statistics.
- Monitor revenue and payment activity.
- Track overdue invoices.
- Visualize financial performance.

> **Note:** Feature availability depends on the current implementation and integration status.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Styling | Tailwind CSS, shadcn/ui |
| Backend | Next.js Route Handlers |
| Database | PostgreSQL (Neon) |
| ORM | Prisma 7 |
| Authentication | Auth.js / NextAuth |
| Validation | Zod |
| Forms | React Hook Form |
| Charts | Recharts |
| Icons | Lucide React |
| Deployment | Vercel |

---

## System Architecture

Brightloop uses a full-stack Next.js architecture. The application handles the user interface, API operations, authentication, and business logic, while Prisma manages communication with the PostgreSQL database.

```text
                       USERS
                         |
                         v
                NEXT.JS APPLICATION
                         |
              +----------+----------+
              |                     |
              v                     v
          FRONTEND              API ROUTES
              |                     |
              |              AUTHENTICATION
              |                     |
              |              BUSINESS LOGIC
              |                     |
              |              BILLING ENGINE
              |                     |
              +----------+----------+
                         |
                         v
                     PRISMA ORM
                         |
                         v
                     POSTGRESQL
                       (NEON)
```

## How the Billing Engine Works

The billing engine identifies subscriptions that have reached their billing date and processes them to generate invoices.

```text
              START BILLING RUN
                      |
                      v
             Find due subscriptions
                      |
                      v
               Process in batches
                      |
                      v
             Validate subscriptions
                      |
                      v
              Calculate line items
                      |
                      v
              Apply eligible discounts
                      |
                      v
                Calculate taxes
                      |
                      v
              Calculate invoice totals
                      |
                      v
               Create invoice & lines
                      |
                      v
             Prevent duplicate invoices
                      |
                      v
             Update next billing date
                      |
                      v
                BILLING COMPLETE
```

Database transactions are used to maintain consistency between invoice creation and related subscription updates.

---

## Project Structure

The following is a representative overview of the project structure:

```text
Brightloop/
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── billing/
│   │   │       └── run/
│   │   │           └── route.ts
│   │   │
│   │   └── dashboard/
│   │
│   ├── components/
│   │   └── shared/
│   │
│   ├── generated/
│   │   └── prisma/
│   │
│   └── lib/
│       ├── billing/
│       │   ├── calculateTotals.ts
│       │   ├── calculateTotals.test.ts
│       │   ├── addPeriod.ts
│       │   ├── addPeriod.test.ts
│       │   ├── runBilling.ts
│       │   └── runBilling.test.ts
│       │
│       ├── money.ts
│       └── prisma.ts
│
├── .env
├── .gitignore
├── package.json
├── prisma.config.ts
└── README.md
```

Additional files and folders may be present as development continues.

---

## Getting Started

Follow these steps to run Brightloop locally.

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) — LTS version recommended.
- npm — included with Node.js.
- [Git](https://git-scm.com/).
- A PostgreSQL database or [Neon](https://neon.tech/) account.
- [Visual Studio Code](https://code.visualstudio.com/) (recommended).

### 1. Clone the Repository

```bash
git clone https://github.com/jassim337/Brightloop.git
```

Navigate into the project directory:

```bash
cd Brightloop
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root and add your database connection string:

```env
DATABASE_URL="YOUR_NEON_DATABASE_URL"
```

Replace the placeholder with your actual PostgreSQL connection string.

**Important:** Never commit your `.env` file or expose database credentials in a public repository.

### 4. Validate the Prisma Schema

```bash
npx prisma validate
```

### 5. Generate Prisma Client

```bash
npx prisma generate
```

### 6. Apply Database Migrations

If the migrations have not already been applied to your development database, run:

```bash
npx prisma migrate dev
```

> Coordinate with your team before applying migrations to a shared database.

### 7. Seed the Database

Once the seed script and its package configuration are ready, run:

```bash
npx prisma db seed
```

The seed script is intended to populate the database with demonstration data, including users, products, plans, subscriptions, invoices, and payments.

### 8. Start the Development Server

```bash
npm run dev
```

Open the application in your browser:

**http://localhost:3000**

---

## API Documentation

### Run Billing

| Property | Value |
|---|---|
| Endpoint | `/api/billing/run` |
| Method | `POST` |
| Authentication | Required |
| Authorized Roles | `ADMIN`, `STAFF` |
| Purpose | Trigger the billing process |

**Example request:**

```http
POST /api/billing/run
Content-Type: application/json
```

The endpoint is intended to process due subscriptions for the authenticated organization.

The exact request parameters and response structure should be documented alongside the completed route implementation.

---

## Database Design

Brightloop uses **PostgreSQL** for data storage and **Prisma ORM** for database access.

The integrated database schema includes the following core models:

| Model | Responsibility |
|---|---|
| Organization | Stores organization information |
| User | Stores user and role information |
| Customer | Stores customer records |
| Product | Stores product information |
| ProductVariant | Stores product variations |
| Tax | Stores tax configuration |
| Plan | Stores subscription plans |
| QuotationTemplate | Stores quotation templates |
| Quotation | Stores customer quotations |
| Subscription | Stores subscription records |
| SubscriptionLine | Stores subscription line items |
| Discount | Stores discount configurations |
| DiscountTarget | Associates discounts with eligible targets |
| Invoice | Stores generated invoices |
| InvoiceLine | Stores invoice line items |
| Payment | Stores payment records |

### Financial Data Representation

Financial calculations use **integer paise values** instead of floating-point numbers to avoid precision errors.

Examples:

| Amount | Stored Value |
|---|---:|
| ₹100.00 | 10,000 paise |
| ₹250.50 | 25,050 paise |
| ₹1,000.00 | 100,000 paise |

Tax rates and percentage-based values use integer basis points where applicable.

---

## Testing

Run the project's automated tests:

```bash
npm test
```

Check TypeScript for errors:

```bash
npx tsc --noEmit
```

Create a production build:

```bash
npm run build
```

### Important Billing Test Scenarios

The billing engine should be tested against the following cases:

- Active subscriptions with billing dates due.
- Future-dated subscriptions.
- Paused subscriptions.
- Duplicate billing attempts.
- Discounts with usage limits.
- Different billing periods.
- Month-end and leap-year date calculations.
- Failed transactions and recovery.
- Large batches of subscriptions.

---

## Performance & Scalability

Brightloop is designed with attention to:

- Batch processing of subscriptions due for billing.
- Database transactions for financial consistency.
- Unique constraints to prevent duplicate invoices.
- Database indexes for frequently queried records.
- Bulk data insertion for demonstration data.
- Efficient pagination and filtering for invoice and subscription lists.

Performance measurements should be added after testing with the seeded dataset.

---

## Development Roadmap

Our development is focused on building a reliable subscription management and billing platform.

| Task | Status |
|---|---|
| Project setup and shared foundations | Completed |
| Core money calculation utilities | Completed |
| Billing total calculation | Completed |
| Billing period date utilities | Completed |
| Integrated Prisma database schema | Completed |
| Initial billing engine and API foundation | Completed |
| Complete automated invoice generation | In Progress |
| Complete discount and tax integration | Planned |
| Complete billing-date advancement and duplicate handling | Planned |
| Comprehensive demo-data seeding | Planned |
| Database index review and optimization | Planned |
| Dashboard and list-page performance testing | Planned |
| End-to-end testing | Planned |
| Final documentation and deployment | Planned |

---

## Team

**Brightloop — Make-a-ton 9.0**

| Team Member | Primary Responsibility |
|---|---|
| Malavika | Billing engine, database integration, invoice generation |
| Jassim | Authentication, roles, product catalog, plans, tax configuration |
| Shahmas | Quotations, subscription lifecycle, discounts |
| Nihal | Invoice interface, payments, overdue tracking, finance dashboard |

---

## Contributors

Built collaboratively by the Brightloop team for **Make-a-ton 9.0**.

---

<p align="center">
  **Brightloop**
  
  *Smarter subscriptions. Simpler billing. Better business visibility.*
</p>
