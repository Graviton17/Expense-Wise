# Authentication & Role-Based Redirect Flow

## How It Works

### Current Implementation (Mock)

The redirect system works in 3 steps:

```
┌─────────────────────────────────────────────────────────────┐
│  Step 1: User Signs In                                      │
│  (/signin page)                                             │
│                                                             │
│  User enters:                                               │
│  - Email: admin@company.com                                 │
│  - Password: ••••••••                                       │
│                                                             │
│  [Sign In Button Clicked]                                   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 2: API Determines Role                                │
│  (/api/auth/signin)                                         │
│                                                             │
│  Mock Logic (for testing):                                 │
│  - If email contains "admin"  → role = "ADMIN"             │
│  - If email contains "manager" → role = "MANAGER"          │
│  - Otherwise                   → role = "EMPLOYEE"         │
│                                                             │
│  Returns:                                                   │
│  {                                                          │
│    user: {                                                  │
│      id: "mock-user-id",                                    │
│      email: "admin@company.com",                            │
│      role: "ADMIN"  ← This determines the redirect         │
│    },                                                       │
│    token: "mock-jwt-token"                                  │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 3: Redirect Based on Role                             │
│  (signin page.tsx - handleSignin function)                  │
│                                                             │
│  switch (result.user.role) {                                │
│    case "ADMIN":                                            │
│      router.push("/dashboard/admin");     ← Admin goes here│
│      break;                                                 │
│    case "MANAGER":                                          │
│      router.push("/dashboard/manager");   ← Manager here   │
│      break;                                                 │
│    case "EMPLOYEE":                                         │
│      router.push("/dashboard/employee");  ← Employee here  │
│      break;                                                 │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Testing the Redirect (Current Mock System)

You can test the role-based redirect right now:

### Test as Admin
```
Email: admin@company.com
Password: anything
→ Redirects to: /dashboard/admin
```

### Test as Manager
```
Email: manager@company.com
Password: anything
→ Redirects to: /dashboard/manager
```

### Test as Employee
```
Email: employee@company.com
Password: anything
→ Redirects to: /dashboard/employee
```

---

## Code Breakdown

### 1. Signin Page (`src/app/(auth)/signin/page.tsx`)

```typescript
const handleSignin = async (data: UserSigninFormData) => {
  // Call the API
  const response = await fetch("/api/auth/signin", {
    method: "POST",
    body: JSON.stringify(data),
  });

  const result = await response.json();
  
  // ✅ THIS IS WHERE THE REDIRECT HAPPENS
  switch (result.user.role) {
    case "ADMIN":
      router.push("/dashboard/admin");      // Admin dashboard
      break;
    case "MANAGER":
      router.push("/dashboard/manager");    // Manager dashboard
      break;
    case "EMPLOYEE":
      router.push("/dashboard/employee");   // Employee dashboard
      break;
    default:
      router.push("/dashboard");            // Fallback
  }
};
```

### 2. API Route (`src/app/api/auth/signin/route.ts`)

```typescript
// Mock authentication - determine role based on email
let role = "EMPLOYEE";  // Default role

if (email.includes("admin")) {
  role = "ADMIN";
} else if (email.includes("manager")) {
  role = "MANAGER";
}

// Return the role in the response
return NextResponse.json({
  user: {
    id: "mock-user-id",
    email: email,
    role: role,  // ✅ This role is used for redirect
  },
  token: "mock-jwt-token",
});
```

---

## Future Implementation (With Real Database)

When you connect to a real database with Prisma, the flow will be:

```typescript
// src/app/api/auth/signin/route.ts

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  // 1. Find user in database
  const user = await prisma.user.findUnique({
    where: { email },
    include: { company: true }
  });

  if (!user) {
    return NextResponse.json(
      { message: "Invalid credentials" },
      { status: 401 }
    );
  }

  // 2. Verify password
  const isValidPassword = await bcrypt.compare(password, user.password);
  
  if (!isValidPassword) {
    return NextResponse.json(
      { message: "Invalid credentials" },
      { status: 401 }
    );
  }

  // 3. Generate JWT token
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET
  );

  // 4. Return user data with role from database
  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,  // ✅ Role comes from database
    },
    token,
  });
}
```

### Database Schema (Prisma)

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String
  role      Role     @default(EMPLOYEE)  // ✅ Role stored in database
  companyId String
  company   Company  @relation(fields: [companyId], references: [id])
  createdAt DateTime @default(now())
}

enum Role {
  ADMIN
  MANAGER
  EMPLOYEE
}
```

---

## Role Assignment

### How Users Get Their Roles

1. **Admin Role**:
   - Automatically assigned during company signup
   - The first user who creates the company becomes ADMIN
   - Can promote other users to ADMIN

2. **Manager Role**:
   - Assigned by ADMIN when creating/editing users
   - Can be promoted from EMPLOYEE by ADMIN

3. **Employee Role**:
   - Default role for new users
   - Assigned when ADMIN or MANAGER adds a new employee

---

## Dashboard Routes

Each role has its own dashboard:

```
/dashboard/admin      → Admin Dashboard (full access)
/dashboard/manager    → Manager Dashboard (team management)
/dashboard/employee   → Employee Dashboard (personal expenses)
```

### Route Protection

You'll want to add middleware to protect these routes:

```typescript
// src/middleware.ts

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token');
  
  if (!token) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  // Verify token and check role
  const { role } = verifyToken(token);
  const path = request.nextUrl.pathname;

  // Protect admin routes
  if (path.startsWith('/dashboard/admin') && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard/employee', request.url));
  }

  // Protect manager routes
  if (path.startsWith('/dashboard/manager') && role !== 'MANAGER' && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard/employee', request.url));
  }

  return NextResponse.next();
}
```

---

## Summary

### Current System (Mock)
✅ **Works right now for testing**
- Email contains "admin" → Admin dashboard
- Email contains "manager" → Manager dashboard
- Any other email → Employee dashboard

### Future System (Production)
🔄 **When you add database**
- Role stored in database User table
- Retrieved during authentication
- Used for redirect and route protection
- Can be changed by admins

The redirect logic is already in place and working. You just need to replace the mock API with real database queries when you're ready!
