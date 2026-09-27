"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useUIStore = create(
  persist(
    (set, get) => ({
      theme: "dark",
      fontSize: "md",
      sidebarOpen: true,
      toasts: [],

      toggleTheme: () =>
        set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),
      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

      addToast: (toast) => {
        const id = Date.now() + Math.random();
        const item = {
          id,
          type: "info",
          duration: 4000,
          ...toast,
        };
        /* same message already on screen (e.g. HTTP alert + its socket
           notification twin) -> don't stack a duplicate */
        if (item.message && get().toasts.some((t) => t.message === item.message)) {
          return id;
        }
        set((s) => ({ toasts: [...s.toasts, item] }));
        if (item.duration > 0) {
          setTimeout(() => {
            set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
          }, item.duration);
        }
        return id;
      },
      removeToast: (id) =>
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
    }),
    {
      name: "campus-coin-ui",
      partialize: (s) => ({ theme: s.theme, fontSize: s.fontSize, sidebarOpen: s.sidebarOpen }),
    }
  )
);
