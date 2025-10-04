"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EnhancedInput } from "./enhanced-input";
import { cn, isValidEmail } from "@/lib/utils";
import { AlertCircle, AlertTriangle, LoaderCircle } from "lucide-react";
import Link from "next/link";

interface UserSigninFormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

interface UserSigninFormProps {
  onSubmit?: (data: UserSigninFormData) => Promise<void>;
  className?: string;
}

export function UserSigninForm({ onSubmit, className }: UserSigninFormProps) {
  const [formData, setFormData] = useState<UserSigninFormData>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation (basic for signin)
    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await onSubmit?.(formData);
    } catch (error) {
      // Handle different types of authentication errors
      if (error instanceof Error) {
        if (error.message.includes("Invalid credentials")) {
          setErrors({
            general: "Invalid email address or password. Please try again.",
          });
        } else if (error.message.includes("Account disabled")) {
          setErrors({
            general: "Your account has been temporarily disabled. Please contact your administrator for assistance.",
          });
        } else {
          setErrors({
            general: "Unable to sign in. Please try again later or contact support if the problem persists.",
          });
        }
      } else {
        setErrors({
          general: "An unexpected error occurred. Please try again.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: keyof UserSigninFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    // Clear general error when user starts typing
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: undefined }));
    }
  };

  return (
    <div className={cn("w-full max-w-md mx-auto", className)}>
      <Card className="shadow-2xl border-0 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
        <CardHeader className="text-center pb-6 pt-8 bg-gradient-to-b from-blue-50/50 to-transparent">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-gray-600 mt-2">
            Sign in to your expense management account
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Authentication Error Display */}
          {errors.general && (
            <div className={cn(
              "border rounded-lg p-4",
              errors.general.includes("disabled") 
                ? "bg-yellow-50 border-yellow-200" 
                : "bg-red-50 border-red-200"
            )}>
              <div className="flex">
                {errors.general.includes("disabled") ? (
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-400" />
                )}
                <div className="ml-3">
                  <h3 className={cn(
                    "text-sm font-medium",
                    errors.general.includes("disabled") 
                      ? "text-yellow-800" 
                      : "text-red-800"
                  )}>
                    {errors.general.includes("disabled") 
                      ? "Account temporarily disabled" 
                      : "Sign in failed"}
                  </h3>
                  <p className={cn(
                    "mt-1 text-sm",
                    errors.general.includes("disabled") 
                      ? "text-yellow-700" 
                      : "text-red-700"
                  )}>
                    {errors.general}
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Address */}
            <EnhancedInput
              id="email"
              name="email"
              type="email"
              label="Email Address"
              placeholder="your.email@company.com"
              value={formData.email}
              onChange={(value) => updateFormData("email", value as string)}
              error={errors.email}
              required
              disabled={isLoading}
              autoComplete="username"
            />

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <EnhancedInput
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(value) => updateFormData("password", value as string)}
                error={errors.password}
                required
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Navigation Links */}
          <div className="space-y-4 mt-6 pt-6 border-t border-gray-100">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link
                  href="/signup"
                  className="font-semibold text-blue-600 hover:text-indigo-600 transition-colors"
                >
                  Create company account
                </Link>
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-500">Need help?</span>
              </div>
            </div>

            <div className="text-center">
              <Link 
                href="/support" 
                className="text-sm text-blue-600 hover:text-indigo-600 font-medium transition-colors"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}