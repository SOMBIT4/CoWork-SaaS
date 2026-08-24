"use client";

import { motion } from "framer-motion";
import { Database, FileText, Key, Lock, Server, Shield } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Server-side authorization",
    description: "Every request validates user permissions on the server before executing operations.",
  },
  {
    icon: Database,
    title: "Organization-scoped data access",
    description: "Members can only access data within their organization. Multi-tenant isolation enforced at the database level.",
  },
  {
    icon: Key,
    title: "Secure invitation tokens",
    description: "Time-limited, single-use invitation tokens with role assignment. No password sharing required.",
  },
  {
    icon: Lock,
    title: "Database-enforced booking conflicts",
    description: "Unique constraints prevent double booking at the database layer, not just application logic.",
  },
  {
    icon: FileText,
    title: "Comprehensive audit logging",
    description: "Track who did what and when. Full activity history for compliance and troubleshooting.",
  },
  {
    icon: Server,
    title: "Production-ready infrastructure",
    description: "Built with Next.js, PostgreSQL, and NextAuth. Battle-tested stack for reliable operations.",
  },
];

export function SecuritySection() {
  return (
    <section id="security" className="py-24 lg:py-32 bg-[#111113]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Built for more than a pretty dashboard
          </h2>
          <p className="text-lg text-[#A1A1AA] max-w-3xl mx-auto">
            Security and reliability considerations built into every layer of the platform.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-[#09090B] border border-[#27272A] rounded-xl p-6 hover:border-[#3f3f46] transition-colors group"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600/10 to-indigo-600/10 border border-blue-600/20 mb-4 group-hover:scale-110 transition-transform duration-200">
                <feature.icon className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-[#A1A1AA] text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
