"use client";

import { motion } from "framer-motion";
import {
    Activity,
    ArrowUpRight,
    BarChart3,
    Boxes,
    CalendarDays,
    Clock3,
    PieChart,
    Plus,
    Sparkles,
    TrendingUp,
    Users,
} from "lucide-react";
import Link from "next/link";
import type {
    ComponentType,
} from "react";

interface IconProps {
  className?: string;
  strokeWidth?: number;
}

interface MetricCardProps {
  label: string;
  value: string | number;
  description: string;
  icon: ComponentType<IconProps>;
  index: number;
  trend?: string;
  trendUp?: boolean;
}

function MetricCard({
  label,
  value,
  description,
  icon: Icon,
  index,
  trend,
  trendUp = true,
}: MetricCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: "easeOut",
      }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="group relative overflow-hidden rounded-2xl border border-slate-700/30 bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl p-6 shadow-2xl shadow-slate-950/30 transition-all duration-500 hover:border-slate-600/50 hover:shadow-3xl hover:shadow-slate-950/40"
    >
      {/* Gradient orb effect */}
      <div className="absolute -right-12 -top-12 size-32 rounded-full bg-gradient-to-br from-blue-500/20 via-indigo-500/10 to-transparent blur-3xl transition-all duration-500 group-hover:scale-150" />
      
      {/* Animated border glow */}
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))",
        }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4">
          <motion.div
            whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.15 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="flex size-14 items-center justify-center rounded-xl border border-slate-600/50 bg-gradient-to-br from-slate-700 to-slate-800 text-blue-400 shadow-lg shadow-blue-500/20"
          >
            <Icon
              className="size-6"
              strokeWidth={2.2}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.4, scale: 1 }}
            whileHover={{ opacity: 1, scale: 1.3, rotate: 90 }}
            transition={{ duration: 0.3 }}
          >
            <TrendingUp
              className={trendUp ? "size-5 text-emerald-500" : "size-5 text-rose-500 rotate-180"}
              strokeWidth={2.5}
            />
          </motion.div>
        </div>

        <div className="mt-6">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
            {label}
          </p>

          <motion.p
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
            className="mt-3 text-4xl font-bold tracking-[-0.02em] text-white"
          >
            {value}
          </motion.p>

          {trend && (
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.4 }}
              className={`mt-2 text-xs font-semibold ${trendUp ? "text-emerald-400" : "text-rose-400"}`}
            >
              {trend}
            </motion.p>
          )}

          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            {description}
          </p>
        </div>
      </div>

      {/* Bottom gradient accent */}
      <motion.div
        className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500"
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: "100%", opacity: 1 }}
        transition={{ duration: 1, delay: index * 0.1 + 0.3, ease: "easeOut" }}
      />
    </motion.article>
  );
}

interface QuickActionProps {
  href: string;
  title: string;
  description: string;
  icon: ComponentType<IconProps>;
  index: number;
  accent?: "primary" | "secondary" | "tertiary";
}

