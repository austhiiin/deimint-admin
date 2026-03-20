import { useState } from "react";
import { useCommissions } from "@/admin/hooks/useAdmin";
import { STATUS_COLORS, STATUS_LABELS, type Commission, type CommissionStatus } from "@/types";

const STATUSES: CommissionStatus[] = ["queued", "sketching", "painting", "completed", "cancelled"];
const MEDIUMS = ["Digital Art", "Traditional / Oil", "Watercolour", "Gouache", "Mixed Media"];

interface FormState {
  client_name: string; client_email: string; status: CommissionStatus;
  queue_pos: number; medium: string; price: string; notes: string; preview_url: string;
}
const EMPTY: FormState = { client_name: "", client_email: "", status: "queued", queue_pos: 0, medium: "", price: "", notes: "", preview_url: "" };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9CA3AF" }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "0.625rem 0.875rem", borderRadius: 10,
  border: "1px solid #EDE9FE", background: "#FAFAFA",
  fontSize: "0.875rem", color: "#1F1235", outline: "none",
  boxSizing: "border-box", fontFamily: "inherit"
};

function CommissionModal({ commission, onClose, onSave }: {
  commission: Commission | null; onClose: () => void; onSave: (data: FormState) => Promise<void>;
}) {
  const [form, setForm] = useState<FormState>(
    commission
      ? { client_name: commission.client_name, client_email: commission.client_email ?? "", status: commission.status, queue_pos: commission.queue_pos, medium: commission.medium ?? "", price: commission.price?.toString() ?? "", notes: commission.notes ?? "", preview_url: commission.preview_url ?? "" }
      : EMPTY
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,10,30,0.4)", backdropFilter: "blur(4px)", zIndex: 40 }} />
      <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
        <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 520, background: "#fff", borderRadius: 20, boxShadow: "0 24px 60px rgba(124,58,237,0.15)", overflow: "hidden" }}>
          {/* Header */}
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #F3F0FF", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 600, color: "#1F1235" }}>
              {commission ? "Edit Commission" : "New Commission"}
            </h2>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", padding: 4, borderRadius: 6, display: "flex" }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 16 16">
                <path d="M3 3l10 10M13 3L3 13" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", maxHeight: "65vh", overflowY: "auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <Field label="Client Name *">
                <input value={form.client_name} onChange={e => set("client_name", e.target.value)} style={inputStyle} placeholder="Full name" />
              </Field>
              <Field label="Client Email">
                <input value={form.client_email} onChange={e => set("client_email", e.target.value)} style={inputStyle} type="email" placeholder="email@example.com" />
              </Field>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <Field label="Status">
                <select value={form.status} onChange={e => set("status", e.target.value as CommissionStatus)} style={inputStyle}>
                  {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                </select>
              </Field>
              <Field label="Queue Position">
                <input value={form.queue_pos} onChange={e => set("queue_pos", parseInt(e.target.value) || 0)} style={inputStyle} type="number" min="0" />
              </Field>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <Field label="Medium">
                <select value={form.medium} onChange={e => set("medium", e.target.value)} style={inputStyle}>
                  <option value="">Select…</option>
                  {MEDIUMS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </Field>
              <Field label="Price ($)">
                <input value={form.price} onChange={e => set("price", e.target.value)} style={inputStyle} type="number" min="0" step="0.01" placeholder="0.00" />
              </Field>
            </div>
            <Field label="Preview URL">
              <input value={form.preview_url} onChange={e => set("preview_url", e.target.value)} style={inputStyle} placeholder="https://…" />
            </Field>
            <Field label="Internal Notes">
              <textarea value={form.notes} onChange={e => set("notes", e.target.value)} style={{ ...inputStyle, resize: "none" }} rows={3} placeholder="Notes visible only to you…" />
            </Field>
            {error && <p style={{ margin: 0, padding: "0.625rem 0.875rem", borderRadius: 10, background: "#FEF2F2", color: "#DC2626", fontSize: "0.8rem" }}>{error}</p>}
          </div>

          {/* Footer */}
          <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid #F3F0FF", display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button onClick={onClose} style={{ padding: "0.5rem 1.25rem", borderRadius: 50, border: "1px solid #EDE9FE", background: "#fff", color: "#6D28D9", fontSize: "0.8rem", fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving} style={{ padding: "0.5rem 1.5rem", borderRadius: 50, border: "none", background: "linear-gradient(135deg,#7C3AED,#A78BFA)", color: "#fff", fontSize: "0.8rem", fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1, fontFamily: "inherit" }}>
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
  const [modal, setModal] = useState<"create" | Commission | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterStatus, setFilter] = useState<CommissionStatus | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = data.filter(c => {
    const matchStatus = filterStatus === "all" || c.status === filterStatus;
    const matchSearch = !search || c.client_name.toLowerCase().includes(search.toLowerCase()) || c.client_email?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleSave = async (form: FormState) => {
    const payload = { client_name: form.client_name, client_email: form.client_email || undefined, status: form.status, queue_pos: form.queue_pos, medium: form.medium || undefined, price: form.price ? parseFloat(form.price) : undefined, notes: form.notes || undefined, preview_url: form.preview_url || undefined };
    if (modal && modal !== "create") await update((modal as Commission).id, payload);
    else await create(payload);
  };

  return (
    <div style={{ maxWidth: 1100, padding: "2rem 2.5rem" }}>
      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "0 0 auto" }}>
          <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 16 16">
            <circle cx="6.5" cy="6.5" r="4.5" /><path d="M11 11l3 3" strokeLinecap="round" />
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email…"
            style={{ paddingLeft: 34, paddingRight: 14, paddingTop: 8, paddingBottom: 8, borderRadius: 10, border: "1px solid #EDE9FE", background: "#fff", fontSize: "0.8rem", color: "#1F1235", outline: "none", width: 220, fontFamily: "inherit" }} />
        </div>
        <select value={filterStatus} onChange={e => setFilter(e.target.value as CommissionStatus | "all")}
          style={{ padding: "0.5rem 0.875rem", borderRadius: 10, border: "1px solid #EDE9FE", background: "#fff", fontSize: "0.8rem", color: "#1F1235", outline: "none", fontFamily: "inherit" }}>
          <option value="all">All statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
        <button onClick={() => setModal("create")} style={{ marginLeft: "auto", padding: "0.5rem 1.25rem", borderRadius: 50, border: "none", background: "linear-gradient(135deg,#7C3AED,#A78BFA)", color: "#fff", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", letterSpacing: "0.01em", fontFamily: "inherit" }}>
          + New Commission
        </button>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid #EDE9FE", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 4px rgba(124,58,237,0.06)" }}>
        {loading ? (
          <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: 12 }}>
            {[...Array(4)].map((_, i) => <div key={i} style={{ height: 44, borderRadius: 8, background: "#F5F3FF" }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <p style={{ padding: "3rem", textAlign: "center", color: "#9CA3AF", fontSize: "0.875rem", margin: 0 }}>No commissions found.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #F3F0FF" }}>
                {["#", "Client", "Email", "Medium", "Status", "Price", "Updated", ""].map(h => (
                  <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9CA3AF" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={c.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid #F9F7FF" : "none" }}>
                  <td style={{ padding: "0.875rem 1rem", color: "#C4B5FD", fontVariantNumeric: "tabular-nums", fontSize: "0.8rem" }}>{c.queue_pos || "—"}</td>
                  <td style={{ padding: "0.875rem 1rem", fontWeight: 500, color: "#1F1235" }}>{c.client_name}</td>
                  <td style={{ padding: "0.875rem 1rem", color: "#6B7280", fontSize: "0.8rem" }}>{c.client_email ?? "—"}</td>
                  <td style={{ padding: "0.875rem 1rem", color: "#6B7280", fontSize: "0.8rem" }}>{c.medium ?? "—"}</td>
                  <td style={{ padding: "0.875rem 1rem" }}>
                    <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", background: `${STATUS_COLORS[c.status]}18`, color: STATUS_COLORS[c.status] }}>
                      {STATUS_LABELS[c.status]}
                    </span>
                  </td>
                  <td style={{ padding: "0.875rem 1rem", color: "#6B7280", fontVariantNumeric: "tabular-nums", fontSize: "0.8rem" }}>{c.price ? `$${c.price}` : "—"}</td>
                  <td style={{ padding: "0.875rem 1rem", color: "#9CA3AF", fontSize: "0.75rem" }}>{new Date(c.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</td>
                  <td style={{ padding: "0.875rem 1rem" }}>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button onClick={() => setModal(c)} title="Edit" style={{ padding: 6, borderRadius: 8, border: "none", background: "none", cursor: "pointer", color: "#9CA3AF", display: "flex" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#EDE9FE"; (e.currentTarget as HTMLElement).style.color = "#7C3AED"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "none"; (e.currentTarget as HTMLElement).style.color = "#9CA3AF"; }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 16 16"><path d="M11 2L14 5l-8 8H3v-3L11 2z" /></svg>
                      </button>
                      <button onClick={() => setDeleteId(c.id)} title="Delete" style={{ padding: 6, borderRadius: 8, border: "none", background: "none", cursor: "pointer", color: "#9CA3AF", display: "flex" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#FEF2F2"; (e.currentTarget as HTMLElement).style.color = "#DC2626"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "none"; (e.currentTarget as HTMLElement).style.color = "#9CA3AF"; }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 16 16"><polyline points="2 4 14 4" /><path d="M5 4V2h6v2M6 7v5M10 7v5" /><path d="M3 4l1 10h8l1-10" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal !== null && <CommissionModal commission={modal === "create" ? null : modal as Commission} onClose={() => setModal(null)} onSave={handleSave} />}

      {deleteId && (
        <>
          <div onClick={() => setDeleteId(null)} style={{ position: "fixed", inset: 0, background: "rgba(15,10,30,0.4)", backdropFilter: "blur(4px)", zIndex: 40 }} />
          <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
            <div style={{ width: "100%", maxWidth: 360, background: "#fff", borderRadius: 20, padding: "2rem", textAlign: "center", boxShadow: "0 24px 60px rgba(124,58,237,0.15)" }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
                <svg width="20" height="20" fill="none" stroke="#DC2626" strokeWidth="2" viewBox="0 0 16 16"><polyline points="2 4 14 4" /><path d="M5 4V2h6v2M6 7v5M10 7v5" /><path d="M3 4l1 10h8l1-10" /></svg>
              </div>
              <p style={{ margin: "0 0 8px", fontSize: "1rem", fontWeight: 600, color: "#1F1235" }}>Delete Commission?</p>
              <p style={{ margin: "0 0 1.5rem", fontSize: "0.85rem", color: "#6B7280" }}>This action cannot be undone.</p>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setDeleteId(null)} style={{ flex: 1, padding: "0.625rem", borderRadius: 50, border: "1px solid #EDE9FE", background: "#fff", color: "#6D28D9", fontSize: "0.8rem", fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                <button onClick={async () => { await remove(deleteId); setDeleteId(null); }} style={{ flex: 1, padding: "0.625rem", borderRadius: 50, border: "none", background: "linear-gradient(135deg,#DC2626,#EF4444)", color: "#fff", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Delete</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}