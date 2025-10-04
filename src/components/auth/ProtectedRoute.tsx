"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts";
import { Loader2, Building2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("ADMIN" | "MANAGER" | "EMPLOYEE")[];
  requireCompany?: boolean;
  fallbackUrl?: string;
}

export default function ProtectedRoute({
  children,
  allowedRoles,
  requireCompany = true,
  fallbackUrl = "/signin",
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    // Not authenticated - redirect to sign in
    if (!isAuthenticated || !user) {
      router.push(`${fallbackUrl}?error=Please sign in to access this page`);
      return;
    }

    // Check role-based access
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.push(
        "/dashboard?error=You do not have permission to access this page"
      );
      return;
    }

    // Check if company access is required
    if (requireCompany && !user.companyId) {
      router.push("/setup-company?error=Please complete company setup");
      return;
    }

    setIsAuthorized(true);
  }, [
    isAuthenticated,
    user,
    isLoading,
    allowedRoles,
    requireCompany,
    router,
    fallbackUrl,
  ]);

  // Show loading spinner while checking authentication
  if (isLoading || !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg mx-auto mb-4">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Higher-order component for easier usage
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options?: Omit<ProtectedRouteProps, "children">
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <WrappedComponent {...props} />
      </ProtectedRoute>
    );
  };
}

// Specific role-based protection components
export function AdminOnlyRoute({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute allowedRoles={["ADMIN"]}>{children}</ProtectedRoute>;
}

export function ManagerOrAdminRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
      {children}
    </ProtectedRoute>
  );
}

export function EmployeeRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["ADMIN", "MANAGER", "EMPLOYEE"]}>
      {children}
    </ProtectedRoute>
  );
}
