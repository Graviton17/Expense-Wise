import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Company Signup - Expense Wise",
  description: "Create your company account to start managing expenses",
};

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your company account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Set up your organization for expense management
          </p>
        </div>

        {/* Company Signup Form Component will go here */}
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <p className="text-center text-gray-500">
            Company Signup Form Component
          </p>
        </div>
      </div>
    </div>
  );
}
