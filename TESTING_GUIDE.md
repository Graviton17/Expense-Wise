# 🧪 ExpenseWise - Testing Guide

## ✅ All Errors Resolved!

The application is now **error-free** and ready for testing with mock API endpoints.

## 🚀 How to Test

### Step 1: Start the Development Server

```bash
cd expense_wise
npm run dev
```

The app will be available at: **http://localhost:3000**

---

## 📋 Test Scenarios

### 1. **Landing Page** (/)

**Expected Behavior:**
- Shows loading spinner
- Automatically redirects to `/signin`

**Test:**
```
1. Visit http://localhost:3000
2. Should see "ExpenseWise" with loading spinner
3. Should redirect to signin page
```

---

### 2. **Company Signup** (/signup)

**URL:** http://localhost:3000/signup

**Test Cases:**

#### ✅ Valid Signup
```
1. Fill in all fields:
   - Admin Name: "John Admin"
   - Email: "admin@company.com"
   - Company Name: "Acme Corp"
   - Country: Select any country
   - Password: "Password123"
   - Confirm Password: "Password123"

2. Click "Create Company Account"
3. Should show loading state
4. Should redirect to signin with success message
```

#### ❌ Validation Errors
```
Test 1: Empty fields
- Leave fields empty
- Click submit
- Should show "required" errors

Test 2: Invalid email
- Email: "notanemail"
- Should show "valid email" error

Test 3: Weak password
- Password: "weak"
- Should show password strength error

Test 4: Password mismatch
- Password: "Password123"
- Confirm: "Different123"
- Should show "passwords do not match" error
```

#### 🎨 UI Features to Test
- Gradient accent bar at top
- Glassmorphism background
- Hover effects on buttons
- Form field focus states
- Country dropdown with currency display
- Password strength indicator

---

### 3. **User Signin** (/signin)

**URL:** http://localhost:3000/signin

**Test Cases:**

#### ✅ Valid Signin (Mock Authentication)

**Admin User:**
```
Email: admin@company.com
Password: anything
→ Redirects to /dashboard/admin
```

**Manager User:**
```
Email: manager@company.com
Password: anything
→ Redirects to /dashboard/manager
```

**Employee User:**
```
Email: employee@company.com
Password: anything
→ Redirects to /dashboard/employee
```

#### ❌ Validation Errors
```
Test 1: Empty fields
- Leave fields empty
- Should show "required" errors

Test 2: Invalid email format
- Email: "notanemail"
- Should show "valid email" error
```

#### 🎨 UI Features to Test
- Success message from signup
- Gradient accent bar
- Glassmorphism background
- Forgot password link
- Support link
- Hover effects

---

### 4. **Admin Dashboard** (/dashboard/admin)

**URL:** http://localhost:3000/dashboard/admin

**Test Cases:**

#### Navigation
```
1. Click sidebar menu items
2. Test active state highlighting
3. Hover over menu items (should see scale effect)
4. Click user profile dropdown
5. Test mobile sidebar (resize browser)
```

#### User Management Tab
```
1. View user table
2. Test search functionality
3. Test role filter dropdown
4. Click action dropdown on user row
5. Hover over table rows
6. Check status badges
```

#### Approval Rules Tab
```
1. Click "Approval Rules" tab
2. Should see placeholder content
3. Click "Create New Rule" button
```

#### 🎨 UI Features to Test
- Dark gradient sidebar
- Glassmorphism header
- Search bar focus state
- Notification badge
- Currency indicator
- Gradient active states
- Icon animations
- Avatar with gradient fallback
- Table hover effects
- Status badges with gradients

---

## 📱 Responsive Testing

### Mobile (< 768px)
```
1. Resize browser to mobile size
2. Click hamburger menu
3. Sidebar should slide in from left
4. Click outside to close
5. Forms should stack vertically
6. Buttons should be full width
```

### Tablet (768px - 1024px)
```
1. Resize to tablet size
2. Check layout adaptations
3. Test touch interactions
4. Verify spacing adjustments
```

### Desktop (> 1024px)
```
1. Full sidebar visible
2. Multi-column layouts
3. Enhanced hover effects
4. All features accessible
```

---

## 🎨 Visual Testing Checklist

