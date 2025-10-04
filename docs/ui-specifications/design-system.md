# Design System Documentation

## Overview

The Expense-Wise Design System provides a comprehensive foundation for creating consistent, accessible, and scalable user interfaces. This system establishes visual language, interaction patterns, and implementation guidelines for the entire application ecosystem.

### Related Documentation

- [Component Library](./component-library.md) - Implementation of design tokens in reusable components
- [Authentication Pages](./authentication-pages.md) - Design system application in forms
- [Admin Dashboard](./admin-dashboard.md) - Complex interface design patterns
- [Employee Dashboard](./employee-dashboard.md) - Mobile-responsive design examples
- [Manager Dashboard](./manager-dashboard.md) - Advanced interaction patterns

---

## Brand Identity

### Core Values

- **Professional**: Clean, business-appropriate aesthetics
- **Trustworthy**: Reliable and secure financial handling
- **Efficient**: Streamlined workflows and clear information hierarchy
- **Accessible**: Inclusive design for all users

### Visual Principles

- **Clarity**: Every element serves a purpose
- **Consistency**: Uniform patterns across all interfaces
- **Hierarchy**: Clear information prioritization
- **Responsiveness**: Seamless experience across devices

---

## Section 1: Color System

### Primary Palette

#### Brand Colors

```css
:root {
  /* Primary Brand Colors */
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-200: #bfdbfe;
  --color-primary-300: #93c5fd;
  --color-primary-400: #60a5fa;
  --color-primary-500: #3b82f6; /* Primary Brand */
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  --color-primary-800: #1e40af;
  --color-primary-900: #1e3a8a;
  --color-primary-950: #172554;
}
```

#### Secondary Colors

```css
:root {
  /* Slate (Neutral) */
  --color-slate-50: #f8fafc;
  --color-slate-100: #f1f5f9;
  --color-slate-200: #e2e8f0;
  --color-slate-300: #cbd5e1;
  --color-slate-400: #94a3b8;
  --color-slate-500: #64748b;
  --color-slate-600: #475569;
  --color-slate-700: #334155;
  --color-slate-800: #1e293b;
  --color-slate-900: #0f172a;
  --color-slate-950: #020617;
}
```

### Semantic Colors

#### Status Colors

```css
:root {
  /* Success (Green) */
  --color-success-50: #f0fdf4;
  --color-success-100: #dcfce7;
  --color-success-500: #22c55e;
  --color-success-600: #16a34a;
  --color-success-700: #15803d;

  /* Warning (Amber) */
  --color-warning-50: #fffbeb;
  --color-warning-100: #fef3c7;
  --color-warning-500: #f59e0b;
  --color-warning-600: #d97706;
  --color-warning-700: #b45309;

  /* Error (Red) */
  --color-error-50: #fef2f2;
  --color-error-100: #fee2e2;
  --color-error-500: #ef4444;
  --color-error-600: #dc2626;
  --color-error-700: #b91c1c;

  /* Info (Blue) */
  --color-info-50: #eff6ff;
  --color-info-100: #dbeafe;
  --color-info-500: #3b82f6;
  --color-info-600: #2563eb;
  --color-info-700: #1d4ed8;
}
```

#### Financial Status Colors

```css
:root {
  /* Expense Status Colors */
  --color-approved: var(--color-success-600);
  --color-rejected: var(--color-error-600);
  --color-pending: var(--color-warning-600);
  --color-draft: var(--color-slate-500);

  /* Currency Colors */
  --color-currency-positive: var(--color-success-700);
  --color-currency-negative: var(--color-error-700);
  --color-currency-neutral: var(--color-slate-700);

  /* Priority Colors */
  --color-priority-urgent: var(--color-error-600);
  --color-priority-high: var(--color-warning-600);
  --color-priority-normal: var(--color-info-600);
  --color-priority-low: var(--color-slate-500);
}
```

### Color Usage Guidelines

#### Background Colors

```css
/* Application Backgrounds */
.bg-app-primary {
  background-color: var(--color-slate-50);
}
.bg-app-secondary {
  background-color: var(--color-white);
}
.bg-app-tertiary {
  background-color: var(--color-slate-100);
}

/* Component Backgrounds */
.bg-card {
  background-color: var(--color-white);
}
.bg-header {
  background-color: var(--color-white);
}
.bg-sidebar {
  background-color: var(--color-slate-900);
}
.bg-overlay {
  background-color: rgba(0, 0, 0, 0.5);
}
```

