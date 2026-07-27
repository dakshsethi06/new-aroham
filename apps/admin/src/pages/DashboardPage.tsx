import React, { useState, useEffect } from "react";
import { ShoppingBag, Users, Sparkles } from "lucide-react";
import { StatCard } from "../components/dashboard/StatCard";
import { adminFetch } from "../services/apiClient";

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState({
    productsCount: 0,
    usersCount: 0,
    blockedUsersCount: 0,
    astrologersCount: 0,
    blockedAstrologersCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [prodRes, userRes, astroRes] = await Promise.allSettled([
          adminFetch("/products"),
          adminFetch("/users"),
          adminFetch("/astrologers")
        ]);

        const products = prodRes.status === "fulfilled" ? prodRes.value.products || [] : [];
        const users = userRes.status === "fulfilled" ? userRes.value.users || [] : [];
        const astrologers = astroRes.status === "fulfilled" ? astroRes.value.astrologers || [] : [];

        setStats({
          productsCount: products.length,
          usersCount: users.length,
          blockedUsersCount: users.filter((u: any) => u.status === "BLOCKED").length,
          astrologersCount: astrologers.length,
          blockedAstrologersCount: astrologers.filter((a: any) => a.status === "BLOCKED").length
        });
      } catch (err) {
        console.error("Failed to load dashboard statistics:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#5B1F24]" style={{ fontFamily: "Cinzel, serif" }}>
          Admin Overview Dashboard
        </h2>
        <p className="text-xs text-gray-500 font-medium mt-0.5">
          Real-time metrics & management for Aroham astrology portal
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard
          title="Total Products"
          value={stats.productsCount}
          subtitle="Live on Aroham Shop"
          icon={ShoppingBag}
          color="#5B1F24"
        />

        <StatCard
          title="Registered Users"
          value={stats.usersCount}
          subtitle={`${stats.blockedUsersCount} account(s) currently blocked`}
          icon={Users}
          color="#C8A044"
        />

        <StatCard
          title="Certified Astrologers"
          value={stats.astrologersCount}
          subtitle={`${stats.blockedAstrologersCount} account(s) currently blocked`}
          icon={Sparkles}
          color="#E78B2F"
        />
      </div>
    </div>
  );
};
