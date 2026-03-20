import { useState } from "react";
import { useCommissions } from "@/admin/hooks/useAdmin";
import { STATUS_COLORS, STATUS_LABELS, type Commission, type CommissionStatus } from "@/types";

const STATUSES: CommissionStatus[] = ["queued","sketching","painting","completed","cancelled"];
const MEDIUMS = ["Digital Art","Traditional / Oil","Watercolour","Gouache","Mixed Media"];

interface FormState {
  client_name: string; client_email: string; status: CommissionStatus;
  queue_pos: number; medium: string; price: string; notes: string; preview_url: string;
}

const EMPTY: FormState = { client_name:"", client_email:"", status:"queued", queue_pos:0, medium:"", price:"", notes:"", preview_url:"" };

function CommissionModal({ commission, onClose, onSave }: {
  commission: Commission | null;
  onClose: () => void;
  onSave: (data: FormState) => Promise<void>;
}) {
  const [form, setForm]   = useState<FormState>(
    commission
      ? { client_name:commission.client_name, client_email:commission.client_email??"", status:commission.status, queue_pos:commission.queue_pos, medium:commission.medium??"", price:commission.price?.toString()??"", notes:commission.notes??"", preview_url:commission.preview_url??"" }
      : EMPTY
  );
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<string|null>(null);

  const set = (k: keyof FormState, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.client_name.trim()) { setError("Client name is required."); return; }
    setSaving(true);
    try { await onSave(form); onClose(); }
    catch (e) { setError(e instanceof Error ? e.message : "Save failed."); }
    finally { setSaving(false); }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose}/>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-xl rounded-3xl overflow-hidden"
          style={{ background:"rgba(255,255,255,0.92)", backdropFilter:"blur(32px)", border:"1px solid rgba(255,255,255,0.95)", boxShadow:"0 24px 80px rgba(86,3,173,0.15)" }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-7 py-5 border-b flex items-center justify-between" style={{ borderColor:"rgba(131,103,199,0.1)" }}>
            <h2 style={{ fontFamily:"var(--font-display)", fontSize:"1.3rem", fontWeight:700, color:"var(--fg)" }}>
              {commission ? "Edit Commission" : "New Commission"}
            </h2>
            <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color:"var(--fg-subtle)" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background="rgba(131,103,199,0.1)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background="transparent"}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 3l10 10M13 3L3 13" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          <div className="px-7 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="field-label">Client Name *</label>
                <input value={form.client_name} onChange={e => set("client_name",e.target.value)} className="input-glass" placeholder="Full name"/>
              </div>
              <div>
                <label className="field-label">Client Email</label>
                <input value={form.client_email} onChange={e => set("client_email",e.target.value)} className="input-glass" placeholder="email@example.com" type="email"/>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="field-label">Status</label>
                <select value={form.status} onChange={e => set("status", e.target.value as CommissionStatus)} className="input-glass">
                  {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">Queue Position</label>
                <input value={form.queue_pos} onChange={e => set("queue_pos", parseInt(e.target.value)||0)} className="input-glass" type="number" min="0"/>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="field-label">Medium</label>
                <select value={form.medium} onChange={e => set("medium",e.target.value)} className="input-glass">
                  <option value="">Select…</option>
                  {MEDIUMS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">Price ($)</label>
                <input value={form.price} onChange={e => set("price",e.target.value)} className="input-glass" type="number" min="0" step="0.01" placeholder="0.00"/>
              </div>
            </div>

            <div>
              <label className="field-label">Preview URL</label>
              <input value={form.preview_url} onChange={e => set("preview_url",e.target.value)} className="input-glass" placeholder="https://…"/>
            </div>

            <div>
              <label className="field-label">Internal Notes</label>
              <textarea value={form.notes} onChange={e => set("notes",e.target.value)} className="input-glass resize-none" rows={3} placeholder="Notes visible only to you…"/>
            </div>

            {error && <p className="text-sm px-3 py-2 rounded-xl" style={{ background:"rgba(229,62,62,0.08)", color:"#c53030" }}>{error}</p>}
          </div>

          <div className="px-7 py-4 border-t flex justify-end gap-3" style={{ borderColor:"rgba(131,103,199,0.1)" }}>
            <button onClick={onClose} className="btn-ghost px-5 py-2 text-xs">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary px-5 py-2 text-xs" style={{ opacity:saving?0.7:1 }}>
              {saving ? "Saving…" : commission ? "Save Changes" : "Create"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function CommissionsPage() {
  const { data, loading, create, update, remove } = useCommissions();
  const [modal, setModal]         = useState<"create"|Commission|null>(null);
  const [deleteId, setDeleteId]   = useState<string|null>(null);
  const [filterStatus, setFilter] = useState<CommissionStatus|"all">("all");
  const [search, setSearch]       = useState("");

  const filtered = data.filter(c => {
    const matchStatus = filterStatus === "all" || c.status === filterStatus;
    const matchSearch = !search || c.client_name.toLowerCase().includes(search.toLowerCase()) || c.client_email?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleSave = async (form: FormState) => {
    const payload = {
      client_name:  form.client_name,
      client_email: form.client_email || undefined,
      status:       form.status,
      queue_pos:    form.queue_pos,
      medium:       form.medium || undefined,
      price:        form.price ? parseFloat(form.price) : undefined,
      notes:        form.notes || undefined,
      preview_url:  form.preview_url || undefined,
    };
    if (modal && modal !== "create") await update((modal as Commission).id, payload);
    else await create(payload);
  };

  return (
    <div className="max-w-6xl space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="input-glass"
          style={{ maxWidth:"240px" }}
        />
        <select
          value={filterStatus}
          onChange={e => setFilter(e.target.value as CommissionStatus|"all")}
          className="input-glass"
          style={{ maxWidth:"160px" }}
        >
          <option value="all">All statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
        <button onClick={() => setModal("create")} className="btn-primary ml-auto text-xs px-4 py-2.5">
          + New Commission
        </button>
      </div>

      {/* Table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background:"rgba(255,255,255,0.7)", backdropFilter:"blur(16px)", border:"1px solid rgba(255,255,255,0.9)", boxShadow:"0 4px 16px rgba(86,3,173,0.06)" }}
      >
        {loading ? (
          <div className="p-8 space-y-3">
            {[...Array(4)].map((_,i) => <div key={i} className="h-10 rounded-xl animate-pulse" style={{ background:"rgba(131,103,199,0.07)" }}/>)}
          </div>
        ) : filtered.length === 0 ? (
          <p className="p-10 text-center" style={{ fontFamily:"var(--font-sans)", color:"var(--fg-subtle)", fontSize:"0.875rem" }}>No commissions found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom:"1px solid rgba(131,103,199,0.1)" }}>
                {["#","Client","Email","Medium","Status","Price","Updated","Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left" style={{ fontFamily:"var(--font-mono)", fontSize:"0.6rem", letterSpacing:"0.15em", textTransform:"uppercase", color:"var(--fg-subtle)", fontWeight:400 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-purple-50/30 transition-colors" style={{ borderColor:"rgba(131,103,199,0.07)" }}>
                  <td className="px-4 py-3" style={{ fontFamily:"var(--font-mono)", fontSize:"0.75rem", color:"var(--fg-subtle)" }}>{c.queue_pos || "—"}</td>
                  <td className="px-4 py-3" style={{ fontFamily:"var(--font-sans)", fontWeight:500, color:"var(--fg)" }}>{c.client_name}</td>
                  <td className="px-4 py-3" style={{ fontFamily:"var(--font-sans)", fontSize:"0.8rem", color:"var(--fg-muted)" }}>{c.client_email ?? "—"}</td>
                  <td className="px-4 py-3" style={{ fontFamily:"var(--font-sans)", fontSize:"0.8rem", color:"var(--fg-muted)" }}>{c.medium ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className="px-2.5 py-1 rounded-full text-xs" style={{ background:`${STATUS_COLORS[c.status]}18`, color:STATUS_COLORS[c.status], fontFamily:"var(--font-mono)", fontSize:"0.6rem", letterSpacing:"0.08em", textTransform:"uppercase" }}>
                      {STATUS_LABELS[c.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3" style={{ fontFamily:"var(--font-mono)", fontSize:"0.78rem", color:"var(--fg-muted)" }}>
                    {c.price ? `$${c.price}` : "—"}
                  </td>
                  <td className="px-4 py-3" style={{ fontFamily:"var(--font-mono)", fontSize:"0.7rem", color:"var(--fg-subtle)" }}>
                    {new Date(c.updated_at).toLocaleDateString("en-US",{ month:"short", day:"numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setModal(c)} className="p-1.5 rounded-lg transition-colors" style={{ color:"var(--fg-subtle)" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background="rgba(86,3,173,0.08)"; (e.currentTarget as HTMLElement).style.color="#5603ad"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background="transparent"; (e.currentTarget as HTMLElement).style.color="var(--fg-subtle)"; }}>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.8">
                          <path d="M11 2L14 5l-8 8H3v-3L11 2z"/>
                        </svg>
                      </button>
                      <button onClick={() => setDeleteId(c.id)} className="p-1.5 rounded-lg transition-colors" style={{ color:"var(--fg-subtle)" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background="rgba(229,62,62,0.08)"; (e.currentTarget as HTMLElement).style.color="#e53e3e"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background="transparent"; (e.currentTarget as HTMLElement).style.color="var(--fg-subtle)"; }}>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.8">
                          <polyline points="2 4 14 4"/><path d="M5 4V2h6v2M6 7v5M10 7v5"/><path d="M3 4l1 10h8l1-10"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modals */}
      {modal !== null && (
        <CommissionModal
          commission={modal === "create" ? null : modal as Commission}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {deleteId && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={() => setDeleteId(null)}/>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm rounded-2xl p-6 text-center" style={{ background:"rgba(255,255,255,0.95)", backdropFilter:"blur(24px)", border:"1px solid rgba(255,255,255,0.9)", boxShadow:"0 16px 60px rgba(86,3,173,0.15)" }}>
              <p style={{ fontFamily:"var(--font-display)", fontSize:"1.2rem", fontWeight:700, color:"var(--fg)", marginBottom:"8px" }}>Delete Commission?</p>
              <p style={{ fontFamily:"var(--font-sans)", fontSize:"0.85rem", color:"var(--fg-muted)", marginBottom:"20px" }}>This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="btn-ghost flex-1 justify-center text-xs">Cancel</button>
                <button
                  onClick={async () => { await remove(deleteId); setDeleteId(null); }}
                  className="flex-1 py-3 rounded-full text-xs font-medium text-white transition-all"
                  style={{ background:"linear-gradient(135deg,#e53e3e,#c53030)", boxShadow:"0 4px 16px rgba(229,62,62,0.3)" }}
                >Delete</button>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`.field-label { display:block; font-family:var(--font-mono); font-size:0.6rem; letter-spacing:0.2em; text-transform:uppercase; color:var(--fg-subtle); margin-bottom:6px; }`}</style>
    </div>
  );
}