#### Text Colors

```css
/* Text Hierarchy */
.text-primary {
  color: var(--color-slate-900);
}
.text-secondary {
  color: var(--color-slate-700);
}
.text-tertiary {
  color: var(--color-slate-500);
}
.text-disabled {
  color: var(--color-slate-400);
}

/* Semantic Text */
.text-success {
  color: var(--color-success-700);
}
.text-warning {
  color: var(--color-warning-700);
}
.text-error {
  color: var(--color-error-700);
}
.text-info {
  color: var(--color-info-700);
}
```

#### Border Colors

```css
/* Border Variants */
.border-default {
  border-color: var(--color-slate-200);
}
.border-interactive {
  border-color: var(--color-primary-300);
}
.border-focus {
  border-color: var(--color-primary-500);
}
.border-error {
  border-color: var(--color-error-300);
}
.border-success {
  border-color: var(--color-success-300);
}
```

---

## Section 2: Typography System

### Font Families

```css
:root {
  /* Primary Font Stack */
  --font-family-sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;

  /* Monospace Font Stack */
  --font-family-mono: "JetBrains Mono", "Fira Code", Menlo, Monaco,
    "Cascadia Code", "Segoe UI Mono", "Roboto Mono", "Oxygen Mono",
    "Ubuntu Monospace", monospace;

  /* Numeric Font Stack */
  --font-family-numeric: "Inter", tabular-nums, sans-serif;
}
```

### Type Scale

```css
:root {
  /* Font Sizes */
  --text-xs: 0.75rem; /* 12px */
  --text-sm: 0.875rem; /* 14px */
  --text-base: 1rem; /* 16px */
  --text-lg: 1.125rem; /* 18px */
  --text-xl: 1.25rem; /* 20px */
  --text-2xl: 1.5rem; /* 24px */
  --text-3xl: 1.875rem; /* 30px */
  --text-4xl: 2.25rem; /* 36px */
  --text-5xl: 3rem; /* 48px */
  --text-6xl: 3.75rem; /* 60px */

  /* Line Heights */
  --leading-none: 1;
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;

  /* Font Weights */
  --font-thin: 100;
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  --font-extrabold: 800;
  --font-black: 900;
}
```

### Typography Classes

#### Headings

```css
.heading-1 {
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  letter-spacing: -0.025em;
  color: var(--color-slate-900);
}

.heading-2 {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  letter-spacing: -0.025em;
  color: var(--color-slate-900);
}

.heading-3 {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-snug);
  color: var(--color-slate-900);
}

.heading-4 {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-snug);
  color: var(--color-slate-900);
}

.heading-5 {
  font-size: var(--text-lg);
  font-weight: var(--font-medium);
  line-height: var(--leading-normal);
  color: var(--color-slate-900);
}

.heading-6 {
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  line-height: var(--leading-normal);
  color: var(--color-slate-900);
}
```

#### Body Text

```css
.body-large {
  font-size: var(--text-lg);
  font-weight: var(--font-normal);
  line-height: var(--leading-relaxed);
  color: var(--color-slate-700);
}

.body-default {
  font-size: var(--text-base);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
  color: var(--color-slate-700);
}

.body-small {
  font-size: var(--text-sm);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
  color: var(--color-slate-600);
}

.body-xs {
  font-size: var(--text-xs);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
  color: var(--color-slate-600);
}
```

#### Specialized Text

```css
.text-currency {
  font-family: var(--font-family-numeric);
  font-weight: var(--font-semibold);
  font-variant-numeric: tabular-nums;
}

.text-code {
  font-family: var(--font-family-mono);
  font-size: 0.9em;
  background-color: var(--color-slate-100);
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
}

.text-label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-slate-700);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.text-caption {
  font-size: var(--text-xs);
  font-weight: var(--font-normal);
  color: var(--color-slate-500);
  line-height: var(--leading-normal);
}
```

### Usage Guidelines

#### Text Hierarchy Example

```tsx
// Page title
<h1 className="heading-1">Expense Dashboard</h1>

// Section title
<h2 className="heading-3">Pending Approvals</h2>

// Card title
<h3 className="heading-5">Travel Expenses</h3>

// Body content
<p className="body-default">Review and approve expense requests from your team members.</p>

// Supporting text
<p className="body-small">Last updated 5 minutes ago</p>

// Currency display
<span className="text-currency text-xl font-bold text-success">$1,234.56</span>

// Form label
<label className="text-label">Expense Amount</label>

// Help text
<p className="text-caption">Maximum file size: 10MB</p>
```

