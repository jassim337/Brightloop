import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { calculateTotals } from "../src/lib/billing/calculateTotals";
import bcrypt from "bcryptjs";

// Helper to compute date offset from today
function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(10, 0, 0, 0);
  return d;
}

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(18, 0, 0, 0);
  return d;
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not defined in environment.");
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    console.log("Starting Brightloop invoicing seed...");

    // 1. Organization
    const org = await prisma.organization.upsert({
      where: { slug: "demo" },
      update: { name: "Brightloop Demo Org" },
      create: {
        name: "Brightloop Demo Org",
        slug: "demo",
      },
    });
    console.log(`✓ Organization ready: ${org.name} (${org.slug})`);

    // 2. Users & Passwords (all use Password123!)
    const passwordHash = await bcrypt.hash("Password123!", 10);

    const adminUser = await prisma.user.upsert({
      where: { email: "admin@brightloop.demo" },
      update: {
        organizationId: org.id,
        role: "ADMIN",
        name: "Aria Admin",
        passwordHash,
      },
      create: {
        email: "admin@brightloop.demo",
        organizationId: org.id,
        role: "ADMIN",
        name: "Aria Admin",
        passwordHash,
      },
    });

    const staffUser = await prisma.user.upsert({
      where: { email: "staff@brightloop.demo" },
      update: {
        organizationId: org.id,
        role: "STAFF",
        name: "Sam Staff",
        passwordHash,
      },
      create: {
        email: "staff@brightloop.demo",
        organizationId: org.id,
        role: "STAFF",
        name: "Sam Staff",
        passwordHash,
      },
    });

    const customerUser1 = await prisma.user.upsert({
      where: { email: "acme@brightloop.demo" },
      update: {
        organizationId: org.id,
        role: "CUSTOMER",
        name: "Alice Acme",
        passwordHash,
      },
      create: {
        email: "acme@brightloop.demo",
        organizationId: org.id,
        role: "CUSTOMER",
        name: "Alice Acme",
        passwordHash,
      },
    });

    const customer1 = await prisma.customer.upsert({
      where: {
        organizationId_email: {
          organizationId: org.id,
          email: "acme@brightloop.demo",
        },
      },
      update: {
        name: "Acme Corp",
        company: "Acme Corporation",
        phone: "+91 98765 43210",
        address: "123 Industrial Area, Bengaluru, KA 560001",
        userId: customerUser1.id,
      },
      create: {
        organizationId: org.id,
        name: "Acme Corp",
        email: "acme@brightloop.demo",
        company: "Acme Corporation",
        phone: "+91 98765 43210",
        address: "123 Industrial Area, Bengaluru, KA 560001",
        userId: customerUser1.id,
      },
    });

    const customerUser2 = await prisma.user.upsert({
      where: { email: "globex@brightloop.demo" },
      update: {
        organizationId: org.id,
        role: "CUSTOMER",
        name: "Bob Globex",
        passwordHash,
      },
      create: {
        email: "globex@brightloop.demo",
        organizationId: org.id,
        role: "CUSTOMER",
        name: "Bob Globex",
        passwordHash,
      },
    });

    const customer2 = await prisma.customer.upsert({
      where: {
        organizationId_email: {
          organizationId: org.id,
          email: "globex@brightloop.demo",
        },
      },
      update: {
        name: "Globex Corp",
        company: "Globex Industries",
        phone: "+91 91234 56789",
        address: "456 Tech Park, HITEC City, Hyderabad, TS 500081",
        userId: customerUser2.id,
      },
      create: {
        organizationId: org.id,
        name: "Globex Corp",
        email: "globex@brightloop.demo",
        company: "Globex Industries",
        phone: "+91 91234 56789",
        address: "456 Tech Park, HITEC City, Hyderabad, TS 500081",
        userId: customerUser2.id,
      },
    });
    console.log("✓ Users and customer profiles ready (1 Admin, 1 Staff, 2 Customers)");

    // 3. Products & Tax
    const defaultTax = await prisma.tax.upsert({
      where: { id: "demo-tax-gst-18" },
      update: {
        organizationId: org.id,
        name: "GST 18%",
        rateBasisPoints: 1800,
        active: true,
        isDefault: true,
      },
      create: {
        id: "demo-tax-gst-18",
        organizationId: org.id,
        name: "GST 18%",
        rateBasisPoints: 1800,
        active: true,
        isDefault: true,
      },
    });

    const productPlatform = await prisma.product.upsert({
      where: { id: "demo-prod-platform" },
      update: {
        organizationId: org.id,
        name: "Brightloop SaaS Platform License",
        type: "SERVICE",
        salesPricePaise: 499900,
        costPricePaise: 100000,
      },
      create: {
        id: "demo-prod-platform",
        organizationId: org.id,
        name: "Brightloop SaaS Platform License",
        type: "SERVICE",
        salesPricePaise: 499900,
        costPricePaise: 100000,
      },
    });

    const productSeat = await prisma.product.upsert({
      where: { id: "demo-prod-seat" },
      update: {
        organizationId: org.id,
        name: "Dedicated Support Seat",
        type: "SEAT",
        salesPricePaise: 150000,
        costPricePaise: 40000,
      },
      create: {
        id: "demo-prod-seat",
        organizationId: org.id,
        name: "Dedicated Support Seat",
        type: "SEAT",
        salesPricePaise: 150000,
        costPricePaise: 40000,
      },
    });

    // 4. Plans (MONTHLY & YEARLY)
    const monthlyPlan = await prisma.plan.upsert({
      where: {
        organizationId_name: {
          organizationId: org.id,
          name: "Pro Monthly",
        },
      },
      update: {
        description: "Professional recurring monthly plan",
        pricePaise: 499900, // ₹4,999.00 / mo
        billingPeriod: "MONTHLY",
        availableFrom: new Date("2024-01-01"),
        isActive: true,
      },
      create: {
        organizationId: org.id,
        name: "Pro Monthly",
        description: "Professional recurring monthly plan",
        pricePaise: 499900,
        billingPeriod: "MONTHLY",
        availableFrom: new Date("2024-01-01"),
        isActive: true,
      },
    });

    const yearlyPlan = await prisma.plan.upsert({
      where: {
        organizationId_name: {
          organizationId: org.id,
          name: "Enterprise Yearly",
        },
      },
      update: {
        description: "Enterprise recurring annual plan with priority support",
        pricePaise: 4999900, // ₹49,999.00 / yr
        billingPeriod: "YEARLY",
        availableFrom: new Date("2024-01-01"),
        isActive: true,
      },
      create: {
        organizationId: org.id,
        name: "Enterprise Yearly",
        description: "Enterprise recurring annual plan with priority support",
        pricePaise: 4999900,
        billingPeriod: "YEARLY",
        availableFrom: new Date("2024-01-01"),
        isActive: true,
      },
    });
    console.log("✓ Plans ready (Pro Monthly & Enterprise Yearly)");

    // 5. Subscriptions with lines
    const sub1 = await prisma.subscription.upsert({
      where: {
        organizationId_number: {
          organizationId: org.id,
          number: "SUB-DEMO-001",
        },
      },
      update: {
        customerId: customer1.id,
        planId: monthlyPlan.id,
        startDate: daysAgo(180),
        nextBillingDate: daysFromNow(15),
        status: "ACTIVE",
        paymentTerm: "Net 15",
      },
      create: {
        organizationId: org.id,
        number: "SUB-DEMO-001",
        customerId: customer1.id,
        planId: monthlyPlan.id,
        startDate: daysAgo(180),
        nextBillingDate: daysFromNow(15),
        status: "ACTIVE",
        paymentTerm: "Net 15",
      },
    });

    await prisma.subscriptionLine.deleteMany({
      where: { subscriptionId: sub1.id },
    });

    await prisma.subscriptionLine.create({
      data: {
        subscriptionId: sub1.id,
        productId: productPlatform.id,
        qty: 1,
        unitPricePaise: 499900,
        taxId: defaultTax.id,
        taxRateBasisPoints: 1800,
        discountPaise: 0,
        amountPaise: 499900,
      },
    });

    const sub2 = await prisma.subscription.upsert({
      where: {
        organizationId_number: {
          organizationId: org.id,
          number: "SUB-DEMO-002",
        },
      },
      update: {
        customerId: customer2.id,
        planId: yearlyPlan.id,
        startDate: daysAgo(120),
        nextBillingDate: daysFromNow(245),
        status: "ACTIVE",
        paymentTerm: "Net 30",
      },
      create: {
        organizationId: org.id,
        number: "SUB-DEMO-002",
        customerId: customer2.id,
        planId: yearlyPlan.id,
        startDate: daysAgo(120),
        nextBillingDate: daysFromNow(245),
        status: "ACTIVE",
        paymentTerm: "Net 30",
      },
    });

    await prisma.subscriptionLine.deleteMany({
      where: { subscriptionId: sub2.id },
    });

    await prisma.subscriptionLine.createMany({
      data: [
        {
          subscriptionId: sub2.id,
          productId: productPlatform.id,
          qty: 1,
          unitPricePaise: 4999900,
          taxId: defaultTax.id,
          taxRateBasisPoints: 1800,
          discountPaise: 0,
          amountPaise: 4999900,
        },
        {
          subscriptionId: sub2.id,
          productId: productSeat.id,
          qty: 2,
          unitPricePaise: 150000,
          taxId: defaultTax.id,
          taxRateBasisPoints: 1800,
          discountPaise: 0,
          amountPaise: 300000,
        },
      ],
    });
    console.log("✓ Subscriptions with lines ready (SUB-DEMO-001 & SUB-DEMO-002)");

    // 6. Clean existing demo invoices and payments for idempotency
    const existingDemoInvoices = await prisma.invoice.findMany({
      where: {
        organizationId: org.id,
        number: { startsWith: "INV-DEMO-" },
      },
      select: { id: true },
    });

    if (existingDemoInvoices.length > 0) {
      const ids = existingDemoInvoices.map((inv) => inv.id);
      await prisma.payment.deleteMany({ where: { invoiceId: { in: ids } } });
      await prisma.invoiceLine.deleteMany({ where: { invoiceId: { in: ids } } });
      await prisma.invoice.deleteMany({ where: { id: { in: ids } } });
    }

    // 7. Seed 14 Invoices Covering All Statuses & 5 Payment Methods
    interface DemoPaymentDef {
      method: "CASH" | "CARD" | "BANK_TRANSFER" | "UPI" | "STRIPE";
      amountPaise: number;
      date: Date;
      note: string;
      recordedById?: string;
    }

    interface DemoInvoiceDef {
      number: string;
      customerId: string;
      subscriptionId?: string;
      periodStart: Date;
      periodEnd: Date;
      dueDate: Date;
      status: "DRAFT" | "CONFIRMED" | "PARTIALLY_PAID" | "PAID" | "OVERDUE" | "CANCELLED";
      items: {
        description: string;
        qty: number;
        unitPriceInPaise: number;
      }[];
      discount?: {
        type: "FIXED";
        amountInPaise: number;
      };
      taxRateBasisPoints?: number;
      payments: DemoPaymentDef[];
    }

    const demoInvoices: DemoInvoiceDef[] = [
      // ---------------- Customer 1 (Acme Corp) ----------------
      // 1. PAID (100% covered via STRIPE)
      {
        number: "INV-DEMO-001",
        customerId: customer1.id,
        subscriptionId: sub1.id,
        periodStart: daysAgo(175),
        periodEnd: daysAgo(145),
        dueDate: daysAgo(160),
        status: "PAID",
        items: [
          { description: "Pro Monthly License - Cycle 1", qty: 1, unitPriceInPaise: 499900 },
        ],
        taxRateBasisPoints: 1800,
        payments: [
          {
            method: "STRIPE",
            amountPaise: 589882, // exact 499900 + 18% tax
            date: daysAgo(162),
            note: "Automatic Stripe webhook charge #ch_demo_01",
            recordedById: staffUser.id,
          },
        ],
      },

      // 2. PAID (100% covered across 2 payments: BANK_TRANSFER + UPI)
      {
        number: "INV-DEMO-002",
        customerId: customer1.id,
        subscriptionId: sub1.id,
        periodStart: daysAgo(145),
        periodEnd: daysAgo(115),
        dueDate: daysAgo(130),
        status: "PAID",
        items: [
          { description: "Pro Monthly License - Cycle 2", qty: 1, unitPriceInPaise: 499900 },
          { description: "Additional Support Hours", qty: 1, unitPriceInPaise: 150000 },
        ],
        taxRateBasisPoints: 1800,
        // subtotal 649900, tax 116982, total 766882
        payments: [
          {
            method: "BANK_TRANSFER",
            amountPaise: 500000,
            date: daysAgo(135),
            note: "NEFT corporate transfer Ref #N14589",
            recordedById: staffUser.id,
          },
          {
            method: "UPI",
            amountPaise: 266882,
            date: daysAgo(132),
            note: "UPI balance clearance txn #984372",
            recordedById: staffUser.id,
          },
        ],
      },

      // 3. PARTIALLY_PAID (Paid ₹3,000 via CARD, balance pending)
      {
        number: "INV-DEMO-003",
        customerId: customer1.id,
        subscriptionId: sub1.id,
        periodStart: daysAgo(115),
        periodEnd: daysAgo(85),
        dueDate: daysAgo(100),
        status: "PARTIALLY_PAID",
        items: [
          { description: "Pro Monthly License - Cycle 3", qty: 1, unitPriceInPaise: 499900 },
        ],
        taxRateBasisPoints: 1800,
        // subtotal 499900, tax 89982, total 589882
        payments: [
          {
            method: "CARD",
            amountPaise: 300000,
            date: daysAgo(105),
            note: "Corporate Visa part-payment",
            recordedById: staffUser.id,
          },
        ],
      },

      // 4. OVERDUE (Due exactly 40 days ago, part-paid via BANK_TRANSFER)
      {
        number: "INV-DEMO-004",
        customerId: customer1.id,
        subscriptionId: sub1.id,
        periodStart: daysAgo(70),
        periodEnd: daysAgo(40),
        dueDate: daysAgo(40), // EXACT: due 40 days ago
        status: "OVERDUE",
        items: [
          { description: "Pro Monthly License - Cycle 4", qty: 1, unitPriceInPaise: 499900 },
          { description: "Data Export & Compliance Export", qty: 1, unitPriceInPaise: 100000 },
        ],
        taxRateBasisPoints: 1800,
        // subtotal 599900, tax 107982, total 707882
        payments: [
          {
            method: "BANK_TRANSFER",
            amountPaise: 250000,
            date: daysAgo(45),
            note: "Advance part payment via IMPS",
            recordedById: adminUser.id,
          },
        ],
      },

      // 5. CONFIRMED (Past due date, e.g. due 3 days ago, unpaid)
      {
        number: "INV-DEMO-005",
        customerId: customer1.id,
        subscriptionId: sub1.id,
        periodStart: daysAgo(35),
        periodEnd: daysAgo(5),
        dueDate: daysAgo(3), // EXACT: past due confirmed invoice
        status: "CONFIRMED",
        items: [
          { description: "Pro Monthly License - Cycle 5", qty: 1, unitPriceInPaise: 499900 },
        ],
        taxRateBasisPoints: 1800,
        // subtotal 499900, tax 89982, total 589882
        payments: [],
      },

      // 6. DRAFT (Draft invoice for upcoming billing cycle)
      {
        number: "INV-DEMO-006",
        customerId: customer1.id,
        subscriptionId: sub1.id,
        periodStart: daysAgo(5),
        periodEnd: daysFromNow(25),
        dueDate: daysFromNow(10),
        status: "DRAFT",
        items: [
          { description: "Pro Monthly License - Upcoming Cycle", qty: 1, unitPriceInPaise: 499900 },
        ],
        taxRateBasisPoints: 1800,
        payments: [],
      },

      // 7. CANCELLED (Customer requested cancellation before payment)
      {
        number: "INV-DEMO-007",
        customerId: customer1.id,
        periodStart: daysAgo(160),
        periodEnd: daysAgo(130),
        dueDate: daysAgo(145),
        status: "CANCELLED",
        items: [
          { description: "Pilot Deployment Fee (Voided)", qty: 1, unitPriceInPaise: 250000 },
        ],
        taxRateBasisPoints: 1800,
        payments: [],
      },

      // ---------------- Customer 2 (Globex Corp) ----------------
      // 8. PAID (Enterprise annual contract paid via BANK_TRANSFER)
      {
        number: "INV-DEMO-008",
        customerId: customer2.id,
        subscriptionId: sub2.id,
        periodStart: daysAgo(120),
        periodEnd: daysFromNow(245),
        dueDate: daysAgo(90),
        status: "PAID",
        items: [
          { description: "Enterprise Yearly License (2026)", qty: 1, unitPriceInPaise: 4999900 },
          { description: "Priority Implementation Package", qty: 1, unitPriceInPaise: 1000000 },
        ],
        discount: { type: "FIXED", amountInPaise: 500000 }, // ₹5,000 discount
        taxRateBasisPoints: 1800,
        // subtotal 5999900, discount 500000, taxable 5499900, tax 989982, total 6489882
        payments: [
          {
            method: "BANK_TRANSFER",
            amountPaise: 6489882,
            date: daysAgo(95),
            note: "RTGS full settlement Ref #RTGS987623",
            recordedById: adminUser.id,
          },
        ],
      },

      // 9. PARTIALLY_PAID (Paid across UPI + CASH)
      {
        number: "INV-DEMO-009",
        customerId: customer2.id,
        periodStart: daysAgo(100),
        periodEnd: daysAgo(70),
        dueDate: daysAgo(85),
        status: "PARTIALLY_PAID",
        items: [
          { description: "On-site Training Workshop (2 Days)", qty: 2, unitPriceInPaise: 500000 },
        ],
        taxRateBasisPoints: 1800,
        // subtotal 1000000, tax 180000, total 1180000
        payments: [
          {
            method: "UPI",
            amountPaise: 500000,
            date: daysAgo(90),
            note: "Advance via Google Pay UPI",
            recordedById: staffUser.id,
          },
          {
            method: "CASH",
            amountPaise: 200000,
            date: daysAgo(86),
            note: "Cash receipt #CR-089 signed by coordinator",
            recordedById: staffUser.id,
          },
        ],
      },

      // 10. PARTIALLY_PAID (Paid via CARD)
      {
        number: "INV-DEMO-010",
        customerId: customer2.id,
        periodStart: daysAgo(80),
        periodEnd: daysAgo(50),
        dueDate: daysAgo(65),
        status: "PARTIALLY_PAID",
        items: [
          { description: "Cloud Infrastructure Setup & Tuning", qty: 1, unitPriceInPaise: 1200000 },
        ],
        taxRateBasisPoints: 1800,
        // subtotal 1200000, tax 216000, total 1416000
        payments: [
          {
            method: "CARD",
            amountPaise: 700000,
            date: daysAgo(70),
            note: "Corporate Amex card charge",
            recordedById: staffUser.id,
          },
        ],
      },

      // 11. OVERDUE (Due exactly 5 days ago, completely unpaid)
      {
        number: "INV-DEMO-011",
        customerId: customer2.id,
        periodStart: daysAgo(35),
        periodEnd: daysAgo(5),
        dueDate: daysAgo(5), // EXACT: due 5 days ago
        status: "OVERDUE",
        items: [
          { description: "Annual Security Audit & Pen-testing Pack", qty: 1, unitPriceInPaise: 350000 },
        ],
        taxRateBasisPoints: 1800,
        // subtotal 350000, tax 63000, total 413000
        payments: [],
      },

      // 12. CONFIRMED (Due in future, e.g. +14 days from now)
      {
        number: "INV-DEMO-012",
        customerId: customer2.id,
        periodStart: daysAgo(1),
        periodEnd: daysFromNow(29),
        dueDate: daysFromNow(14), // EXACT: due in future
        status: "CONFIRMED",
        items: [
          { description: "Custom Reporting Module Q4", qty: 1, unitPriceInPaise: 850000 },
        ],
        taxRateBasisPoints: 1800,
        // subtotal 850000, tax 153000, total 1003000
        payments: [],
      },

      // 13. DRAFT (Draft invoice for custom integration)
      {
        number: "INV-DEMO-013",
        customerId: customer2.id,
        periodStart: new Date(),
        periodEnd: daysFromNow(30),
        dueDate: daysFromNow(30),
        status: "DRAFT",
        items: [
          { description: "Custom SSO / SAML Integration Pack", qty: 1, unitPriceInPaise: 2000000 },
        ],
        taxRateBasisPoints: 1800,
        payments: [],
      },

      // 14. CANCELLED (Superseded invoice cancelled)
      {
        number: "INV-DEMO-014",
        customerId: customer2.id,
        periodStart: daysAgo(140),
        periodEnd: daysAgo(110),
        dueDate: daysAgo(125),
        status: "CANCELLED",
        items: [
          { description: "Old Scoping Estimate (Superseded)", qty: 1, unitPriceInPaise: 150000 },
        ],
        taxRateBasisPoints: 1800,
        payments: [],
      },
    ];

    console.log(`Seeding ${demoInvoices.length} invoices...`);

    let createdInvoicesCount = 0;
    let createdPaymentsCount = 0;

    for (const def of demoInvoices) {
      // 1. Calculate totals using pure billing engine
      const totals = calculateTotals({
        items: def.items.map((item) => ({
          quantity: item.qty,
          unitPriceInPaise: item.unitPriceInPaise,
        })),
        discount: def.discount,
        taxRateBasisPoints: def.taxRateBasisPoints ?? 0,
      });

      // 2. Sum payments to ensure exact paidAmountPaise parity
      const paidAmountPaise = def.payments.reduce(
        (sum, p) => sum + p.amountPaise,
        0
      );

      // 3. Create Invoice
      const invoice = await prisma.invoice.create({
        data: {
          organizationId: org.id,
          number: def.number,
          customerId: def.customerId,
          subscriptionId: def.subscriptionId || null,
          periodStart: def.periodStart,
          periodEnd: def.periodEnd,
          dueDate: def.dueDate,
          status: def.status,
          subtotalPaise: totals.subtotalInPaise,
          discountTotalPaise: totals.discountAmountInPaise,
          taxTotalPaise: totals.taxAmountInPaise,
          totalPaise: totals.totalInPaise,
          paidAmountPaise,
          lines: {
            create: def.items.map((item) => ({
              description: item.description,
              qty: item.qty,
              unitPricePaise: item.unitPriceInPaise,
              taxRateBasisPoints: def.taxRateBasisPoints ?? 0,
              discountPaise: 0,
              amountPaise: item.unitPriceInPaise * item.qty,
            })),
          },
        },
      });

      // 4. Create Payments
      if (def.payments.length > 0) {
        for (const p of def.payments) {
          await prisma.payment.create({
            data: {
              organizationId: org.id,
              invoiceId: invoice.id,
              method: p.method,
              amountPaise: p.amountPaise,
              date: p.date,
              note: p.note,
              recordedById: p.recordedById || staffUser.id,
            },
          });
          createdPaymentsCount++;
        }
      }

      createdInvoicesCount++;
    }

    console.log(
      `✓ Seeded ${createdInvoicesCount} invoices and ${createdPaymentsCount} payments.`
    );

    // 8. Summary Output
    console.log("\n========================================================");
    console.log("            BRIGHTLOOP DEV SEED SUMMARY                 ");
    console.log("========================================================");
    console.log(`Organization : ${org.name} (Slug: ${org.slug})`);
    console.log(`Total Invoices: ${createdInvoicesCount}`);
    console.log("Status Breakdown:");
    console.log("  - DRAFT         : 2 (INV-DEMO-006, INV-DEMO-013)");
    console.log("  - CONFIRMED     : 2 (INV-DEMO-005 past-due, INV-DEMO-012 future)");
    console.log("  - PARTIALLY_PAID: 3 (INV-DEMO-003, INV-DEMO-009, INV-DEMO-010)");
    console.log("  - PAID          : 3 (INV-DEMO-001, INV-DEMO-002, INV-DEMO-008)");
    console.log("  - OVERDUE       : 2 (INV-DEMO-004 due 40d ago, INV-DEMO-011 due 5d ago)");
    console.log("  - CANCELLED     : 2 (INV-DEMO-007, INV-DEMO-014)");
    console.log(`Payment Methods : CASH, CARD, BANK_TRANSFER, UPI, STRIPE`);
    console.log("--------------------------------------------------------");
    console.log("LOGIN CREDENTIALS (Password for all: Password123!)");
    console.log("--------------------------------------------------------");
    console.log("  ADMIN    : admin@brightloop.demo");
    console.log("  STAFF    : staff@brightloop.demo");
    console.log("  CUSTOMER : acme@brightloop.demo (Customer: Acme Corp)");
    console.log("  CUSTOMER : globex@brightloop.demo (Customer: Globex Corp)");
    console.log("========================================================\n");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});

