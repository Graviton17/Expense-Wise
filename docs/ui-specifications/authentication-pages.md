# Authentication Pages UI Specification

## Overview

The authentication flow consists of two primary pages: Company Signup and User Sign-in. These pages serve as the entry point for all users and establish the foundational company and user entities.\n\n### Technology Stack\n\n- **Framework**: Next.js 15 with React 19\n- **Styling**: Tailwind CSS v4 with custom design tokens\n- **UI Components**: shadcn/ui + Radix UI primitives\n- **Database**: PostgreSQL with Prisma ORM\n- **Icons**: Lucide React\n- **State Management**: React hooks with TypeScript\n- **Accessibility**: WCAG 2.1 AA compliance\n\n### Related Documentation\n\n- [Design System](./design-system.md) - Colors, typography, and spacing guidelines\n- [Component Library](./component-library.md) - Form components and validation patterns\n- [Admin Dashboard](./admin-dashboard.md) - Post-authentication admin interface\n- [Employee Dashboard](./employee-dashboard.md) - Post-authentication employee interface\n- [Manager Dashboard](./manager-dashboard.md) - Post-authentication manager interface

---

## Page 1: Company Signup Page

### Purpose

Allow the first administrator of a new company to register, simultaneously creating both the Company entity and the Admin user account.

### Route

- **Path**: `/signup`
- **Method**: `GET` (form display), `POST` (form submission)
- **Authentication**: Public (no authentication required)

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│                        Header                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │              Signup Form Container              │   │
│   │                                                     │   │
│   │  Company Registration                              │   │
│   │  ┌─────────────────────────────────────────────┐   │   │
│   │  │ Form Fields                                 │   │   │
│   │  └─────────────────────────────────────────────┘   │   │
│   │                                                     │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                        Footer                               │
└─────────────────────────────────────────────────────────────┘
```

### Component Specifications

#### 1. Page Container

- **Width**: Maximum 1200px, centered
- **Padding**: 24px on mobile, 48px on desktop
- **Background**: Neutral gray-50 (`bg-gray-50`)

#### 2. Form Container

- **Width**: 480px maximum, responsive
- **Background**: White (`bg-white`)
- **Border Radius**: 12px (`rounded-xl`)
- **Shadow**: Large shadow (`shadow-lg`)
- **Padding**: 32px (`p-8`)

#### 3. Form Header

```tsx
<div className="text-center mb-8">
  <h1 className="text-3xl font-bold text-gray-900 mb-2">
    Create Your Company Account
  </h1>
  <p className="text-gray-600">
    Set up your organization and become the administrator
  </p>
</div>
```

#### 4. Form Fields

##### Administrator Name Field

```tsx
<div className="space-y-2">
  <Label htmlFor="adminName" className="text-sm font-medium text-gray-700">
    Administrator Full Name *
  </Label>
  <Input
    id="adminName"
    name="adminName"
    type="text"
    required
    placeholder="John Doe"
    className="w-full"
    aria-describedby="adminName-error"
  />
  <div id="adminName-error" className="text-sm text-red-600" role="alert">
    {/* Error message if validation fails */}
  </div>
</div>
```

##### Email Field

```tsx
<div className="space-y-2">
  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
    Email Address *
  </Label>
  <Input
    id="email"
    name="email"
    type="email"
    required
    placeholder="admin@company.com"
    className="w-full"
    aria-describedby="email-error email-description"
  />
  <p id="email-description" className="text-xs text-gray-500">
    This will be your login email address
  </p>
  <div id="email-error" className="text-sm text-red-600" role="alert">
    {/* Error message if validation fails */}
  </div>
</div>
```

##### Company Name Field

```tsx
<div className="space-y-2">
  <Label htmlFor="companyName" className="text-sm font-medium text-gray-700">
    Company Name *
  </Label>
  <Input
    id="companyName"
    name="companyName"
    type="text"
    required
    placeholder="Acme Corporation"
    className="w-full"
    aria-describedby="companyName-error"
  />
  <div id="companyName-error" className="text-sm text-red-600" role="alert">
    {/* Error message if validation fails */}
  </div>
