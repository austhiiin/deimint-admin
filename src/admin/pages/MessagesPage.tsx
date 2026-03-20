import { useState } from "react";
import { useMessages } from "@/admin/hooks/useAdmin";
import type { ContactMessage } from "@/types";

export default function MessagesPage() {
  const { data, loading, markRead, remove } = useMessages();
  const [selected, setSelected] = useState<ContactMessage|null>(null);

  const handleSelect = async (m: ContactMessage) => {
    setSelected(m);
    if (!m.read) await markRead(m.id, true);
  };

  return (
    <div className="max-w-6xl h-[calc(100vh-8rem)]">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-5 h-full">

        {/* List panel */}
        <div
          className="md:col-span-2 rounded-2xl overflow-hidden flex flex-col"
          style={{ background:"rgba(255,255,255,0.7)",backdropFilter:"blur(16px)",border:"1px solid rgba(255,255,255,0.9)",boxShadow:"0 4px 16px rgba(86,3,173,0.06)" }}
        >
          <div className="px-5 py-4 border-b shrink-0" style={{ borderColor:"rgba(131,103,199,0.1)" }}>
            <h2 style={{ fontFamily:"var(--font-display)",fontSize:"1rem",fontWeight:700,color:"var(--fg)" }}>
              Inbox
              {data.filter(m=>!m.read).length > 0 && (
                <span className="ml-2 text-xs px-2 py-0.5 rounded-full text-white" style={{ background:"linear-gradient(135deg,#5603ad,#8367c7)",fontFamily:"var(--font-mono)" }}>
                  {data.filter(m=>!m.read).length}
                </span>
              )}
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto divide-y" style={{ '--tw-divide-color':'rgba(131,103,199,0.07)' } as React.CSSProperties}>
            {loading ? (
              <div className="p-4 space-y-3">
                {[...Array(4)].map((_,i)=><div key={i} className="h-14 rounded-xl animate-pulse" style={{ background:"rgba(131,103,199,0.07)" }}/>)}
              </div>
            ) : data.length === 0 ? (
              <p className="p-8 text-center" style={{ fontFamily:"var(--font-sans)",fontSize:"0.85rem",color:"var(--fg-subtle)" }}>No messages yet.</p>
            ) : data.map(m => (
              <button
                key={m.id}
                onClick={()=>handleSelect(m)}
                className="w-full text-left px-5 py-3.5 flex items-start gap-3 transition-colors"
                style={{ background: selected?.id === m.id ? "rgba(86,3,173,0.05)" : "transparent" }}
                onMouseEnter={e=>{ if(selected?.id!==m.id)(e.currentTarget as HTMLElement).style.background="rgba(131,103,199,0.04)"; }}
                onMouseLeave={e=>{ if(selected?.id!==m.id)(e.currentTarget as HTMLElement).style.background="transparent"; }}
              >
                <div className="mt-1.5 w-2 h-2 rounded-full shrink-0" style={{ background:m.read?"transparent":"#5603ad", border:m.read?"1.5px solid #8a7fab":"none" }}/>
                <div className="min-w-0">
                  <p style={{ fontFamily:"var(--font-sans)",fontWeight:m.read?400:600,fontSize:"0.875rem",color:"var(--fg)" }}>{m.name}</p>
                  <p style={{ fontFamily:"var(--font-sans)",fontSize:"0.78rem",color:"var(--fg-muted)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
                    {m.subject ?? m.message.slice(0,40)}
                  </p>
                  <p style={{ fontFamily:"var(--font-mono)",fontSize:"0.58rem",color:"var(--fg-subtle)",marginTop:"2px" }}>
                    {new Date(m.created_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        <div
          className="md:col-span-3 rounded-2xl overflow-hidden flex flex-col"
          style={{ background:"rgba(255,255,255,0.7)",backdropFilter:"blur(16px)",border:"1px solid rgba(255,255,255,0.9)",boxShadow:"0 4px 16px rgba(86,3,173,0.06)" }}
        >
          {!selected ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3" style={{ color:"var(--fg-subtle)" }}>
              <svg className="w-10 h-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
              </svg>
              <p style={{ fontFamily:"var(--font-sans)",fontSize:"0.875rem" }}>Select a message to read</p>
            </div>
          ) : (
            <>
              <div className="px-6 py-4 border-b shrink-0" style={{ borderColor:"rgba(131,103,199,0.1)" }}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 style={{ fontFamily:"var(--font-display)",fontSize:"1.1rem",fontWeight:700,color:"var(--fg)",marginBottom:"2px" }}>
                      {selected.subject ?? "No Subject"}
                    </h3>
                    <p style={{ fontFamily:"var(--font-sans)",fontSize:"0.8rem",color:"var(--fg-muted)" }}>
                      From <strong>{selected.name}</strong> · <a href={`mailto:${selected.email}`} style={{ color:"#5603ad" }}>{selected.email}</a>
                    </p>
                  </div>
                  <button
                    onClick={async()=>{ await remove(selected.id); setSelected(null); }}
                    className="shrink-0 p-2 rounded-lg transition-colors"
                    style={{ color:"var(--fg-subtle)" }}
                    onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background="rgba(229,62,62,0.08)";(e.currentTarget as HTMLElement).style.color="#e53e3e";}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="transparent";(e.currentTarget as HTMLElement).style.color="var(--fg-subtle)";}}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.8">
                      <polyline points="2 4 14 4"/><path d="M5 4V2h6v2M6 7v5M10 7v5"/><path d="M3 4l1 10h8l1-10"/>
                    </svg>
                  </button>
                </div>
                {/* Meta badges */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {[selected.medium, selected.budget].filter(Boolean).map(v => (
                    <span key={v} className="px-2.5 py-1 rounded-full text-xs" style={{ background:"rgba(179,233,199,0.4)",color:"var(--purple)",fontFamily:"var(--font-mono)",fontSize:"0.6rem" }}>
                      {v}
                    </span>
                  ))}
                  <span className="px-2.5 py-1 rounded-full text-xs" style={{ background:"rgba(131,103,199,0.08)",color:"var(--fg-subtle)",fontFamily:"var(--font-mono)",fontSize:"0.58rem" }}>
                    {new Date(selected.created_at).toLocaleString("en-US",{dateStyle:"medium",timeStyle:"short"})}
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5">
                <p style={{ fontFamily:"var(--font-sans)",fontSize:"0.9rem",color:"var(--fg-muted)",lineHeight:1.8,whiteSpace:"pre-wrap" }}>
                  {selected.message}
                </p>
              </div>

              <div className="px-6 py-4 border-t shrink-0" style={{ borderColor:"rgba(131,103,199,0.1)" }}>
                <a href={`mailto:${selected.email}?subject=Re: ${selected.subject ?? "Your commission enquiry"}`} className="btn-primary text-xs px-5 py-2.5">
                  Reply via Email →
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}