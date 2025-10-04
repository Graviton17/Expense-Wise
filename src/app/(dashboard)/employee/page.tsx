import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Employee Dashboard - Expense Wise",
  description: "Submit and track your expense reports",
};

export default function EmployeeDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Layout Component will go here */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Employee Dashboard
            </h1>
            <p className="text-gray-600">Submit and track your expenses</p>
          </div>

          {/* Employee Dashboard Components will go here */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-500">Expense Submission Component</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-500">Expense History Component</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow lg:col-span-2">
              <p className="text-gray-500">Receipt Upload Component</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
