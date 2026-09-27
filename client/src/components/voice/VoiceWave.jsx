"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const BARS = [0, 1, 2, 3, 4];

export function VoiceWave({ className }) {
  return (
    <span className={cn("flex h-5 items-center gap-[3px]", className)} aria-hidden="true">
      {BARS.map((i) => (
        <motion.span
          key={i}
          className="w-1.5 rounded-full bg-honey-500"
          animate={{ height: ["5px", "17px", "7px", "15px", "5px"] }}
          transition={{
            duration: 0.9 + i * 0.12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.08,
          }}
        />
      ))}
    </span>
  );
}
