import { Metadata } from "next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserManagementTable from "@/components/dashboard/admin/user-management-table";
import ApprovalRuleEditor from "@/components/dashboard/admin/approval-rule-editor";

export const metadata: Metadata = {
  title: "Admin Dashboard - Expense Wise",
  description: "Manage users, approvals, and system configuration",
};

// Mock data - replace with actual API calls
const mockUsers = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: "MANAGER" as const,
    status: "ACTIVE" as const,
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "EMPLOYEE" as const,
    status: "ACTIVE" as const,
    createdAt: new Date("2024-01-20"),
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob@example.com",
    role: "EMPLOYEE" as const,
    status: "INACTIVE" as const,
    createdAt: new Date("2024-01-10"),
  },
];

const mockWorkflow = {
  id: "1",
  name: "Standard Approval Workflow",
  rules: [],
  isManagerApprover: true,
  approversSequence: false,
  minimumApprovalPercentage: 50,
  isActive: true,
};

export default function AdminDashboard() {
  const handleEditUser = (userId: string) => {
    console.log("Edit user:", userId);
    // Implement edit user logic
  };

  const handleDeleteUser = (userId: string) => {
    console.log("Delete user:", userId);
    // Implement delete user logic
  };

  const handleSaveWorkflow = (workflow: any) => {
    console.log("Save workflow:", workflow);
    // Implement save workflow logic
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">
              Manage users, approval workflows, and system settings
            </p>
          </div>

          {/* Admin Dashboard Tabs */}
          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="users">User Management</TabsTrigger>
              <TabsTrigger value="workflows">Approval Rules</TabsTrigger>
              <TabsTrigger value="analytics">System Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-6">
              <UserManagementTable
                users={mockUsers}
                onEditUser={handleEditUser}
                onDeleteUser={handleDeleteUser}
              />
            </TabsContent>

            <TabsContent value="workflows" className="space-y-6">
              <ApprovalRuleEditor
                workflow={mockWorkflow}
                onSave={handleSaveWorkflow}
              />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  System Analytics
                </h3>
                <p className="text-gray-500">
                  Analytics and reporting components will be implemented here
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm font-medium text-blue-900">
                      Total Users
                    </div>
                    <div className="text-2xl font-bold text-blue-700">
                      {mockUsers.length}
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm font-medium text-green-900">
                      Active Users
                    </div>
                    <div className="text-2xl font-bold text-green-700">
                      {mockUsers.filter((u) => u.status === "ACTIVE").length}
                    </div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-sm font-medium text-purple-900">
                      Active Workflows
                    </div>
                    <div className="text-2xl font-bold text-purple-700">1</div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
