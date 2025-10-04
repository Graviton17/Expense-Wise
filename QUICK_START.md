# ExpenseWise Quick Start Guide 🚀

Get ExpenseWise up and running in 5 minutes!

## Prerequisites Checklist

- [ ] Node.js 20+ installed
- [ ] PostgreSQL 14+ installed and running
- [ ] Git installed
- [ ] Code editor (VS Code recommended)

## 5-Minute Setup

### 1. Clone & Install (1 min)

```bash
git clone https://github.com/yourusername/ExpenseWise.git
cd ExpenseWise
npm install
```

### 2. Database Setup (2 min)

```bash
# Create database
createdb expensewise

# Or using psql
psql -U postgres -c "CREATE DATABASE expensewise;"
```

### 3. Configure Environment (1 min)

```bash
# Copy environment file
cp .env.example .env.local

# Edit .env.local with your settings
# Minimum required:
# DATABASE_URL="postgresql://user:password@localhost:5432/expensewise"
# JWT_SECRET="your-secret-key"
```

### 4. Initialize Database (30 sec)

```bash
npx prisma migrate dev
npx prisma db seed
```

### 5. Start Development Server (30 sec)

```bash
npm run dev
```

🎉 **Done!** Open [http://localhost:3000](http://localhost:3000)

## Default Login Credentials

### Admin
- **Email**: admin@expensewise.com
- **Password**: Admin@123

### Manager
- **Email**: manager@expensewise.com
- **Password**: Manager@123

### Employee
- **Email**: employee@expensewise.com
- **Password**: Employee@123

⚠️ **Change these passwords immediately!**

## Quick Tour

### Employee Dashboard
1. Click **"New Expense"** to create an expense
2. Upload a receipt
3. Fill in details and submit
4. Track status in the expense history table

### Manager Dashboard
1. View pending approvals
2. Click ✓ to approve or ✗ to reject
3. Use bulk approve for multiple expenses
4. Add comments for feedback

### Admin Dashboard
1. **User Management** tab - Add/edit users
2. **Approval Rules** tab - Configure workflows
3. Assign roles and managers
4. Export user data

## Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Start production server

# Database
npx prisma studio        # Open database GUI
npx prisma migrate dev   # Run migrations
npx prisma db seed       # Seed database

# Code Quality
npm run lint             # Run linter
npm run type-check       # Check TypeScript
npm run format           # Format code

# Testing
npm test                 # Run tests
npm run test:watch       # Watch mode
```

## Troubleshooting

### Port 3000 already in use?
```bash
# Use different port
npm run dev -- -p 3001
```

### Database connection error?
```bash
# Check PostgreSQL is running
pg_isready

# Verify DATABASE_URL in .env.local
```

### Module not found?
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Prisma errors?
```bash
# Reset database (⚠️ deletes all data)
npx prisma migrate reset
```

## Next Steps

1. ✅ Explore the dashboards
2. ✅ Read the [Full Documentation](./docs/SETUP.md)
3. ✅ Check out the [API Docs](./docs/API.md)
4. ✅ Review [Contributing Guide](./CONTRIBUTING.md)
5. ✅ Join our [Discord](https://discord.gg/expensewise)

## Project Structure

```
ExpenseWise/
├── src/
│   ├── app/              # Next.js pages
│   │   ├── dashboard/    # Dashboard pages
│   │   └── api/          # API routes
│   ├── components/       # React components
│   ├── lib/              # Utilities
│   └── services/         # Business logic
├── prisma/               # Database schema
├── docs/                 # Documentation
└── public/               # Static files
```

## Key Features

✨ **Employee** - Submit & track expenses  
✨ **Manager** - Approve/reject with bulk actions  
✨ **Admin** - Manage users & approval rules  
✨ **Multi-currency** - Support for any currency  
✨ **Real-time** - Live status updates  
✨ **Responsive** - Works on all devices  

## Tech Stack

- **Framework**: Next.js 15
- **UI**: React 19 + Tailwind CSS 4
- **Database**: PostgreSQL + Prisma
- **Auth**: JWT
- **Components**: shadcn/ui

## Getting Help

- 📖 [Full Documentation](./README.md)
- 💬 [Discord Community](https://discord.gg/expensewise)
- 🐛 [Report Issues](https://github.com/yourusername/ExpenseWise/issues)
- 📧 Email: support@expensewise.com

## Keyboard Shortcuts

- `Ctrl/Cmd + N` - New expense
- `Ctrl/Cmd + R` - Refresh
- `Ctrl/Cmd + K` - Search (coming soon)

---

**Happy expense tracking!** 💰

Made with ❤️ by the ExpenseWise Team
