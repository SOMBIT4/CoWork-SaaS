"use client";

import { motion } from "framer-motion";
import { BarChart3, Box, MapPin, Users } from "lucide-react";

export function FeatureShowcase() {
  return (
    <section id="features" className="py-24 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Everything you need to manage your workspace
          </h2>
          <p className="text-lg text-[#A1A1AA] max-w-3xl mx-auto">
            A complete platform for workspace operations, from resource inventory to member management.
          </p>
        </motion.div>

        {/* Feature 1: Resource Management */}
        <FeatureCard
          title="Resource Management"
          description="Organize your workspace inventory with detailed resource profiles. Track capacity, availability, and floor location for every desk, room, and cabin."
          icon={Box}
          delay={0.2}
        >
          <ResourceManagementUI />
        </FeatureCard>

        {/* Feature 2: Members & Permissions */}
        <FeatureCard
          title="Members & Permissions"
          description="Give every person only the access they need. Manage workspace ownership, administrative rights, and member capabilities from one place."
          icon={Users}
          delay={0.4}
          reverse
        >
          <MembersPermissionsUI />
        </FeatureCard>

        {/* Feature 3: Visibility & Audit */}
        <FeatureCard
          title="Visibility & Audit"
          description="Monitor workspace activity with real-time occupancy metrics and comprehensive audit logging. Know what's happening across your organization."
          icon={BarChart3}
          delay={0.6}
        >
          <VisibilityAuditUI />
        </FeatureCard>
      </div>
    </section>
  );
}

function FeatureCard({
  title,
  description,
  icon: Icon,
  children,
  delay = 0,
  reverse = false,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  delay?: number;
  reverse?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay }}
      className="mb-24 last:mb-0"
    >
      <div className={`grid lg:grid-cols-2 gap-12 items-center ${reverse ? "lg:flex-row-reverse" : ""}`}>
        <div className={reverse ? "lg:order-2" : ""}>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600/10 to-indigo-600/10 border border-blue-600/20">
              <Icon className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">{title}</h3>
          </div>
          <p className="text-lg text-[#A1A1AA] leading-relaxed">{description}</p>
        </div>
        <div className={reverse ? "lg:order-1" : ""}>
          {children}
        </div>
      </div>
    </motion.div>
  );
}

function ResourceManagementUI() {
  return (
    <div className="bg-[#111113] border border-[#27272A] rounded-2xl p-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <ResourceCard icon={<Box className="w-4 h-4" />} label="Meeting rooms" count="8" color="blue" />
        <ResourceCard icon={<MapPin className="w-4 h-4" />} label="Desks" count="45" color="indigo" />
        <ResourceCard icon={<Box className="w-4 h-4" />} label="Private cabins" count="6" color="violet" />
        <ResourceCard icon={<BarChart3 className="w-4 h-4" />} label="Capacity" count="120" color="purple" />
      </div>
      <div className="pt-4 border-t border-[#27272A]">
        <ResourceItem name="Meeting Room A" floor="2nd Floor" capacity="8" status="available" />
        <ResourceItem name="Executive Cabin 01" floor="3rd Floor" capacity="1" status="occupied" />
        <ResourceItem name="Desk 12" floor="1st Floor" capacity="1" status="available" />
      </div>
    </div>
  );
}

