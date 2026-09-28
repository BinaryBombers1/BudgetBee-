"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export const MIN_LOADER_MS = 800;
const FLIGHT_S = 4.4;

const MESSAGES = [
  "Waking up BudgetBee…",
  "Doing the waggle dance…",
  "Counting your coins…",
  "Fetching your transactions…",
  "Polishing the honeycomb…",
  "Buckling the budget…",
];

/** Smooth figure-8 (bee waggle dance) through the centre of a w×h box. */
export function figure8(w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const m = w * 0.03;
  const wx = w - m;
  const ax = (w / 2 - m) * 0.52;
  const by = h * 0.42;
  const by2 = h * 0.34;
  return [
    `M ${cx} ${cy}`,
    `C ${cx + ax} ${cy - by}, ${wx} ${cy - by2}, ${wx} ${cy}`,
    `C ${wx} ${cy + by2}, ${cx + ax} ${cy + by}, ${cx} ${cy}`,
    `C ${cx - ax} ${cy + by}, ${m} ${cy + by2}, ${m} ${cy}`,
    `C ${m} ${cy - by2}, ${cx - ax} ${cy - by}, ${cx} ${cy}`,
    "Z",
  ].join(" ");
}

export function BeeMascot({ size = 72, className, flutter = true, blink = true }) {
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
        animate={flutter ? { scaleY: [1, 0.5, 1] } : { scaleY: 1 }}
        transition={{ duration: 0.15, repeat: Infinity, ease: "easeInOut" }}
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
        <ellipse
          cx="27"
          cy="28"
          rx="12"
          ry="8.5"
          transform="rotate(-22 27 28)"
          fill="#FFFFFF"
          fillOpacity="0.3"
        />
        <ellipse
          cx="53"
          cy="28"
          rx="12"
          ry="8.5"
          transform="rotate(22 53 28)"
          fill="#FFFFFF"
          fillOpacity="0.3"
        />
      </motion.g>

      <ellipse cx="40" cy="46" rx="19" ry="16" fill="url(#beeBodyGrad)" />
      <g clipPath="url(#beeBodyClip)">
        <rect x="23" y="27" width="7" height="40" fill="#18181B" fillOpacity="0.85" transform="rotate(8 26 46)" />
        <rect x="50" y="27" width="7" height="40" fill="#18181B" fillOpacity="0.85" transform="rotate(8 53 46)" />
      </g>

      <motion.g
        initial={false}
        animate={blink ? { scaleY: [1, 1, 0.08, 1, 1] } : { scaleY: 1 }}
        transition={{
          duration: 4.2,
          repeat: Infinity,
          times: [0, 0.88, 0.91, 0.94, 1],
          ease: "easeInOut",
        }}
        style={{ transformOrigin: "40px 44px", transformBox: "view-box" }}
      >
        <circle cx="34.5" cy="44" r="3.5" fill="#18181B" />
        <circle cx="45.5" cy="44" r="3.5" fill="#18181B" />
        <circle cx="35.7" cy="42.7" r="1.15" fill="#FFFFFF" />
        <circle cx="46.7" cy="42.7" r="1.15" fill="#FFFFFF" />
      </motion.g>

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

const MOTES = [
  { left: "26%", delay: 0 },
  { left: "52%", delay: 1.3 },
  { left: "74%", delay: 2.4 },
];

export function BeeLoader({ full = false, label, className }) {
  const reduce = useReducedMotion();
  const [msgIndex, setMsgIndex] = useState(0);
  const trackRef = useRef(null);
  const [trackLen, setTrackLen] = useState(900);

  useEffect(() => {
    if (label) return undefined;
    const id = setInterval(() => setMsgIndex((i) => (i + 1) % MESSAGES.length), 2100);
    return () => clearInterval(id);
  }, [label]);

  useEffect(() => {
    const el = trackRef.current;
    if (el && typeof el.getTotalLength === "function") {
      try {
        setTrackLen(Math.round(el.getTotalLength()));
      } catch {
        /* keep fallback length */
      }
    }
  }, [full]);

  const w = full ? 280 : 224;
  const h = full ? 106 : 84;
  const d = figure8(w, h);
  const message = label || MESSAGES[msgIndex];
  const flying = !reduce;

  return (
    <div
      role="status"
      aria-label={message}
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden px-4 py-10 sm:px-6",
        full && "min-h-screen bg-zinc-50 dark:bg-zinc-950",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute left-1/2 top-1/2 h-[440px] w-[660px] max-w-[160%] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.16),transparent_65%)]" />
        <Hex className="left-[12%] top-[16%]" delay={0} size={full ? 72 : 52} />
        <Hex className="right-[14%] top-[22%]" delay={0.7} size={full ? 56 : 44} />
        <Hex className="bottom-[18%] left-[18%]" delay={1.3} size={full ? 48 : 40} />
        <Hex className="bottom-[14%] right-[16%]" delay={1.9} size={full ? 68 : 48} />
        <Hex className="left-[46%] top-[8%]" delay={1.1} size={full ? 40 : 32} />
        {MOTES.map((m, i) => (
          <motion.span
            key={i}
            className="absolute bottom-10 h-1.5 w-1.5 rounded-full bg-honey-400"
            style={{ left: m.left }}
            animate={flying ? { y: [-8, -78], opacity: [0, 0.9, 0] } : {}}
            transition={{ duration: 3.4, repeat: Infinity, delay: m.delay, ease: "easeOut" }}
          />
        ))}
      </div>

      <div
        className="relative"
        style={{ width: w, height: h, "--bee-dur": `${FLIGHT_S}s` }}
      >
        <svg
          width={w}
          height={h}
          viewBox={`0 0 ${w} ${h}`}
          className="absolute inset-0"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id="beeCometGrad"
              x1="0"
              y1="0"
              x2={w}
              y2={h}
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#FDE68A" stopOpacity="0.95" />
              <stop offset="1" stopColor="#F59E0B" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          <path
            ref={trackRef}
            d={d}
            stroke="#F59E0B"
            strokeOpacity="0.3"
            strokeWidth="2"
            strokeDasharray="6 9"
            className="bee-track"
          />
          <path
            d={d}
            stroke="url(#beeCometGrad)"
            strokeWidth="3"
            strokeLinecap="round"
            className="bee-comet"
            style={{
              "--bee-len": trackLen,
              strokeDasharray: `54 ${Math.max(trackLen - 54, 1)}`,
            }}
          />
        </svg>

        <div className="absolute inset-0">
          <div
            className="bee-flyer absolute left-0 top-0"
            style={{
              offsetPath: `path("${d}")`,
              offsetRotate: "auto 90deg",
              offsetDistance: "0%",
            }}
          >
            <motion.div
              animate={flying ? { y: [0, -4, 0], rotate: [-4, 4, -4] } : {}}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              className="drop-shadow-[0_6px_14px_rgba(245,158,11,0.5)]"
            >
              <BeeMascot size={full ? 76 : 58} flutter={!reduce} />
            </motion.div>
          </div>
        </div>
      </div>

      <div className="relative mt-5 flex items-center gap-2.5">
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
            initial={reduce ? false : { y: 14, opacity: 0, filter: "blur(8px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={reduce ? { opacity: 0 } : { y: -14, opacity: 0, filter: "blur(8px)" }}
            transition={{ duration: 0.26 }}
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
