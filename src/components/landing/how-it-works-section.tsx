"use client";

import { motion } from "framer-motion";
import { Building2, Calendar, Users } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Create your workspace",
    description: "Set up your organization with a unique workspace identifier and timezone configuration.",
    icon: Building2,
  },
  {
    number: "02",
    title: "Add resources and invite members",
    description: "Define your meeting rooms, desks, and cabins. Invite team members with appropriate access levels.",
    icon: Users,
  },
  {
    number: "03",
    title: "Start booking without conflicts",
    description: "Members can browse available resources and create bookings with automatic conflict prevention.",
    icon: Calendar,
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 lg:py-32 bg-[#111113]/50 border-y border-[#27272A]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            How it works
          </h2>
          <p className="text-lg text-[#A1A1AA] max-w-3xl mx-auto">
            Get your workspace operational in three straightforward steps.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative"
            >
              {/* Connector line (not on last item) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-px bg-gradient-to-r from-[#27272A] to-transparent z-0" />
              )}

              <div className="relative z-10 text-center lg:text-left">
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600/10 to-indigo-600/10 border border-blue-600/20 mb-6">
                  <step.icon className="w-8 h-8 text-blue-400" />
                </div>

                {/* Number badge */}
                <div className="inline-block px-3 py-1 rounded-full bg-white/5 border border-[#27272A] text-white text-sm font-bold mb-4">
                  {step.number}
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-[#A1A1AA] leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
