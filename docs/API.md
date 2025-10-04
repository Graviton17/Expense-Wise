# ExpenseWise API Documentation

Base URL: `http://localhost:3000/api`

## Authentication

All API endpoints (except auth endpoints) require authentication via JWT token.

### Headers

```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

---

## Authentication Endpoints

### POST /api/auth/login

Authenticate a user and receive a JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "name": "John Doe",
      "email": "user@example.com",
      "role": "EMPLOYEE"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

### POST /api/auth/register

Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "companyId": "company_123"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "EMPLOYEE"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST /api/auth/logout

Logout the current user.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Expense Endpoints

### GET /api/expenses

Get all expenses for the authenticated user.

**Query Parameters:**
- `status` (optional): Filter by status (DRAFT, PENDING_APPROVAL, APPROVED, REJECTED)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `sortBy` (optional): Sort field (createdAt, amount, expenseDate)
- `sortOrder` (optional): Sort order (asc, desc)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "expenses": [
      {
        "id": "exp_123",
        "description": "Client dinner",
        "amount": 150.00,
        "currency": "USD",
        "expenseDate": "2024-01-15T00:00:00.000Z",
        "status": "PENDING_APPROVAL",
        "category": {
          "id": "cat_123",
          "name": "Meals & Entertainment"
        },
        "receipt": {
          "id": "rec_123",
          "url": "https://...",
          "fileName": "receipt.jpg"
        },
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

### GET /api/expenses/:id

Get a specific expense by ID.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "exp_123",
    "description": "Client dinner",
    "amount": 150.00,
    "currency": "USD",
    "expenseDate": "2024-01-15T00:00:00.000Z",
    "status": "PENDING_APPROVAL",
    "remarks": "Discussed Q1 strategy",
    "category": {
      "id": "cat_123",
      "name": "Meals & Entertainment"
    },
    "receipt": {
      "id": "rec_123",
      "url": "https://...",
      "fileName": "receipt.jpg",
      "fileType": "image/jpeg",
      "fileSize": 245678
    },
    "submitter": {
      "id": "user_123",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "approvals": [
      {
        "id": "app_123",
        "status": "PENDING",
        "approver": {
          "id": "user_456",
          "name": "Manager Name"
        }
      }
    ],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### POST /api/expenses

Create a new expense.

**Request Body:**
```json
{
  "description": "Client dinner at Italian restaurant",
  "amount": 150.00,
  "currency": "USD",
  "expenseDate": "2024-01-15",
  "categoryId": "cat_123",
  "remarks": "Discussed Q1 strategy",
  "receiptFile": "base64_encoded_file_or_url"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "exp_123",
    "description": "Client dinner at Italian restaurant",
    "amount": 150.00,
    "currency": "USD",
    "status": "DRAFT",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### PUT /api/expenses/:id

Update an existing expense (only DRAFT status).

**Request Body:**
```json
{
  "description": "Updated description",
  "amount": 175.00,
  "remarks": "Updated remarks"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "exp_123",
    "description": "Updated description",
    "amount": 175.00,
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

### DELETE /api/expenses/:id

Delete an expense (only DRAFT status).

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Expense deleted successfully"
}
```

### POST /api/expenses/:id/submit

Submit an expense for approval.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "exp_123",
    "status": "PENDING_APPROVAL",
    "submittedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

---

## Approval Endpoints (Manager)

### GET /api/approvals/pending

Get all pending approvals for the authenticated manager.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "approvals": [
      {
        "id": "app_123",
        "expense": {
          "id": "exp_123",
          "description": "Client dinner",
          "amount": 150.00,
          "currency": "USD",
          "submitter": {
            "id": "user_123",
            "name": "John Doe"
          }
        },
        "status": "PENDING",
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

### POST /api/approvals/:id/approve

Approve an expense.

**Request Body:**
```json
{
  "comments": "Approved - looks good"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "app_123",
    "status": "APPROVED",
    "comments": "Approved - looks good",
    "approvedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

### POST /api/approvals/:id/reject

Reject an expense.

**Request Body:**
```json
{
  "reason": "POLICY_VIOLATION",
  "comments": "Missing required documentation"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "app_123",
    "status": "REJECTED",
    "reason": "POLICY_VIOLATION",
    "comments": "Missing required documentation",
    "rejectedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

### POST /api/approvals/bulk-approve

Approve multiple expenses at once.

**Request Body:**
```json
{
  "approvalIds": ["app_123", "app_456", "app_789"],
  "comments": "Bulk approved"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "approved": 3,
    "failed": 0
  }
}
```

---

## User Management Endpoints (Admin)

### GET /api/users

Get all users in the company.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user_123",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "EMPLOYEE",
        "status": "ACTIVE",
        "managerId": "user_456",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### POST /api/users

Create a new user (Admin only).

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "role": "EMPLOYEE",
  "managerId": "user_456"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "user_789",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": "EMPLOYEE",
    "temporaryPassword": "TempPass123!"
  }
}
```

### PUT /api/users/:id

Update user details (Admin only).

**Request Body:**
```json
{
  "role": "MANAGER",
  "managerId": null
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "role": "MANAGER",
    "updatedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

---

## Categories Endpoints

### GET /api/categories

Get all expense categories.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "cat_123",
        "name": "Meals & Entertainment",
        "description": "Business meals and entertainment expenses",
        "isActive": true
      }
    ]
  }
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Common Error Codes

- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

### Example Error Response

```json
{
  "success": false,
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "field": "amount",
      "message": "Amount must be greater than 0"
    }
  ]
}
```

---

## Rate Limiting

API requests are rate-limited to prevent abuse:

- **Authenticated requests**: 100 requests per minute
- **Unauthenticated requests**: 20 requests per minute

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642345678
```

---

## Webhooks (Coming Soon)

ExpenseWise will support webhooks for real-time notifications:

- `expense.created`
- `expense.submitted`
- `expense.approved`
- `expense.rejected`
- `user.created`

---

## SDK Support (Coming Soon)

Official SDKs will be available for:

- JavaScript/TypeScript
- Python
- PHP
- Ruby

---

For more information, visit our [documentation](https://docs.expensewise.com) or contact support@expensewise.com.
