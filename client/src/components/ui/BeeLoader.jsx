"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const MESSAGES = [
  "Waking up BudgetBee…",
  "Counting your coins…",
  "Fetching your transactions…",
  "Polishing the honeycomb…",
  "Buckling the budget…",
];

export function BeeMascot({ size = 72, className, flutter = true }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id="beeBodyGrad" x1="21" y1="30" x2="59" y2="62" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FBBF24" />
          <stop offset="1" stopColor="#F59E0B" />
        </linearGradient>
        <clipPath id="beeBodyClip">
          <ellipse cx="40" cy="46" rx="19" ry="16" />
        </clipPath>
      </defs>

      <path d="M33 27 C31 18 27 14 23 12" stroke="#18181B" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="22" cy="11.5" r="3" fill="#18181B" />
      <path d="M47 27 C49 18 53 14 57 12" stroke="#18181B" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="58" cy="11.5" r="3" fill="#18181B" />

      <motion.g
        initial={false}
        animate={flutter ? { scaleY: [1, 0.66, 1] } : { scaleY: 1 }}
        transition={{ duration: 0.22, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "40px 34px", transformBox: "view-box" }}
      >
        <ellipse
          cx="27"
          cy="28"
          rx="12"
          ry="8.5"
          transform="rotate(-22 27 28)"
          fill="#FFFFFF"
          fillOpacity="0.88"
          stroke="#FCD34D"
          strokeWidth="1.6"
        />
        <ellipse
          cx="53"
          cy="28"
          rx="12"
          ry="8.5"
          transform="rotate(22 53 28)"
          fill="#FFFFFF"
          fillOpacity="0.88"
          stroke="#FCD34D"
          strokeWidth="1.6"
        />
      </motion.g>

      <ellipse cx="40" cy="46" rx="19" ry="16" fill="url(#beeBodyGrad)" />
      <g clipPath="url(#beeBodyClip)">
        <rect x="23" y="27" width="7" height="40" fill="#18181B" fillOpacity="0.85" transform="rotate(8 26 46)" />
        <rect x="50" y="27" width="7" height="40" fill="#18181B" fillOpacity="0.85" transform="rotate(8 53 46)" />
      </g>

      <circle cx="34.5" cy="44" r="3.5" fill="#18181B" />
      <circle cx="45.5" cy="44" r="3.5" fill="#18181B" />
      <circle cx="35.7" cy="42.7" r="1.15" fill="#FFFFFF" />
      <circle cx="46.7" cy="42.7" r="1.15" fill="#FFFFFF" />
      <path
        d="M36 51.5 Q40 55.2 44 51.5"
        stroke="#18181B"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="29" cy="50.5" r="2.5" fill="#F87171" fillOpacity="0.45" />
      <circle cx="51" cy="50.5" r="2.5" fill="#F87171" fillOpacity="0.45" />
    </svg>
  );
}

function Hex({ className, delay = 0, size = 56 }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      aria-hidden="true"
      className={cn("absolute", className)}
      animate={{ opacity: [0.28, 0.6, 0.28], scale: [1, 1.06, 1] }}
      transition={{ duration: 3.4, repeat: Infinity, delay, ease: "easeInOut" }}
    >
      <polygon
        points="30,3 54,17 54,43 30,57 6,43 6,17"
        fill="#F59E0B"
        fillOpacity="0.14"
        stroke="#F59E0B"
        strokeOpacity="0.4"
        strokeWidth="1.5"
      />
    </motion.svg>
  );
}

function FlightTrack({ compact }) {
  const w = compact ? 220 : 320;
  const h = compact ? 90 : 124;
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      aria-hidden="true"
      className="absolute inset-0"
      fill="none"
    >
      <ellipse
        cx={w / 2}
        cy={h / 2}
        rx={compact ? 82 : 122}
        ry={compact ? 26 : 36}
        stroke="#F59E0B"
        strokeOpacity="0.4"
        strokeWidth="2"
        strokeDasharray="7 9"
        className="bee-track"
      />
    </svg>
  );
}

export function BeeLoader({ full = false, label, className }) {
  const reduce = useReducedMotion();
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (label) return undefined;
    const id = setInterval(() => setMsgIndex((i) => (i + 1) % MESSAGES.length), 2100);
    return () => clearInterval(id);
  }, [label]);

  const message = label || MESSAGES[msgIndex];
  const flight = reduce
    ? {}
    : {
        x: [-(full ? 56 : 40), 0, full ? 56 : 40, 0, -(full ? 56 : 40)],
        y: [0, full ? -18 : -13, 0, full ? 18 : 13, 0],
        rotate: [-7, 0, 7, 0, -7],
      };

  return (
    <div
      role="status"
      aria-label={message}
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden px-6 py-10",
        full && "min-h-screen bg-zinc-50 dark:bg-zinc-950",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <Hex className="left-[12%] top-[16%]" delay={0} size={full ? 72 : 52} />
        <Hex className="right-[14%] top-[22%]" delay={0.7} size={full ? 56 : 44} />
        <Hex className="bottom-[18%] left-[18%]" delay={1.3} size={full ? 48 : 40} />
        <Hex className="bottom-[14%] right-[16%]" delay={1.9} size={full ? 68 : 48} />
        <Hex className="left-[46%] top-[8%]" delay={1.1} size={full ? 40 : 32} />
      </div>

      <div
        className={cn(
          "relative",
          full ? "h-[130px] w-[340px] max-w-full" : "h-[96px] w-[240px] max-w-full"
        )}
      >
        <FlightTrack compact={!full} />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={flight}
            transition={{ duration: reduce ? 0 : 3.4, repeat: Infinity, ease: "linear" }}
          >
            <motion.div
              animate={reduce ? {} : { y: [0, -5, 0] }}
              transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
            >
              <BeeMascot size={full ? 92 : 64} flutter={!reduce} />
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="relative mt-4 flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-honey-400 to-honey-600 shadow-honey">
          <span className="text-sm">🐝</span>
        </span>
        <span
          className={cn(
            "bg-gradient-to-r from-honey-500 to-honey-400 bg-clip-text font-extrabold tracking-tight text-transparent",
            full ? "text-3xl" : "text-xl"
          )}
        >
          BudgetBee
        </span>
      </div>

      <div className="relative mt-3 h-6 overflow-hidden" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={message}
            initial={reduce ? false : { y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { y: -14, opacity: 0 }}
            transition={{ duration: 0.24 }}
            className={cn(
              "font-medium text-honey-700 dark:text-honey-300",
              full ? "text-sm" : "text-xs"
            )}
          >
            {message}
          </motion.p>
        </AnimatePresence>
      </div>

      {!reduce && (
        <div className="relative mt-3 flex gap-1.5" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-honey-500"
              animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
