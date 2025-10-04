# API Specifications

## Overview

This document provides comprehensive API endpoint specifications for the Expense-Wise application, following RESTful design principles and industry-standard practices.

## Base Information

- **Base URL**: `https://api.expensewise.com/v1`
- **Protocol**: HTTPS only
- **Authentication**: Bearer token (JWT)
- **Content Type**: `application/json`
- **API Version**: v1

## Table of Contents

1. [Authentication APIs](#1-authentication-apis)
2. [User Management APIs](#2-user-management-apis)
3. [Company Management APIs](#3-company-management-apis)
4. [Expense Management APIs](#4-expense-management-apis)
5. [Approval Workflow APIs](#5-approval-workflow-apis)
6. [Receipt and OCR APIs](#6-receipt-and-ocr-apis)
7. [Reporting and Analytics APIs](#7-reporting-and-analytics-apis)
8. [Notification APIs](#8-notification-apis)
9. [Webhook APIs](#9-webhook-apis)

---

## 1. Authentication APIs

### 1.1 Company Registration

**Endpoint**: `POST /auth/company/register`

**Description**: Creates a new company account with an admin user.

**Request Body**:

```json
{
  "company": {
    "name": "Acme Corporation",
    "industry": "Technology",
    "size": "51-200",
    "country": "United States"
  },
  "admin": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@acme.com",
    "password": "SecureP@ssw0rd123"
  }
}
```

**Response** (201 Created):

```json
{
  "success": true,
  "data": {
    "company": {
      "id": "comp_abc123",
      "name": "Acme Corporation",
      "status": "ACTIVE",
      "createdAt": "2025-10-04T12:00:00Z"
    },
    "user": {
      "id": "user_xyz789",
      "email": "john.doe@acme.com",
      "role": "ADMIN",
      "firstName": "John",
      "lastName": "Doe"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 3600
    }
  }
}
```

**Error Responses**:

- `400 Bad Request`: Invalid input data
- `409 Conflict`: Company or email already exists

---

### 1.2 User Login

**Endpoint**: `POST /auth/login`

**Description**: Authenticates a user and provides access and refresh tokens.

**Request Body**:

```json
{
  "email": "john.doe@acme.com",
  "password": "SecureP@ssw0rd123"
}
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_xyz789",
      "email": "john.doe@acme.com",
      "role": "ADMIN",
      "firstName": "John",
      "lastName": "Doe",
      "companyId": "comp_abc123"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 3600
    }
  }
}
```

**Error Responses**:

- `401 Unauthorized`: Invalid credentials
- `403 Forbidden`: Account suspended or inactive

---

### 1.3 Refresh Token

**Endpoint**: `POST /auth/refresh`

**Description**: Issues a new access token using a valid refresh token.

**Request Body**:

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  }
}
```

**Error Responses**:

- `401 Unauthorized`: Invalid or expired refresh token

---

### 1.4 Logout

**Endpoint**: `POST /auth/logout`

**Description**: Invalidates a user's session by revoking their refresh token.

**Headers**:

```
Authorization: Bearer {accessToken}
```

**Request Body**:

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Successfully logged out"
}
```

---

### 1.5 Password Reset Request

**Endpoint**: `POST /auth/password/reset-request`

**Description**: Initiates a password reset flow by sending a reset email.

**Request Body**:

```json
{
  "email": "john.doe@acme.com"
}
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Password reset email sent successfully"
}
```

---

### 1.6 Password Reset Confirmation

**Endpoint**: `POST /auth/password/reset-confirm`

**Description**: Completes the password reset using the reset token.

**Request Body**:

```json
{
  "token": "reset_token_abc123",
  "newPassword": "NewSecureP@ssw0rd123"
}
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

## 2. User Management APIs

### 2.1 Get Current User Profile

**Endpoint**: `GET /users/me`

**Description**: Retrieves the profile of the currently authenticated user.

**Headers**:

```
Authorization: Bearer {accessToken}
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "id": "user_xyz789",
    "email": "john.doe@acme.com",
    "role": "ADMIN",
    "firstName": "John",
    "lastName": "Doe",
    "department": "Engineering",
    "managerId": null,
    "companyId": "comp_abc123",
    "status": "ACTIVE",
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-10-04T12:00:00Z"
  }
}
```

---

### 2.2 Update Current User Profile

**Endpoint**: `PUT /users/me`

**Description**: Updates the profile of the currently authenticated user.

**Headers**:

```
Authorization: Bearer {accessToken}
```

**Request Body**:

```json
{
  "firstName": "John",
  "lastName": "Smith",
  "department": "Product Management"
}
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "id": "user_xyz789",
    "email": "john.doe@acme.com",
    "firstName": "John",
    "lastName": "Smith",
    "department": "Product Management",
    "updatedAt": "2025-10-04T12:30:00Z"
  }
}
```

---

### 2.3 List Company Users

**Endpoint**: `GET /users`

**Description**: Lists all users within the company (Admin/Manager only).

**Headers**:

```
Authorization: Bearer {accessToken}
```

**Query Parameters**:

- `role` (optional): Filter by role (ADMIN, MANAGER, EMPLOYEE)
- `status` (optional): Filter by status (ACTIVE, INACTIVE, SUSPENDED)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `search` (optional): Search by name or email

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user_xyz789",
        "email": "john.doe@acme.com",
        "role": "ADMIN",
        "firstName": "John",
        "lastName": "Doe",
        "department": "Engineering",
        "status": "ACTIVE",
        "createdAt": "2025-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

---

### 2.4 Create User

**Endpoint**: `POST /users`

**Description**: Creates a new user in the company (Admin only).

**Headers**:

```
Authorization: Bearer {accessToken}
```

**Request Body**:

```json
{
  "email": "jane.smith@acme.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "EMPLOYEE",
  "department": "Sales",
  "managerId": "user_manager123"
}
```

**Response** (201 Created):

```json
{
  "success": true,
  "data": {
    "id": "user_new456",
    "email": "jane.smith@acme.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "EMPLOYEE",
    "department": "Sales",
    "managerId": "user_manager123",
    "status": "ACTIVE",
    "temporaryPassword": "TempP@ss123",
    "createdAt": "2025-10-04T12:00:00Z"
  },
  "message": "User created. Invitation email sent."
}
```

---

### 2.5 Update User

**Endpoint**: `PUT /users/{userId}`

**Description**: Updates a specific user's information (Admin only).

**Headers**:

```
Authorization: Bearer {accessToken}
```

**Request Body**:

```json
{
  "role": "MANAGER",
  "department": "Engineering",
  "managerId": "user_senior789"
}
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "id": "user_new456",
    "email": "jane.smith@acme.com",
    "role": "MANAGER",
    "department": "Engineering",
    "managerId": "user_senior789",
    "updatedAt": "2025-10-04T12:30:00Z"
  }
}
```

---

### 2.6 Delete User

**Endpoint**: `DELETE /users/{userId}`

**Description**: Deactivates a user account (Admin only).

**Headers**:

```
Authorization: Bearer {accessToken}
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "User deactivated successfully"
}
```

---

## 3. Company Management APIs

### 3.1 Get Company Profile

**Endpoint**: `GET /company`

**Description**: Retrieves the company profile information.

**Headers**:

```
Authorization: Bearer {accessToken}
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "id": "comp_abc123",
    "name": "Acme Corporation",
    "industry": "Technology",
    "size": "51-200",
    "country": "United States",
    "currency": "USD",
    "status": "ACTIVE",
    "settings": {
      "expenseCategories": ["Travel", "Meals", "Office", "Equipment"],
      "defaultApprovalWorkflow": "SEQUENTIAL",
      "maxExpenseAmount": 10000.0,
      "requireReceipts": true,
      "receiptMinAmount": 25.0
    },
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-10-04T12:00:00Z"
  }
}
```

---

### 3.2 Update Company Profile

**Endpoint**: `PUT /company`

**Description**: Updates company profile and settings (Admin only).

**Headers**:

```
Authorization: Bearer {accessToken}
```

**Request Body**:

```json
{
  "name": "Acme Corporation Inc.",
  "currency": "USD",
  "settings": {
    "maxExpenseAmount": 15000.0,
    "receiptMinAmount": 50.0
  }
}
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "id": "comp_abc123",
    "name": "Acme Corporation Inc.",
    "currency": "USD",
    "settings": {
      "maxExpenseAmount": 15000.0,
      "receiptMinAmount": 50.0
    },
    "updatedAt": "2025-10-04T12:30:00Z"
  }
}
```

---

## 4. Expense Management APIs

### 4.1 Create Expense

**Endpoint**: `POST /expenses`

**Description**: Creates a new expense submission.

**Headers**:

```
Authorization: Bearer {accessToken}
```

**Request Body**:

```json
{
  "amount": 125.5,
  "currency": "USD",
  "category": "Meals",
  "description": "Client dinner meeting",
  "date": "2025-10-03",
  "merchantName": "Restaurant ABC",
  "receiptIds": ["receipt_123", "receipt_456"]
}
```

**Response** (201 Created):

```json
{
  "success": true,
  "data": {
    "id": "exp_abc123",
    "userId": "user_xyz789",
    "amount": 125.5,
    "currency": "USD",
    "category": "Meals",
    "description": "Client dinner meeting",
    "date": "2025-10-03",
    "merchantName": "Restaurant ABC",
    "status": "PENDING",
    "receiptIds": ["receipt_123", "receipt_456"],
    "submittedAt": "2025-10-04T12:00:00Z",
    "createdAt": "2025-10-04T12:00:00Z"
  }
}
```

---

### 4.2 List Expenses

**Endpoint**: `GET /expenses`

**Description**: Lists expenses based on user role and filters.

**Headers**:

```
Authorization: Bearer {accessToken}
```

**Query Parameters**:

- `status` (optional): Filter by status (PENDING, APPROVED, REJECTED, PAID)
- `category` (optional): Filter by category
- `startDate` (optional): Filter by date range start
- `endDate` (optional): Filter by date range end
- `userId` (optional): Filter by user (Admin/Manager only)
- `page` (optional): Page number
- `limit` (optional): Items per page
- `sortBy` (optional): Sort field (date, amount, status)
- `sortOrder` (optional): asc or desc

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "expenses": [
      {
        "id": "exp_abc123",
        "userId": "user_xyz789",
        "userName": "John Doe",
        "amount": 125.5,
        "currency": "USD",
        "category": "Meals",
        "description": "Client dinner meeting",
        "status": "PENDING",
        "date": "2025-10-03",
        "submittedAt": "2025-10-04T12:00:00Z",
        "receiptCount": 2
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    },
    "summary": {
      "totalAmount": 15420.75,
      "pendingCount": 12,
      "approvedCount": 8,
      "rejectedCount": 2
    }
  }
}
```

