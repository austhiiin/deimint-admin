import { useCommissions, useMessages } from "@/admin/hooks/useAdmin";
import { STATUS_COLORS, STATUS_LABELS } from "@/types";

export default function DashboardPage() {
  const { data: commissions, loading: cLoading } = useCommissions();
  const { data: messages,    loading: mLoading  } = useMessages();

  const stats = [
    { label:"Total Commissions", value: commissions.length, color:"#5603ad" },
    { label:"Active",            value: commissions.filter(c => !["completed","cancelled"].includes(c.status)).length, color:"#8367c7" },
    { label:"Completed",         value: commissions.filter(c => c.status === "completed").length, color:"#10b981" },
    { label:"Unread Messages",   value: messages.filter(m => !m.read).length, color:"#f59e0b" },
  ];

  const recentCommissions = commissions.slice(0, 5);
  const recentMessages    = messages.slice(0, 4);

  if (cLoading || mLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_,i) => (
          <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background:"rgba(131,103,199,0.08)" }}/>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div
            key={s.label}
            className="p-5 rounded-2xl"
            style={{ background:"rgba(255,255,255,0.7)", backdropFilter:"blur(16px)", border:"1px solid rgba(255,255,255,0.9)", boxShadow:"0 4px 16px rgba(86,3,173,0.06)" }}
          >
            <p style={{ fontFamily:"var(--font-display)", fontSize:"2.2rem", fontWeight:700, color:s.color, lineHeight:1 }}>
              {s.value}
            </p>
            <p style={{ fontFamily:"var(--font-mono)", fontSize:"0.6rem", letterSpacing:"0.15em", textTransform:"uppercase", color:"var(--fg-subtle)", marginTop:"6px" }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent commissions */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background:"rgba(255,255,255,0.7)", backdropFilter:"blur(16px)", border:"1px solid rgba(255,255,255,0.9)", boxShadow:"0 4px 16px rgba(86,3,173,0.06)" }}
        >
          <div className="px-5 py-4 border-b" style={{ borderColor:"rgba(131,103,199,0.1)" }}>
            <h2 style={{ fontFamily:"var(--font-display)", fontSize:"1rem", fontWeight:700, color:"var(--fg)" }}>Recent Commissions</h2>
          </div>
          <div className="divide-y" style={{ '--tw-divide-opacity':1 } as React.CSSProperties}>
            {recentCommissions.length === 0 && (
              <p className="px-5 py-8 text-center" style={{ fontFamily:"var(--font-sans)", fontSize:"0.85rem", color:"var(--fg-subtle)" }}>No commissions yet.</p>
            )}
            {recentCommissions.map(c => (
              <div key={c.id} className="px-5 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p style={{ fontFamily:"var(--font-sans)", fontWeight:500, fontSize:"0.875rem", color:"var(--fg)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {c.client_name}
                  </p>
                  <p style={{ fontFamily:"var(--font-mono)", fontSize:"0.6rem", color:"var(--fg-subtle)", textTransform:"uppercase", letterSpacing:"0.08em" }}>
                    {c.medium ?? "—"} {c.price ? `· $${c.price}` : ""}
                  </p>
                </div>
                <span
                  className="shrink-0 px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{ background:`${STATUS_COLORS[c.status]}18`, color:STATUS_COLORS[c.status], fontFamily:"var(--font-mono)", fontSize:"0.6rem", letterSpacing:"0.08em", textTransform:"uppercase" }}
                >
                  {STATUS_LABELS[c.status]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent messages */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background:"rgba(255,255,255,0.7)", backdropFilter:"blur(16px)", border:"1px solid rgba(255,255,255,0.9)", boxShadow:"0 4px 16px rgba(86,3,173,0.06)" }}
        >
          <div className="px-5 py-4 border-b" style={{ borderColor:"rgba(131,103,199,0.1)" }}>
            <h2 style={{ fontFamily:"var(--font-display)", fontSize:"1rem", fontWeight:700, color:"var(--fg)" }}>Recent Messages</h2>
          </div>
          <div>
            {recentMessages.length === 0 && (
              <p className="px-5 py-8 text-center" style={{ fontFamily:"var(--font-sans)", fontSize:"0.85rem", color:"var(--fg-subtle)" }}>No messages yet.</p>
            )}
            {recentMessages.map(m => (
              <div key={m.id} className="px-5 py-3 flex items-start gap-3 border-b last:border-0" style={{ borderColor:"rgba(131,103,199,0.08)" }}>
                <div
                  className="mt-1 w-2 h-2 rounded-full shrink-0"
                  style={{ background: m.read ? "transparent" : "#5603ad", border: m.read ? "1.5px solid #8a7fab" : "none" }}
                />
                <div className="min-w-0">
                  <p style={{ fontFamily:"var(--font-sans)", fontWeight:500, fontSize:"0.875rem", color:"var(--fg)" }}>{m.name}</p>
                  <p style={{ fontFamily:"var(--font-sans)", fontSize:"0.78rem", color:"var(--fg-muted)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {m.subject ?? m.message.slice(0, 50)}
                  </p>
                  <p style={{ fontFamily:"var(--font-mono)", fontSize:"0.58rem", color:"var(--fg-subtle)", marginTop:"2px" }}>
                    {new Date(m.created_at).toLocaleDateString("en-US",{ month:"short", day:"numeric", year:"numeric" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}