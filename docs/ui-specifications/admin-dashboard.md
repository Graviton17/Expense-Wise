# Admin Dashboard UI Specification

## Overview

The Admin Dashboard is the central management interface for company administrators. It provides comprehensive tools for user management and approval workflow configuration. The dashboard is divided into two primary functional areas: User Management and Approval Rules Management.

### Technology Stack

- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS v4 with custom design tokens
- **UI Components**: shadcn/ui + Radix UI primitives
- **State Management**: React hooks with TypeScript
- **Accessibility**: WCAG 2.1 AA compliance
- **Icons**: Lucide React

### Related Documentation

- [Design System](./design-system.md) - Colors, typography, and spacing guidelines
- [Component Library](./component-library.md) - Reusable UI components
- [Employee Dashboard](./employee-dashboard.md) - Employee interface specifications
- [Manager Dashboard](./manager-dashboard.md) - Manager interface specifications

---

## Route Configuration

- **Path**: `/dashboard/admin`
- **Method**: `GET`
- **Authentication**: Required (Admin role only)
- **Layout**: Authenticated dashboard layout with sidebar navigation

---

## Page Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              Header Navigation                                      │
├─────────────────────────────────────────────────────────────────────────────────────┤
│           │                                                                         │
│           │                        Main Content Area                               │
│  Sidebar  │                                                                         │
│    Nav    │  ┌─────────────────────────────────────────────────────────────────┐  │
│           │  │                    Tab Navigation                               │  │
│           │  │  [User Management] [Approval Rules]                            │  │
│           │  └─────────────────────────────────────────────────────────────────┘  │
│           │                                                                         │
│           │  ┌─────────────────────────────────────────────────────────────────┐  │
│           │  │                                                                 │  │
│           │  │                 Dynamic Tab Content                             │  │
│           │  │                                                                 │  │
│           │  │                                                                 │  │
│           │  └─────────────────────────────────────────────────────────────────┘  │
│           │                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Section 1: User Management Interface

### Purpose

Provide comprehensive user lifecycle management including creation, role assignment, manager assignment, and credential management.

### Component Specifications

#### 1. Page Header

```tsx
<div className="mb-8">
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
      <p className="text-gray-600 mt-1">
        Manage your organization's users, roles, and reporting structure
      </p>
    </div>
    <div className="flex space-x-3">
      <Button variant="outline" size="sm">
        <Download className="h-4 w-4 mr-2" />
        Export Users
      </Button>
      <Button
        size="sm"
        className="bg-primary-600 hover:bg-primary-700 text-white"
      >
        <UserPlus className="h-4 w-4 mr-2" />
        Add User
      </Button>
    </div>
  </div>
</div>
```

#### 2. Users Table Container

```tsx
<div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
  <div className="px-6 py-4 border-b border-gray-200">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-medium text-gray-900">
        Company Users ({totalUsers})
      </h3>
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search users..."
            className="pl-10 w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
            <SelectItem value="MANAGER">Manager</SelectItem>
            <SelectItem value="EMPLOYEE">Employee</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  </div>

  {/* Table Content */}
  <Table>{/* Table implementation below */}</Table>
</div>
```

#### 3. Users Data Table

##### Table Header

```tsx
<TableHeader>
  <TableRow className="bg-gray-50">
    <TableHead className="w-[300px]">
      <div className="flex items-center space-x-2">
        <span>User</span>
        <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
          <ArrowUpDown className="h-3 w-3" />
        </Button>
      </div>
    </TableHead>
    <TableHead className="w-[150px]">
      <div className="flex items-center space-x-2">
        <span>Role</span>
        <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
          <ArrowUpDown className="h-3 w-3" />
        </Button>
      </div>
    </TableHead>
    <TableHead className="w-[200px]">Manager</TableHead>
    <TableHead className="w-[250px]">Email</TableHead>
    <TableHead className="w-[120px]">Status</TableHead>
    <TableHead className="w-[140px]">Last Active</TableHead>
    <TableHead className="w-[120px] text-right">Actions</TableHead>
  </TableRow>
</TableHeader>
```

##### Table Row Template

