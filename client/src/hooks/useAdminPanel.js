"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

/** True until the server says ADMIN_PANEL_ENABLED=false (kill-switch). */
export function useAdminPanel() {
  const [enabled, setEnabled] = useState(true);
  useEffect(() => {
    let alive = true;
    api
      .get("/config")
      .then((r) => {
        if (alive) setEnabled(r?.data?.adminPanel !== false);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return enabled;
}
