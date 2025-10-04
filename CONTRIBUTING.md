# Contributing to ExpenseWise

First off, thank you for considering contributing to ExpenseWise! It's people like you that make ExpenseWise such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title**
* **Describe the exact steps to reproduce the problem**
* **Provide specific examples to demonstrate the steps**
* **Describe the behavior you observed after following the steps**
* **Explain which behavior you expected to see instead and why**
* **Include screenshots and animated GIFs if possible**
* **Include your environment details** (OS, browser, Node version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* **Use a clear and descriptive title**
* **Provide a step-by-step description of the suggested enhancement**
* **Provide specific examples to demonstrate the steps**
* **Describe the current behavior and explain the behavior you expected to see**
* **Explain why this enhancement would be useful**

### Pull Requests

* Fill in the required template
* Do not include issue numbers in the PR title
* Follow the TypeScript and React styleguides
* Include thoughtfully-worded, well-structured tests
* Document new code based on the Documentation Styleguide
* End all files with a newline

## Development Process

### 1. Fork and Clone

```bash
# Fork the repo on GitHub, then:
git clone https://github.com/your-username/ExpenseWise.git
cd ExpenseWise
```

### 2. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 3. Set Up Development Environment

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

### 4. Make Your Changes

* Write clean, readable code
* Follow existing code style
* Add tests for new features
* Update documentation as needed

### 5. Test Your Changes

```bash
# Run linter
npm run lint

# Run type check
npm run type-check

# Run tests
npm run test

# Run all checks
npm run validate
```

### 6. Commit Your Changes

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat: add expense filtering by date range"
git commit -m "fix: resolve currency conversion bug"
git commit -m "docs: update API documentation"
```

**Commit Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### 7. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Styleguides

### TypeScript Styleguide

* Use TypeScript for all new code
* Define proper types, avoid `any`
* Use interfaces for object shapes
* Use enums for fixed sets of values
* Document complex types with JSDoc comments

```typescript
// Good
interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// Bad
const user: any = { ... };
```

### React Styleguide

* Use functional components with hooks
* Keep components small and focused
* Use meaningful component and prop names
* Extract reusable logic into custom hooks
* Use proper TypeScript types for props

```typescript
// Good
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>;
}
```

### CSS/Tailwind Styleguide

* Use Tailwind utility classes
* Follow mobile-first responsive design
* Use design tokens for consistency
* Avoid inline styles
* Group related utilities

```tsx
// Good
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">

// Bad
<div style={{ display: 'flex', padding: '16px' }}>
```

### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line

## Project Structure Guidelines

### Component Organization

```
components/
├── ui/              # Reusable UI components (shadcn/ui)
├── employee/        # Employee-specific components
├── manager/         # Manager-specific components
├── admin/           # Admin-specific components
└── shared/          # Shared business components
```

### File Naming

* Components: `PascalCase.tsx` (e.g., `ExpenseCard.tsx`)
* Utilities: `camelCase.ts` (e.g., `formatCurrency.ts`)
* Types: `PascalCase.ts` (e.g., `User.ts`)
* Tests: `*.test.ts` or `*.spec.ts`

## Testing Guidelines

### Unit Tests

* Test individual functions and components
* Mock external dependencies
* Aim for high coverage of business logic

```typescript
describe('formatCurrency', () => {
  it('should format USD correctly', () => {
    expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56');
  });
});
```

### Integration Tests

* Test component interactions
* Test API endpoints
* Test database operations

### E2E Tests

* Test critical user flows
* Test across different user roles
* Test responsive behavior

## Documentation Guidelines

* Update README.md for user-facing changes
* Update API.md for API changes
* Add JSDoc comments for complex functions
* Include code examples in documentation
* Keep documentation up to date with code

## Review Process

1. **Automated Checks**: All PRs must pass automated tests and linting
2. **Code Review**: At least one maintainer must review and approve
3. **Testing**: Reviewers will test the changes locally
4. **Documentation**: Ensure documentation is updated
5. **Merge**: Maintainers will merge approved PRs

## Getting Help

* 💬 Join our [Discord community](https://discord.gg/expensewise)
* 📧 Email: dev@expensewise.com
* 📖 Check the [documentation](./docs)
* 🐛 Search [existing issues](https://github.com/yourusername/ExpenseWise/issues)

## Recognition

Contributors will be recognized in:
* README.md contributors section
* Release notes
* Project website (coming soon)

Thank you for contributing to ExpenseWise! 🎉