---

### 4.3 Get Expense Details

**Endpoint**: `GET /expenses/{expenseId}`

**Description**: Retrieves detailed information about a specific expense.

**Headers**:

```
Authorization: Bearer {accessToken}
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "id": "exp_abc123",
    "userId": "user_xyz789",
    "user": {
      "id": "user_xyz789",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@acme.com",
      "department": "Engineering"
    },
    "amount": 125.5,
    "currency": "USD",
    "category": "Meals",
    "description": "Client dinner meeting",
    "date": "2025-10-03",
    "merchantName": "Restaurant ABC",
    "status": "APPROVED",
    "receipts": [
      {
        "id": "receipt_123",
        "filename": "receipt_001.jpg",
        "url": "https://cdn.expensewise.com/receipts/receipt_001.jpg",
        "uploadedAt": "2025-10-04T11:30:00Z"
      }
    ],
    "approvalHistory": [
      {
        "id": "approval_789",
        "approverId": "user_manager123",
        "approverName": "Jane Manager",
        "action": "APPROVED",
        "comment": "Approved for client engagement",
        "timestamp": "2025-10-04T14:00:00Z"
      }
    ],
    "submittedAt": "2025-10-04T12:00:00Z",
    "approvedAt": "2025-10-04T14:00:00Z",
    "createdAt": "2025-10-04T12:00:00Z",
    "updatedAt": "2025-10-04T14:00:00Z"
  }
}
```

