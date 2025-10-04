# Architecture Documentation

## Overview

This document outlines the system architecture for the Expense-Wise application, following industry-standard practices for building scalable, maintainable, and secure enterprise applications.

## Table of Contents

1. [Architectural Patterns](#1-architectural-patterns)
2. [Technology Stack](#2-technology-stack)
3. [System Components](#3-system-components)
4. [Data Flow Architecture](#4-data-flow-architecture)
5. [Microservices Design](#5-microservices-design)
6. [API Gateway Pattern](#6-api-gateway-pattern)
7. [Event-Driven Architecture](#7-event-driven-architecture)
8. [Security Architecture](#8-security-architecture)

---

## 1. Architectural Patterns

### 1.1 Hybrid Architecture Approach

Expense-Wise implements a **hybrid architectural pattern** combining:

1. **Microservices Architecture** for core business services
2. **Event-Driven Architecture** for asynchronous operations
3. **Layered Architecture** within individual services

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Client Applications                        │
│              (Web App, Mobile App, Third-party Integrations)        │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                    ┌───────────▼────────────┐
                    │     API Gateway        │
                    │   (Kong/AWS Gateway)   │
                    └───────────┬────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
┌───────▼──────┐     ┌─────────▼────────┐    ┌───────▼────────┐
│     Auth     │     │     Expense      │    │   Approval     │
│   Service    │     │     Service      │    │   Service      │
└───────┬──────┘     └─────────┬────────┘    └───────┬────────┘
        │                      │                      │
        └──────────────────────┼──────────────────────┘
                               │
                    ┌──────────▼───────────┐
                    │   Message Broker     │
                    │   (RabbitMQ/Kafka)   │
                    └──────────┬───────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
┌───────▼──────┐     ┌─────────▼────────┐    ┌──────▼────────┐
│     OCR      │     │   Notification   │    │   Reporting   │
│  Processing  │     │     Service      │    │    Service    │
└──────────────┘     └──────────────────┘    └───────────────┘
```

### 1.2 Design Principles

**SOLID Principles**

- **S**ingle Responsibility: Each service has one well-defined purpose
- **O**pen/Closed: Services are open for extension, closed for modification
- **L**iskov Substitution: Service interfaces can be substituted without breaking clients
- **I**nterface Segregation: Services expose only necessary interfaces
- **D**ependency Inversion: Services depend on abstractions, not concrete implementations

**12-Factor App Methodology**

1. **Codebase**: One codebase tracked in version control
2. **Dependencies**: Explicitly declare and isolate dependencies
3. **Config**: Store config in environment variables
4. **Backing Services**: Treat backing services as attached resources
5. **Build, Release, Run**: Strictly separate build and run stages
6. **Processes**: Execute app as stateless processes
7. **Port Binding**: Export services via port binding
8. **Concurrency**: Scale out via the process model
9. **Disposability**: Fast startup and graceful shutdown
10. **Dev/Prod Parity**: Keep environments as similar as possible
11. **Logs**: Treat logs as event streams
12. **Admin Processes**: Run admin tasks as one-off processes

---

## 2. Technology Stack

### 2.1 Frontend Stack

| Component         | Technology            | Version | Purpose                      |
| ----------------- | --------------------- | ------- | ---------------------------- |
| Framework         | Next.js               | 15+     | React framework with SSR/SSG |
| UI Library        | React                 | 19+     | Component-based UI library   |
| Styling           | Tailwind CSS          | 4+      | Utility-first CSS framework  |
| Component Library | shadcn/ui + Radix UI  | Latest  | Accessible UI components     |
| State Management  | React Hooks + Context | -       | Local and global state       |
| Data Fetching     | TanStack Query        | 5+      | Server state management      |
| Form Handling     | React Hook Form       | 7+      | Form validation and handling |
| Validation        | Zod                   | 3+      | Schema validation            |
| Date Handling     | date-fns              | 3+      | Date manipulation            |
| Charts            | Recharts              | 2+      | Data visualization           |
| File Upload       | react-dropzone        | 14+     | Drag-and-drop file uploads   |

### 2.2 Backend Stack (Node.js Option)

| Component      | Technology       | Version | Purpose                         |
| -------------- | ---------------- | ------- | ------------------------------- |
| Runtime        | Node.js          | 20 LTS  | JavaScript runtime              |
| Framework      | Express.js       | 4+      | Web application framework       |
| ORM            | Prisma           | 5+      | Database ORM and migration tool |
| Validation     | Zod              | 3+      | Schema validation               |
| Authentication | Passport.js      | 0.7+    | Authentication middleware       |
| JWT            | jsonwebtoken     | 9+      | JWT token generation/validation |
| Task Queue     | Bull/BullMQ      | 4+      | Redis-based task queue          |
| File Storage   | AWS SDK / Multer | Latest  | File upload and storage         |
| Email          | Nodemailer       | 6+      | Email sending                   |
| Logging        | Winston          | 3+      | Structured logging              |
| Testing        | Jest + Supertest | Latest  | Unit and integration testing    |

### 2.3 Backend Stack (Python Option)

| Component      | Technology                 | Version   | Purpose                      |
| -------------- | -------------------------- | --------- | ---------------------------- |
| Runtime        | Python                     | 3.11+     | Python runtime               |
| Framework      | Django/FastAPI             | 4+/0.100+ | Web application framework    |
| ORM            | Django ORM/SQLAlchemy      | Latest    | Database ORM                 |
| Validation     | Pydantic                   | 2+        | Data validation              |
| Authentication | Django Auth/Authlib        | Latest    | Authentication system        |
| JWT            | PyJWT                      | 2+        | JWT token handling           |
| Task Queue     | Celery                     | 5+        | Distributed task queue       |
| OCR            | Tesseract OCR/AWS Textract | Latest    | Receipt OCR processing       |
| File Storage   | boto3/Django Storage       | Latest    | File upload and storage      |
| Email          | Django Email/SendGrid      | Latest    | Email sending                |
| Logging        | Python logging             | 3.11+     | Structured logging           |
| Testing        | pytest                     | 7+        | Unit and integration testing |

### 2.4 Database and Storage

| Component           | Technology     | Version       | Purpose                        |
| ------------------- | -------------- | ------------- | ------------------------------ |
| Primary Database    | PostgreSQL     | 15+           | Relational data storage        |
| Cache/Session Store | Redis          | 7+            | Caching and session management |
| Message Broker      | RabbitMQ       | 3.12+         | Message queue for async tasks  |
| Object Storage      | AWS S3 / MinIO | Latest        | File and receipt storage       |
| Search Engine       | Elasticsearch  | 8+ (Optional) | Full-text search               |

### 2.5 Infrastructure and DevOps

| Component          | Technology                                  | Version | Purpose                           |
| ------------------ | ------------------------------------------- | ------- | --------------------------------- |
| Containerization   | Docker                                      | 24+     | Application containerization      |
| Orchestration      | Kubernetes                                  | 1.28+   | Container orchestration           |
| CI/CD              | GitHub Actions                              | Latest  | Continuous integration/deployment |
| Reverse Proxy      | NGINX                                       | 1.24+   | Load balancing and reverse proxy  |
| API Gateway        | Kong/AWS API Gateway                        | Latest  | API management and routing        |
| Monitoring         | Prometheus + Grafana                        | Latest  | Metrics and monitoring            |
| Logging            | ELK Stack (Elasticsearch, Logstash, Kibana) | 8+      | Centralized logging               |
| Tracing            | Jaeger/OpenTelemetry                        | Latest  | Distributed tracing               |
| Secrets Management | HashiCorp Vault/AWS Secrets Manager         | Latest  | Secure secrets storage            |

---

## 3. System Components

### 3.1 Core Services

#### **Authentication Service**

- **Responsibility**: User authentication, authorization, token management
- **Technology**: Node.js/Python with JWT
- **Database**: PostgreSQL (users, sessions), Redis (token blacklist)
- **Endpoints**: `/auth/*`
- **Dependencies**: Email service for password reset

#### **User Service**

- **Responsibility**: User profile management, company management
- **Technology**: Node.js/Python
- **Database**: PostgreSQL (users, companies)
- **Endpoints**: `/users/*`, `/company/*`
- **Dependencies**: Authentication service

#### **Expense Service**

- **Responsibility**: Expense CRUD operations, expense lifecycle management
- **Technology**: Node.js/Python
- **Database**: PostgreSQL (expenses, receipts)
- **Endpoints**: `/expenses/*`
- **Dependencies**: Receipt service, approval service
- **Events Published**: `expense.created`, `expense.updated`, `expense.deleted`

#### **Approval Service**

- **Responsibility**: Approval workflow execution, rule management
- **Technology**: Node.js/Python
- **Database**: PostgreSQL (approvals, approval_rules)
- **Endpoints**: `/approvals/*`, `/approval-rules/*`
- **Dependencies**: Notification service
- **Events Published**: `expense.approved`, `expense.rejected`

#### **Receipt Service**

- **Responsibility**: Receipt upload, storage, OCR processing
- **Technology**: Node.js/Python
- **Database**: PostgreSQL (receipt metadata), S3 (files)
- **Endpoints**: `/receipts/*`
- **Dependencies**: OCR worker service
- **Events Published**: `receipt.uploaded`, `receipt.processed`

#### **Reporting Service**

- **Responsibility**: Analytics, reports, data export
- **Technology**: Node.js/Python
- **Database**: PostgreSQL (read replicas preferred)
- **Endpoints**: `/reports/*`
- **Dependencies**: All core services for data aggregation

#### **Notification Service**

- **Responsibility**: Email, in-app, push notifications
- **Technology**: Node.js/Python
- **Database**: PostgreSQL (notification queue), Redis (delivery tracking)
- **Endpoints**: `/notifications/*`
- **Dependencies**: Email provider (SendGrid/SES)
- **Events Consumed**: All business events

### 3.2 Worker Services

#### **OCR Processing Worker**

- **Responsibility**: Receipt image processing, text extraction
- **Technology**: Python (Tesseract OCR/AWS Textract)
- **Queue**: RabbitMQ/Bull queue
- **Scaling**: Horizontally scalable based on queue depth

#### **Report Generation Worker**

- **Responsibility**: Async report generation and export
- **Technology**: Node.js/Python
- **Queue**: RabbitMQ/Bull queue
- **Scaling**: Horizontally scalable

#### **Email Worker**

- **Responsibility**: Email sending and delivery tracking
- **Technology**: Node.js/Python
- **Queue**: RabbitMQ/Bull queue
- **Scaling**: Horizontally scalable

---

## 4. Data Flow Architecture

### 4.1 Expense Submission Flow

```
┌─────────┐
│ Employee│
│ Client  │
└────┬────┘
     │ 1. Upload Receipt
     ▼
┌────────────┐    2. Store File    ┌──────────┐
│  Receipt   ├───────────────────→ │  AWS S3  │
│  Service   │                     └──────────┘
└────┬───────┘
     │ 3. Queue OCR Job
     ▼
┌────────────┐    4. Process OCR   ┌──────────┐
│  Message   ├───────────────────→ │   OCR    │
│   Queue    │                     │  Worker  │
└────────────┘                     └────┬─────┘
                                        │ 5. Extract Data
                                        ▼
                                   ┌────────────┐
     ┌──────────────────────────  │  Receipt   │
     │ 6. OCR Result              │  Service   │
     │                            └────────────┘
     ▼
┌────────────┐
│  Employee  │ 7. Create Expense
│   Client   │    (with OCR data)
└────┬───────┘
     │
     ▼
┌────────────┐    8. Create Expense ┌──────────┐
│  Expense   ├────────────────────→ │PostgreSQL│
│  Service   │                      └──────────┘
└────┬───────┘
     │ 9. Publish Event
     ▼
┌────────────┐   10. Route Event   ┌──────────┐
│  Message   ├────────────────────→│ Approval │
│   Queue    │                     │ Service  │
└────────────┘                     └────┬─────┘
                                        │ 11. Create Approval
                                        ▼
                                   ┌────────────┐
                                   │Notification│
                                   │  Service   │
                                   └────────────┘
```

### 4.2 Approval Workflow Flow

```
┌─────────┐
│ Manager │
│ Client  │
└────┬────┘
     │ 1. Approve/Reject
     ▼
┌────────────┐   2. Update Status   ┌──────────┐
│  Approval  ├────────────────────→ │PostgreSQL│
│  Service   │                      └──────────┘
└────┬───────┘
     │ 3. Publish Event
     ▼
┌────────────┐   4. Route Event     ┌──────────┐
│  Message   ├────────────────────→ │ Expense  │
│   Queue    │                      │ Service  │
└────────────┘                      └────┬─────┘
                                         │ 5. Update Expense
                                         ▼
                                    ┌────────────┐
                                    │Notification│
                                    │  Service   │
                                    └────┬───────┘
                                         │ 6. Notify Employee
                                         ▼
                                    ┌────────────┐
                                    │  Employee  │
                                    │   Client   │
                                    └────────────┘
```

---

## 5. Microservices Design

### 5.1 Service Boundaries

**Bounded Contexts** (Domain-Driven Design):

- **Identity & Access Context**: Users, authentication, permissions
- **Expense Management Context**: Expenses, receipts, categories
- **Approval Context**: Approval rules, workflows, decisions
- **Reporting Context**: Analytics, exports, dashboards
- **Notification Context**: Alerts, emails, in-app messages

### 5.2 Service Communication Patterns

**Synchronous Communication** (REST/HTTP):

- Used for real-time operations requiring immediate response
- Example: User authentication, expense creation
- Tools: Express.js/FastAPI with HTTP/REST

**Asynchronous Communication** (Message Queue):

- Used for long-running operations and event-driven workflows
- Example: OCR processing, email sending, report generation
- Tools: RabbitMQ/Kafka with publish-subscribe pattern

**Service Mesh** (Optional for advanced scenarios):

- Implements service-to-service communication
- Provides observability, security, and resilience
- Tools: Istio/Linkerd

### 5.3 Data Management

**Database Per Service Pattern**:

- Each microservice owns its database
- No direct database access between services
- Data consistency through events and sagas

**Shared Database (Alternative)**:

- Multiple services share PostgreSQL instance
- Use schemas/namespaces for logical separation
- Simpler for small-to-medium deployments

---

## 6. API Gateway Pattern

### 6.1 Gateway Responsibilities

1. **Request Routing**: Route requests to appropriate microservices
2. **Authentication**: Validate JWT tokens before forwarding
3. **Rate Limiting**: Enforce API rate limits per user/client
4. **Request/Response Transformation**: Adapt protocols if needed
5. **Aggregation**: Combine responses from multiple services
6. **Caching**: Cache frequently accessed data
7. **Monitoring**: Log requests, track metrics

### 6.2 Gateway Architecture

```
                        ┌──────────────────┐
                        │   Client Apps    │
                        └────────┬─────────┘
                                 │
                                 │ HTTPS
                                 │
                    ┌────────────▼─────────────┐
                    │      API Gateway         │
                    │  (Kong/AWS API Gateway)  │
                    │                          │
                    │  - Authentication        │
                    │  - Rate Limiting         │
                    │  - Request Routing       │
                    │  - Response Caching      │
                    └────────────┬─────────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          │                      │                      │
    ┌─────▼──────┐        ┌─────▼──────┐        ┌─────▼──────┐
    │   Auth     │        │  Expense   │        │  Approval  │
    │  Service   │        │  Service   │        │  Service   │
    │  :3001     │        │  :3002     │        │  :3003     │
    └────────────┘        └────────────┘        └────────────┘
```

---

## 7. Event-Driven Architecture

### 7.1 Event Types

**Domain Events**:

- `expense.created`
- `expense.updated`
- `expense.deleted`
- `expense.approved`
- `expense.rejected`
- `receipt.uploaded`
- `receipt.processed`
- `user.created`
- `approval_rule.created`

### 7.2 Event Structure

```json
{
  "eventId": "evt_abc123",
  "eventType": "expense.created",
  "timestamp": "2025-10-04T12:00:00Z",
  "version": "1.0",
  "source": "expense-service",
  "data": {
    "expenseId": "exp_abc123",
    "userId": "user_xyz789",
    "amount": 125.5,
    "currency": "USD",
    "category": "Meals"
  },
  "metadata": {
    "correlationId": "corr_123",
    "causationId": "cause_456"
  }
}
```

### 7.3 Message Broker Configuration

**RabbitMQ Topology**:

```
Exchange: expense-events (topic)
  ├─ Queue: approval-service-queue
  │   └─ Binding: expense.created, expense.updated
  ├─ Queue: notification-service-queue
  │   └─ Binding: expense.*, approval.*
  └─ Queue: analytics-service-queue
      └─ Binding: #
```

---

## 8. Security Architecture

### 8.1 Authentication Flow (OAuth 2.0 + JWT)

```
┌────────┐                                  ┌──────────┐
│ Client │                                  │   Auth   │
│        │                                  │ Service  │
└───┬────┘                                  └─────┬────┘
    │                                             │
    │  1. POST /auth/login                        │
    │  {email, password}                          │
    ├────────────────────────────────────────────>│
    │                                             │
    │                   2. Validate credentials   │
    │                      Check DB               │
    │                                      ┌──────▼────┐
    │                                      │PostgreSQL │
    │                                      └──────┬────┘
    │                                             │
    │  3. Generate JWT tokens                     │
    │  (Access + Refresh)                         │
    │<────────────────────────────────────────────┤
    │                                             │
    │  4. Subsequent API requests                 │
    │  Header: Authorization: Bearer <token>      │
    ├────────────────────────────────────────────>│
    │                                             │
    │  5. Validate JWT                            │
    │  Check signature, expiry, blacklist         │
    │                                      ┌──────▼────┐
    │                                      │   Redis   │
    │                                      │ (blacklist)│
    │                                      └──────┬────┘
    │                                             │
    │  6. Return protected resource               │
    │<────────────────────────────────────────────┤
    │                                             │
```

### 8.2 Security Layers

**1. Network Security**:

- TLS 1.3 for all communications
- VPC isolation for backend services
- Security groups and firewall rules

**2. Application Security**:

- JWT-based authentication
- Role-Based Access Control (RBAC)
- Input validation and sanitization
- SQL injection prevention (ORM usage)
- XSS protection
- CSRF tokens for state-changing operations

**3. Data Security**:

- Encryption at rest (AES-256)
- Encryption in transit (TLS 1.3)
- Password hashing (bcrypt/Argon2)
- Sensitive data masking in logs

**4. API Security**:

- Rate limiting per user/IP
- API key management for integrations
- CORS configuration
- Request signing for webhooks

### 8.3 RBAC Model

```
Roles:
  ├─ ADMIN
  │   └─ Full system access
  │   └─ User management
  │   └─ Company settings
  │   └─ Approval rules management
  │
  ├─ MANAGER
  │   └─ View team expenses
  │   └─ Approve/reject expenses
  │   └─ View team reports
  │
  └─ EMPLOYEE
      └─ Submit expenses
      └─ View own expenses
      └─ Upload receipts
```

---

## 9. Scalability Considerations

### 9.1 Horizontal Scaling

**Stateless Services**:

- All API services designed to be stateless
- Session state stored in Redis
- Horizontal scaling via Kubernetes replicas

**Database Scaling**:

- Read replicas for reporting queries
- Connection pooling
- Query optimization and indexing

**Cache Strategy**:

- Redis cluster for distributed caching
- Cache-aside (lazy loading) pattern
- Write-through for critical data

### 9.2 Performance Optimization

**CDN for Static Assets**:

- CloudFront/Cloudflare for global distribution
- Cached receipt thumbnails and images

**Database Optimization**:

- Proper indexing on frequently queried fields
- Query result caching
- Pagination for large datasets

**Async Processing**:

- Offload heavy operations to worker queues
- Background job processing for reports
- OCR processing in dedicated workers

---

**Last Updated**: October 4, 2025  
**Version**: 1.0.0  
**Next Review**: January 4, 2026
