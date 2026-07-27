import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "#5B1F24"
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-[#5B1F24]/10 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
      <div className="space-y-1">
        <p className="text-xs font-semibold text-[#222222]/60 uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-extrabold text-[#5B1F24] tracking-tight">{value}</h3>
        <p className="text-[11px] font-medium text-[#222222]/50">{subtitle}</p>
      </div>

      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm"
        style={{ backgroundColor: color }}
      >
        <Icon size={24} />
      </div>
    </div>
  );
};