---

### 4.4 Update Expense

**Endpoint**: `PUT /expenses/{expenseId}`

**Description**: Updates an expense (only if status is PENDING or REJECTED).

**Headers**:

```
Authorization: Bearer {accessToken}
```

**Request Body**:

```json
{
  "amount": 135.75,
  "description": "Client dinner meeting (updated)",
  "merchantName": "Restaurant ABC & Bar"
}
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "id": "exp_abc123",
    "amount": 135.75,
    "description": "Client dinner meeting (updated)",
    "merchantName": "Restaurant ABC & Bar",
    "status": "PENDING",
    "updatedAt": "2025-10-04T13:00:00Z"
  }
}
```

---

### 4.5 Delete Expense

**Endpoint**: `DELETE /expenses/{expenseId}`

**Description**: Deletes an expense (only if status is PENDING or REJECTED).

**Headers**:

```
Authorization: Bearer {accessToken}
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Expense deleted successfully"
}
```

---

## 5. Approval Workflow APIs

### 5.1 Get Pending Approvals

**Endpoint**: `GET /approvals/pending`

**Description**: Lists all expenses pending approval for the current manager.

**Headers**:

```
Authorization: Bearer {accessToken}
```

**Query Parameters**:

- `page` (optional): Page number
- `limit` (optional): Items per page

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "approvals": [
      {
        "id": "approval_789",
        "expense": {
          "id": "exp_abc123",
          "userId": "user_xyz789",
          "userName": "John Doe",
          "amount": 125.5,
          "currency": "USD",
          "category": "Meals",
          "description": "Client dinner meeting",
          "date": "2025-10-03",
          "receiptCount": 2
        },
        "submittedAt": "2025-10-04T12:00:00Z",
        "priority": "NORMAL"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 8,
      "totalPages": 1
    }
  }
}
```

---

### 5.2 Approve Expense

**Endpoint**: `POST /approvals/{expenseId}/approve`

**Description**: Approves a pending expense.

**Headers**:

```
Authorization: Bearer {accessToken}
```

**Request Body**:

```json
{
  "comment": "Approved for valid business expense"
}
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "expenseId": "exp_abc123",
    "status": "APPROVED",
    "approver": {
      "id": "user_manager123",
      "name": "Jane Manager"
    },
    "comment": "Approved for valid business expense",
    "timestamp": "2025-10-04T14:00:00Z"
  }
}
```

---

### 5.3 Reject Expense

**Endpoint**: `POST /approvals/{expenseId}/reject`

**Description**: Rejects a pending expense.

**Headers**:

```
Authorization: Bearer {accessToken}
```

**Request Body**:

```json
{
  "reason": "Missing required receipt documentation",
  "comment": "Please provide itemized receipt"
}
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "expenseId": "exp_abc123",
    "status": "REJECTED",
    "approver": {
      "id": "user_manager123",
      "name": "Jane Manager"
    },
    "reason": "Missing required receipt documentation",
    "comment": "Please provide itemized receipt",
    "timestamp": "2025-10-04T14:00:00Z"
  }
}
```

---

### 5.4 Get Approval Rules

**Endpoint**: `GET /approval-rules`

**Description**: Lists all approval rules for the company (Admin only).

**Headers**:

```
Authorization: Bearer {accessToken}
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "rules": [
      {
        "id": "rule_abc123",
        "name": "Standard Approval Rule",
        "conditions": {
          "amountThreshold": 100.0,
          "categories": ["Travel", "Meals"],
          "userRoles": ["EMPLOYEE"]
        },
        "approvers": ["user_manager123", "user_manager456"],
        "sequence": "SEQUENTIAL",
        "minApprovalPercentage": 100,
        "isActive": true,
        "createdAt": "2025-01-01T00:00:00Z"
      }
    ]
  }
}
```

---

### 5.5 Create Approval Rule

**Endpoint**: `POST /approval-rules`

**Description**: Creates a new approval rule (Admin only).

**Headers**:

```
Authorization: Bearer {accessToken}
```

**Request Body**:

```json
{
  "name": "High Value Expense Rule",
  "conditions": {
    "amountThreshold": 1000.0,
    "categories": ["Travel", "Equipment"]
  },
  "approvers": ["user_manager123", "user_cfo789"],
  "sequence": "SEQUENTIAL",
  "minApprovalPercentage": 100
}
```

**Response** (201 Created):

```json
{
  "success": true,
  "data": {
    "id": "rule_new456",
    "name": "High Value Expense Rule",
    "conditions": {
      "amountThreshold": 1000.0,
      "categories": ["Travel", "Equipment"]
    },
    "approvers": ["user_manager123", "user_cfo789"],
    "sequence": "SEQUENTIAL",
    "minApprovalPercentage": 100,
    "isActive": true,
    "createdAt": "2025-10-04T12:00:00Z"
  }
}
```

---

### 5.6 Update Approval Rule

**Endpoint**: `PUT /approval-rules/{ruleId}`

**Description**: Updates an existing approval rule (Admin only).

**Headers**:

```
Authorization: Bearer {accessToken}
```

**Request Body**:

```json
{
  "minApprovalPercentage": 50,
  "sequence": "PARALLEL"
}
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "id": "rule_new456",
    "minApprovalPercentage": 50,
    "sequence": "PARALLEL",
    "updatedAt": "2025-10-04T13:00:00Z"
  }
}
```

---

### 5.7 Delete Approval Rule

**Endpoint**: `DELETE /approval-rules/{ruleId}`

**Description**: Deletes an approval rule (Admin only).

**Headers**:

```
Authorization: Bearer {accessToken}
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Approval rule deleted successfully"
}
```

---

## 6. Receipt and OCR APIs

### 6.1 Upload Receipt

**Endpoint**: `POST /receipts/upload`

**Description**: Uploads a receipt image for OCR processing.

**Headers**:

```
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data
```

**Request Body** (form-data):

- `file`: Receipt image file (JPEG, PNG, PDF)
- `expenseId` (optional): Associate with existing expense

**Response** (201 Created):

```json
{
  "success": true,
  "data": {
    "id": "receipt_123",
    "filename": "receipt_001.jpg",
    "url": "https://cdn.expensewise.com/receipts/receipt_001.jpg",
    "status": "PROCESSING",
    "uploadedAt": "2025-10-04T12:00:00Z",
    "ocrTaskId": "task_ocr_456"
  }
}
```

---

### 6.2 Get Receipt OCR Status

**Endpoint**: `GET /receipts/{receiptId}/ocr-status`

**Description**: Checks the OCR processing status for a receipt.

**Headers**:

```
Authorization: Bearer {accessToken}
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "receiptId": "receipt_123",
    "status": "COMPLETED",
    "ocrData": {
      "merchantName": "Restaurant ABC",
      "totalAmount": 125.5,
      "currency": "USD",
      "date": "2025-10-03",
      "lineItems": [
        {
          "description": "Entree",
          "amount": 85.0
        },
        {
          "description": "Beverages",
          "amount": 25.5
        },
        {
          "description": "Tax",
          "amount": 15.0
        }
      ],
      "confidence": 0.95
    },
    "processedAt": "2025-10-04T12:02:00Z"
  }
}
```

---

### 6.3 Get Receipt Details

**Endpoint**: `GET /receipts/{receiptId}`

**Description**: Retrieves receipt information and OCR data.

**Headers**:

```
Authorization: Bearer {accessToken}
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "id": "receipt_123",
    "filename": "receipt_001.jpg",
    "url": "https://cdn.expensewise.com/receipts/receipt_001.jpg",
    "thumbnailUrl": "https://cdn.expensewise.com/receipts/thumbs/receipt_001.jpg",
    "fileSize": 2048576,
    "mimeType": "image/jpeg",
    "expenseId": "exp_abc123",
    "status": "COMPLETED",
    "ocrData": {
      "merchantName": "Restaurant ABC",
      "totalAmount": 125.5,
      "currency": "USD",
      "date": "2025-10-03",
      "confidence": 0.95
    },
    "uploadedAt": "2025-10-04T12:00:00Z",
    "processedAt": "2025-10-04T12:02:00Z"
  }
}
```

---

### 6.4 Delete Receipt

**Endpoint**: `DELETE /receipts/{receiptId}`

**Description**: Deletes a receipt file.

**Headers**:

```
Authorization: Bearer {accessToken}
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Receipt deleted successfully"
}
```

---

## 7. Reporting and Analytics APIs

### 7.1 Get Expense Dashboard

**Endpoint**: `GET /reports/dashboard`

**Description**: Retrieves dashboard analytics for expenses.

**Headers**:

```
Authorization: Bearer {accessToken}
```

**Query Parameters**:

- `startDate` (optional): Filter start date
- `endDate` (optional): Filter end date
- `userId` (optional): Filter by user (Admin/Manager only)

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalExpenses": 45890.75,
      "pendingAmount": 5420.5,
      "approvedAmount": 38150.25,
      "rejectedAmount": 2320.0,
      "expenseCount": 234,
      "averageExpense": 196.11
    },
    "categoryBreakdown": [
      {
        "category": "Travel",
        "amount": 25400.5,
        "count": 45,
        "percentage": 55.3
      },
      {
        "category": "Meals",
        "amount": 12350.25,
        "count": 89,
        "percentage": 26.9
      }
    ],
    "monthlyTrend": [
      {
        "month": "2025-09",
        "amount": 42350.75,
        "count": 198
      },
      {
        "month": "2025-10",
        "amount": 45890.75,
        "count": 234
      }
    ],
    "topSpenders": [
      {
        "userId": "user_xyz789",
        "name": "John Doe",
        "amount": 8750.5,
        "count": 23
      }
    ]
  }
}
```

