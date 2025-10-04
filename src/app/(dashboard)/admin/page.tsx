import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard - Expense Wise",
  description: "Manage users, approvals, and system configuration",
};

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Layout Component will go here */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">Manage users and system settings</p>
          </div>

          {/* Admin Dashboard Components will go here */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-500">User Management Component</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-500">Approval Workflow Component</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-500">System Analytics Component</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
