import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manager Dashboard - Expense Wise",
  description: "Review and approve expense reports",
};

export default function ManagerDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Layout Component will go here */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Manager Dashboard
            </h1>
            <p className="text-gray-600">Review and approve expense reports</p>
          </div>

          {/* Manager Dashboard Components will go here */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-500">Pending Approvals Component</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-500">Team Analytics Component</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow lg:col-span-2">
              <p className="text-gray-500">Expense Review Table Component</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
