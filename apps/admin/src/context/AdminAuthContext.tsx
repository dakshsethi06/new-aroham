import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AdminUser } from "../types/admin";
import { adminFetch } from "../services/apiClient";

interface AdminAuthContextType {
  admin: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  isLoading: boolean;
  login: (mobileNumber: string, mpin: string) => Promise<void>;
  sendOtp: (mobileNumber: string) => Promise<any>;
  register: (payload: any) => Promise<void>;
  logout: () => void;
}

const SUPER_ADMIN_MOBILES = ["7505298939", "8000153840"];

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export const AdminAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("aroham_admin_token"));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const adminMobile = (admin?.mobile || admin?.mobileNumber || "").replace(/\D/g, "");
  const isSuperAdmin = !!admin && (admin.role === "SUPER_ADMIN" || SUPER_ADMIN_MOBILES.includes(adminMobile));

  useEffect(() => {
    async function verifySession() {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await adminFetch("/auth/me");
        if (res.success && res.admin) {
          setAdmin(res.admin);
        } else {
          logout();
        }
      } catch (err) {
        logout();
      } finally {
        setIsLoading(false);
      }
    }
    verifySession();
  }, [token]);

  const login = async (mobileNumber: string, mpin: string) => {
    const res = await adminFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ mobileNumber, mpin })
    });

    if (res.token && res.admin) {
      setToken(res.token);
      setAdmin(res.admin);
      localStorage.setItem("aroham_admin_token", res.token);
    }
  };

  const sendOtp = async (mobileNumber: string) => {
    return await adminFetch("/auth/send-otp", {
      method: "POST",
      body: JSON.stringify({ mobileNumber })
    });
  };

  const register = async (payload: any) => {
    const res = await adminFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    if (res.token && res.admin) {
      setToken(res.token);
      setAdmin(res.admin);
      localStorage.setItem("aroham_admin_token", res.token);
    }
  };

  const logout = () => {
    setToken(null);
    setAdmin(null);
    localStorage.removeItem("aroham_admin_token");
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        token,
        isAuthenticated: !!admin && !!token,
        isSuperAdmin,
        isLoading,
        login,
        sendOtp,
        register,
        logout
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
};