</div>
```

##### Country Selection Dropdown

```tsx
<div className="space-y-2">
  <Label htmlFor="country" className="text-sm font-medium text-gray-700">
    Country *
  </Label>
  <Select>
    <SelectTrigger className="w-full" aria-describedby="country-description">
      <SelectValue placeholder="Select your country" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="US">United States (USD)</SelectItem>
      <SelectItem value="IN">India (INR)</SelectItem>
      <SelectItem value="GB">United Kingdom (GBP)</SelectItem>
      <SelectItem value="DE">Germany (EUR)</SelectItem>
      {/* All countries with currency display */}
    </SelectContent>
  </Select>
  <p id="country-description" className="text-xs text-gray-500">
    This determines your company's base currency for reporting
  </p>
</div>
```

##### Password Fields

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div className="space-y-2">
    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
      Password *
    </Label>
    <Input
      id="password"
      name="password"
      type="password"
      required
      placeholder="••••••••"
      className="w-full"
      aria-describedby="password-requirements password-error"
    />
    <div id="password-requirements" className="text-xs text-gray-500">
      Minimum 8 characters with uppercase, lowercase, and number
    </div>
  </div>

  <div className="space-y-2">
    <Label
      htmlFor="confirmPassword"
      className="text-sm font-medium text-gray-700"
    >
      Confirm Password *
    </Label>
    <Input
      id="confirmPassword"
      name="confirmPassword"
      type="password"
      required
      placeholder="••••••••"
      className="w-full"
      aria-describedby="confirmPassword-error"
    />
  </div>
</div>
```

#### 5. Submit Button

```tsx
<Button
  type="submit"
  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
  disabled={isLoading}
>
  {isLoading ? (
    <>
      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
      Creating Account...
    </>
  ) : (
    "Create Company Account"
  )}
</Button>
```

#### 6. Navigation Link

```tsx
<div className="text-center mt-6">
  <p className="text-sm text-gray-600">
    Already have an account?{" "}
    <Link
      href="/signin"
      className="font-medium text-blue-600 hover:text-blue-500"
    >
      Sign in here
    </Link>
  </p>
</div>
```

### Validation Rules

#### Client-Side Validation

- **Administrator Name**: Required, 2-50 characters
- **Email**: Required, valid email format, unique check via API
- **Company Name**: Required, 2-100 characters
- **Country**: Required selection
- **Password**: Required, minimum 8 characters, must contain uppercase, lowercase, and number
- **Confirm Password**: Must match password

#### Server-Side Validation

- Email uniqueness across all companies
- Company name uniqueness (case-insensitive)
- Password strength validation
- Country code validation against ISO standards

### Error Handling

#### Form Validation Errors

```tsx
<div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
  <div className="flex">
    <AlertCircle className="h-5 w-5 text-red-400" />
    <div className="ml-3">
      <h3 className="text-sm font-medium text-red-800">
        Please correct the following errors:
      </h3>
      <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
        <li>Email address is already registered</li>
        <li>Password must contain at least one uppercase letter</li>
      </ul>
    </div>
  </div>
</div>
```

#### Network/Server Errors

```tsx
<div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
  <div className="flex">
    <AlertTriangle className="h-5 w-5 text-red-400" />
    <div className="ml-3">
      <h3 className="text-sm font-medium text-red-800">
        Unable to create account
      </h3>
      <p className="mt-1 text-sm text-red-700">
        Please try again later or contact support if the problem persists.
      </p>
    </div>
  </div>
</div>
```

### Success State

Upon successful registration, redirect to `/signin` with success message.

---

## Page 2: User Sign-in Page

### Purpose

Allow registered users (Admin, Manager, Employee) to authenticate and access their role-specific dashboard.

### Route

- **Path**: `/signin`
- **Method**: `GET` (form display), `POST` (authentication)
- **Authentication**: Public (no authentication required)

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│                        Header                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │              Sign-in Form Container             │   │
│   │                                                     │   │
│   │  Welcome Back                                      │   │
│   │  ┌─────────────────────────────────────────────┐   │   │
│   │  │ Login Form                                  │   │   │
│   │  └─────────────────────────────────────────────┘   │   │
│   │                                                     │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                        Footer                               │
└─────────────────────────────────────────────────────────────┘
```

### Component Specifications

#### 1. Form Container

Same styling as signup page for consistency.

#### 2. Form Header

```tsx
<div className="text-center mb-8">
  <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
  <p className="text-gray-600">Sign in to your expense management account</p>
</div>
```

#### 3. Form Fields

##### Email Field

```tsx
<div className="space-y-2">
  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
    Email Address
  </Label>
  <Input
    id="email"
    name="email"
    type="email"
    required
    placeholder="your.email@company.com"
    className="w-full"
    autoComplete="username"
    aria-describedby="email-error"
  />
  <div id="email-error" className="text-sm text-red-600" role="alert">
    {/* Error message if validation fails */}
  </div>
