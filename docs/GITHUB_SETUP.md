# GitHub Repository Setup Guide

Follow these steps to create and set up your ExpenseWise repository on GitHub.

## Step 1: Create GitHub Repository

### Option A: Via GitHub Website

1. Go to [GitHub](https://github.com)
2. Click the **"+"** icon in the top right corner
3. Select **"New repository"**
4. Fill in the details:
   - **Repository name**: `ExpenseWise`
   - **Description**: `A modern expense management system built with Next.js 15, React 19, and TypeScript`
   - **Visibility**: Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
5. Click **"Create repository"**

### Option B: Via GitHub CLI

```bash
# Install GitHub CLI if you haven't
# https://cli.github.com/

# Login to GitHub
gh auth login

# Create repository
gh repo create ExpenseWise --public --description "A modern expense management system built with Next.js 15, React 19, and TypeScript"
```

## Step 2: Initialize Git (if not already done)

```bash
# Navigate to your project directory
cd Expense-Wise

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: ExpenseWise v1.0.0"
```

## Step 3: Connect to GitHub

```bash
# Add GitHub as remote origin (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/ExpenseWise.git

# Verify remote
git remote -v

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 4: Configure Repository Settings

### 4.1 Add Repository Description

1. Go to your repository on GitHub
2. Click the **⚙️ Settings** icon next to "About"
3. Add:
   - **Description**: `A modern expense management system built with Next.js 15, React 19, and TypeScript`
   - **Website**: Your deployment URL (if available)
   - **Topics**: `nextjs`, `react`, `typescript`, `expense-management`, `tailwindcss`, `prisma`, `postgresql`

### 4.2 Enable Issues

1. Go to **Settings** → **General**
2. Under **Features**, ensure **Issues** is checked

### 4.3 Set Up Branch Protection

1. Go to **Settings** → **Branches**
2. Click **Add rule**
3. Branch name pattern: `main`
4. Enable:
   - ✅ Require a pull request before merging
   - ✅ Require approvals (1)
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging

### 4.4 Configure GitHub Actions

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: expensewise_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linter
      run: npm run lint
    
    - name: Run type check
      run: npm run type-check
    
    - name: Run tests
      run: npm test
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/expensewise_test
```

## Step 5: Add Issue Templates

Create `.github/ISSUE_TEMPLATE/bug_report.md`:

```markdown
---
name: Bug report
about: Create a report to help us improve
title: '[BUG] '
labels: bug
assignees: ''
---

**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - OS: [e.g. Windows, macOS, Linux]
 - Browser: [e.g. chrome, safari]
 - Version: [e.g. 22]

**Additional context**
Add any other context about the problem here.
```

Create `.github/ISSUE_TEMPLATE/feature_request.md`:

```markdown
---
name: Feature request
about: Suggest an idea for this project
title: '[FEATURE] '
labels: enhancement
assignees: ''
---

**Is your feature request related to a problem? Please describe.**
A clear and concise description of what the problem is.

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request here.
```

## Step 6: Add Pull Request Template

Create `.github/PULL_REQUEST_TEMPLATE.md`:

```markdown
## Description
Please include a summary of the changes and which issue is fixed.

Fixes # (issue)

## Type of change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## How Has This Been Tested?
Please describe the tests that you ran to verify your changes.

- [ ] Test A
- [ ] Test B

## Checklist:
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
```

## Step 7: Add GitHub Labels

Run this script or add labels manually:

```bash
# Using GitHub CLI
gh label create "bug" --color "d73a4a" --description "Something isn't working"
gh label create "enhancement" --color "a2eeef" --description "New feature or request"
gh label create "documentation" --color "0075ca" --description "Improvements or additions to documentation"
gh label create "good first issue" --color "7057ff" --description "Good for newcomers"
gh label create "help wanted" --color "008672" --description "Extra attention is needed"
gh label create "priority: high" --color "d93f0b" --description "High priority"
gh label create "priority: low" --color "0e8a16" --description "Low priority"
gh label create "wontfix" --color "ffffff" --description "This will not be worked on"
```

## Step 8: Set Up GitHub Pages (Optional)

If you want to host documentation:

1. Go to **Settings** → **Pages**
2. Source: Deploy from a branch
3. Branch: `main` / `docs`
4. Click **Save**

## Step 9: Add Secrets for CI/CD

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add necessary secrets:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `VERCEL_TOKEN` (if deploying to Vercel)
   - etc.

## Step 10: Create Initial Release

```bash
# Tag the initial release
git tag -a v1.0.0 -m "Initial release of ExpenseWise"
git push origin v1.0.0
```

Or via GitHub:
1. Go to **Releases**
2. Click **Create a new release**
3. Tag: `v1.0.0`
4. Title: `ExpenseWise v1.0.0 - Initial Release`
5. Description: Add release notes
6. Click **Publish release**

## Step 11: Add Collaborators (Optional)

1. Go to **Settings** → **Collaborators**
2. Click **Add people**
3. Enter GitHub username or email
4. Select permission level

## Step 12: Set Up Project Board (Optional)

1. Go to **Projects** tab
2. Click **New project**
3. Choose template: **Board**
4. Name: `ExpenseWise Development`
5. Add columns: `To Do`, `In Progress`, `Review`, `Done`

## Useful Git Commands

```bash
# Check status
git status

# Create new branch
git checkout -b feature/new-feature

# Stage changes
git add .

# Commit changes
git commit -m "feat: add new feature"

# Push branch
git push origin feature/new-feature

# Pull latest changes
git pull origin main

# Merge branch
git checkout main
git merge feature/new-feature

# Delete branch
git branch -d feature/new-feature
git push origin --delete feature/new-feature
```

## Repository Structure

Your repository should now look like this:

```
ExpenseWise/
├── .github/
│   ├── workflows/
│   │   └── ci.yml
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── PULL_REQUEST_TEMPLATE.md
├── docs/
│   ├── API.md
│   ├── SETUP.md
│   └── ui-specifications/
├── src/
├── .gitignore
├── README.md
├── CONTRIBUTING.md
├── LICENSE
└── package.json
```

## Next Steps

1. ✅ Invite team members
2. ✅ Set up continuous integration
3. ✅ Configure deployment (Vercel, AWS, etc.)
4. ✅ Add status badges to README
5. ✅ Create project roadmap
6. ✅ Start accepting contributions!

## Resources

- [GitHub Docs](https://docs.github.com)
- [GitHub CLI](https://cli.github.com/)
- [Git Documentation](https://git-scm.com/doc)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

Need help? Open an issue or contact support@expensewise.com