---

## Section 3: Spacing System

### Spacing Scale

```css
:root {
  /* Spacing Scale (based on 0.25rem = 4px) */
  --space-0: 0;
  --space-px: 1px;
  --space-0-5: 0.125rem; /* 2px */
  --space-1: 0.25rem; /* 4px */
  --space-1-5: 0.375rem; /* 6px */
  --space-2: 0.5rem; /* 8px */
  --space-2-5: 0.625rem; /* 10px */
  --space-3: 0.75rem; /* 12px */
  --space-3-5: 0.875rem; /* 14px */
  --space-4: 1rem; /* 16px */
  --space-5: 1.25rem; /* 20px */
  --space-6: 1.5rem; /* 24px */
  --space-7: 1.75rem; /* 28px */
  --space-8: 2rem; /* 32px */
  --space-9: 2.25rem; /* 36px */
  --space-10: 2.5rem; /* 40px */
  --space-11: 2.75rem; /* 44px */
  --space-12: 3rem; /* 48px */
  --space-14: 3.5rem; /* 56px */
  --space-16: 4rem; /* 64px */
  --space-18: 4.5rem; /* 72px */
  --space-20: 5rem; /* 80px */
  --space-24: 6rem; /* 96px */
  --space-28: 7rem; /* 112px */
  --space-32: 8rem; /* 128px */
}
```

### Component Spacing Standards

#### Card Spacing

```css
.card-padding-sm {
  padding: var(--space-3);
} /* 12px */
.card-padding-default {
  padding: var(--space-4);
} /* 16px */
.card-padding-lg {
  padding: var(--space-6);
} /* 24px */

.card-gap-sm {
  gap: var(--space-2);
} /* 8px */
.card-gap-default {
  gap: var(--space-3);
} /* 12px */
.card-gap-lg {
  gap: var(--space-4);
} /* 16px */
```

#### Form Spacing

```css
.form-field-gap {
  margin-bottom: var(--space-4);
} /* 16px */
.form-section-gap {
  margin-bottom: var(--space-8);
} /* 32px */
.form-label-gap {
  margin-bottom: var(--space-1);
} /* 4px */
.form-help-gap {
  margin-top: var(--space-1);
} /* 4px */

.form-input-padding {
  padding: var(--space-2) var(--space-3);
} /* 8px 12px */
.form-button-padding {
  padding: var(--space-2) var(--space-4);
} /* 8px 16px */
```

#### Layout Spacing

```css
.page-padding {
  padding: var(--space-6);
} /* 24px */
.page-gap {
  gap: var(--space-6);
} /* 24px */

.section-padding {
  padding: var(--space-4);
} /* 16px */
.section-gap {
  gap: var(--space-4);
} /* 16px */

.component-gap-sm {
  gap: var(--space-2);
} /* 8px */
.component-gap-default {
  gap: var(--space-3);
} /* 12px */
.component-gap-lg {
  gap: var(--space-4);
} /* 16px */
```

---

## Section 4: Component Sizing

### Size Variants

```css
:root {
  /* Size Scales */
  --size-xs: 1.5rem; /* 24px */
  --size-sm: 2rem; /* 32px */
  --size-md: 2.5rem; /* 40px */
  --size-lg: 3rem; /* 48px */
  --size-xl: 3.5rem; /* 56px */
  --size-2xl: 4rem; /* 64px */
}
```

#### Button Sizing

```css
.btn-xs {
  height: var(--size-xs);
  padding: 0 var(--space-2);
  font-size: var(--text-xs);
}

.btn-sm {
  height: var(--size-sm);
  padding: 0 var(--space-3);
  font-size: var(--text-sm);
}

.btn-md {
  height: var(--size-md);
  padding: 0 var(--space-4);
  font-size: var(--text-base);
}

.btn-lg {
  height: var(--size-lg);
  padding: 0 var(--space-6);
  font-size: var(--text-lg);
}

.btn-xl {
  height: var(--size-xl);
  padding: 0 var(--space-8);
  font-size: var(--text-xl);
}
```

#### Input Sizing

```css
.input-sm {
  height: var(--size-sm);
  padding: var(--space-1) var(--space-2);
  font-size: var(--text-sm);
}

.input-md {
  height: var(--size-md);
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-base);
}

.input-lg {
  height: var(--size-lg);
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-lg);
}
```

---

