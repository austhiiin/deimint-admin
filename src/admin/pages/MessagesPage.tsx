import { useState } from "react";
import { useMessages } from "@/admin/hooks/useAdmin";
import type { ContactMessage } from "@/types";

export default function MessagesPage() {
  const { data, loading, markRead, remove } = useMessages();
  const [selected, setSelected] = useState<ContactMessage | null>(null);

  const handleSelect = async (m: ContactMessage) => {
    setSelected(m);
    if (!m.read) await markRead(m.id, true);
  };

  return (
    <div style={{ padding: "2rem 2.5rem", height: "calc(100vh - 4rem)", maxWidth: 1100, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "1.25rem", flex: 1, minHeight: 0 }}>

        {/* List panel */}
        <div style={{ background: "#fff", border: "1px solid #EDE9FE", borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 1px 4px rgba(124,58,237,0.06)" }}>
          <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #F3F0FF", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <h2 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600, color: "#1F1235" }}>Inbox</h2>
            {data.filter(m => !m.read).length > 0 && (
              <span style={{ padding: "2px 8px", borderRadius: 20, background: "linear-gradient(135deg,#7C3AED,#A78BFA)", color: "#fff", fontSize: "0.65rem", fontWeight: 700 }}>
                {data.filter(m => !m.read).length}
              </span>
            )}
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {loading ? (
              <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: 8 }}>
                {[...Array(4)].map((_, i) => <div key={i} style={{ height: 60, borderRadius: 10, background: "#F5F3FF" }} />)}
              </div>
            ) : data.length === 0 ? (
              <p style={{ padding: "2rem", textAlign: "center", color: "#9CA3AF", fontSize: "0.875rem", margin: 0 }}>No messages yet.</p>
            ) : data.map(m => (
              <button key={m.id} onClick={() => handleSelect(m)} style={{
                width: "100%", textAlign: "left", padding: "0.875rem 1.25rem",
                display: "flex", alignItems: "flex-start", gap: 10, border: "none",
                borderBottom: "1px solid #F9F7FF", cursor: "pointer",
                background: selected?.id === m.id ? "#F5F3FF" : "#fff",
                transition: "background 0.1s"
              }}
                onMouseEnter={e => { if (selected?.id !== m.id) (e.currentTarget as HTMLElement).style.background = "#FAFAFA"; }}
                onMouseLeave={e => { if (selected?.id !== m.id) (e.currentTarget as HTMLElement).style.background = "#fff"; }}
              >
                <div style={{ marginTop: 6, width: 7, height: 7, borderRadius: "50%", flexShrink: 0, background: m.read ? "transparent" : "#7C3AED", border: m.read ? "1.5px solid #D1D5DB" : "none" }} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 4 }}>
                    <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: m.read ? 400 : 600, color: "#1F1235", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.name}</p>
                    <span style={{ flexShrink: 0, fontSize: "0.65rem", color: "#C4B5FD" }}>{new Date(m.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                  </div>
                  <p style={{ margin: "2px 0 0", fontSize: "0.78rem", color: "#9CA3AF", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {m.subject ?? m.message.slice(0, 45)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        <div style={{ background: "#fff", border: "1px solid #EDE9FE", borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 1px 4px rgba(124,58,237,0.06)" }}>
          {!selected ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, color: "#D1D5DB" }}>
              <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <p style={{ margin: 0, fontSize: "0.875rem", color: "#9CA3AF" }}>Select a message to read</p>
            </div>
          ) : (
            <>
              {/* Message header */}
              <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #F3F0FF", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                  <div style={{ minWidth: 0 }}>
                    <h3 style={{ margin: "0 0 4px", fontSize: "1rem", fontWeight: 600, color: "#1F1235" }}>
                      {selected.subject ?? "No Subject"}
                    </h3>
                    <p style={{ margin: 0, fontSize: "0.8rem", color: "#6B7280" }}>
                      From <strong style={{ color: "#4B5563" }}>{selected.name}</strong>
                      {" · "}
                      <a href={`mailto:${selected.email}`} style={{ color: "#7C3AED", textDecoration: "none" }}>{selected.email}</a>
                    </p>
                  </div>
                  <button onClick={async () => { await remove(selected.id); setSelected(null); }} title="Delete"
                    style={{ flexShrink: 0, padding: 8, borderRadius: 10, border: "none", background: "none", cursor: "pointer", color: "#9CA3AF", display: "flex" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#FEF2F2"; (e.currentTarget as HTMLElement).style.color = "#DC2626"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "none"; (e.currentTarget as HTMLElement).style.color = "#9CA3AF"; }}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 16 16">
                      <polyline points="2 4 14 4" /><path d="M5 4V2h6v2M6 7v5M10 7v5" /><path d="M3 4l1 10h8l1-10" />
                    </svg>
                  </button>
                </div>
                {/* Meta badges */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                  {[selected.medium, selected.budget].filter(Boolean).map(v => (
                    <span key={v} style={{ padding: "3px 10px", borderRadius: 20, background: "#EDE9FE", color: "#7C3AED", fontSize: "0.7rem", fontWeight: 500 }}>{v}</span>
                  ))}
                  <span style={{ padding: "3px 10px", borderRadius: 20, background: "#F3F4F6", color: "#9CA3AF", fontSize: "0.7rem" }}>
                    {new Date(selected.created_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
                  </span>
                </div>
              </div>

              {/* Message body */}
              <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>
                <p style={{ margin: 0, fontSize: "0.9rem", color: "#374151", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                  {selected.message}
                </p>
              </div>

              {/* Reply footer */}
              <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid #F3F0FF", flexShrink: 0 }}>
                <a href={`mailto:${selected.email}?subject=Re: ${selected.subject ?? "Your commission enquiry"}`}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "0.5rem 1.25rem", borderRadius: 50, background: "linear-gradient(135deg,#7C3AED,#A78BFA)", color: "#fff", textDecoration: "none", fontSize: "0.8rem", fontWeight: 600 }}>
                  Reply via Email
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 16 16"><path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}