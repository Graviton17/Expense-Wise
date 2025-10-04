"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User } from "@/lib/jwt";
import AuthService from "@/services/auth.service";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (userData: {
    adminName: string;
    email: string;
    companyName: string;
    country: string;
    password: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  refreshAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && AuthService.isAuthenticated();

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        if (AuthService.isAuthenticated()) {
          const currentUser = AuthService.getCurrentUser();
          setUser(currentUser);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        AuthService.removeToken();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await AuthService.signIn({ email, password });
      setUser(response.user);
      AuthService.redirectByRole(response.user);
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (userData: {
    adminName: string;
    email: string;
    companyName: string;
    country: string;
    password: string;
  }) => {
    try {
      await AuthService.signUp(userData);
      // Note: signUp doesn't automatically sign in the user
      // They need to sign in separately after account creation
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await AuthService.signOut();
      setUser(null);
      // Redirect to sign in page
      if (typeof window !== "undefined") {
        window.location.href = "/signin";
      }
    } catch (error) {
      console.error("Error signing out:", error);
      // Even if the API call fails, clear local state
      setUser(null);
      AuthService.removeToken();
      if (typeof window !== "undefined") {
        window.location.href = "/signin";
      }
    }
  };

  const refreshAuth = () => {
    if (AuthService.isAuthenticated()) {
      const currentUser = AuthService.getCurrentUser();
      setUser(currentUser);
    } else {
      setUser(null);
      AuthService.removeToken();
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    signIn,
    signUp,
    signOut,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };
