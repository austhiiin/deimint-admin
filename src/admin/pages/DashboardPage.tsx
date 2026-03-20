import { useCommissions, useMessages } from "@/admin/hooks/useAdmin";
import { STATUS_COLORS, STATUS_LABELS } from "@/types";

export default function DashboardPage() {
  const { data: commissions, loading: cLoading } = useCommissions();
  const { data: messages, loading: mLoading } = useMessages();

  const stats = [
    { label: "Total Commissions", value: commissions.length, accent: "#7C3AED" },
    { label: "Active", value: commissions.filter(c => !["completed", "cancelled"].includes(c.status)).length, accent: "#8B5CF6" },
    { label: "Completed", value: commissions.filter(c => c.status === "completed").length, accent: "#10B981" },
    { label: "Unread Messages", value: messages.filter(m => !m.read).length, accent: "#F59E0B" },
  ];

  const recentCommissions = commissions.slice(0, 5);
  const recentMessages = messages.slice(0, 5);

  return (
    <div style={{ maxWidth: 1100, padding: "2rem 2.5rem" }}>
      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.25rem", marginBottom: "2rem" }}>
        {stats.map(s => (
          <div key={s.label} style={{
            background: "#fff",
            border: "1px solid #EDE9FE",
            borderRadius: 16,
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: 8,
            boxShadow: "0 1px 4px rgba(124,58,237,0.06)"
          }}>
            {cLoading || mLoading ? (
              <div style={{ height: 44, borderRadius: 8, background: "#F5F3FF", animation: "pulse 1.5s infinite" }} />
            ) : (
              <span style={{ fontSize: "2.75rem", fontWeight: 700, color: s.accent, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                {s.value}
              </span>
            )}
            <span style={{ fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#9CA3AF", fontWeight: 500 }}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Two-column content */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
        {/* Recent Commissions */}
        <div style={{ background: "#fff", border: "1px solid #EDE9FE", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 4px rgba(124,58,237,0.06)" }}>
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #F3F0FF" }}>
            <h2 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600, color: "#1F1235", letterSpacing: "-0.01em" }}>Recent Commissions</h2>
          </div>
          <div>
            {cLoading ? (
              <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: 12 }}>
                {[...Array(3)].map((_, i) => <div key={i} style={{ height: 40, borderRadius: 8, background: "#F5F3FF" }} />)}
              </div>
            ) : recentCommissions.length === 0 ? (
              <p style={{ padding: "2.5rem", textAlign: "center", color: "#9CA3AF", fontSize: "0.875rem", margin: 0 }}>No commissions yet.</p>
            ) : recentCommissions.map((c, i) => (
              <div key={c.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "0.875rem 1.5rem",
                borderBottom: i < recentCommissions.length - 1 ? "1px solid #F9F7FF" : "none",
                gap: 12
              }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: 500, color: "#1F1235", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {c.client_name}
                  </p>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "#9CA3AF", marginTop: 2 }}>
                    {c.medium ?? "—"}{c.price ? ` · $${c.price}` : ""}
                  </p>
                </div>
                <span style={{
                  flexShrink: 0, padding: "3px 10px", borderRadius: 20, fontSize: "0.65rem",
                  fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
                  background: `${STATUS_COLORS[c.status]}18`, color: STATUS_COLORS[c.status]
                }}>
                  {STATUS_LABELS[c.status]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Messages */}
        <div style={{ background: "#fff", border: "1px solid #EDE9FE", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 4px rgba(124,58,237,0.06)" }}>
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #F3F0FF" }}>
            <h2 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600, color: "#1F1235", letterSpacing: "-0.01em" }}>Recent Messages</h2>
          </div>
          <div>
            {mLoading ? (
              <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: 12 }}>
                {[...Array(3)].map((_, i) => <div key={i} style={{ height: 40, borderRadius: 8, background: "#F5F3FF" }} />)}
              </div>
            ) : recentMessages.length === 0 ? (
              <p style={{ padding: "2.5rem", textAlign: "center", color: "#9CA3AF", fontSize: "0.875rem", margin: 0 }}>No messages yet.</p>
            ) : recentMessages.map((m, i) => (
              <div key={m.id} style={{
                display: "flex", alignItems: "flex-start", gap: 12,
                padding: "0.875rem 1.5rem",
                borderBottom: i < recentMessages.length - 1 ? "1px solid #F9F7FF" : "none"
              }}>
                <div style={{
                  marginTop: 5, width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                  background: m.read ? "transparent" : "#7C3AED",
                  border: m.read ? "1.5px solid #D1D5DB" : "none"
                }} />
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: m.read ? 400 : 600, color: "#1F1235" }}>{m.name}</p>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "#9CA3AF", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {m.subject ?? m.message.slice(0, 50)}
                  </p>
                </div>
                <span style={{ flexShrink: 0, fontSize: "0.7rem", color: "#C4B5FD", marginLeft: "auto" }}>
                  {new Date(m.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  );
}