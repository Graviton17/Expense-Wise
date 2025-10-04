import { User } from "@/lib/jwt";

export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  adminName: string;
  email: string;
  companyName: string;
  country: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
  company?: {
    id: string;
    name: string;
    country: string;
  };
}

export interface ApiError {
  message: string;
  code?: string;
}

class AuthService {
  private static readonly API_BASE = "/api/auth";

  /**
   * Sign in a user
   */
  static async signIn(credentials: SignInRequest): Promise<AuthResponse> {
    const response = await fetch(`${this.API_BASE}/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to sign in");
    }

    // Store the JWT token in localStorage for future requests
    if (data.token) {
      this.setToken(data.token);
    }

    return data;
  }

  /**
   * Sign up a new user and company
   */
  static async signUp(userData: SignUpRequest): Promise<AuthResponse> {
    const response = await fetch(`${this.API_BASE}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to create account");
    }

    return data;
  }

  /**
   * Sign out the current user
   */
  static async signOut(): Promise<void> {
    try {
      // Call the signout API if it exists
      const token = this.getToken();
      if (token) {
        await fetch(`${this.API_BASE}/signout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }
    } catch (error) {
      console.warn("Failed to call signout API:", error);
    } finally {
      // Always remove token from localStorage
      this.removeToken();
    }
  }

  /**
   * Get the current JWT token from localStorage
   */
  static getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("auth_token");
  }

  /**
   * Set the JWT token in localStorage
   */
  static setToken(token: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem("auth_token", token);
  }

  /**
   * Remove the JWT token from localStorage
   */
  static removeToken(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem("auth_token");
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Basic check to see if token is expired
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  }

  /**
   * Get user information from JWT token
   */
  static getCurrentUser(): User | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        companyId: payload.companyId,
      };
    } catch {
      return null;
    }
  }

  /**
   * Create an authenticated fetch request
   */
  static async authenticatedFetch(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const token = this.getToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // If we get a 401, the token might be expired
    if (response.status === 401) {
      this.removeToken();
      // Redirect to sign in page
      if (typeof window !== "undefined") {
        window.location.href =
          "/signin?error=Session expired, please sign in again";
      }
    }

    return response;
  }

  /**
   * Refresh the current token (if refresh endpoint exists)
   */
  static async refreshToken(): Promise<string | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const response = await fetch(`${this.API_BASE}/refresh`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          this.setToken(data.token);
          return data.token;
        }
      }
    } catch (error) {
      console.warn("Failed to refresh token:", error);
    }

    return null;
  }

  /**
   * Redirect user based on their role
   */
  static redirectByRole(user: User): void {
    if (typeof window === "undefined") return;

    switch (user.role) {
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
  }
}

export default AuthService;