## Section 5: Responsive Design

### Breakpoint System

```css
:root {
  /* Breakpoints */
  --screen-sm: 640px;
  --screen-md: 768px;
  --screen-lg: 1024px;
  --screen-xl: 1280px;
  --screen-2xl: 1536px;
}

/* Media Queries */
@media (min-width: 640px) {
  /* sm */
}
@media (min-width: 768px) {
  /* md */
}
@media (min-width: 1024px) {
  /* lg */
}
@media (min-width: 1280px) {
  /* xl */
}
@media (min-width: 1536px) {
  /* 2xl */
}
```

### Container Sizes

```css
.container {
  width: 100%;
  margin: 0 auto;
  padding: 0 var(--space-4);
}

@media (min-width: 640px) {
  .container {
    max-width: 640px;
  }
}

@media (min-width: 768px) {
  .container {
    max-width: 768px;
  }
}

@media (min-width: 1024px) {
  .container {
    max-width: 1024px;
  }
}

@media (min-width: 1280px) {
  .container {
    max-width: 1280px;
  }
}

@media (min-width: 1536px) {
  .container {
    max-width: 1536px;
  }
}
```

### Responsive Utilities

#### Layout Grids

```css
/* Responsive Grid */
.grid-responsive {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: 1fr;
}

@media (min-width: 640px) {
  .grid-responsive {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .grid-responsive {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1280px) {
  .grid-responsive {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

#### Responsive Tables

```tsx
// Table component with responsive behavior
<div className="overflow-x-auto">
  <table className="w-full min-w-[600px]">
    {/* Table content */}
  </table>
</div>

// Mobile card layout
<div className="md:hidden space-y-4">
  {items.map(item => (
    <MobileCard key={item.id} item={item} />
  ))}
</div>

// Desktop table layout
<div className="hidden md:block">
  <DataTable columns={columns} data={data} />
