"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { useUIStore } from "@/store/ui";
import { Sidebar } from "@/components/layout/Sidebar";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Toaster } from "@/components/ui/Toaster";
import { ChatWidget } from "@/components/ai/ChatWidget";
import { useSocket } from "@/hooks/useSocket";
import { BeeLoader, MIN_LOADER_MS } from "@/components/ui/BeeLoader";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, initialized, init } = useAuthStore();
  const { connected } = useSocket();
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);

  const isAdminArea = pathname === "/admin" || pathname.startsWith("/admin/");
  const [minTimeUp, setMinTimeUp] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMinTimeUp(true), MIN_LOADER_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!initialized) init();
  }, [initialized, init]);

  useEffect(() => {
    if (minTimeUp && initialized && !loading && !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [minTimeUp, initialized, loading, user, router, pathname]);

  useEffect(() => {
    if (minTimeUp && initialized && !loading && user && isAdminArea && user.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [minTimeUp, initialized, loading, user, isAdminArea, router]);

  const authReady = initialized && !loading && !!user;

  /* Auth still resolving: only the loader can show. */
  if (!authReady) {
    return <BeeLoader full />;
  }

  if (isAdminArea && user.role !== "admin") {
    return <BeeLoader full label="Redirecting you…" />;
  }

  /* Auth known: mount children NOW so page data fetches overlap the
     brand-loader hold; the bee stays as an overlay until minTimeUp. */
  const coverLoader = !minTimeUp;
  const padClass = sidebarOpen ? "lg:pl-[16.25rem]" : "lg:pl-[5.5rem]";

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {coverLoader && (
        <div className="fixed inset-0 z-50 bg-zinc-50 dark:bg-zinc-950">
          <BeeLoader full />
        </div>
      )}
      {isAdminArea ? <AdminSidebar /> : <Sidebar />}
      <div className={`flex min-h-screen flex-col transition-[padding] duration-300 ${padClass}`}>
        <Topbar live={connected} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div key={pathname} className="page-enter mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
      <Toaster />
      {!isAdminArea && <ChatWidget />}
    </div>
  );
}