</div>
```

##### Password Field

```tsx
<div className="space-y-2">
  <div className="flex items-center justify-between">
    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
      Password
    </Label>
    <Link
      href="/forgot-password"
      className="text-sm text-blue-600 hover:text-blue-500"
    >
      Forgot password?
    </Link>
  </div>
  <Input
    id="password"
    name="password"
    type="password"
    required
    placeholder="••••••••"
    className="w-full"
    autoComplete="current-password"
    aria-describedby="password-error"
  />
  <div id="password-error" className="text-sm text-red-600" role="alert">
    {/* Error message if validation fails */}
  </div>
</div>
```

#### 4. Submit Button

```tsx
<Button
  type="submit"
  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
  disabled={isLoading}
>
  {isLoading ? (
    <>
      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
      Signing in...
    </>
  ) : (
    "Sign In"
  )}
</Button>
```

#### 5. Navigation Links

```tsx
<div className="space-y-4 mt-6">
  <div className="text-center">
    <p className="text-sm text-gray-600">
      Don't have an account?{" "}
      <Link
        href="/signup"
        className="font-medium text-blue-600 hover:text-blue-500"
      >
        Create company account
      </Link>
    </p>
  </div>

  <div className="relative">
    <div className="absolute inset-0 flex items-center">
      <div className="w-full border-t border-gray-300" />
    </div>
    <div className="relative flex justify-center text-sm">
      <span className="px-2 bg-white text-gray-500">Need help?</span>
    </div>
  </div>

  <div className="text-center">
    <Link href="/support" className="text-sm text-blue-600 hover:text-blue-500">
      Contact Support
    </Link>
  </div>
</div>
```

### Validation Rules

#### Client-Side Validation

- **Email**: Required, valid email format
- **Password**: Required, minimum 1 character (for UX)

#### Server-Side Validation

- Email and password combination validation
- Account status check (active/inactive)
- Rate limiting for failed attempts

### Error Handling

#### Authentication Errors

```tsx
<div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
  <div className="flex">
    <AlertCircle className="h-5 w-5 text-red-400" />
    <div className="ml-3">
      <h3 className="text-sm font-medium text-red-800">Sign in failed</h3>
      <p className="mt-1 text-sm text-red-700">
        Invalid email address or password. Please try again.
      </p>
    </div>
  </div>
</div>
```

#### Account Status Errors

```tsx
<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
  <div className="flex">
    <AlertTriangle className="h-5 w-5 text-yellow-400" />
    <div className="ml-3">
      <h3 className="text-sm font-medium text-yellow-800">
        Account temporarily disabled
      </h3>
      <p className="mt-1 text-sm text-yellow-700">
        Please contact your administrator for assistance.
      </p>
    </div>
  </div>
</div>
```

### Success State

Upon successful authentication, redirect based on user role:

- **Admin**: `/dashboard/admin`
- **Manager**: `/dashboard/manager`
- **Employee**: `/dashboard/employee`

### Security Considerations

1. **CSRF Protection**: Include CSRF tokens in forms
2. **Rate Limiting**: Implement progressive delays for failed attempts
3. **Session Management**: Secure session handling with proper expiration
4. **Input Sanitization**: Sanitize all user inputs
5. **HTTPS Only**: Enforce HTTPS for all authentication flows

---

## Responsive Design

### Mobile Layout (< 768px)

- Single column form layout
- Increased touch targets (minimum 44px)
- Simplified navigation
- Stack password fields vertically

### Tablet Layout (768px - 1024px)

- Maintain single column for forms
- Increase form container width to 600px
- Enhanced spacing for touch interactions

### Desktop Layout (> 1024px)

- Maximum form container width of 480px
- Side-by-side password fields
- Enhanced hover states
- Keyboard navigation support

## Accessibility Standards

### WCAG 2.1 AA Compliance

- **Color Contrast**: Minimum 4.5:1 ratio for all text
- **Focus Management**: Clear focus indicators
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **Keyboard Navigation**: Full keyboard accessibility
- **Form Labels**: Explicit labels for all form controls
- **Error Identification**: Clear error messages with role="alert"

### Implementation Checklist

- [ ] All form controls have associated labels
- [ ] Error messages are announced to screen readers
- [ ] Focus management during form submission
- [ ] High contrast mode compatibility
- [ ] Touch target minimum 44px square
- [ ] Reduced motion preferences respected
