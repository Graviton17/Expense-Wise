"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn, formatDate, formatRelativeTime, getUserInitials } from "@/lib/utils";
import { useState } from "react";

// Mock data - replace with actual API calls
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

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState("users");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <DashboardLayout user={mockUser} company={mockCompany}>
      <div className="px-4 sm:px-6 lg:px-8">
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
            <UserManagementSection 
              users={filteredUsers}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              roleFilter={roleFilter}
              setRoleFilter={setRoleFilter}
            />
          </TabsContent>

          <TabsContent value="rules" className="mt-6">
            <ApprovalRulesSection />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

function UserManagementSection({ 
  users, 
  searchQuery, 
  setSearchQuery, 
  roleFilter, 
  setRoleFilter 
}: {
  users: any[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  roleFilter: string;
  setRoleFilter: (filter: string) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            User Management
          </h1>
          <p className="text-gray-600 mt-2 text-sm">
            Manage your organization's users, roles, and reporting structure
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="sm" className="border-gray-300 hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2" />
            Export Users
          </Button>
          <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all">
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <Card className="shadow-lg border-gray-200">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-gray-900">
                Company Users ({users.length})
              </CardTitle>
              <CardDescription className="text-gray-600 mt-1">
                Manage user roles, permissions, and reporting relationships
              </CardDescription>
            </div>
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
        </CardHeader>
        <CardContent>
          <Table>
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
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="hover:bg-gray-50">
                  {/* User Information */}
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                          {getUserInitials(user.name)}
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

                  {/* Role */}
                  <TableCell>
                    <Badge variant="outline" className="flex items-center space-x-1">
                      {user.role === "ADMIN" && <Shield className="h-3 w-3 text-red-600" />}
                      {user.role === "MANAGER" && <Users className="h-3 w-3 text-blue-600" />}
                      {user.role === "EMPLOYEE" && <User className="h-3 w-3 text-green-600" />}
                      <span>{user.role}</span>
                    </Badge>
                  </TableCell>

                  {/* Manager */}
                  <TableCell>
                    {user.managerId ? (
                      <div className="text-sm text-gray-900">
                        {mockUsers.find(m => m.id === user.managerId)?.name || "Unknown"}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">No manager</span>
                    )}
                  </TableCell>

                  {/* Email */}
                  <TableCell>
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </TableCell>

                  {/* Status */}
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

                  {/* Last Active */}
                  <TableCell>
                    <div className="text-sm text-gray-500">
                      {user.lastActiveAt ? formatRelativeTime(user.lastActiveAt) : "Never"}
                    </div>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Mail className="h-4 w-4 mr-2" />
                          Send Password Reset
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit User
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className={user.status === "active" ? "text-red-600" : "text-green-600"}
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function ApprovalRulesSection() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
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

      {/* Placeholder for approval rules */}
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Approval Rules Management
            </h3>
            <p className="text-gray-600 mb-4">
              This section will contain the approval rules configuration interface.
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create First Rule
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}