---

### 7.2 Export Expenses Report

**Endpoint**: `POST /reports/export`

**Description**: Generates an expense report in CSV or Excel format.

**Headers**:

```
Authorization: Bearer {accessToken}
```

**Request Body**:

```json
{
  "format": "xlsx",
  "filters": {
    "startDate": "2025-09-01",
    "endDate": "2025-09-30",
    "status": ["APPROVED", "PAID"],
    "category": "Travel"
  },
  "includeReceipts": false
}
```

**Response** (202 Accepted):

```json
{
  "success": true,
  "data": {
    "taskId": "task_export_789",
    "status": "PROCESSING",
    "estimatedTime": 30
  }
}
```

---

### 7.3 Get Export Status

**Endpoint**: `GET /reports/export/{taskId}`

**Description**: Checks the status of an export task.

**Headers**:

```
Authorization: Bearer {accessToken}
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "taskId": "task_export_789",
    "status": "COMPLETED",
    "downloadUrl": "https://cdn.expensewise.com/exports/report_2025_09.xlsx",
    "expiresAt": "2025-10-05T12:00:00Z",
    "completedAt": "2025-10-04T12:05:00Z"
  }
}
```

---

## 8. Notification APIs

### 8.1 Get Notifications

**Endpoint**: `GET /notifications`