```tsx
<TableRow className="hover:bg-gray-50">
  {/* User Information Column */}
  <TableCell>
    <div className="flex items-center space-x-3">
      <Avatar className="h-8 w-8">
        <AvatarImage src={user.avatar} alt={user.name} />
        <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
          {user.initials}
        </AvatarFallback>
      </Avatar>
      <div>
        <div className="font-medium text-gray-900">{user.name}</div>
        <div className="text-sm text-gray-500">
          Joined {formatDate(user.createdAt)}
        </div>
      </div>
    </div>
  </TableCell>

  {/* Role Column with Inline Editor */}
  <TableCell>
    <Select
      value={user.role}
      onValueChange={(newRole) => handleRoleChange(user.id, newRole)}
      disabled={user.id === currentUserId} // Prevent self-role change
    >
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ADMIN">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-red-600" />
            <span>Admin</span>
          </div>
        </SelectItem>
        <SelectItem value="MANAGER">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-blue-600" />
            <span>Manager</span>
          </div>
        </SelectItem>
        <SelectItem value="EMPLOYEE">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-green-600" />
            <span>Employee</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  </TableCell>

  {/* Manager Assignment Column */}
  <TableCell>
    <Select
      value={user.managerId || ""}
      onValueChange={(managerId) => handleManagerChange(user.id, managerId)}
      disabled={user.role === "ADMIN"}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="No manager" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="">No manager</SelectItem>
        {availableManagers.map((manager) => (
          <SelectItem key={manager.id} value={manager.id}>
            <div className="flex items-center space-x-2">
              <Avatar className="h-4 w-4">
                <AvatarImage src={manager.avatar} alt={manager.name} />
                <AvatarFallback className="text-xs">
                  {manager.initials}
                </AvatarFallback>
              </Avatar>
              <span>{manager.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </TableCell>

  {/* Email Column */}
  <TableCell>
    <div className="text-sm text-gray-900">{user.email}</div>
  </TableCell>

  {/* Status Column */}
  <TableCell>
    <Badge
      variant={user.status === "active" ? "default" : "secondary"}
      className={
        user.status === "active"
          ? "bg-green-100 text-green-800"
          : "bg-gray-100 text-gray-800"
      }
    >
      {user.status === "active" ? (
        <>
          <CheckCircle className="h-3 w-3 mr-1" />
          Active
        </>
      ) : (
        <>
          <XCircle className="h-3 w-3 mr-1" />
          Inactive
        </>
      )}
    </Badge>
  </TableCell>

  {/* Last Active Column */}
  <TableCell>
    <div className="text-sm text-gray-500">
      {user.lastActiveAt ? formatRelativeTime(user.lastActiveAt) : "Never"}
    </div>
  </TableCell>

  {/* Actions Column */}
  <TableCell className="text-right">
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleSendPassword(user.id)}>
          <Mail className="h-4 w-4 mr-2" />
          Send Password Reset
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleEditUser(user.id)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit User
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleToggleStatus(user.id)}
          className={
            user.status === "active" ? "text-red-600" : "text-green-600"
          }
        >
          {user.status === "active" ? (
            <>
              <UserX className="h-4 w-4 mr-2" />
              Deactivate User
            </>
          ) : (
            <>
              <UserCheck className="h-4 w-4 mr-2" />
              Activate User
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </TableCell>
</TableRow>
```

##### New User Row (Inline Creation)

```tsx
<TableRow className="bg-blue-50 border-t-2 border-blue-200">
  <TableCell>
    <div className="flex items-center space-x-3">
      <Avatar className="h-8 w-8 bg-gray-200">
        <UserPlus className="h-4 w-4 text-gray-500" />
      </Avatar>
      <Input
        placeholder="Full name"
        value={newUser.name}
        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
        className="border-0 bg-transparent"
      />
    </div>
  </TableCell>

  <TableCell>
    <Select
      value={newUser.role}
      onValueChange={(role) => setNewUser({ ...newUser, role })}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select role" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="MANAGER">Manager</SelectItem>
        <SelectItem value="EMPLOYEE">Employee</SelectItem>
      </SelectContent>
    </Select>
  </TableCell>

  <TableCell>
    <Select
      value={newUser.managerId}
      onValueChange={(managerId) => setNewUser({ ...newUser, managerId })}
      disabled={newUser.role === "ADMIN"}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select manager" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="">No manager</SelectItem>
        {availableManagers.map((manager) => (
          <SelectItem key={manager.id} value={manager.id}>
            {manager.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </TableCell>

  <TableCell>
    <Input
      type="email"
      placeholder="email@company.com"
      value={newUser.email}
      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
      className="border-0 bg-transparent"
    />
  </TableCell>

  <TableCell>
    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
      <Clock className="h-3 w-3 mr-1" />
      Pending
    </Badge>
  </TableCell>

  <TableCell>-</TableCell>

  <TableCell className="text-right">
    <div className="flex items-center space-x-2">
      <Button size="sm" onClick={handleCreateUser} disabled={!isNewUserValid}>
        <Check className="h-4 w-4" />
      </Button>
      <Button size="sm" variant="ghost" onClick={handleCancelCreate}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  </TableCell>
</TableRow>
```

