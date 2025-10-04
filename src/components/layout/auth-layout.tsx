import { FC, ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

const AuthLayout: FC<AuthLayoutProps> = ({
  children,
  title = "Expense Wise",
  description = "Professional Expense Management",
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
            {/* Logo icon */}
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {title}
          </h2>
          <p className="mt-2 text-sm text-gray-600">{description}</p>
        </div>

        {/* Auth Form Content */}
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {children}
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>&copy; 2024 Expense Wise. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
