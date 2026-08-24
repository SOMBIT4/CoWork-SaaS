"use client";

import { motion } from "framer-motion";
import { Building2, FileText, Shield, Users } from "lucide-react";

const capabilities = [
  { icon: Shield, label: "Conflict-safe booking" },
  { icon: Users, label: "Role-based permissions" },
  { icon: Building2, label: "Multi-tenant architecture" },
  { icon: FileText, label: "Audit history" },
];

export function CapabilityStrip() {
  return (
    <section className="py-12 border-y border-[#27272A] bg-[#111113]/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {capabilities.map((capability, index) => (
            <motion.div
              key={capability.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col items-center text-center group"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600/10 to-indigo-600/10 border border-blue-600/20 mb-4 group-hover:scale-110 transition-transform duration-200">
                <capability.icon className="w-6 h-6 text-blue-400" />
              </div>
              <p className="text-sm font-medium text-[#FAFAFA]">
                {capability.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