function ResourceCard({
  icon,
  label,
  count,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  count: string;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-600/10 text-blue-400 border-blue-600/20",
    indigo: "bg-indigo-600/10 text-indigo-400 border-indigo-600/20",
    violet: "bg-violet-600/10 text-violet-400 border-violet-600/20",
    purple: "bg-purple-600/10 text-purple-400 border-purple-600/20",
  };

  return (
    <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-4">
      <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border ${colorMap[color]} mb-3`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-white mb-1">{count}</p>
      <p className="text-xs text-[#A1A1AA]">{label}</p>
    </div>
  );
}

function ResourceItem({
  name,
  floor,
  capacity,
  status,
}: {
  name: string;
  floor: string;
  capacity: string;
  status: "available" | "occupied";
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[#27272A] last:border-0">
      <div>
        <p className="text-sm font-medium text-white">{name}</p>
        <p className="text-xs text-[#A1A1AA]">{floor} · Capacity {capacity}</p>
      </div>
      <div
        className={`px-2 py-1 rounded-md text-xs font-medium ${
          status === "available"
            ? "bg-emerald-500/10 text-emerald-400"
            : "bg-amber-500/10 text-amber-400"
        }`}
      >
        {status}
      </div>
    </div>
  );
}

function MembersPermissionsUI() {
  return (
    <div className="bg-[#111113] border border-[#27272A] rounded-2xl p-6 space-y-4">
      <MemberItem name="Sarah Mitchell" role="OWNER" initials="SM" color="blue" />
      <MemberItem name="Alex Rahman" role="ADMIN" initials="AR" color="indigo" />
      <MemberItem name="Nadia Khan" role="MEMBER" initials="NK" color="violet" />
      <MemberItem name="James Chen" role="MEMBER" initials="JC" color="purple" />
      
      <div className="pt-4 border-t border-[#27272A] space-y-3">
        <PermissionRow role="OWNER" description="Full organization control" />
        <PermissionRow role="ADMIN" description="Manage resources & members" />
        <PermissionRow role="MEMBER" description="Personal bookings only" />
      </div>
    </div>
  );
}

function MemberItem({
  name,
  role,
  initials,
  color,
}: {
  name: string;
  role: string;
  initials: string;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-600/20 text-blue-400",
    indigo: "bg-indigo-600/20 text-indigo-400",
    violet: "bg-violet-600/20 text-violet-400",
    purple: "bg-purple-600/20 text-purple-400",
  };

  return (
    <div className="flex items-center justify-between p-3 bg-[#09090B] border border-[#27272A] rounded-lg">
      <div className="flex items-center gap-3">
        <div className={`flex items-center justify-center w-10 h-10 rounded-lg font-bold text-sm ${colorMap[color]}`}>
          {initials}
        </div>
        <div>
          <p className="text-sm font-medium text-white">{name}</p>
          <p className="text-xs text-[#A1A1AA]">Workspace {role.toLowerCase()}</p>
        </div>
      </div>
      <div className="px-2 py-1 rounded-md bg-white/5 text-white text-xs font-medium">
        {role}
      </div>
    </div>
  );
}

function PermissionRow({ role, description }: { role: string; description: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="px-2 py-1 rounded-md bg-blue-600/10 text-blue-400 text-xs font-bold min-w-[80px] text-center">
        {role}
      </div>
      <p className="text-sm text-[#A1A1AA]">{description}</p>
    </div>
  );
}

function VisibilityAuditUI() {
  return (
    <div className="bg-[#111113] border border-[#27272A] rounded-2xl p-6 space-y-6">
      {/* Occupancy meter */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-white">Today's Occupancy</p>
          <p className="text-2xl font-bold text-white">68%</p>
        </div>
        <div className="h-2 bg-[#27272A] rounded-full overflow-hidden">
          <div className="h-full w-[68%] bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full" />
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-[#A1A1AA]">
          <span>82 booked hours</span>
          <span>120 total hours</span>
        </div>
      </div>

      {/* Audit log */}
      <div className="pt-4 border-t border-[#27272A]">
        <p className="text-sm font-medium text-white mb-3">Recent Activity</p>
        <div className="space-y-2">
          <AuditItem action="Booking created" resource="Meeting Room A" time="2 min ago" />
          <AuditItem action="Room updated" resource="Executive Cabin" time="12 min ago" />
          <AuditItem action="Member invited" resource="john@company.com" time="1 hour ago" />
          <AuditItem action="Booking cancelled" resource="Desk 08" time="2 hours ago" />
        </div>
      </div>
    </div>
  );
}

function AuditItem({ action, resource, time }: { action: string; resource: string; time: string }) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#09090B] transition-colors">
      <div className="flex items-center justify-center w-2 h-2 rounded-full bg-blue-400" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white truncate">{action}</p>
        <p className="text-xs text-[#A1A1AA] truncate">{resource}</p>
      </div>
      <p className="text-xs text-[#A1A1AA] whitespace-nowrap">{time}</p>
    </div>
  );
}
