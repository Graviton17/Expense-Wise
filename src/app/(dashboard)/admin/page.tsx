"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Settings, Download, UserPlus, Search, Plus } from "lucide-react";
import { UserManagementTable, UserData, UserAction } from "@/components/dashboard/admin/user-management-table";
import { ApprovalRuleEditor, ApprovalRule } from "@/components/dashboard/admin/approval-rule-editor";
import { cn } from "@/lib/utils";

// (Mock data remains the same)
const mockUsers: UserData[] = [
  { id: 'usr_1', name: 'Alicia Keys', email: 'alicia.k@example.com', role: 'ADMIN', managerId: null, status: 'active', avatarUrl: '/avatars/01.png', initials: 'AK', createdAt: '2024-08-15' },
  { id: 'usr_2', name: 'Ben Carter', email: 'ben.c@example.com', role: 'MANAGER', managerId: 'usr_1', status: 'active', avatarUrl: '/avatars/02.png', initials: 'BC', createdAt: '2024-07-20' },
  { id: 'usr_3', name: 'Clara Dane', email: 'clara.d@example.com', role: 'EMPLOYEE', managerId: 'usr_2', status: 'active', avatarUrl: '/avatars/03.png', initials: 'CD', createdAt: '2024-09-01' },
  { id: 'usr_4', name: 'David Lee', email: 'david.l@example.com', role: 'EMPLOYEE', managerId: 'usr_2', status: 'inactive', avatarUrl: '/avatars/04.png', initials: 'DL', createdAt: '2024-05-10' },
];
const mockApprovalRules: ApprovalRule[] = [
  { id: 'rule_1', name: 'Software Purchases > $1,000', description: 'Requires CFO approval.', approvers: [{ id: 'usr_1', name: 'Alicia Keys' }], isManagerApprovalRequired: true },
  { id: 'rule_2', name: 'General Expenses < $50', description: 'Auto-approved by manager.', approvers: [], isManagerApprovalRequired: true },
  { id: 'rule_3', name: 'Client Travel & Entertainment', description: 'Goes to the department head.', approvers: [{ id: 'usr_2', name: 'Ben Carter' }], isManagerApprovalRequired: false }
];

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<UserData[]>(mockUsers);
  const currentUserId = 'usr_1';
  const managers = users.filter(u => u.role === 'MANAGER' || u.role === 'ADMIN');
  const [approvalRules, setApprovalRules] = useState(mockApprovalRules);
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(mockApprovalRules[0]?.id || null);
  const selectedRule = approvalRules.find(r => r.id === selectedRuleId);

  // (Handler functions remain the same)
  const handleUserRoleChange = (userId: string, newRole: UserData['role']) => { console.log(`ACTION: Change user ${userId} to role ${newRole}`); setUsers(users.map(u => (u.id === userId ? { ...u, role: newRole } : u))); };
  const handleUserManagerChange = (userId: string, managerId: string) => { console.log(`ACTION: Assign manager ${managerId} to user ${userId}`); setUsers(users.map(u => (u.id === userId ? { ...u, managerId: managerId || null } : u))); };
  const handleUserAction = (userId: string, action: UserAction) => { console.log(`ACTION: Perform "${action}" for user ${userId}`); if (action === 'toggleStatus') { setUsers(users.map(u => (u.id === userId ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u))); } };
  const handleSaveRule = (updatedRule: ApprovalRule) => { console.log("ACTION: Save rule", updatedRule); setApprovalRules(rules => rules.map(r => r.id === updatedRule.id ? updatedRule : r)); };

  return (
    // Added container for better spacing and a subtle background
    <div className="bg-secondary/40 min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Central hub for managing users and approval workflows.
          </p>
        </header>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-background shadow-sm animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <TabsTrigger value="users"><Users className="h-4 w-4 mr-2" />User Management</TabsTrigger>
            <TabsTrigger value="rules"><Settings className="h-4 w-4 mr-2" />Approval Rules</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Card className="shadow-md">
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <CardTitle>Company Users</CardTitle>
                    <CardDescription>View, edit, and manage all users in the organization.</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Export</Button>
                    <Button size="sm"><UserPlus className="h-4 w-4 mr-2" />Add User</Button>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <div className="relative flex-1 min-w-[250px]">
                      <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                      <Input placeholder="Search by name or email..." className="pl-10" />
                  </div>
                  <Select defaultValue="all">
                      <SelectTrigger className="w-full sm:w-[180px]">
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
              </CardHeader>
              <CardContent>
                <UserManagementTable
                  users={users} managers={managers} currentUserId={currentUserId}
                  onRoleChange={handleUserRoleChange} onManagerChange={handleUserManagerChange} onAction={handleUserAction}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rules" className="mt-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1 shadow-md">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Workflows</CardTitle>
                        <CardDescription>Select a rule to edit.</CardDescription>
                      </div>
                      <Button size="icon" variant="ghost"><Plus className="h-5 w-5"/></Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {approvalRules.map((rule) => (
                      <button
                        key={rule.id} onClick={() => setSelectedRuleId(rule.id)}
                        className={cn( "w-full text-left p-4 rounded-lg border transition-all duration-200",
                          selectedRuleId === rule.id
                              ? "bg-primary/10 border-primary shadow-sm ring-2 ring-primary/20"
                              : "hover:bg-accent hover:border-border hover:shadow-sm"
                        )} >
                        <p className="font-semibold text-foreground">{rule.name}</p>
                        <p className="text-sm text-muted-foreground mt-1">{rule.description}</p>
                      </button>
                    ))}
                  </CardContent>
                </Card>
                <div className="lg:col-span-2">
                  {selectedRule ? (
                    <ApprovalRuleEditor rule={selectedRule} onSave={handleSaveRule} />
                  ) : (
                    <Card className="flex items-center justify-center h-full min-h-[300px] shadow-md">
                      <div className="text-center text-muted-foreground">Select a rule to start editing.</div>
                    </Card>
                  )}
                </div>
              </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}