**Description**: Retrieves user notifications.

**Headers**:

```
Authorization: Bearer {accessToken}
```

**Query Parameters**:

- `unreadOnly` (optional): Filter unread notifications
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif_123",
        "type": "EXPENSE_APPROVED",
        "title": "Expense Approved",
        "message": "Your expense of $125.50 has been approved",
        "data": {
          "expenseId": "exp_abc123",
          "amount": 125.5
        },
        "isRead": false,
        "createdAt": "2025-10-04T14:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "totalPages": 1
    },
    "unreadCount": 5
  }
}
```

---

### 8.2 Mark Notification as Read

**Endpoint**: `PUT /notifications/{notificationId}/read`

**Description**: Marks a notification as read.

**Headers**:

```
Authorization: Bearer {accessToken}
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

### 8.3 Mark All Notifications as Read

**Endpoint**: `PUT /notifications/read-all`

**Description**: Marks all notifications as read.

**Headers**:

```
Authorization: Bearer {accessToken}
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

## 9. Webhook APIs

### 9.1 Create Webhook

**Endpoint**: `POST /webhooks`

**Description**: Creates a new webhook subscription (Admin only).

**Headers**:

```
Authorization: Bearer {accessToken}
```

**Request Body**:

```json
{
  "url": "https://your-app.com/webhooks/expense-wise",
  "events": ["expense.created", "expense.approved", "expense.rejected"],
  "secret": "your_webhook_secret_key"
}
```

**Response** (201 Created):

```json
{
  "success": true,
  "data": {
    "id": "webhook_abc123",
    "url": "https://your-app.com/webhooks/expense-wise",
    "events": ["expense.created", "expense.approved", "expense.rejected"],
    "status": "ACTIVE",
    "createdAt": "2025-10-04T12:00:00Z"
  }
}
```

---

### 9.2 List Webhooks

**Endpoint**: `GET /webhooks`

**Description**: Lists all webhook subscriptions (Admin only).

**Headers**:

```
Authorization: Bearer {accessToken}
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "webhooks": [
      {
        "id": "webhook_abc123",
        "url": "https://your-app.com/webhooks/expense-wise",
        "events": ["expense.created", "expense.approved"],
        "status": "ACTIVE",
        "lastTriggered": "2025-10-04T11:30:00Z",
        "createdAt": "2025-10-01T10:00:00Z"
      }
    ]
  }
}
```

---

### 9.3 Delete Webhook

**Endpoint**: `DELETE /webhooks/{webhookId}`

**Description**: Deletes a webhook subscription (Admin only).

**Headers**:

```
Authorization: Bearer {accessToken}
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Webhook deleted successfully"
}
```

---

## Common Response Patterns

### Success Response

```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": [...],
    "timestamp": "2025-10-04T12:00:00Z",
    "traceId": "abc-123-def-456"
  }
}
```

### Pagination Pattern

```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

