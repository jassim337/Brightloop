# Brightloop

> **Subscription Management System for Brightloop Software**

Brightloop is a modern SaaS Subscription Management System designed to handle multi-tier subscriptions, recurring billing workflows, customer retention metrics, and real-time revenue analytics.

---

## 🛠️ Confirmed Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 19)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) design system patterns
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma ORM](https://www.prisma.io/)
- **Validation**: [Zod](https://zod.dev/)
- **Analytics & Visualizations**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 📁 Repository Structure

```text
Brightloop/
├── prisma/
│   └── schema.prisma           # Prisma schema definition (PostgreSQL datasource)
├── src/
│   ├── app/
│   │   ├── (auth)/             # Future auth routes (login, register)
│   │   ├── (dashboard)/        # Main dashboard route group
│   │   │   ├── layout.tsx      # Dashboard shell layout with Sidebar & Header
│   │   │   ├── page.tsx        # Dashboard overview (KPIs, MRR charts, recent subs)
│   │   │   ├── subscriptions/  # Subscriptions management view
│   │   │   ├── customers/      # Customer accounts directory
│   │   │   ├── plans/          # Tier pricing & plan configuration
│   │   │   └── settings/       # Workspace & integration settings
│   │   ├── layout.tsx          # Root HTML layout with Inter font
│   │   ├── page.tsx            # Brightloop landing page
│   │   └── globals.css         # Tailwind base styles and theme tokens
│   ├── components/
│   │   ├── layout/             # Sidebar, Header, and Navigation components
│   │   ├── dashboard/          # Metric cards, Recharts revenue chart, and activity widgets
│   │   └── ui/                 # Reusable atomic UI components (Button, Card, Badge)
│   ├── lib/
│   │   ├── utils.ts            # Class merging (clsx + tailwind-merge) & currency formatters
│   │   └── constants.ts        # Navigation items and app metadata
│   └── types/
│       └── index.ts            # Shared TypeScript domain models
├── .env.example                # Environment variable configuration template
├── package.json
└── tsconfig.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v20 or later (v24+ recommended)
- **npm**: v10+

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/jassim337/Brightloop.git
   cd Brightloop
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.
   - Landing page: [http://localhost:3000](http://localhost:3000)
   - Dashboard: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

---

## 📌 Phase Progress

- [x] **Phase 0: Project Setup**
  - Next.js App Router, TypeScript, and Tailwind CSS initialization
  - Scalable modular folder structure (`src/app`, `src/components`, `src/lib`, `src/types`, `prisma/`)
  - Foundational UI components (Button, Card, Badge)
  - Brightloop landing page & interactive dashboard preview
  - Scaffolded Prisma schema for PostgreSQL
- [ ] **Phase 1: Database & Data Models** (PostgreSQL connection, Prisma migrations, seed script)
- [ ] **Phase 2: Authentication & Multi-Tenancy**
- [ ] **Phase 3: Subscription & Billing Engine**
- [ ] **Phase 4: Analytics, Dunning & Webhooks**