### Functional Requirements

#### 1. Role Management

- **Admin Role**: Cannot be changed by the user themselves
- **Manager/Employee Roles**: Can be changed dynamically
- **Role Change Effects**:
  - Changing to Manager: Gains approval permissions
  - Changing to Employee: Loses management permissions
  - Automatic manager relationship updates

#### 2. Manager Assignment

- **Hierarchical Structure**: Prevent circular reporting relationships
- **Auto-unassignment**: When user becomes Admin, manager is automatically removed
- **Cascade Effects**: When manager role changes, subordinates may need reassignment

#### 3. User Creation Workflow

- **Inline Creation**: New users created directly in the table
- **Required Fields**: Name, email, role
- **Auto-generated Password**: System generates secure password
- **Email Notification**: Welcome email with login credentials

#### 4. Password Management

- **Send Password Button**: Generates new password and emails user
- **Security**: Passwords are hashed and never displayed
- **Reset Flow**: Integration with forgot password flow

---

## Section 2: Approval Rules Management Interface

### Purpose

Configure flexible approval workflows for different expense types and amounts, defining who approves expenses and in what order.

### Component Specifications

#### 1. Page Header

```tsx
<div className="mb-8">
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Approval Rules</h1>
      <p className="text-gray-600 mt-1">
        Configure approval workflows for expense processing
      </p>
    </div>
    <Button size="sm">
      <Plus className="h-4 w-4 mr-2" />
      Create New Rule
    </Button>
  </div>
</div>
```

#### 2. Rules List/Selection

```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* Rules List - Left Column */}
  <div className="lg:col-span-1">
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Approval Rules</CardTitle>
        <CardDescription>
          Select a rule to configure or create a new one
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {approvalRules.map((rule) => (
            <button
              key={rule.id}
              onClick={() => setSelectedRule(rule.id)}
              className={cn(
                "w-full text-left p-3 rounded-lg border transition-colors",
                selectedRule === rule.id
                  ? "bg-blue-50 border-blue-200 text-blue-900"
                  : "bg-white border-gray-200 hover:bg-gray-50"
              )}
            >
              <div className="font-medium">{rule.name}</div>
              <div className="text-sm text-gray-500 mt-1">
                {rule.description}
              </div>
              <div className="flex items-center mt-2 text-xs text-gray-400">
                <Users className="h-3 w-3 mr-1" />
                {rule.approvers.length} approvers
              </div>
            </button>
          ))}

          {/* Create New Rule Button */}
          <button
            onClick={() => setIsCreatingRule(true)}
            className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
          >
            <div className="flex items-center justify-center text-gray-500">
              <Plus className="h-4 w-4 mr-2" />
              Create New Rule
            </div>
          </button>
        </div>
      </CardContent>
    </Card>
  </div>

  {/* Rule Configuration - Right Columns */}
  <div className="lg:col-span-2">
    {selectedRule ? (
      <RuleConfigurationPanel ruleId={selectedRule} />
    ) : (
      <EmptyRuleSelection />
    )}
  </div>
</div>
```

#### 3. Rule Configuration Panel

