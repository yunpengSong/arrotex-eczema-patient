"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export interface AuthUser {
  id: number;
  email: string;
  title?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
  autoLoginError: string | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoLoginError, setAutoLoginError] = useState<string | null>(null);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");

      if (token) {
        try {
          const res = await fetch("/api/auto-login-exchange", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          });

          const data = await res.json();

          const url = new URL(window.location.href);
          url.searchParams.delete("token");
          window.history.replaceState({}, "", url.toString());

          if (data.success) {
            setUser(data.user);
          } else {
            setAutoLoginError(data.error);
          }
        } catch (error) {
          console.error("Auto-login failed:", error);
          setAutoLoginError("Something went wrong");
        } finally {
          setLoading(false);
        }
      } else {
        checkAuth();
      }
    };

    initAuth();
  }, []);

  const logout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, checkAuth, logout, autoLoginError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
