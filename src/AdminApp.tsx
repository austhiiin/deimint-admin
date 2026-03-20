import { useState } from "react";
import { useAuth } from "@/admin/hooks/useAuth";
import AdminLayout from "@/admin/components/AdminLayout";
import LoginPage from "@/admin/pages/LoginPage";
import DashboardPage from "@/admin/pages/DashboardPage";
import CommissionsPage from "@/admin/pages/CommissionsPage";
import GalleryAdminPage from "@/admin/pages/GalleryAdminPage";
import MessagesPage from "@/admin/pages/MessagesPage";
import SettingsPage from "@/admin/pages/SettingsPage";
import { useMessages } from "@/admin/hooks/useAdmin";

function AdminRouter({ page }: { page: string }) {
  switch (page) {
    case "dashboard":   return <DashboardPage />;
    case "commissions": return <CommissionsPage />;
    case "gallery":     return <GalleryAdminPage />;
    case "messages":    return <MessagesPage />;
    case "settings":    return <SettingsPage />;
    default:            return <DashboardPage />;
  }
}

function AdminShell({ user }: { user: NonNullable<ReturnType<typeof useAuth>["user"]> }) {
  const [page, setPage] = useState("dashboard");
  const { data: messages } = useMessages();
  const unread = messages.filter((m) => !m.read).length;

  return (
    <AdminLayout user={user} activePage={page} onNavigate={setPage} unreadCount={unread}>
      <AdminRouter page={page} />
    </AdminLayout>
  );
}

export default function AdminApp() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--bg)" }}
      >
        <svg
          className="w-8 h-8 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          style={{ color: "#8367c7" }}
        >
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.25" />
          <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  if (!user) return <LoginPage />;
  return <AdminShell user={user} />;
}