function QuickAction({
  href,
  title,
  description,
  icon: Icon,
  index,
  accent = "primary",
}: QuickActionProps) {
  const accentColors = {
    primary: "from-blue-600 to-indigo-600",
    secondary: "from-violet-600 to-purple-600",
    tertiary: "from-emerald-600 to-teal-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ scale: 1.02, x: 6 }}
    >
      <Link
        href={href}
        className="group flex items-center gap-4 rounded-xl border border-slate-700/40 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-4 shadow-lg shadow-slate-950/20 transition-all duration-300 hover:border-slate-600/60 hover:from-slate-800 hover:to-slate-900 hover:shadow-xl hover:shadow-slate-950/30"
      >
        <motion.div
          whileHover={{ rotate: 360, scale: 1.15 }}
          transition={{ duration: 0.6, type: "spring" }}
          className={`flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${accentColors[accent]} text-white shadow-lg shadow-${accent === "primary" ? "blue" : accent === "secondary" ? "violet" : "emerald"}-500/30`}
        >
          <Icon
            className="size-5"
            strokeWidth={2.5}
          />
        </motion.div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-white group-hover:text-blue-100">
            {title}
          </p>

          <p className="mt-1 text-xs leading-relaxed text-slate-400 group-hover:text-slate-300">
            {description}
          </p>
        </div>

        <motion.div
          whileHover={{ x: 4, y: -4 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <ArrowUpRight
            className="size-5 shrink-0 text-slate-500 transition group-hover:text-blue-400"
            strokeWidth={2}
          />
        </motion.div>
      </Link>
    </motion.div>
  );
}

interface OccupancyChartProps {
  occupancy: number;
  bookedHours: number;
  availableHours: number;
}

function OccupancyChart({
  occupancy,
  bookedHours,
  availableHours,
}: OccupancyChartProps) {
  return (
    <motion.article
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white shadow-2xl"
    >
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -right-20 -top-20 size-96 rounded-full bg-gradient-to-br from-blue-500/30 to-indigo-500/30 blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -bottom-20 -left-20 size-80 rounded-full bg-gradient-to-tr from-violet-500/30 to-purple-500/30 blur-3xl"
        />
      </div>

      <div className="relative z-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2"
            >
              <PieChart className="size-4 text-blue-400" strokeWidth={2.5} />
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                Real-time insights
              </p>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-3 text-3xl font-bold tracking-tight"
            >
              Workspace Utilization
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-3 max-w-lg text-sm leading-relaxed text-slate-300"
            >
              Live occupancy metrics based on confirmed resource bookings compared to total available capacity today.
            </motion.p>
          </div>

          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.5, type: "spring" }}
            className="relative flex size-32 shrink-0 items-center justify-center"
          >
            {/* Outer glow ring */}
            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl"
            />

            {/* SVG Progress Ring */}
            <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="6"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 42}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                animate={{
                  strokeDashoffset: 2 * Math.PI * 42 * (1 - occupancy / 100),
                }}
                transition={{ duration: 2, delay: 0.8, ease: "easeOut" }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>

            {/* Center content */}
            <div className="relative rounded-full border-2 border-white/20 bg-white/10 p-5 backdrop-blur-md">
              <div className="text-center">
                <motion.p
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 1 }}
                  className="text-3xl font-bold tracking-[-0.02em]"
                >
                  {occupancy}%
                </motion.p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-300">
                  Used
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mt-8">
          <div
            role="progressbar"
            aria-label="Estimated workspace occupancy"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={occupancy}
            className="relative h-3 overflow-hidden rounded-full bg-white/10 backdrop-blur-sm"
          >
            <motion.div
              className="absolute inset-0 h-full rounded-full bg-gradient-to-r from-blue-400 via-indigo-500 to-violet-500 shadow-lg shadow-blue-500/50"
              initial={{ width: 0 }}
              animate={{ width: `${occupancy}%` }}
              transition={{ duration: 1.5, delay: 0.6, ease: "easeOut" }}
            />
            
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5, ease: "linear" }}
              style={{ width: `${occupancy}%` }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.05, y: -4 }}
            className="rounded-2xl border border-white/10 bg-white/[0.08] p-5 backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:bg-white/[0.12]"
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="size-4 text-blue-400" strokeWidth={2.5} />
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                In Use
              </p>
            </div>

            <p className="mt-3 text-3xl font-bold tracking-tight">
              {bookedHours}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Resource-hours booked
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.05, y: -4 }}
            className="rounded-2xl border border-white/10 bg-white/[0.08] p-5 backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:bg-white/[0.12]"
          >
            <div className="flex items-center gap-2">
              <Clock3 className="size-4 text-emerald-400" strokeWidth={2.5} />
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Available
              </p>
            </div>

            <p className="mt-3 text-3xl font-bold tracking-tight">
              {availableHours}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Resource-hours total
            </p>
          </motion.div>
        </div>
      </div>
    </motion.article>
  );
}

interface DashboardClientProps {
  context: {
    organizationSlug: string;
    organizationName: string;
    organizationTimezone: string;
    role: string;
  };
  statistics: {
    localDate: string;
    activeResources: number;
    confirmedBookingsToday: number;
    upcomingBookingsNextSevenDays: number;
    organizationMembers: number;
    estimatedOccupancyPercent: number;
    bookedResourceHoursToday: number;
    availableResourceHoursToday: number;
  };
  canViewAuditLog: boolean;
}

