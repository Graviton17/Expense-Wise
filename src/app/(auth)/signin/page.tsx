"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Loader2, Building2, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

const signinSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type SigninFormValues = z.infer<typeof signinSchema>;

export default function SigninPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const message = searchParams.get("message");
    const errorParam = searchParams.get("error");
    
    if (message) setSuccessMessage(message);
    if (errorParam) setError(errorParam);
  }, [searchParams]);

  const form = useForm<SigninFormValues>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: SigninFormValues) {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to sign in");
      }

      const result = await response.json();
      
      // Redirect based on user role
      switch (result.user.role) {
        case "ADMIN":
          window.location.href = "/dashboard/admin";
          break;
        case "MANAGER":
          window.location.href = "/dashboard/manager";
          break;
        case "EMPLOYEE":
          window.location.href = "/dashboard/employee";
          break;
        default:
          window.location.href = "/dashboard";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl"></div>
      </div>

      <Card className="w-full max-w-md shadow-2xl border-0 relative overflow-hidden">
        {/* Gradient accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
        
        <CardHeader className="space-y-1 pb-6 pt-8 bg-gradient-to-b from-blue-50/50 to-transparent">
          <div className="flex items-center justify-center mb-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
              <Building2 className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl text-center font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-center text-gray-600 mt-2">
            Sign in to your expense management account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {successMessage && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="your.email@company.com" 
                        autoComplete="username"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Password</FormLabel>
                      <Link 
                        href="/forgot-password" 
                        className="text-sm text-primary hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        autoComplete="current-password"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5" 
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </form>
          </Form>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <Separator className="border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-gray-500">
                  Need help?
                </span>
              </div>
            </div>

            <div className="space-y-4 text-center text-sm">
              <div>
                <span className="text-gray-600">Don't have an account? </span>
                <Link href="/signup" className="font-semibold text-blue-600 hover:text-indigo-600 transition-colors">
                  Create company account
                </Link>
              </div>
              <div>
                <Link href="/support" className="text-blue-600 hover:text-indigo-600 font-medium transition-colors">
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}