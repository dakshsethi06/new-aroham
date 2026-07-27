import React from "react";
import { CheckCircle2, Ban } from "lucide-react";

interface StatusBadgeProps {
  status: "ACTIVE" | "BLOCKED" | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const isBlocked = status === "BLOCKED";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase border ${
        isBlocked
          ? "bg-[#d4183d]/10 text-[#d4183d] border-[#d4183d]/30"
          : "bg-emerald-500/10 text-emerald-700 border-emerald-500/30"
      }`}
    >
      {isBlocked ? (
        <>
          <Ban size={12} />
          <span>BLOCKED</span>
        </>
      ) : (
        <>
          <CheckCircle2 size={12} />
          <span>ACTIVE</span>
        </>
      )}
    </span>
  );
};
