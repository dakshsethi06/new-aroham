import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, ShoppingBag, Users, Sparkles, UserCheck, TrendingUp, LogOut } from "lucide-react";
import { useAdminAuth } from "../../context/AdminAuthContext";

export const Sidebar: React.FC = () => {
  const { logout } = useAdminAuth();

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Product Management", path: "/products", icon: ShoppingBag },
    { label: "User Management", path: "/users", icon: Users },
    { label: "Astrologer Management", path: "/astrologers", icon: Sparkles }
  ];



  return (
    <aside className="w-64 bg-[#5B1F24] text-[#FAF7F2] flex flex-col justify-between flex-shrink-0 min-h-[calc(100vh-4rem)] p-4 shadow-xl">
      <div className="space-y-6">
        <div className="px-3 py-2 text-[10px] uppercase font-bold tracking-widest text-[#C8A044]/80 border-b border-[#FAF7F2]/10">
          Navigation Menu
        </div>

        <nav className="space-y-1.5">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-[#C8A044] text-[#222222] shadow-md font-bold"
                      : "text-[#FAF7F2]/80 hover:bg-[#FAF7F2]/10 hover:text-[#FAF7F2]"
                  }`
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-[#FAF7F2]/10 space-y-3">
        <div className="p-3.5 rounded-xl bg-[#FAF7F2]/5 border border-[#FAF7F2]/10 text-center">
          <p className="text-[11px] text-[#C8A044] font-semibold">Live Database Sync</p>
          <p className="text-[10px] text-[#FAF7F2]/60 mt-0.5">Connected to Aroham DB</p>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-[#d4183d] text-white transition-all duration-200 cursor-pointer"
        >
          <LogOut size={14} />
          <span>Exit Admin Portal</span>
        </button>
      </div>
    </aside>
  );
};
