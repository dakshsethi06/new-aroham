import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { User } from "../types/admin";
import { adminFetch } from "../services/apiClient";
import { UserTable } from "../components/users/UserTable";
import { ConfirmModal } from "../components/common/ConfirmModal";

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const res = await adminFetch("/users");
      if (res.success && res.users) {
        setUsers(res.users);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    let result = users;
    if (statusFilter !== "ALL") {
      result = result.filter(u => u.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(u =>
        u.fullName.toLowerCase().includes(q) ||
        u.phone.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      );
    }
    setFilteredUsers(result);
  }, [users, statusFilter, searchQuery]);

  const handleToggleStatus = async (user: User) => {
    const nextStatus = user.status === "BLOCKED" ? "ACTIVE" : "BLOCKED";
    // Optimistically update status in frontend UI immediately without deleting row
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: nextStatus } : u));
    try {
      await adminFetch(`/users/${user.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus })
      });
      await loadUsers();
    } catch (err: any) {
      alert(err.message || "Failed to update user status");
      await loadUsers();
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
      await adminFetch(`/users/${deleteTarget.id}`, { method: "DELETE" });
      setDeleteTarget(null);
      await loadUsers();
    } catch (err: any) {
      alert(err.message || "Failed to delete user");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#5B1F24]" style={{ fontFamily: "Cinzel, serif" }}>
          User Account Management
        </h2>
        <p className="text-xs text-gray-500 font-medium mt-0.5">
          View registered customer profiles from Supabase database, Block/Unblock login access or Delete accounts
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#5B1F24]/10 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search users by name, phone or email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-xs bg-[#FAF7F2] rounded-xl border border-gray-200 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {["ALL", "ACTIVE", "BLOCKED"].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === st
                  ? "bg-[#5B1F24] text-white font-bold"
                  : "bg-[#FAF7F2] text-gray-700 hover:bg-gray-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-xs font-semibold text-gray-500">Loading users from Supabase...</div>
      ) : (
        <UserTable
          users={filteredUsers}
          onToggleStatus={handleToggleStatus}
          onDelete={u => setDeleteTarget(u)}
        />
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete User Account"
        message={`Are you sure you want to delete user account "${deleteTarget?.fullName}"? This action cannot be undone.`}
        confirmText="Delete User"
        onConfirm={handleDeleteUser}
        onClose={() => setDeleteTarget(null)}
        isLoading={isSubmitting}
      />
    </div>
  );
};