```tsx
<Card>
  <CardHeader>
    <div className="flex items-center justify-between">
      <div>
        <CardTitle className="text-lg">{currentRule.name}</CardTitle>
        <CardDescription>{currentRule.description}</CardDescription>
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm">
          <Copy className="h-4 w-4 mr-2" />
          Duplicate
        </Button>
        <Button variant="destructive" size="sm">
          <Trash className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>
    </div>
  </CardHeader>

  <CardContent className="space-y-6">
    {/* Rule Basic Information */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="ruleName">Rule Name</Label>
        <Input
          id="ruleName"
          value={currentRule.name}
          onChange={(e) => updateRule({ name: e.target.value })}
          placeholder="e.g., General Expense Approval"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ruleDescription">Description</Label>
        <Input
          id="ruleDescription"
          value={currentRule.description}
          onChange={(e) => updateRule({ description: e.target.value })}
          placeholder="Brief description of when this rule applies"
        />
      </div>
    </div>

    {/* Manager Approval Section */}
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="managerApproval"
          checked={currentRule.isManagerApprovalRequired}
          onCheckedChange={(checked) =>
            updateRule({ isManagerApprovalRequired: checked })
          }
        />
        <Label htmlFor="managerApproval" className="font-medium">
          Require manager approval
        </Label>
      </div>
      <p className="text-sm text-gray-600 ml-6">
        When enabled, the expense will first go to the employee's direct manager
      </p>
    </div>

    {/* Approvers Section */}
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">Additional Approvers</Label>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsAddingApprover(true)}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add Approver
        </Button>
      </div>

      {/* Approvers List */}
      <div className="space-y-3">
        {currentRule.approvers.map((approver, index) => (
          <div
            key={approver.id}
            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
                {index + 1}
              </div>
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={approver.user.avatar}
                  alt={approver.user.name}
                />
                <AvatarFallback className="text-xs">
                  {approver.user.initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium text-sm">{approver.user.name}</div>
                <div className="text-xs text-gray-500">
                  {approver.user.email}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={approver.isRequired}
                  onCheckedChange={(checked) =>
                    updateApprover(approver.id, { isRequired: checked })
                  }
                />
                <Label className="text-sm">Required</Label>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => moveApproverUp(index)}>
                    <ArrowUp className="h-4 w-4 mr-2" />
                    Move Up
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => moveApproverDown(index)}>
                    <ArrowDown className="h-4 w-4 mr-2" />
                    Move Down
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => removeApprover(approver.id)}
                    className="text-red-600"
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {currentRule.approvers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>No additional approvers configured</p>
            <p className="text-sm">
              Add approvers to create an approval workflow
            </p>
          </div>
        )}
      </div>
    </div>

    {/* Workflow Configuration */}
    <div className="space-y-4">
      <Label className="text-base font-medium">Approval Workflow</Label>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="sequentialApproval"
            checked={currentRule.isSequenceRequired}
            onCheckedChange={(checked) =>
              updateRule({ isSequenceRequired: checked })
            }
          />
          <Label htmlFor="sequentialApproval">
            Sequential approval required
          </Label>
        </div>
        <p className="text-sm text-gray-600 ml-6">
          {currentRule.isSequenceRequired
            ? "Approvers must approve in the order listed above"
            : "All approvers are notified simultaneously"}
        </p>
      </div>

      {!currentRule.isSequenceRequired && (
        <div className="ml-6 space-y-2">
          <Label htmlFor="minApprovalPercentage">
            Minimum approval percentage
          </Label>
          <div className="flex items-center space-x-2">
            <Input
              id="minApprovalPercentage"
              type="number"
              min="1"
              max="100"
              value={currentRule.minApprovalPercentage || ""}
              onChange={(e) =>
                updateRule({ minApprovalPercentage: parseInt(e.target.value) })
              }
              className="w-20"
            />
            <span className="text-sm text-gray-500">%</span>
          </div>
          <p className="text-sm text-gray-600">
            Percentage of approvers required to approve the expense
          </p>
        </div>
      )}
    </div>
  </CardContent>

  <CardFooter className="bg-gray-50">
    <div className="flex items-center justify-between w-full">
      <div className="text-sm text-gray-500">
        Last modified {formatRelativeTime(currentRule.updatedAt)}
      </div>
      <div className="flex space-x-2">
        <Button variant="outline" onClick={handleCancelChanges}>
          Cancel
        </Button>
        <Button onClick={handleSaveRule}>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  </CardFooter>
</Card>
```

### Functional Requirements

#### 1. Rule Creation and Management

- **CRUD Operations**: Create, read, update, delete approval rules
- **Rule Templates**: Pre-defined templates for common scenarios
- **Rule Duplication**: Copy existing rules as starting points
- **Rule Validation**: Ensure at least one approval mechanism is configured

