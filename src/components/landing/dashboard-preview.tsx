"use client";

import { motion } from "framer-motion";
import { Box, Calendar, Clock, TrendingUp, Users } from "lucide-react";

export function DashboardPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="relative"
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 blur-3xl rounded-3xl" />

      {/* Dashboard mockup */}
      <div className="relative bg-[#111113] border border-[#27272A] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#09090B] border-b border-[#27272A] px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold text-sm">Workspace Overview</h3>
              <p className="text-[#A1A1AA] text-xs mt-0.5">Real-time insights</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[#A1A1AA] text-xs">Live</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            <MetricCard
              icon={<TrendingUp className="w-4 h-4" />}
              label="Estimated occupancy"
              value="68%"
              trend="+12%"
            />
            <MetricCard
              icon={<Calendar className="w-4 h-4" />}
              label="Bookings today"
              value="12"
              trend="+3"
            />
            <MetricCard
              icon={<Box className="w-4 h-4" />}
              label="Active resources"
              value="20"
            />
            <MetricCard
              icon={<Users className="w-4 h-4" />}
              label="Members"
              value="14"
            />
          </div>

          {/* Upcoming bookings */}
          <div className="space-y-3">
            <h4 className="text-white text-sm font-medium">Upcoming</h4>
            <div className="space-y-2">
              <BookingItem time="10:00 AM" resource="Meeting Room A" status="confirmed" />
              <BookingItem time="12:30 PM" resource="Desk 04" status="confirmed" />
              <BookingItem time="03:00 PM" resource="Private Cabin" status="pending" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  trend,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: string;
}) {
  return (
    <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-4 hover:border-[#3f3f46] transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600/10 text-blue-400">
          {icon}
        </div>
        {trend && (
          <span className="text-emerald-400 text-xs font-medium">{trend}</span>
        )}
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-[#A1A1AA] text-xs">{label}</p>
    </div>
  );
}

function BookingItem({
  time,
  resource,
  status,
}: {
  time: string;
  resource: string;
  status: "confirmed" | "pending";
}) {
  return (
    <div className="flex items-center gap-3 p-3 bg-[#09090B] border border-[#27272A] rounded-lg hover:border-[#3f3f46] transition-colors">
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-600/10">
        <Clock className="w-4 h-4 text-blue-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{resource}</p>
        <p className="text-[#A1A1AA] text-xs">{time}</p>
      </div>
      <div
        className={`px-2 py-1 rounded-md text-xs font-medium ${
          status === "confirmed"
            ? "bg-emerald-500/10 text-emerald-400"
            : "bg-amber-500/10 text-amber-400"
        }`}
      >
        {status}
      </div>
    </div>
  );
}
