# ExpenseWise 💰

A modern, full-featured expense management system built with Next.js 15, React 19, and TypeScript. ExpenseWise streamlines expense submission, approval workflows, and financial tracking for organizations of all sizes.

![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)
![React](https://img.shields.io/badge/React-19.1.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38bdf8)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

### 👤 Employee Dashboard
- **Expense Submission** - Quick and intuitive expense creation with receipt upload
- **Real-time Status Tracking** - Monitor approval status of all submissions
- **Expense History** - Comprehensive view of all past expenses
- **Draft Management** - Save and edit expenses before submission
- **Receipt Management** - Upload, view, and download receipts
- **Multi-currency Support** - Submit expenses in any currency

### 👔 Manager Dashboard
- **Approval Workflow** - Review and approve/reject team expenses
- **Bulk Actions** - Approve multiple expenses simultaneously
- **Currency Conversion** - Automatic conversion to base currency
- **Team Analytics** - Track team spending and approval metrics
- **Priority Indicators** - Urgent expenses highlighted for quick action
- **Detailed Comments** - Add feedback and notes to approvals/rejections

### 🔐 Admin Dashboard
- **User Management** - Create, edit, and manage user accounts
- **Role Assignment** - Assign and modify user roles (Admin, Manager, Employee)
- **Reporting Structure** - Define manager-employee relationships
- **Approval Rules** - Configure flexible approval workflows
- **Sequential/Parallel Approvals** - Set up complex approval chains
- **User Analytics** - Monitor user activity and system usage

## 🚀 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **UI Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/)
- **Authentication**: JWT-based authentication
- **State Management**: React Hooks
- **Icons**: [Lucide React](https://lucide.dev/)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20.x or higher
- **npm** or **yarn** or **pnpm**
- **PostgreSQL** 14.x or higher
- **Git**

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ExpenseWise.git
cd ExpenseWise
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/expensewise"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Email (Optional - for notifications)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"

# Redis (Optional - for caching)
REDIS_URL="redis://localhost:6379"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_BASE_CURRENCY="USD"
```

### 4. Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database (optional)
npx prisma db seed
```

### 5. Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
ExpenseWise/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   ├── dashboard/         # Dashboard pages
│   │   │   ├── admin/        # Admin dashboard
│   │   │   ├── manager/      # Manager dashboard
│   │   │   └── employee/     # Employee dashboard
│   │   ├── auth/             # Authentication pages
│   │   └── layout.tsx        # Root layout
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── employee/         # Employee-specific components
│   │   ├── manager/          # Manager-specific components
│   │   └── admin/            # Admin-specific components
│   ├── lib/                   # Utility functions
│   │   ├── utils.ts          # Helper functions
│   │   ├── prisma.ts         # Prisma client
│   │   └── auth.ts           # Authentication utilities
│   ├── services/              # Business logic
│   │   ├── expense.service.ts
│   │   ├── user.service.ts
│   │   └── approval.service.ts
│   └── types/                 # TypeScript types
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts               # Database seeding
├── public/                    # Static assets
├── docs/                      # Documentation
│   └── ui-specifications/    # UI specifications
└── package.json
```

## 🎨 UI Components

ExpenseWise uses [shadcn/ui](https://ui.shadcn.com/) for consistent, accessible UI components:

- **Forms**: Input, Select, Checkbox, Radio, Textarea
- **Data Display**: Table, Card, Badge, Avatar
- **Feedback**: Toast, Dialog, Alert
- **Navigation**: Tabs, Dropdown Menu
- **Overlays**: Modal, Tooltip, Popover

## 🔒 Authentication & Authorization

### User Roles

1. **Employee** - Submit and track expenses
2. **Manager** - Approve/reject team expenses
3. **Admin** - Full system access and configuration

### Protected Routes

All dashboard routes require authentication. Role-based access control ensures users only access authorized features.

## 📊 Database Schema

Key entities:

- **User** - User accounts with roles
- **Expense** - Expense submissions
- **Receipt** - Receipt attachments
- **Approval** - Approval workflow records
- **ApprovalRule** - Configurable approval rules
- **Category** - Expense categories
- **Company** - Organization settings

See `prisma/schema.prisma` for complete schema.

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run integration tests
npm run test:integration

# Run e2e tests
npm run test:e2e

# Generate coverage report
npm run test:coverage
```

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Configure environment variables
4. Deploy!

### Docker

```bash
# Build image
docker build -t expensewise .

# Run container
docker run -p 3000:3000 expensewise
```

### Manual Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🔧 Configuration

### Currency Settings

Configure base currency in `.env.local`:

```env
NEXT_PUBLIC_BASE_CURRENCY="USD"
```

### Email Notifications

Configure SMTP settings for email notifications:

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
```

## 📖 API Documentation

API endpoints are available at `/api`:

- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `GET /api/expenses` - List expenses
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `POST /api/expenses/:id/approve` - Approve expense
- `POST /api/expenses/:id/reject` - Reject expense

See [API Documentation](./docs/API.md) for complete reference.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 👥 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Prisma](https://www.prisma.io/) - Next-generation ORM

## 📞 Support

- 📧 Email: support@expensewise.com
- 💬 Discord: [Join our community](https://discord.gg/expensewise)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/ExpenseWise/issues)

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] OCR receipt scanning
- [ ] Advanced analytics dashboard
- [ ] Integration with accounting software
- [ ] Multi-language support
- [ ] Expense policies and limits
- [ ] Automated expense categorization
- [ ] Budget tracking and alerts

---

Made with ❤️ by the ExpenseWise Team
