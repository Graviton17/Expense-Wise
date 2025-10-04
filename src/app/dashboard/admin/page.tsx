"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  UserPlus, 
  Download, 
  Search, 
  Settings, 
  Plus,
  Shield,
  User,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Edit,
  UserX,
  UserCheck,
  ArrowUpDown,
  FileText,
  Bell,
  LogOut,
  Copy,
  Trash,
  ArrowUp,
  ArrowDown,
  Check,
  X,
  Save,
  RefreshCw,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, formatDate, formatRelativeTime, getUserInitials } from "@/lib/utils";
import { useState } from "react";

// Mock data
const mockUser = {
  id: "1",
  name: "John Admin",
  email: "admin@company.com",
  role: "ADMIN" as const,
  avatar: undefined,
};

const mockCompany = {
  name: "Acme Corporation",
  baseCurrency: "USD",
};

const mockUsers = [
  {
    id: "1",
    name: "John Admin",
    email: "john@company.com",
    role: "ADMIN",
    status: "active",
    managerId: null,
    createdAt: new Date("2024-01-15"),
    lastActiveAt: new Date("2024-01-20"),
  },
  {
    id: "2",
    name: "Sarah Manager",
    email: "sarah@company.com",
    role: "MANAGER",
    status: "active",
    managerId: "1",
    createdAt: new Date("2024-01-16"),
    lastActiveAt: new Date("2024-01-19"),
  },
  {
    id: "3",
    name: "Mike Employee",
    email: "mike@company.com",
    role: "EMPLOYEE",
    status: "active",
    managerId: "2",
    createdAt: new Date("2024-01-17"),
    lastActiveAt: new Date("2024-01-18"),
  },
];