#### 2. Approver Management

- **User Selection**: Choose from active company users
- **Sequence Control**: Drag-and-drop or button-based reordering
- **Required vs. Optional**: Flag approvers as required or optional
- **Role-based Filtering**: Filter available approvers by role

#### 3. Workflow Logic

- **Manager-first Flow**: Option to require manager approval before other approvers
- **Sequential vs. Parallel**: Choose approval order requirements
- **Percentage-based Approval**: Set minimum approval thresholds
- **Conditional Logic**: Future: Amount-based or category-based rule triggering

#### 4. Real-time Validation

- **Circular Reference Prevention**: Detect and prevent approval loops
- **Required Field Validation**: Ensure all required configurations are set
- **Permission Validation**: Verify selected approvers have appropriate permissions

---

## Navigation and State Management

### Tab Navigation

```tsx
<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
  <TabsList className="grid w-full grid-cols-2">
    <TabsTrigger value="users" className="flex items-center space-x-2">
      <Users className="h-4 w-4" />
      <span>User Management</span>
    </TabsTrigger>
    <TabsTrigger value="rules" className="flex items-center space-x-2">
      <Settings className="h-4 w-4" />
      <span>Approval Rules</span>
    </TabsTrigger>
  </TabsList>

  <TabsContent value="users" className="mt-6">
    <UserManagementSection />
  </TabsContent>

  <TabsContent value="rules" className="mt-6">
    <ApprovalRulesSection />
  </TabsContent>
</Tabs>
```

### URL State Management

- **Tab Persistence**: URL reflects current tab (`/dashboard/admin?tab=users`)
- **Deep Linking**: Direct links to specific rules (`/dashboard/admin?tab=rules&rule=123`)
- **Search State**: Persist search and filter states in URL parameters

## Data Loading and Error States

### Loading States

```tsx
{
  /* Table Loading State */
}
<div className="space-y-3">
  {[...Array(5)].map((_, i) => (
    <div key={i} className="flex items-center space-x-4 p-4">
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[100px]" />
      </div>
    </div>
  ))}
</div>;
```

### Error States

```tsx
<div className="text-center py-12">
  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
  <h3 className="text-lg font-medium text-gray-900 mb-2">
    Unable to load users
  </h3>
  <p className="text-gray-600 mb-4">
    There was an error loading the user data. Please try again.
  </p>
  <Button onClick={handleRetry}>
    <RefreshCw className="h-4 w-4 mr-2" />
    Try Again
  </Button>
</div>
```

### Empty States

```tsx
<div className="text-center py-12">
  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
  <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
  <p className="text-gray-600 mb-4">
    Get started by adding your first team member.
  </p>
  <Button onClick={handleAddUser}>
    <UserPlus className="h-4 w-4 mr-2" />
    Add First User
  </Button>
</div>
```

## Responsive Design Considerations

### Mobile Layout (< 768px)

- **Stacked Tables**: Convert table to card-based layout
- **Simplified Actions**: Combine actions into single menu
- **Touch-friendly**: Larger touch targets for mobile interaction
- **Horizontal Scroll**: Allow horizontal scrolling for complex tables

### Tablet Layout (768px - 1024px)

- **Adaptive Columns**: Hide less critical columns
- **Collapsible Sections**: Use accordions for dense information
- **Touch Optimization**: Optimize for touch-based interactions

### Desktop Layout (> 1024px)

- **Full Table Display**: Show all columns with optimal spacing
- **Sidebar Navigation**: Persistent sidebar for quick navigation
- **Hover Interactions**: Rich hover states and tooltips
- **Keyboard Shortcuts**: Support for power user keyboard navigation

## Security and Permissions

### Role-Based Access Control

- **Admin Only**: Entire dashboard restricted to Admin role
- **Self-Modification Prevention**: Users cannot modify their own role
- **Audit Logging**: Log all user management actions
- **Permission Validation**: Server-side validation of all actions

### Data Protection

- **Input Sanitization**: Sanitize all user inputs
- **CSRF Protection**: Include CSRF tokens in all forms
- **Rate Limiting**: Limit rapid successive actions
- **Session Management**: Proper session handling and timeout
