import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - Expense Wise",
  description: "Sign in to your expense management account",
};

export default function SigninPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Access your expense management dashboard
          </p>
        </div>

        {/* User Signin Form Component will go here */}
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <p className="text-center text-gray-500">
            User Signin Form Component
          </p>
        </div>
      </div>
    </div>
  );
}
