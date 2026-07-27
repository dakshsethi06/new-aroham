import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AdminAuthProvider, useAdminAuth } from "./context/AdminAuthContext";
import { Header } from "./components/common/Header";
import { Sidebar } from "./components/common/Sidebar";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ProductsPage } from "./pages/ProductsPage";
import { UsersPage } from "./pages/UsersPage";
import { AstrologersPage } from "./pages/AstrologersPage";



const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <div className="text-xs font-bold text-[#5B1F24] flex items-center gap-2">
          <div className="w-5 h-5 rounded-full border-2 border-[#5B1F24] border-t-transparent animate-spin" />
          <span>Verifying Admin Session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col font-sans text-[#222222]">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl">
          {children}
        </main>
      </div>
    </div>
  );
};

const PublicLoginRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAdminAuth();

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <LoginPage />;
};

export function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <Routes>
          <Route path="/" element={<PublicLoginRoute />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedLayout>
                <DashboardPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedLayout>
                <ProductsPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedLayout>
                <UsersPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/astrologers"
            element={
              <ProtectedLayout>
                <AstrologersPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/onboarding"
            element={
              <ProtectedLayout>
                <AstrologersPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/performance"
            element={
              <ProtectedLayout>
                <AstrologersPage />
              </ProtectedLayout>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />


        </Routes>
      </AdminAuthProvider>
    </BrowserRouter>
  );
}

export default App;
