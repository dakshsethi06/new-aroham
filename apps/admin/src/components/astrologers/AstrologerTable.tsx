import React from "react";
import { Ban, CheckCircle2, Trash2, Sparkles } from "lucide-react";
import { Astrologer } from "../../types/admin";
import { StatusBadge } from "../common/StatusBadge";
import { useAdminAuth } from "../../context/AdminAuthContext";

interface AstrologerTableProps {
  astrologers: Astrologer[];
  onToggleStatus: (astrologer: Astrologer) => void;
  onDelete: (astrologer: Astrologer) => void;
}

export const AstrologerTable: React.FC<AstrologerTableProps> = ({
  astrologers,
  onToggleStatus,
  onDelete
}) => {
  const { isSuperAdmin } = useAdminAuth();

  if (!astrologers.length) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-[#5B1F24]/10 my-4">
        <p className="text-sm font-semibold text-[#5B1F24]">No astrologers found in Supabase database.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#5B1F24]/10 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAF7F2] text-[#5B1F24] uppercase font-bold border-b border-[#5B1F24]/10">
            <tr>
              <th className="p-3.5">Astrologer</th>
              <th className="p-3.5">Mobile Phone</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-medium">
            {astrologers.map(a => {
              const isBlocked = a.status === "BLOCKED";
              return (
                <tr key={a.id} className="hover:bg-[#FAF7F2]/50 transition-colors">
                  <td className="p-3.5 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#C8A044]/20 text-[#5B1F24] flex items-center justify-center font-bold">
                      <Sparkles size={18} className="text-[#C8A044]" />
                    </div>
                    <div>
                      <p className="font-bold text-[#5B1F24]">{a.fullName}</p>
                      <p className="text-[10px] text-gray-500 font-mono">ID: {a.id.slice(0, 8)}...</p>
                    </div>
                  </td>
                  <td className="p-3.5 font-mono text-gray-700">{a.phone}</td>
                  <td className="p-3.5">
                    <StatusBadge status={a.status} />
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onToggleStatus(a)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 border ${
                          isBlocked
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            : "bg-[#d4183d]/10 text-[#d4183d] border-[#d4183d]/20 hover:bg-[#d4183d]/20"
                        }`}
                      >
                        {isBlocked ? (
                          <>
                            <CheckCircle2 size={13} />
                            <span>Unblock</span>
                          </>
                        ) : (
                          <>
                            <Ban size={13} />
                            <span>Block</span>
                          </>
                        )}
                      </button>

                      {isSuperAdmin && (
                        <button
                          onClick={() => onDelete(a)}
                          className="p-1.5 rounded-lg text-[#d4183d] hover:bg-[#d4183d]/10 transition-colors"
                          title="Delete Astrologer Account"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