---

## HTTP Status Codes

| Code | Description                                          |
| ---- | ---------------------------------------------------- |
| 200  | OK - Request succeeded                               |
| 201  | Created - Resource created successfully              |
| 202  | Accepted - Async operation initiated                 |
| 204  | No Content - Request succeeded with no response body |
| 400  | Bad Request - Invalid input data                     |
| 401  | Unauthorized - Authentication required or failed     |
| 403  | Forbidden - Insufficient permissions                 |
| 404  | Not Found - Resource not found                       |
| 409  | Conflict - Resource already exists                   |
| 422  | Unprocessable Entity - Validation failed             |
| 429  | Too Many Requests - Rate limit exceeded              |
| 500  | Internal Server Error - Server error                 |
| 503  | Service Unavailable - Temporary service issue        |

---

## Error Codes

| Code                    | Description                     |
| ----------------------- | ------------------------------- |
| `VALIDATION_ERROR`      | Input validation failed         |
| `AUTHENTICATION_ERROR`  | Authentication failed           |
| `AUTHORIZATION_ERROR`   | Insufficient permissions        |
| `RESOURCE_NOT_FOUND`    | Requested resource not found    |
| `RESOURCE_CONFLICT`     | Resource already exists         |
| `RATE_LIMIT_EXCEEDED`   | Too many requests               |
| `INTERNAL_ERROR`        | Internal server error           |
| `SERVICE_UNAVAILABLE`   | Service temporarily unavailable |
| `OCR_PROCESSING_FAILED` | OCR processing failed           |
| `FILE_UPLOAD_FAILED`    | File upload failed              |
| `INVALID_FILE_TYPE`     | Invalid file type               |
| `FILE_TOO_LARGE`        | File size exceeds limit         |

---

**Last Updated**: October 4, 2025  
**Version**: 1.0.0