### Colors & Gradients
- [ ] Primary gradient (blue → indigo) visible
- [ ] Status badges have gradient backgrounds
- [ ] Buttons have gradient on hover
- [ ] Sidebar has dark gradient
- [ ] Accent bars on cards visible

### Animations
- [ ] Button lift on hover
- [ ] Icon scale on hover
- [ ] Smooth transitions
- [ ] Loading spinners work
- [ ] Shadow elevation changes

### Typography
- [ ] Inter font loaded
- [ ] Heading hierarchy clear
- [ ] Text readable on all backgrounds
- [ ] Currency numbers use tabular nums

### Spacing
- [ ] Consistent padding
- [ ] Proper gaps between elements
- [ ] No overlapping content
- [ ] Aligned elements

---

## 🐛 Common Issues & Solutions

### Issue: Styles not loading
**Solution:**
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

### Issue: API routes not working
**Solution:**
```bash
# Restart dev server
# Press Ctrl+C
npm run dev
```

### Issue: Fonts not loading
**Solution:**
- Check internet connection (fonts load from Google)
- Clear browser cache
- Hard refresh (Ctrl+Shift+R)

### Issue: Gradients not showing
**Solution:**
- Ensure using modern browser (Chrome, Firefox, Safari, Edge)
- Check Tailwind CSS v4 is properly configured

---

## ✅ Expected Results

### Signup Flow
1. ✅ Form validates inputs
2. ✅ Shows loading state
3. ✅ Redirects to signin
4. ✅ Success message displays

### Signin Flow
1. ✅ Form validates inputs
2. ✅ Shows loading state
3. ✅ Redirects based on role
4. ✅ Dashboard loads correctly

### Dashboard
1. ✅ Sidebar navigation works
2. ✅ Search functionality present
3. ✅ Tables display data
4. ✅ Dropdowns work
5. ✅ Responsive on all devices

---

## 🎯 Mock Data

### Test Users (for signin)
```
Admin:
- Email: admin@company.com
- Password: any

Manager:
- Email: manager@company.com
- Password: any

Employee:
- Email: employee@company.com
- Password: any
```

### Mock Company Data
```
Company: Acme Corporation
Currency: USD
Users: 3 (shown in admin dashboard)
```

---

## 📊 Browser Compatibility

### Tested & Supported
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Not Supported
- ❌ Internet Explorer 11

---

## 🔍 Debugging Tips

### Check Browser Console
```
1. Open DevTools (F12)
2. Go to Console tab
3. Look for errors (red text)
4. Check Network tab for API calls
```

### Check Network Requests
```
1. Open DevTools (F12)
2. Go to Network tab
3. Submit a form
4. Check API request/response
5. Verify status codes (200, 201, 400, etc.)
```

### React DevTools
```
1. Install React DevTools extension
2. Open DevTools
3. Go to Components tab
4. Inspect component props/state
```

---

## 📝 Test Report Template

```markdown
## Test Session Report

**Date:** [Date]
**Tester:** [Name]
**Browser:** [Browser + Version]
**Device:** [Desktop/Mobile/Tablet]

### Signup Page
- [ ] Form validation works
- [ ] Submit button shows loading
- [ ] Redirects to signin
- [ ] UI looks professional

### Signin Page
- [ ] Form validation works
- [ ] Success message displays
- [ ] Redirects to correct dashboard
- [ ] UI looks professional

### Admin Dashboard
- [ ] Navigation works
- [ ] Search works
- [ ] Tables display correctly
- [ ] Responsive on mobile
- [ ] UI looks professional

### Issues Found
1. [Issue description]
2. [Issue description]

### Screenshots
[Attach screenshots if needed]
```

---

## 🎉 Success Criteria

The application passes testing if:

✅ All forms validate correctly
✅ No console errors
✅ Smooth animations
✅ Responsive on all devices
✅ Professional appearance
✅ All links work
✅ Mock API calls succeed
✅ Proper error handling

---

## 📞 Need Help?

If you encounter issues:

1. Check this testing guide
2. Review browser console
3. Check QUICK_START.md
4. Review FRONTEND_README.md
5. Check IMPLEMENTATION_STATUS.md

---

**Happy Testing! 🚀**

The application is fully functional with mock APIs and ready for real backend integration.