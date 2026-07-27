import React from "react";
import { LogOut, UserCheck } from "lucide-react";
import { useAdminAuth } from "../../context/AdminAuthContext";

export const Header: React.FC = () => {
  const { admin, logout } = useAdminAuth();

  return (
    <header className="h-16 bg-white border-b border-[#5B1F24]/10 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#5B1F24] text-[#FAF7F2] flex items-center justify-center font-bold text-lg shadow-sm">
          🕉️
        </div>
        <div>
          <h1 className="font-semibold text-base text-[#5B1F24] tracking-tight leading-none" style={{ fontFamily: "Cinzel, serif" }}>
            AROHAM <span className="text-[#C8A044] text-xs font-normal font-sans uppercase tracking-widest ml-1">Admin Portal</span>
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#5B1F24]/10">
          <div className="w-7 h-7 rounded-full bg-[#C8A044]/20 text-[#5B1F24] flex items-center justify-center">
            <UserCheck size={15} />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-[#5B1F24]">{admin?.name || "Admin"}</p>
            <p className="text-[10px] text-[#222222]/60 font-mono">+91 {admin?.mobile || ""}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#d4183d] bg-[#d4183d]/10 hover:bg-[#d4183d]/20 transition-all border border-[#d4183d]/20 active:scale-95 cursor-pointer"
          title="Sign out of Admin Portal"
        >
          <LogOut size={14} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};