const mockApprovalRules = [
  {
    id: "1",
    name: "General Expense Approval",
    description: "Standard approval workflow for all expenses",
    isManagerApprovalRequired: true,
    isSequenceRequired: false,
    minApprovalPercentage: 50,
    approvers: [
      {
        id: "a1",
        user: { id: "2", name: "Sarah Manager", email: "sarah@company.com", avatar: undefined, initials: "SM" },
        isRequired: true,
      },
    ],
    updatedAt: new Date("2024-01-15"),
  },
];

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState("users");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedRule, setSelectedRule] = useState<string | null>(mockApprovalRules[0]?.id || null);
  const [isCreatingRule, setIsCreatingRule] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Top Navigation Bar */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  ExpenseWise
                </h1>
                <p className="text-xs text-gray-500">{mockCompany.name}</p>
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              {/* Currency Badge */}
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                <span className="text-sm font-semibold text-blue-700">{mockCompany.baseCurrency}</span>
              </div>

              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                  2
                </span>
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={mockUser.avatar} alt={mockUser.name} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm font-semibold">
                        {getUserInitials(mockUser.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:block text-sm font-medium text-gray-700">{mockUser.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{mockUser.name}</p>
                    <p className="text-xs text-gray-500">{mockUser.email}</p>
                    <Badge variant="outline" className="mt-1 text-xs">
                      <Shield className="h-3 w-3 mr-1 text-red-600" />
                      Admin
                    </Badge>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>User Management</span>
            </TabsTrigger>
            <TabsTrigger value="rules" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Approval Rules</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UserManagementSection 
              users={filteredUsers}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              roleFilter={roleFilter}
              setRoleFilter={setRoleFilter}
              isAddingUser={isAddingUser}
              setIsAddingUser={setIsAddingUser}
              currentUserId={mockUser.id}
            />
          </TabsContent>

          <TabsContent value="rules">
            <ApprovalRulesSection 
              rules={mockApprovalRules}
              selectedRule={selectedRule}
              setSelectedRule={setSelectedRule}
              isCreatingRule={isCreatingRule}
              setIsCreatingRule={setIsCreatingRule}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function UserManagementSection({ 
  users, 
  searchQuery, 
  setSearchQuery, 
  roleFilter, 
  setRoleFilter,
  isAddingUser,
  setIsAddingUser,
  currentUserId,
}: {
  users: any[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  roleFilter: string;
  setRoleFilter: (filter: string) => void;
  isAddingUser: boolean;
  setIsAddingUser: (adding: boolean) => void;
  currentUserId: string;
}) {
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "EMPLOYEE",
    managerId: "",
  });

  const availableManagers = users.filter(u => u.role === "MANAGER" || u.role === "ADMIN");

  const isNewUserValid = newUser.name && newUser.email && newUser.role;

  const handleCreateUser = () => {
    console.log("Creating user:", newUser);
    alert(`User "${newUser.name}" created successfully! Welcome email sent to ${newUser.email}`);
    setIsAddingUser(false);
    setNewUser({ name: "", email: "", role: "EMPLOYEE", managerId: "" });
  };

  const handleCancelCreate = () => {
    if (newUser.name || newUser.email) {
      if (!confirm("Discard new user? All entered information will be lost.")) {
        return;
      }
    }
    setIsAddingUser(false);
    setNewUser({ name: "", email: "", role: "EMPLOYEE", managerId: "" });
  };

  const handleExportUsers = () => {
    console.log("Exporting users...");
    alert(`Exporting ${users.length} users to CSV...`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
            User Management
          </h2>
          <p className="text-gray-600 mt-2 text-sm">
            Manage your organization's users, roles, and reporting structure
          </p>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="border-gray-300 hover:bg-gray-50"
            onClick={handleExportUsers}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Users
          </Button>
          <Button
            size="sm"
            onClick={() => setIsAddingUser(true)}
            disabled={isAddingUser}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <Card className="shadow-xl border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 via-white to-gray-50 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Company Users ({users.length})
              </CardTitle>
              <CardDescription className="text-gray-600 mt-1">
                Manage user roles, permissions, and reporting relationships
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  className="pl-10 w-full sm:w-64 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-32 border-gray-300">
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
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200 hover:bg-gray-50">
                  <TableHead className="w-[300px] font-semibold text-gray-700">
                    <div className="flex items-center space-x-2">
                      <span>User</span>
                      <Button variant="ghost" size="sm" className="h-4 w-4 p-0 hover:bg-gray-200">
                        <ArrowUpDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableHead>
                  <TableHead className="w-[150px] font-semibold text-gray-700">
                    <div className="flex items-center space-x-2">
                      <span>Role</span>
                      <Button variant="ghost" size="sm" className="h-4 w-4 p-0 hover:bg-gray-200">
                        <ArrowUpDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableHead>
                  <TableHead className="w-[200px] font-semibold text-gray-700">Manager</TableHead>
                  <TableHead className="w-[250px] font-semibold text-gray-700">Email</TableHead>
                  <TableHead className="w-[120px] font-semibold text-gray-700">Status</TableHead>
                  <TableHead className="w-[140px] font-semibold text-gray-700">Last Active</TableHead>
                  <TableHead className="w-[120px] text-right font-semibold text-gray-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <UserTableRow 
                    key={user.id} 
                    user={user} 
                    availableManagers={availableManagers}
                    currentUserId={currentUserId}
                  />
                ))}
                
                {/* New User Row */}
                {isAddingUser && (
                  <TableRow className="bg-blue-50 border-t-2 border-blue-200">
                    <TableCell className="py-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8 bg-gray-200">
                          <UserPlus className="h-4 w-4 text-gray-500" />
                        </Avatar>
                        <Input
                          placeholder="Full name"
                          value={newUser.name}
                          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                          className="border-gray-300 bg-white"
                        />
                      </div>
                    </TableCell>

                    <TableCell className="py-4">
                      <Select
                        value={newUser.role}
                        onValueChange={(role) => setNewUser({ ...newUser, role })}
                      >
                        <SelectTrigger className="border-gray-300 bg-white">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
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

                    <TableCell className="py-4">
                      <Select
                        value={newUser.managerId || "none"}
                        onValueChange={(managerId) => setNewUser({ ...newUser, managerId: managerId === "none" ? "" : managerId })}
                        disabled={newUser.role === "ADMIN"}
                      >
                        <SelectTrigger className="border-gray-300 bg-white">
                          <SelectValue placeholder="Select manager" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No manager</SelectItem>
                          {availableManagers.map((manager) => (
                            <SelectItem key={manager.id} value={manager.id}>
                              {manager.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>

                    <TableCell className="py-4">
                      <Input
                        type="email"
                        placeholder="email@company.com"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        className="border-gray-300 bg-white"
                      />
                    </TableCell>

                    <TableCell className="py-4">
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    </TableCell>

                    <TableCell className="py-4">
                      <span className="text-sm text-gray-500">-</span>
                    </TableCell>

                    <TableCell className="text-right py-4">
                      <div className="flex items-center justify-end space-x-2">
                        <Button 
                          size="sm" 
                          onClick={handleCreateUser} 
                          disabled={!isNewUserValid}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={handleCancelCreate}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function UserTableRow({ 
  user, 
  availableManagers,
  currentUserId,
}: { 
  user: any;
  availableManagers: any[];
  currentUserId: string;
}) {
  const handleRoleChange = (newRole: string) => {
    if (confirm(`Change ${user.name}'s role to ${newRole}?`)) {
      console.log(`Changing role for ${user.id} to ${newRole}`);
      alert(`${user.name}'s role updated to ${newRole} successfully!`);
    }
  };

  const handleManagerChange = (managerId: string) => {
    const actualManagerId = managerId === "none" ? null : managerId;
    const managerName = managerId === "none" ? "No manager" : availableManagers.find(m => m.id === managerId)?.name;
    if (confirm(`Assign ${user.name} to ${managerName}?`)) {
      console.log(`Changing manager for ${user.id} to ${actualManagerId}`);
      alert(`${user.name}'s manager updated successfully!`);
    }
  };

  const handleSendPassword = () => {
    if (confirm(`Send password reset email to ${user.email}?`)) {
      console.log(`Sending password reset to ${user.id}`);
      alert(`Password reset email sent to ${user.email}`);
    }
  };

  const handleEditUser = () => {
    console.log(`Editing user ${user.id}`);
    alert(`Edit user modal for ${user.name} - Coming soon!`);
  };

  const handleToggleStatus = () => {
    const action = user.status === "active" ? "deactivate" : "activate";
    if (confirm(`Are you sure you want to ${action} ${user.name}?`)) {
      console.log(`Toggling status for ${user.id}`);
      alert(`${user.name} ${action}d successfully!`);
    }
  };

  return (
    <TableRow className="hover:bg-blue-50/50 transition-colors duration-150 border-b border-gray-100">
      {/* User Information */}
      <TableCell className="py-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
              {getUserInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold text-gray-900 text-sm">{user.name}</div>
            <div className="text-xs text-gray-500">
              Joined {formatDate(user.createdAt)}
            </div>
          </div>
        </div>
      </TableCell>

      {/* Role with Inline Editor */}
      <TableCell className="py-4">
        <Select
          value={user.role}
          onValueChange={handleRoleChange}
          disabled={user.id === currentUserId}
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

      {/* Manager Assignment */}
      <TableCell className="py-4">
        <Select
          value={user.managerId || "none"}
          onValueChange={handleManagerChange}
          disabled={user.role === "ADMIN"}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="No manager" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No manager</SelectItem>
            {availableManagers.map((manager) => (
              <SelectItem key={manager.id} value={manager.id}>
                <div className="flex items-center space-x-2">
                  <Avatar className="h-4 w-4">
                    <AvatarImage src={manager.avatar} alt={manager.name} />
                    <AvatarFallback className="text-xs">
                      {getUserInitials(manager.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span>{manager.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>

      {/* Email */}
      <TableCell className="py-4">
        <div className="text-sm text-gray-700">{user.email}</div>
      </TableCell>

      {/* Status */}
      <TableCell className="py-4">
        <Badge
          variant={user.status === "active" ? "default" : "secondary"}
          className={cn(
            "flex items-center w-fit space-x-1 font-semibold",
            user.status === "active"
              ? "bg-green-100 text-green-800 border-green-300"
              : "bg-gray-100 text-gray-800 border-gray-300"
          )}
        >
          {user.status === "active" ? (
            <>
              <CheckCircle className="h-3 w-3" />
              <span>Active</span>
            </>
          ) : (
            <>
              <XCircle className="h-3 w-3" />
              <span>Inactive</span>
            </>
          )}
        </Badge>
      </TableCell>

      {/* Last Active */}
      <TableCell className="py-4">
        <div className="text-sm text-gray-500">
          {user.lastActiveAt ? formatRelativeTime(user.lastActiveAt) : "Never"}
        </div>
      </TableCell>

      {/* Actions */}
      <TableCell className="text-right py-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="hover:bg-gray-100">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={handleSendPassword} className="cursor-pointer">
              <Mail className="h-4 w-4 mr-2" />
              Send Password Reset
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleEditUser} className="cursor-pointer">
              <Edit className="h-4 w-4 mr-2" />
              Edit User
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleToggleStatus}
              className={cn(
                "cursor-pointer",
                user.status === "active" ? "text-red-600 focus:text-red-600 focus:bg-red-50" : "text-green-600 focus:text-green-600 focus:bg-green-50"
              )}
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
  );
}

function ApprovalRulesSection({ 
  rules, 
  selectedRule, 
  setSelectedRule,
  isCreatingRule,
  setIsCreatingRule,
}: {
  rules: any[];
  selectedRule: string | null;
  setSelectedRule: (ruleId: string | null) => void;
  isCreatingRule: boolean;
  setIsCreatingRule: (creating: boolean) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
            Approval Rules
          </h2>
          <p className="text-gray-600 mt-2 text-sm">
            Configure approval workflows for expense processing
          </p>
        </div>
        <Button 
          size="sm"
          onClick={() => setIsCreatingRule(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Rule
        </Button>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rules List - Left Column */}
        <div className="lg:col-span-1">
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
              <CardTitle className="text-lg font-bold text-gray-900">Approval Rules</CardTitle>
              <CardDescription className="text-gray-600">
                Select a rule to configure or create a new one
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2">
                {rules.map((rule) => (
                  <button
                    key={rule.id}
                    onClick={() => setSelectedRule(rule.id)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg border transition-all duration-200",
                      selectedRule === rule.id
                        ? "bg-blue-50 border-blue-200 text-blue-900 shadow-sm"
                        : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                    )}
                  >
                    <div className="font-semibold text-sm">{rule.name}</div>
                    <div className="text-xs text-gray-500 mt-1 line-clamp-2">
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
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
                >
                  <div className="flex items-center justify-center text-gray-500 hover:text-blue-600">
                    <Plus className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">Create New Rule</span>
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rule Configuration - Right Columns */}
        <div className="lg:col-span-2">
          {selectedRule ? (
            <RuleConfigurationPanel 
              rule={rules.find(r => r.id === selectedRule)!} 
            />
          ) : (
            <EmptyRuleSelection />
          )}
        </div>
      </div>
    </div>
  );
}

function RuleConfigurationPanel({ rule }: { rule: any }) {
  const [currentRule, setCurrentRule] = useState(rule);
  const [isAddingApprover, setIsAddingApprover] = useState(false);

  const updateRule = (updates: any) => {
    setCurrentRule({ ...currentRule, ...updates });
  };

  const updateApprover = (approverId: string, updates: any) => {
    const updatedApprovers = currentRule.approvers.map((a: any) =>
      a.id === approverId ? { ...a, ...updates } : a
    );
    setCurrentRule({ ...currentRule, approvers: updatedApprovers });
  };

  const removeApprover = (approverId: string) => {
    const updatedApprovers = currentRule.approvers.filter((a: any) => a.id !== approverId);
    setCurrentRule({ ...currentRule, approvers: updatedApprovers });
  };

  const moveApproverUp = (index: number) => {
    if (index === 0) return;
    const newApprovers = [...currentRule.approvers];
    [newApprovers[index - 1], newApprovers[index]] = [newApprovers[index], newApprovers[index - 1]];
    setCurrentRule({ ...currentRule, approvers: newApprovers });
  };

  const moveApproverDown = (index: number) => {
    if (index === currentRule.approvers.length - 1) return;
    const newApprovers = [...currentRule.approvers];
    [newApprovers[index], newApprovers[index + 1]] = [newApprovers[index + 1], newApprovers[index]];
    setCurrentRule({ ...currentRule, approvers: newApprovers });
  };

  const handleSaveRule = () => {
    console.log("Saving rule:", currentRule);
    alert(`Approval rule "${currentRule.name}" saved successfully!`);
  };

  const handleCancelChanges = () => {
    if (JSON.stringify(currentRule) !== JSON.stringify(rule)) {
      if (confirm("Discard changes to this approval rule?")) {
        setCurrentRule(rule);
      }
    } else {
      setCurrentRule(rule);
    }
  };

  const handleDuplicateRule = () => {
    console.log("Duplicating rule:", currentRule);
    alert(`Rule "${currentRule.name}" duplicated! You can now edit the copy.`);
  };

  const handleDeleteRule = () => {
    if (confirm(`Are you sure you want to delete the rule "${currentRule.name}"? This action cannot be undone.`)) {
      console.log("Deleting rule:", currentRule);
      alert(`Rule "${currentRule.name}" deleted successfully!`);
    }
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-gray-900">{currentRule.name}</CardTitle>
            <CardDescription className="text-gray-600 mt-1">{currentRule.description}</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="border-gray-300"
              onClick={handleDuplicateRule}
            >
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleDeleteRule}
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-6">
        {/* Rule Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ruleName" className="text-sm font-semibold text-gray-700">Rule Name</Label>
            <Input
              id="ruleName"
              value={currentRule.name}
              onChange={(e) => updateRule({ name: e.target.value })}
              placeholder="e.g., General Expense Approval"
              className="border-gray-300"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ruleDescription" className="text-sm font-semibold text-gray-700">Description</Label>
            <Input
              id="ruleDescription"
              value={currentRule.description}
              onChange={(e) => updateRule({ description: e.target.value })}
              placeholder="Brief description of when this rule applies"
              className="border-gray-300"
            />
          </div>
        </div>

        {/* Manager Approval Section */}
        <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="managerApproval"
              checked={currentRule.isManagerApprovalRequired}
              onCheckedChange={(checked) =>
                updateRule({ isManagerApprovalRequired: checked })
              }
            />
            <Label htmlFor="managerApproval" className="font-semibold text-gray-900 cursor-pointer">
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
            <Label className="text-base font-bold text-gray-900">Additional Approvers</Label>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsAddingApprover(true);
                alert("Add Approver modal - Coming soon! You'll be able to select users to add as approvers.");
              }}
              className="border-gray-300"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Approver
            </Button>
          </div>

          {/* Approvers List */}
          <div className="space-y-3">
            {currentRule.approvers.map((approver: any, index: number) => (
              <div
                key={approver.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-7 h-7 bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 rounded-full text-xs font-bold">
                    {index + 1}
                  </div>
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={approver.user.avatar}
                      alt={approver.user.name}
                    />
                    <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                      {getUserInitials(approver.user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-sm text-gray-900">{approver.user.name}</div>
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
                    <Label className="text-sm text-gray-700 cursor-pointer">Required</Label>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="hover:bg-gray-100">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => moveApproverUp(index)}
                        disabled={index === 0}
                        className="cursor-pointer"
                      >
                        <ArrowUp className="h-4 w-4 mr-2" />
                        Move Up
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => moveApproverDown(index)}
                        disabled={index === currentRule.approvers.length - 1}
                        className="cursor-pointer"
                      >
                        <ArrowDown className="h-4 w-4 mr-2" />
                        Move Down
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => removeApprover(approver.id)}
                        className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50"
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
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-700 font-medium mb-1">No additional approvers configured</p>
                <p className="text-sm text-gray-500">
                  Add approvers to create an approval workflow
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Workflow Configuration */}
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <Label className="text-base font-bold text-gray-900">Approval Workflow</Label>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sequentialApproval"
                checked={currentRule.isSequenceRequired}
                onCheckedChange={(checked) =>
                  updateRule({ isSequenceRequired: checked })
                }
              />
              <Label htmlFor="sequentialApproval" className="font-semibold text-gray-900 cursor-pointer">
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
            <div className="ml-6 space-y-2 pt-2">
              <Label htmlFor="minApprovalPercentage" className="text-sm font-semibold text-gray-700">
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
                  className="w-24 border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">%</span>
              </div>
              <p className="text-xs text-gray-600">
                Percentage of approvers required to approve the expense
              </p>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="bg-gradient-to-r from-gray-50 to-white border-t border-gray-200">
        <div className="flex items-center justify-between w-full">
          <div className="text-sm text-gray-500">
            Last modified {formatRelativeTime(currentRule.updatedAt)}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleCancelChanges} className="border-gray-300">
              Cancel
            </Button>
            <Button 
              onClick={handleSaveRule}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

function EmptyRuleSelection() {
  return (
    <Card className="shadow-lg border-0">
      <CardContent className="py-16">
        <div className="text-center">
          <div className="h-16 w-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Settings className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Select an Approval Rule
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Choose a rule from the list to view and configure its approval workflow settings
          </p>
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Create New Rule
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
