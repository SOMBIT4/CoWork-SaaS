"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

export function BookingConflictDemo() {
  return (
    <section className="py-24 lg:py-32 bg-[#111113]/50 border-y border-[#27272A]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            No accidental double booking
          </h2>
          <p className="text-lg text-[#A1A1AA] max-w-3xl mx-auto">
            Database-enforced booking validation prevents scheduling conflicts. When a resource is occupied, overlapping requests are automatically rejected.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-[#09090B] border border-[#27272A] rounded-2xl p-6 sm:p-8">
            {/* Timeline header */}
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-[#27272A]">
              <div className="flex-shrink-0 w-32 text-sm font-medium text-[#A1A1AA]">
                Meeting Room A
              </div>
              <div className="flex-1 grid grid-cols-12 gap-1 text-xs text-[#A1A1AA]">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="text-center">
                    {9 + i}:00
                  </div>
                ))}
              </div>
            </div>

            {/* Booking attempts */}
            <div className="space-y-6">
              {/* Booking 1 - Success */}
              <BookingAttempt
                time="10:00 – 11:00"
                status="success"
                slots={[1, 2]}
                delay={0.2}
              />

              {/* Booking 2 - Conflict */}
              <BookingAttempt
                time="10:30 – 11:30"
                status="conflict"
                slots={[2, 3]}
                delay={0.4}
              />

              {/* Booking 3 - Success */}
              <BookingAttempt
                time="11:00 – 12:00"
                status="success"
                slots={[3, 4]}
                delay={0.6}
              />
            </div>

            {/* Legend */}
            <div className="mt-8 pt-6 border-t border-[#27272A] flex flex-wrap gap-6 justify-center text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/40" />
                <span className="text-[#A1A1AA]">Accepted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-rose-500/20 border border-rose-500/40" />
                <span className="text-[#A1A1AA]">Rejected (Conflict)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-blue-500/20 border border-blue-500/40" />
                <span className="text-[#A1A1AA]">Available</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BookingAttempt({
  time,
  status,
  slots,
  delay,
}: {
  time: string;
  status: "success" | "conflict";
  slots: number[];
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="flex items-center gap-4"
    >
      <div className="flex-shrink-0 w-32">
        <div className="text-sm font-medium text-white mb-1">{time}</div>
        <div
          className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${
            status === "success"
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-rose-500/10 text-rose-400"
          }`}
        >
          {status === "success" ? (
            <>
              <Check className="w-3 h-3" />
              Accepted
            </>
          ) : (
            <>
              <X className="w-3 h-3" />
              Rejected
            </>
          )}
        </div>
      </div>

      {/* Timeline visualization */}
      <div className="flex-1 grid grid-cols-12 gap-1">
        {[...Array(12)].map((_, i) => {
          const isSlot = slots.includes(i);
          return (
            <div
              key={i}
              className={`h-10 rounded transition-all duration-300 ${
                isSlot
                  ? status === "success"
                    ? "bg-emerald-500/20 border border-emerald-500/40"
                    : "bg-rose-500/20 border border-rose-500/40"
                  : "bg-blue-500/5 border border-blue-500/10"
              }`}
            />
          );
        })}
      </div>
    </motion.div>
  );
}
