"use client";

import { motion } from "framer-motion";
import { Crown, ShieldCheck, User } from "lucide-react";

const roles = [
  {
    name: "OWNER",
    icon: Crown,
    description: "Full organization control",
    permissions: [
      "Manage all resources",
      "Control member access",
      "Configure workspace settings",
      "View complete audit history",
      "Delete organization",
    ],
    color: "from-amber-600 to-orange-600",
    iconBg: "bg-amber-600/10",
    iconColor: "text-amber-400",
    borderColor: "border-amber-600/20",
  },
  {
    name: "ADMIN",
    icon: ShieldCheck,
    description: "Manage resources, bookings and members",
    permissions: [
      "Add and edit resources",
      "Manage all bookings",
      "Invite new members",
      "Assign member roles",
      "View audit logs",
    ],
    color: "from-blue-600 to-indigo-600",
    iconBg: "bg-blue-600/10",
    iconColor: "text-blue-400",
    borderColor: "border-blue-600/20",
  },
  {
    name: "MEMBER",
    icon: User,
    description: "Browse resources and manage personal bookings",
    permissions: [
      "View workspace resources",
      "Create personal bookings",
      "Cancel own bookings",
      "Update profile",
      "View team members",
    ],
    color: "from-violet-600 to-purple-600",
    iconBg: "bg-violet-600/10",
    iconColor: "text-violet-400",
    borderColor: "border-violet-600/20",
  },
];

export function RolesSection() {
  return (
    <section className="py-24 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Role-based access control
          </h2>
          <p className="text-lg text-[#A1A1AA] max-w-3xl mx-auto">
            Give every person only the access they need. Clear permission boundaries keep your workspace secure.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {roles.map((role, index) => (
            <motion.div
              key={role.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className={`bg-[#111113] border ${role.borderColor} rounded-2xl p-8 hover:border-opacity-60 transition-all duration-300 group`}
            >
              {/* Icon */}
              <div className="mb-6">
                <div
                  className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${role.iconBg} border ${role.borderColor} group-hover:scale-110 transition-transform duration-200`}
                >
                  <role.icon className={`w-7 h-7 ${role.iconColor}`} />
                </div>
              </div>

              {/* Role name */}
              <h3 className="text-2xl font-bold text-white mb-2">{role.name}</h3>
              <p className="text-[#A1A1AA] mb-6">{role.description}</p>

              {/* Permissions */}
              <div className="space-y-3">
                {role.permissions.map((permission, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`mt-0.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-gradient-to-r ${role.color}`} />
                    <p className="text-sm text-[#A1A1AA]">{permission}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