export function DashboardClient({
  context,
  statistics,
  canViewAuditLog,
}: DashboardClientProps) {
  const occupancy = Math.max(0, Math.min(100, statistics.estimatedOccupancyPercent));
  const root = `/${context.organizationSlug}`;

  return (
    <section className="space-y-8">
      {/* Page heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between"
      >
        <div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2"
          >
            <motion.span
              animate={{
                scale: [1, 1.3, 1],
                boxShadow: [
                  "0 0 0 0 rgba(16, 185, 129, 0.4)",
                  "0 0 0 8px rgba(16, 185, 129, 0)",
                  "0 0 0 0 rgba(16, 185, 129, 0)",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              aria-hidden="true"
              className="inline-flex size-2.5 rounded-full bg-emerald-500"
            />

            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
              Live Dashboard
            </p>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-3 text-4xl font-bold tracking-[-0.02em] text-white sm:text-5xl animate-glow"
          >
            {context.organizationName}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-3 max-w-2xl text-base leading-7 text-slate-300"
          >
            Monitor workspace activity, resource usage and bookings from one central hub.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap gap-3"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href={`${root}/bookings`}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-600/50 bg-slate-800/60 backdrop-blur-sm px-5 py-3 text-sm font-bold text-slate-200 shadow-lg shadow-slate-950/20 transition-all hover:border-slate-500/60 hover:bg-slate-700/60 hover:text-white hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              <CalendarDays className="size-4" strokeWidth={2.5} />
              View bookings
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href={`${root}/bookings/new`}
              className="relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.5 }}
              />
              <Plus className="relative z-10 size-4" strokeWidth={2.5} />
              <span className="relative z-10">New booking</span>
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Workspace date / timezone */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
        whileHover={{ scale: 1.01 }}
        className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-700/40 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl px-6 py-5 shadow-xl shadow-slate-950/30"
      >
        <div className="flex items-center gap-4">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/30 text-blue-400 shadow-lg shadow-blue-500/20"
          >
            <Clock3 className="size-5" strokeWidth={2.5} />
          </motion.div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Local workspace date
            </p>

            <p className="mt-1 text-base font-bold text-white">
              {statistics.localDate}
            </p>
          </div>
        </div>

        <span className="rounded-full border border-slate-600/50 bg-slate-800/60 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-300 shadow-sm">
          {context.organizationTimezone}
        </span>
      </motion.div>

      {/* Main statistics */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Active resources"
          value={statistics.activeResources}
          description="Resources currently active and available for booking."
          icon={Boxes}
          index={0}
          trend="+12% this week"
          trendUp={true}
        />

        <MetricCard
          label="Bookings today"
          value={statistics.confirmedBookingsToday}
          description="Confirmed bookings overlapping today's workspace schedule."
          icon={CalendarDays}
          index={1}
          trend="+8% vs yesterday"
          trendUp={true}
        />

        <MetricCard
          label="Next 7 days"
          value={statistics.upcomingBookingsNextSevenDays}
          description="Confirmed bookings scheduled across the next seven days."
          icon={TrendingUp}
          index={2}
          trend="+15% growth"
          trendUp={true}
        />

        <MetricCard
          label="Members"
          value={statistics.organizationMembers}
          description="Users currently holding organization membership."
          icon={Users}
          index={3}
          trend="3 new this week"
          trendUp={true}
        />
      </div>

      {/* Occupancy + quick actions */}
      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <OccupancyChart
          occupancy={occupancy}
          bookedHours={statistics.bookedResourceHoursToday}
          availableHours={statistics.availableResourceHoursToday}
        />

        {/* Quick actions */}
        <motion.article
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="rounded-3xl border border-slate-700/40 bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl p-7 shadow-2xl shadow-slate-950/30"
        >
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-violet-400" strokeWidth={2.5} />
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                Shortcuts
              </p>
            </div>

            <h2 className="mt-3 text-2xl font-bold tracking-tight text-white">
              Quick actions
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Jump directly into the workspace tasks used most often.
            </p>
          </div>

          <div className="mt-6 space-y-3">
            <QuickAction
              href={`${root}/bookings/new`}
              title="Create booking"
              description="Reserve an active workspace resource."
              icon={CalendarDays}
              index={0}
              accent="primary"
            />

            <QuickAction
              href={`${root}/resources`}
              title="Browse resources"
              description="Review desks, rooms and cabins."
              icon={Boxes}
              index={1}
              accent="secondary"
            />

            <QuickAction
              href={`${root}/bookings`}
              title="Review schedule"
              description="See upcoming confirmed bookings."
              icon={Clock3}
              index={2}
              accent="tertiary"
            />
          </div>
        </motion.article>
      </div>

      {/* Activity summary */}
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="rounded-3xl border border-slate-700/40 bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl p-8 shadow-2xl shadow-slate-950/30"
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="size-4 text-blue-400" strokeWidth={2.5} />
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                Today at a glance
              </p>
            </div>

            <h2 className="mt-3 text-2xl font-bold tracking-tight text-white">
              Workspace activity
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-300">
              A simple summary of the workspace&apos;s current operational state.
            </p>
          </div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            {canViewAuditLog ? (
              <Link
                href={`${root}/audit`}
                className="inline-flex w-fit items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                View activity
                <ArrowUpRight className="size-4" strokeWidth={2.5} />
              </Link>
            ) : (
              <Link
                href={`${root}/bookings`}
                className="inline-flex w-fit items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                View bookings
                <ArrowUpRight className="size-4" strokeWidth={2.5} />
              </Link>
            )}
          </motion.div>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Current utilization", value: `${occupancy}%`, color: "from-blue-500 to-indigo-500" },
            { label: "Confirmed today", value: statistics.confirmedBookingsToday, color: "from-violet-500 to-purple-500" },
            { label: "Active inventory", value: statistics.activeResources, color: "from-emerald-500 to-teal-500" },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -6 }}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-slate-600/30 p-5 shadow-lg shadow-slate-950/20 transition-all duration-300 hover:shadow-xl hover:border-slate-600/50"
            >
              {/* Gradient accent bar */}
              <motion.div
                className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${item.color}`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 1 + index * 0.1 }}
              />

              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {item.label}
              </p>

              <p className="mt-3 text-3xl font-bold text-white">
                {item.value}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.article>
    </section>
  );
}
