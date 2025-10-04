"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EnhancedInput } from "./enhanced-input";
import { cn, isValidEmail, isValidPassword } from "@/lib/utils";
import { AlertCircle, AlertTriangle, LoaderCircle } from "lucide-react";
import Link from "next/link";

interface CompanySignupFormData {
  adminName: string;
  email: string;
  companyName: string;
  country: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  adminName?: string;
  email?: string;
  companyName?: string;
  country?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

interface CompanySignupFormProps {
  onSubmit?: (data: CompanySignupFormData) => Promise<void>;
  className?: string;
}

// Country list with currencies
const COUNTRIES = [
  { code: "US", name: "United States", currency: "USD" },
  { code: "IN", name: "India", currency: "INR" },
  { code: "GB", name: "United Kingdom", currency: "GBP" },
  { code: "DE", name: "Germany", currency: "EUR" },
  { code: "FR", name: "France", currency: "EUR" },
  { code: "CA", name: "Canada", currency: "CAD" },
  { code: "AU", name: "Australia", currency: "AUD" },
  { code: "JP", name: "Japan", currency: "JPY" },
  { code: "SG", name: "Singapore", currency: "SGD" },
  { code: "CH", name: "Switzerland", currency: "CHF" },
];

export function CompanySignupForm({ onSubmit, className }: CompanySignupFormProps) {
  const [formData, setFormData] = useState<CompanySignupFormData>({
    adminName: "",
    email: "",
    companyName: "",
    country: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Admin name validation
    if (!formData.adminName.trim()) {
      newErrors.adminName = "Administrator name is required";
    } else if (formData.adminName.trim().length < 2) {
      newErrors.adminName = "Name must be at least 2 characters";
    } else if (formData.adminName.trim().length > 50) {
      newErrors.adminName = "Name must be less than 50 characters";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Company name validation
    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required";
    } else if (formData.companyName.trim().length < 2) {
      newErrors.companyName = "Company name must be at least 2 characters";
    } else if (formData.companyName.trim().length > 100) {
      newErrors.companyName = "Company name must be less than 100 characters";
    }

    // Country validation
    if (!formData.country) {
      newErrors.country = "Please select a country";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!isValidPassword(formData.password)) {
      newErrors.password = "Password must be at least 8 characters with uppercase, lowercase, and number";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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
      setErrors({
        general: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: keyof CompanySignupFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const selectedCountry = COUNTRIES.find(c => c.code === formData.country);

  return (
    <div className={cn("w-full max-w-md mx-auto", className)}>
      <Card className="shadow-2xl border-0 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
        <CardHeader className="text-center pb-6 pt-8 bg-gradient-to-b from-blue-50/50 to-transparent">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Create Your Company Account
          </CardTitle>
          <CardDescription className="text-gray-600 mt-2">
            Set up your organization and become the administrator
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* General Error Display */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Unable to create account
                  </h3>
                  <p className="mt-1 text-sm text-red-700">
                    {errors.general}
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Administrator Name */}
            <EnhancedInput
              id="adminName"
              name="adminName"
              label="Administrator Full Name"
              placeholder="John Doe"
              value={formData.adminName}
              onChange={(value) => updateFormData("adminName", value as string)}
              error={errors.adminName}
              required
              disabled={isLoading}
            />

            {/* Email Address */}
            <EnhancedInput
              id="email"
              name="email"
              type="email"
              label="Email Address"
              placeholder="admin@company.com"
              value={formData.email}
              onChange={(value) => updateFormData("email", value as string)}
              error={errors.email}
              helpText="This will be your login email address"
              required
              disabled={isLoading}
              autoComplete="username"
            />

            {/* Company Name */}
            <EnhancedInput
              id="companyName"
              name="companyName"
              label="Company Name"
              placeholder="Acme Corporation"
              value={formData.companyName}
              onChange={(value) => updateFormData("companyName", value as string)}
              error={errors.companyName}
              required
              disabled={isLoading}
            />

            {/* Country Selection */}
            <div className="space-y-2">
              <label htmlFor="country" className="text-sm font-medium text-gray-700">
                Country <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.country}
                onValueChange={(value) => updateFormData("country", value)}
                disabled={isLoading}
              >
                <SelectTrigger 
                  className={cn(
                    "w-full",
                    errors.country && "border-red-300 focus:border-red-500 focus:ring-red-500"
                  )}
                >
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name} ({country.currency})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedCountry && (
                <p className="text-xs text-gray-500">
                  This determines your company's base currency ({selectedCountry.currency}) for reporting
                </p>
              )}
              {errors.country && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.country}
                </p>
              )}
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <EnhancedInput
                id="password"
                name="password"
                type="password"
                label="Password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(value) => updateFormData("password", value as string)}
                error={errors.password}
                helpText="Minimum 8 characters with uppercase, lowercase, and number"
                required
                disabled={isLoading}
                autoComplete="new-password"
              />

              <EnhancedInput
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                label="Confirm Password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(value) => updateFormData("confirmPassword", value as string)}
                error={errors.confirmPassword}
                required
                disabled={isLoading}
                autoComplete="new-password"
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
                  Creating Account...
                </>
              ) : (
                "Create Company Account"
              )}
            </Button>
          </form>

          {/* Navigation Link */}
          <div className="text-center mt-6 pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/signin"
                className="font-semibold text-blue-600 hover:text-indigo-600 transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}