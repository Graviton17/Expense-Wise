# ExpenseWise Setup Guide

This guide will walk you through setting up ExpenseWise for development.

## Prerequisites

Ensure you have the following installed:

- **Node.js** 20.x or higher ([Download](https://nodejs.org/))
- **npm** 10.x or higher (comes with Node.js)
- **PostgreSQL** 14.x or higher ([Download](https://www.postgresql.org/download/))
- **Git** ([Download](https://git-scm.com/downloads))

Optional but recommended:
- **Redis** for caching ([Download](https://redis.io/download))
- **Docker** for containerized development ([Download](https://www.docker.com/))

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ExpenseWise.git
cd ExpenseWise
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Prisma
- And all other dependencies

### 3. Database Setup

#### Option A: Local PostgreSQL

1. **Create a new database:**

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE expensewise;

# Create user (optional)
CREATE USER expensewise_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE expensewise TO expensewise_user;

# Exit
\q
```

2. **Update your `.env.local` file:**

```env
DATABASE_URL="postgresql://expensewise_user:your_password@localhost:5432/expensewise"
```

#### Option B: Docker PostgreSQL

```bash
# Run PostgreSQL in Docker
docker run --name expensewise-db \
  -e POSTGRES_DB=expensewise \
  -e POSTGRES_USER=expensewise_user \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  -d postgres:14
```

### 4. Environment Configuration

1. **Copy the example environment file:**

```bash
cp .env.example .env.local
```

2. **Update `.env.local` with your settings:**

```env
# Required
DATABASE_URL="postgresql://expensewise_user:your_password@localhost:5432/expensewise"
JWT_SECRET="generate-a-random-secret-key-here"

# Optional (for email features)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"

# App settings
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_BASE_CURRENCY="USD"
```

**Generate a secure JWT secret:**

```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### 5. Database Migration

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations to create database tables
npx prisma migrate dev --name init

# (Optional) Seed the database with sample data
npx prisma db seed
```

### 6. Verify Setup

```bash
# Check database connection
npx prisma db pull

# View database in Prisma Studio
npx prisma studio
```

### 7. Start Development Server

```bash
npm run dev
```

The application should now be running at [http://localhost:3000](http://localhost:3000)

## Default Credentials

After seeding the database, you can log in with these default accounts:

### Admin Account
- **Email**: admin@expensewise.com
- **Password**: Admin@123

### Manager Account
- **Email**: manager@expensewise.com
- **Password**: Manager@123

### Employee Account
- **Email**: employee@expensewise.com
- **Password**: Employee@123

**⚠️ Important**: Change these passwords immediately in production!

## Troubleshooting

### Database Connection Issues

**Error**: `Can't reach database server`

**Solution**:
1. Verify PostgreSQL is running: `pg_isready`
2. Check your DATABASE_URL in `.env.local`
3. Ensure PostgreSQL is accepting connections on port 5432

### Port Already in Use

**Error**: `Port 3000 is already in use`

**Solution**:
```bash
# Find and kill the process using port 3000
# On Linux/Mac
lsof -ti:3000 | xargs kill -9

# On Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use a different port
npm run dev -- -p 3001
```

### Prisma Migration Errors

**Error**: `Migration failed`

**Solution**:
```bash
# Reset the database (⚠️ This will delete all data)
npx prisma migrate reset

# Or manually fix migrations
npx prisma migrate resolve --rolled-back "migration_name"
```

### Module Not Found Errors

**Error**: `Cannot find module`

**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
rm -rf .next
```

## Development Tools

### Prisma Studio

Visual database browser:

```bash
npx prisma studio
```

Access at [http://localhost:5555](http://localhost:5555)

### TypeScript Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

### Format Code

```bash
npm run format
```

## Docker Development (Alternative)

If you prefer Docker for development:

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## IDE Setup

### VS Code (Recommended)

Install these extensions:
- ESLint
- Prettier
- Prisma
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features

**Recommended settings** (`.vscode/settings.json`):

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## Next Steps

1. ✅ Explore the application at http://localhost:3000
2. ✅ Read the [API Documentation](./API.md)
3. ✅ Check out the [UI Specifications](./ui-specifications/)
4. ✅ Review the [Contributing Guide](../CONTRIBUTING.md)
5. ✅ Start building features!

## Getting Help

- 📖 [Documentation](./README.md)
- 💬 [Discord Community](https://discord.gg/expensewise)
- 🐛 [Report Issues](https://github.com/yourusername/ExpenseWise/issues)
- 📧 Email: support@expensewise.com

Happy coding! 🚀
