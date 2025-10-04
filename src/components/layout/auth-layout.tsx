"use client";

import { cn } from "@/lib/utils";
import { Building2, Sparkles } from "lucide-react";
import Link from "next/link";

interface AuthLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function AuthLayout({ children, className }: AuthLayoutProps) {
  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50", className)}>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  ExpenseWise
                </h1>
                <p className="text-xs text-gray-500 -mt-0.5">Smart Expense Management</p>
              </div>
            </Link>
            <nav className="hidden md:flex items-center space-x-1">
              <a
                href="#features"
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              >
                Pricing
              </a>
              <a
                href="#support"
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              >
                Support
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 -left-40 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-md border-t border-gray-200/50 mt-auto">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <p className="text-sm text-gray-600">
                © 2024 ExpenseWise. All rights reserved.
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <a
                href="/privacy"
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="/terms"
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="/contact"
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}