</div>
```

---

## Section 6: Animation and Transitions

### Transition System

```css
:root {
  /* Transition Durations */
  --duration-fast: 150ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  --duration-slower: 500ms;

  /* Easing Functions */
  --ease-linear: linear;
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

### Standard Transitions

```css
/* Component Transitions */
.transition-colors {
  transition: color var(--duration-normal) var(--ease-out), background-color var(
        --duration-normal
      ) var(--ease-out), border-color var(--duration-normal) var(--ease-out);
}

.transition-transform {
  transition: transform var(--duration-normal) var(--ease-out);
}

.transition-opacity {
  transition: opacity var(--duration-normal) var(--ease-out);
}

.transition-shadow {
  transition: box-shadow var(--duration-normal) var(--ease-out);
}

.transition-all {
  transition: all var(--duration-normal) var(--ease-out);
}
```

### Interactive States

```css
/* Button States */
.btn-base {
  transition: all var(--duration-normal) var(--ease-out);
}

.btn-base:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-base:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-base:focus {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

/* Card Hover Effects */
.card-interactive {
  transition: all var(--duration-normal) var(--ease-out);
}

.card-interactive:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}
```

### Loading Animations

```css
/* Spinner Animation */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Pulse Animation */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Fade In Animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn var(--duration-slow) var(--ease-out);
}
```

---

## Section 7: Shadows and Elevation

### Shadow System

```css
:root {
  /* Shadow Levels */
  --shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

  /* Colored Shadows */
  --shadow-primary: 0 4px 14px 0 rgba(59, 130, 246, 0.15);
  --shadow-success: 0 4px 14px 0 rgba(34, 197, 94, 0.15);
  --shadow-warning: 0 4px 14px 0 rgba(245, 158, 11, 0.15);
  --shadow-error: 0 4px 14px 0 rgba(239, 68, 68, 0.15);
}
```

### Elevation Usage

```css
/* Component Elevation Levels */
.elevation-0 {
  box-shadow: none;
} /* Flat surfaces */
.elevation-1 {
  box-shadow: var(--shadow-sm);
} /* Cards, buttons */
.elevation-2 {
  box-shadow: var(--shadow-md);
} /* Dropdowns */
.elevation-3 {
  box-shadow: var(--shadow-lg);
} /* Modals */
.elevation-4 {
  box-shadow: var(--shadow-xl);
} /* Navigation */
.elevation-5 {
  box-shadow: var(--shadow-2xl);
} /* Overlays */

/* Interactive Elevation */
.elevation-interactive {
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--duration-normal) var(--ease-out);
}

.elevation-interactive:hover {
  box-shadow: var(--shadow-md);
}

.elevation-interactive:active {
  box-shadow: var(--shadow-xs);
}
```

---

## Section 8: Border Radius

### Radius Scale

```css
:root {
  /* Border Radius Scale */
  --radius-none: 0;
  --radius-sm: 0.125rem; /* 2px */
  --radius-default: 0.25rem; /* 4px */
  --radius-md: 0.375rem; /* 6px */
  --radius-lg: 0.5rem; /* 8px */
  --radius-xl: 0.75rem; /* 12px */
  --radius-2xl: 1rem; /* 16px */
  --radius-3xl: 1.5rem; /* 24px */
  --radius-full: 9999px; /* Full circle */
}
```

### Component Radius Standards

```css
/* Form Elements */
.input-radius {
  border-radius: var(--radius-md);
}
.button-radius {
  border-radius: var(--radius-md);
}
.checkbox-radius {
  border-radius: var(--radius-sm);
}

/* Containers */
.card-radius {
  border-radius: var(--radius-lg);
}
.modal-radius {
  border-radius: var(--radius-xl);
}
.tooltip-radius {
  border-radius: var(--radius-md);
}

/* Avatars and Images */
.avatar-radius {
  border-radius: var(--radius-full);
}
.image-radius {
  border-radius: var(--radius-lg);
}

/* Status Indicators */
.badge-radius {
  border-radius: var(--radius-full);
}
.tag-radius {
  border-radius: var(--radius-default);
}
```

---

## Section 9: Implementation Guidelines

### CSS Custom Properties Usage

```css
/* Global CSS Variables Setup */
:root {
  color-scheme: light;

  /* Apply design tokens */
  --font-family: var(--font-family-sans);
  --color-background: var(--color-slate-50);
  --color-foreground: var(--color-slate-900);

  /* Component defaults */
  --border-radius: var(--radius-md);
  --transition-duration: var(--duration-normal);
}

[data-theme="dark"] {
  color-scheme: dark;

  /* Dark mode overrides */
  --color-background: var(--color-slate-900);
  --color-foreground: var(--color-slate-50);
}
```

### Tailwind CSS Configuration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: "rgb(239 246 255)",
          500: "rgb(59 130 246)",
          600: "rgb(37 99 235)",
          // ... other shades
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
      },
      animation: {
        "fade-in": "fadeIn 300ms ease-out",
        "slide-up": "slideUp 200ms ease-out",
      },
    },
  },
};
```

### Component Token Usage

```tsx
// Example component using design tokens
export function ExpenseCard({ amount, currency, status }: ExpenseCardProps) {
  return (
    <div
      className={cn(
        // Base styles using design tokens
        "card-radius card-padding-default elevation-1",
        "bg-white border border-default",
        "transition-all duration-normal ease-out",

        // Interactive states
        "hover:elevation-2 hover:-translate-y-0.5",
        "focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2",

        // Conditional styles
        status === "approved" && "border-success",
        status === "rejected" && "border-error",
        status === "pending" && "border-warning"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="body-default font-medium">Travel Expenses</p>
          <p className="body-small text-secondary">Submitted 2 hours ago</p>
        </div>

        <div className="text-right">
          <p className="text-currency text-xl font-semibold text-success">
            {formatCurrency(amount, currency)}
          </p>
          <Badge variant={getStatusVariant(status)}>{status}</Badge>
        </div>
      </div>
    </div>
  );
}
```

### Design Token Validation

```typescript
// Type-safe design token usage
type ColorToken =
  | "primary-50"
  | "primary-500"
  | "primary-600"
  | "success-500"
  | "warning-500"
  | "error-500"
  | "slate-50"
  | "slate-500"
  | "slate-900";

type SpacingToken =
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "6"
  | "8"
  | "12"
  | "16"
  | "20";

type TypographyToken =
  | "heading-1"
  | "heading-2"
  | "heading-3"
  | "body-large"
  | "body-default"
  | "body-small"
  | "text-currency"
  | "text-label"
  | "text-caption";

// Utility function for safe token usage
function getColorValue(token: ColorToken): string {
  return `var(--color-${token})`;
}

function getSpacingValue(token: SpacingToken): string {
  return `var(--space-${token})`;
}
```

This comprehensive design system documentation provides the foundation for building consistent, accessible, and scalable user interfaces throughout the Expense-Wise application. It ensures that all team members can create cohesive experiences by following established patterns and standards.
