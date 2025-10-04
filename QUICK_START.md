# 🚀 ExpenseWise - Quick Start Guide

## Get Up and Running in 5 Minutes

### Prerequisites
```bash
✅ Node.js 18+ installed
✅ npm or yarn installed
✅ PostgreSQL database running
✅ Git installed
```

### Step 1: Install Dependencies
```bash
cd expense_wise
npm install
```

### Step 2: Set Up Environment
```bash
# Copy the environment template
cp .env.example .env

# Edit .env with your database credentials
# DATABASE_URL="postgresql://user:password@localhost:5432/expense_wise"
```

### Step 3: Initialize Database
```bash
# Run Prisma migrations
npx prisma migrate dev

# (Optional) Seed the database
npx prisma db seed
```

### Step 4: Start Development Server
```bash
npm run dev
```

### Step 5: Open in Browser
```
🌐 http://localhost:3000
```

## 🎯 What You'll See

### 1. Landing Page
- Automatically redirects to signin
- Shows loading spinner

### 2. Sign Up Page (`/signup`)
- **URL**: http://localhost:3000/signup
- **Features**:
  - Company registration form
  - Country/currency selection
  - Password validation
  - Professional gradient design

### 3. Sign In Page (`/signin`)
- **URL**: http://localhost:3000/signin
- **Features**:
  - User authentication
  - Error handling
  - Forgot password link
  - Support access

### 4. Admin Dashboard (`/dashboard/admin`)
- **URL**: http://localhost:3000/dashboard/admin
- **Features**:
  - User management table
  - Search and filter
  - Role assignment
  - Approval rules (placeholder)

## 🎨 UI Highlights

### Professional Design Elements
✨ **Gradient Accents**: Blue to indigo throughout
✨ **Glassmorphism**: Backdrop blur on headers
✨ **Dark Sidebar**: Slate gradient theme
✨ **Smooth Animations**: Hover effects and transitions
✨ **Shadow Depth**: Layered shadows for hierarchy
✨ **Responsive**: Mobile-first design

### Color Scheme
```
Primary: Blue 600 → Indigo 600
Success: Green 600
Warning: Amber 600
Error: Red 600
Neutral: Slate scale
```

## 📱 Test Responsive Design

### Desktop View (> 1024px)
- Full sidebar visible
- Multi-column layouts
- Enhanced hover effects

### Tablet View (768px - 1024px)
- Adaptive layouts
- Collapsible sections
- Touch-optimized

### Mobile View (< 768px)
- Slide-out sidebar
- Stacked layouts
- Touch-friendly buttons

## 🧪 Test Features

### Authentication Flow
1. Go to `/signup`
2. Fill in company details
3. Submit form (will show error without API)
4. Go to `/signin`
5. Try signing in (will show error without API)

### Dashboard Navigation
1. Go to `/dashboard/admin`
2. Click sidebar menu items
3. Test search functionality
4. Try user action dropdowns
5. Switch between tabs

### Responsive Testing
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test different screen sizes
4. Check mobile sidebar

## 🔧 Common Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npx prisma studio    # Open Prisma Studio
npx prisma migrate dev  # Run migrations
npx prisma generate  # Generate Prisma Client

# Testing (when implemented)
npm run test         # Run tests
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report
```

## 📂 Key Files to Explore

### Design System
```
src/app/globals.css          # Design tokens & utilities
```

### Components
```
src/components/forms/        # Form components
src/components/layout/       # Layout components
src/components/shared/       # Shared components
src/components/ui/           # shadcn/ui components
```

### Pages
```
src/app/(auth)/signup/       # Company signup
src/app/(auth)/signin/       # User signin
src/app/(dashboard)/admin/   # Admin dashboard
```

### Configuration
```
tailwind.config.js           # Tailwind configuration
tsconfig.json                # TypeScript config
next.config.ts               # Next.js config
prisma/schema.prisma         # Database schema
```

## 🎯 Next Steps

### For Development
1. ✅ Explore the codebase
2. ✅ Review design system tokens
3. ✅ Test responsive design
4. ⏳ Implement API endpoints
5. ⏳ Build remaining dashboards

### For Design
1. ✅ Review implemented UI
2. ✅ Check design consistency
3. ⏳ Create additional mockups
4. ⏳ Design remaining pages

### For Testing
1. ✅ Test authentication flow
2. ✅ Verify responsive design
3. ⏳ Test with real data
4. ⏳ Perform accessibility audit

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
PORT=3001 npm run dev
```

### Database Connection Error
```bash
# Check PostgreSQL is running
# Verify DATABASE_URL in .env
# Run migrations again
npx prisma migrate reset
```

### Module Not Found
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
```

### Styles Not Loading
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

## 📚 Resources

### Documentation
- 📖 [Frontend README](./FRONTEND_README.md)
- 🎨 [UI Improvements](./UI_IMPROVEMENTS.md)
- 📊 [Implementation Status](./IMPLEMENTATION_STATUS.md)

### External Links
- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Prisma Docs](https://www.prisma.io/docs)

## 💡 Tips

### Development
- Use React DevTools for debugging
- Enable Tailwind CSS IntelliSense in VS Code
- Use Prisma Studio for database inspection
- Check browser console for errors

### Design
- All colors use design tokens
- Gradients follow blue → indigo pattern
- Shadows use layered approach
- Animations use transform for performance

### Performance
- Images should be optimized
- Use Next.js Image component
- Lazy load heavy components
- Monitor bundle size

## 🎉 You're Ready!

The frontend is now set up with:
- ✅ Professional UI design
- ✅ Responsive layouts
- ✅ Authentication pages
- ✅ Dashboard structure
- ✅ Reusable components
- ✅ Design system

**Happy coding! 🚀**

---

Need help? Check the documentation or create an issue on GitHub.