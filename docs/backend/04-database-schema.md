# Database Schema Documentation

## Overview

This document provides comprehensive documentation for the Expense-Wise PostgreSQL database schema, including entity relationships, indexes, constraints, and migration strategies.

## Table of Contents

1. [Database Configuration](#1-database-configuration)
2. [Entity Relationship Diagram](#2-entity-relationship-diagram)
3. [Schema Details](#3-schema-details)
4. [Indexing Strategy](#4-indexing-strategy)
5. [Data Integrity](#5-data-integrity)
6. [Migration Management](#6-migration-management)
7. [Performance Optimization](#7-performance-optimization)

---

## 1. Database Configuration

### 1.1 Database Information

- **Database Engine**: PostgreSQL 15+
- **Character Set**: UTF-8
- **Collation**: en_US.UTF-8
- **Timezone**: UTC
- **ORM**: Prisma 5+

### 1.2 Connection Configuration

```env
# Development
DATABASE_URL="postgresql://postgres:password@localhost:5432/expense_wise?schema=public"

# Production (with connection pooling)
DATABASE_URL="postgresql://postgres:password@db-host:5432/expense_wise?schema=public&connection_limit=20&pool_timeout=60"
```

### 1.3 Prisma Configuration

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

## 2. Entity Relationship Diagram

```
┌──────────────────┐
│     Company      │
│──────────────────│
│ id (PK)          │
│ name             │
│ country          │
│ baseCurrency     │
│ createdAt        │
│ updatedAt        │
└────────┬─────────┘
         │ 1
         │
         │ N
┌────────▼─────────┐         ┌─────────────────┐
│      User        │    N    │  ExpenseCategory│
│──────────────────│◄────────┤─────────────────│
│ id (PK)          │    1    │ id (PK)         │
│ email (UQ)       │         │ name            │
│ role             │         │ companyId (FK)  │
│ companyId (FK)   │         └─────────────────┘
│ managerId (FK)   │
│ passwordHash     │
│ firstName        │
│ lastName         │
│ createdAt        │
│ updatedAt        │
└────────┬─────────┘
         │ 1
         │
         │ N
┌────────▼─────────┐         ┌─────────────────┐
│     Expense      │    1    │     Receipt     │
│──────────────────│◄────────┤─────────────────│
│ id (PK)          │    N    │ id (PK)         │
│ userId (FK)      │         │ expenseId (FK)  │
│ companyId (FK)   │         │ filename        │
│ categoryId (FK)  │         │ fileUrl         │
│ amount           │         │ fileSize        │
│ currency         │         │ uploadedAt      │
│ description      │         │ ocrData         │
│ date             │         └─────────────────┘
│ status           │
│ merchantName     │
│ submittedAt      │
│ createdAt        │
│ updatedAt        │
└────────┬─────────┘
         │ 1
         │
         │ N
┌────────▼─────────┐
│    Approval      │
│──────────────────│
│ id (PK)          │
│ expenseId (FK)   │
│ approverId (FK)  │
│ status           │
│ comment          │
│ approvedAt       │
│ createdAt        │
│ updatedAt        │
└──────────────────┘
```

---

## 3. Schema Details

### 3.1 Enum Types

```prisma
enum Role {
  ADMIN      // Full system access, user management, settings
  MANAGER    // Approve/reject expenses, view team reports
  EMPLOYEE   // Submit expenses, view own expenses
}

enum ExpenseStatus {
  DRAFT              // Saved but not submitted
  PENDING_APPROVAL   // Submitted and awaiting approval
  APPROVED           // Approved by required approvers
  REJECTED           // Rejected by approver
}

enum ApprovalStatus {
  PENDING    // Awaiting approver decision
  APPROVED   // Approved by approver
  REJECTED   // Rejected by approver
}
```

### 3.2 Core Tables

#### Company Table

```prisma
model Company {
  id           String   @id @default(cuid())
  name         String
  country      String
  baseCurrency String   @db.VarChar(3)  // ISO 4217 currency code
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  // Relations
  users             User[]
  expenseCategories ExpenseCategory[]
  expenses          Expense[]

  @@index([name])
}
```

**Purpose**: Represents a distinct customer organization (multi-tenant support).

**Key Fields**:

- `id`: Primary key using CUID for uniqueness
- `baseCurrency`: Default currency for the company (USD, EUR, GBP, etc.)
- `name`: Company name for display

**Business Rules**:

- Each company is a separate tenant
- All data is isolated by companyId
- Base currency affects default expense submissions

---

#### User Table

```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  firstName    String
  lastName     String
  role         Role     @default(EMPLOYEE)
  companyId    String
  managerId    String?  // Self-referential for reporting structure
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  // Relations
  company        Company      @relation(fields: [companyId], references: [id], onDelete: Cascade)
  manager        User?        @relation("ManagerToEmployee", fields: [managerId], references: [id])
  managedUsers   User[]       @relation("ManagerToEmployee")
  expenses       Expense[]    @relation("UserExpenses")
  approvals      Approval[]   @relation("ApproverApprovals")

  @@index([companyId])
  @@index([email])
  @@index([managerId])
}
```

**Purpose**: Stores user accounts within a company.

**Key Fields**:

- `email`: Unique identifier for authentication (must be unique across all companies)
- `passwordHash`: Bcrypt hashed password
- `role`: Determines user permissions (ADMIN, MANAGER, EMPLOYEE)
- `managerId`: Creates organizational hierarchy for approval workflows

**Business Rules**:

- Email must be unique globally
- Users belong to one company
- Managers can approve expenses from their managed users
- Admin users can manage all company users

---

#### ExpenseCategory Table

```prisma
model ExpenseCategory {
  id        String   @id @default(cuid())
  name      String
  companyId String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  company  Company   @relation(fields: [companyId], references: [id], onDelete: Cascade)
  expenses Expense[]

  @@unique([name, companyId])  // Category names unique per company
  @@index([companyId])
}
```

**Purpose**: Defines expense categories specific to each company.

**Key Fields**:

- `name`: Category name (e.g., Travel, Meals, Office Supplies)
- `companyId`: Associates category with a specific company

**Business Rules**:

- Categories are company-specific
- Category names must be unique within a company
- Default categories created on company signup

**Common Categories**:

- Travel
- Meals & Entertainment
- Office Supplies
- Equipment
- Software & Subscriptions
- Transportation
- Accommodation

---

#### Expense Table

```prisma
model Expense {
  id            String        @id @default(cuid())
  userId        String
  companyId     String
  categoryId    String
  amount        Decimal       @db.Decimal(12, 2)
  currency      String        @db.VarChar(3)
  description   String        @db.Text
  date          DateTime      @db.Date
  status        ExpenseStatus @default(DRAFT)
  merchantName  String?
  submittedAt   DateTime?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  // Relations
  user     User            @relation("UserExpenses", fields: [userId], references: [id], onDelete: Cascade)
  company  Company         @relation(fields: [companyId], references: [id], onDelete: Cascade)
  category ExpenseCategory @relation(fields: [categoryId], references: [id])
  receipts Receipt[]
  approvals Approval[]

  @@index([userId])
  @@index([companyId])
  @@index([status])
  @@index([date])
  @@index([submittedAt])
}
```

**Purpose**: Stores individual expense submissions.

**Key Fields**:

- `amount`: Expense amount with 2 decimal precision (supports up to 9,999,999,999.99)
- `currency`: ISO 4217 currency code (USD, EUR, GBP, etc.)
- `status`: Current workflow status (DRAFT, PENDING_APPROVAL, APPROVED, REJECTED)
- `date`: Actual expense date (not submission date)
- `submittedAt`: When expense was submitted for approval

**Business Rules**:

- Expenses can only be edited in DRAFT or REJECTED status
- Amount must be greater than 0
- Date cannot be in the future
- At least one receipt required for amounts above threshold
- Currency conversions applied when different from base currency

**Status Workflow**:

```
DRAFT → PENDING_APPROVAL → APPROVED
                        ↘ REJECTED → (back to DRAFT if re-submitted)
```

---

#### Receipt Table

```prisma
model Receipt {
  id          String   @id @default(cuid())
  expenseId   String
  filename    String
  fileUrl     String
  fileSize    Int
  mimeType    String   @default("image/jpeg")
  ocrData     Json?    // Stores OCR extracted data
  uploadedAt  DateTime @default(now())
  processedAt DateTime?

  // Relations
  expense Expense @relation(fields: [expenseId], references: [id], onDelete: Cascade)

  @@index([expenseId])
}
```

**Purpose**: Stores receipt files and OCR extracted data.

**Key Fields**:

- `fileUrl`: S3 URL for the receipt file
- `fileSize`: File size in bytes
- `mimeType`: File MIME type (image/jpeg, image/png, application/pdf)
- `ocrData`: JSON field storing OCR extracted data
- `processedAt`: Timestamp when OCR processing completed

**OCR Data Structure**:

```json
{
  "merchantName": "Restaurant ABC",
  "totalAmount": 125.5,
  "currency": "USD",
  "date": "2025-10-03",
  "lineItems": [
    {
      "description": "Entree",
      "amount": 85.0
    },
    {
      "description": "Beverages",
      "amount": 25.5
    },
    {
      "description": "Tax",
      "amount": 15.0
    }
  ],
  "confidence": 0.95
}
```

**Business Rules**:

- Maximum file size: 10MB
- Supported formats: JPEG, PNG, PDF
- OCR processing is asynchronous
- Original files retained indefinitely
- Thumbnails generated for images

---

#### Approval Table

```prisma
model Approval {
  id         String         @id @default(cuid())
  expenseId  String
  approverId String
  status     ApprovalStatus @default(PENDING)
  comment    String?        @db.Text
  approvedAt DateTime?
  createdAt  DateTime       @default(now())
  updatedAt  DateTime       @updatedAt

  // Relations
  expense  Expense @relation(fields: [expenseId], references: [id], onDelete: Cascade)
  approver User    @relation("ApproverApprovals", fields: [approverId], references: [id])

  @@unique([expenseId, approverId])  // One approval per expense per approver
  @@index([expenseId])
  @@index([approverId])
  @@index([status])
}
```

**Purpose**: Tracks approval decisions for expenses.

**Key Fields**:

- `expenseId`: Associated expense
- `approverId`: User who made the approval decision
- `status`: Approval decision (PENDING, APPROVED, REJECTED)
- `comment`: Optional approval/rejection comment
- `approvedAt`: Timestamp of approval decision

**Business Rules**:

- Each approver can only approve an expense once
- Comments required for rejections
- Approvals are immutable once decided
- Sequential or parallel approval workflows supported

---

## 4. Indexing Strategy

### 4.1 Primary Indexes

All tables use CUID as primary key with automatic B-tree index:

```sql
CREATE INDEX idx_company_pkey ON "Company" USING btree (id);
CREATE INDEX idx_user_pkey ON "User" USING btree (id);
CREATE INDEX idx_expense_pkey ON "Expense" USING btree (id);
CREATE INDEX idx_receipt_pkey ON "Receipt" USING btree (id);
CREATE INDEX idx_approval_pkey ON "Approval" USING btree (id);
```

### 4.2 Foreign Key Indexes

```sql
-- User table
CREATE INDEX idx_user_companyId ON "User" (companyId);
CREATE INDEX idx_user_managerId ON "User" (managerId);

-- Expense table
CREATE INDEX idx_expense_userId ON "Expense" (userId);
CREATE INDEX idx_expense_companyId ON "Expense" (companyId);
CREATE INDEX idx_expense_categoryId ON "Expense" (categoryId);

-- Receipt table
CREATE INDEX idx_receipt_expenseId ON "Receipt" (expenseId);

-- Approval table
CREATE INDEX idx_approval_expenseId ON "Approval" (expenseId);
CREATE INDEX idx_approval_approverId ON "Approval" (approverId);
```

### 4.3 Query Optimization Indexes

```sql
-- User authentication
CREATE INDEX idx_user_email ON "User" (email);

-- Expense filtering and sorting
CREATE INDEX idx_expense_status ON "Expense" (status);
CREATE INDEX idx_expense_date ON "Expense" (date DESC);
CREATE INDEX idx_expense_submittedAt ON "Expense" (submittedAt DESC);

-- Composite index for common queries
CREATE INDEX idx_expense_user_status_date
  ON "Expense" (userId, status, date DESC);

-- Approval filtering
CREATE INDEX idx_approval_status ON "Approval" (status);

-- Company lookup
CREATE INDEX idx_company_name ON "Company" (name);
```

### 4.4 Unique Constraints

```sql
-- Email must be globally unique
CREATE UNIQUE INDEX idx_user_email_unique ON "User" (email);

-- Category names unique per company
CREATE UNIQUE INDEX idx_category_name_company_unique
  ON "ExpenseCategory" (name, companyId);

-- One approval per expense per approver
CREATE UNIQUE INDEX idx_approval_expense_approver_unique
  ON "Approval" (expenseId, approverId);
```

---

## 5. Data Integrity

### 5.1 Foreign Key Constraints

```sql
-- User → Company (CASCADE DELETE)
ALTER TABLE "User" ADD CONSTRAINT fk_user_company
  FOREIGN KEY (companyId) REFERENCES "Company"(id)
  ON DELETE CASCADE;

-- User → User (Manager relationship, SET NULL on delete)
ALTER TABLE "User" ADD CONSTRAINT fk_user_manager
  FOREIGN KEY (managerId) REFERENCES "User"(id)
  ON DELETE SET NULL;

-- Expense → User (CASCADE DELETE)
ALTER TABLE "Expense" ADD CONSTRAINT fk_expense_user
  FOREIGN KEY (userId) REFERENCES "User"(id)
  ON DELETE CASCADE;

-- Expense → Company (CASCADE DELETE)
ALTER TABLE "Expense" ADD CONSTRAINT fk_expense_company
  FOREIGN KEY (companyId) REFERENCES "Company"(id)
  ON DELETE CASCADE;

-- Receipt → Expense (CASCADE DELETE)
ALTER TABLE "Receipt" ADD CONSTRAINT fk_receipt_expense
  FOREIGN KEY (expenseId) REFERENCES "Expense"(id)
  ON DELETE CASCADE;

-- Approval → Expense (CASCADE DELETE)
ALTER TABLE "Approval" ADD CONSTRAINT fk_approval_expense
  FOREIGN KEY (expenseId) REFERENCES "Expense"(id)
  ON DELETE CASCADE;
```

### 5.2 Check Constraints

```sql
-- Amount must be positive
ALTER TABLE "Expense" ADD CONSTRAINT chk_expense_amount_positive
  CHECK (amount > 0);

-- File size must be positive
ALTER TABLE "Receipt" ADD CONSTRAINT chk_receipt_filesize_positive
  CHECK (fileSize > 0);

-- Date cannot be in the future
ALTER TABLE "Expense" ADD CONSTRAINT chk_expense_date_not_future
  CHECK (date <= CURRENT_DATE);

-- Currency code must be 3 characters
ALTER TABLE "Expense" ADD CONSTRAINT chk_expense_currency_length
  CHECK (LENGTH(currency) = 3);
```

---

## 6. Migration Management

### 6.1 Prisma Migration Commands

```bash
# Create a new migration
npx prisma migrate dev --name add_receipts_table

# Apply migrations to production
npx prisma migrate deploy

# Check migration status
npx prisma migrate status

# Reset database (development only)
npx prisma migrate reset

# Generate Prisma Client
npx prisma generate
```

### 6.2 Migration Best Practices

**Development Workflow**:

1. Modify `schema.prisma`
2. Run `prisma migrate dev --name descriptive_name`
3. Review generated SQL in `prisma/migrations/`
4. Test migration locally
5. Commit migration files to version control

**Production Deployment**:

1. Run `prisma migrate deploy` in CI/CD pipeline
2. Apply migrations before deploying new code
3. Always backup database before major migrations
4. Use feature flags for schema changes

**Example Migration**:

```sql
-- Migration: 20251004120000_add_expense_approval_system

BEGIN;

-- Add approval status enum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- Create Approval table
CREATE TABLE "Approval" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "expenseId" TEXT NOT NULL,
    "approverId" TEXT NOT NULL,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "comment" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fk_approval_expense"
      FOREIGN KEY ("expenseId") REFERENCES "Expense"("id") ON DELETE CASCADE,
    CONSTRAINT "fk_approval_approver"
      FOREIGN KEY ("approverId") REFERENCES "User"("id")
);

-- Create indexes
CREATE INDEX "idx_approval_expenseId" ON "Approval"("expenseId");
CREATE INDEX "idx_approval_approverId" ON "Approval"("approverId");
CREATE INDEX "idx_approval_status" ON "Approval"("status");
CREATE UNIQUE INDEX "idx_approval_expense_approver_unique"
  ON "Approval"("expenseId", "approverId");

COMMIT;
```

---

## 7. Performance Optimization

### 7.1 Query Patterns

**Efficient Expense Listing**:

```typescript
// ✅ Good - Use indexes, paginate, select only needed fields
const expenses = await prisma.expense.findMany({
  where: {
    userId: req.user.id,
    status: "PENDING_APPROVAL",
  },
  select: {
    id: true,
    amount: true,
    currency: true,
    description: true,
    date: true,
    status: true,
    category: {
      select: { name: true },
    },
    _count: {
      select: { receipts: true },
    },
  },
  orderBy: {
    submittedAt: "desc",
  },
  take: 20,
  skip: (page - 1) * 20,
});

// ❌ Bad - Fetches all fields, no pagination
const expenses = await prisma.expense.findMany({
  where: { userId: req.user.id },
  include: { receipts: true, approvals: true, category: true },
});
```

### 7.2 Connection Pooling

```typescript
// prisma/client.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

### 7.3 Query Optimization Tips

1. **Use Select Instead of Include**: Fetch only required fields
2. **Paginate Large Datasets**: Always use `take` and `skip`
3. **Index Frequently Queried Columns**: Add indexes for WHERE, ORDER BY columns
4. **Use Aggregations**: Leverage database for counting and summing
5. **Avoid N+1 Queries**: Use `include` or nested selects appropriately
6. **Connection Pooling**: Configure proper pool size (20-50 connections)

### 7.4 Database Maintenance

```sql
-- Analyze tables for query planner
ANALYZE;

-- Vacuum to reclaim storage
VACUUM ANALYZE;

-- Reindex tables
REINDEX TABLE "Expense";

-- Check table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

**Last Updated**: October 4, 2025  
**Version**: 1.0.0  
**Based on**: Prisma Schema v5.0
