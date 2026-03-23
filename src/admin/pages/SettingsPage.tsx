import { useState, useEffect } from "react";
import { useSiteSettings } from "@/admin/hooks/useAdmin";
import { supabase } from "@/lib/supabase";

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "0.625rem 0.875rem", borderRadius: 10,
  border: "1px solid #EDE9FE", background: "#FAFAFA",
  fontSize: "0.875rem", color: "#1F1235", outline: "none",
  boxSizing: "border-box", fontFamily: "inherit"
};

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div>
        <label style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6B7280" }}>{label}</label>
        {hint && <p style={{ margin: "2px 0 0", fontSize: "0.72rem", color: "#9CA3AF" }}>{hint}</p>}
      </div>
      {children}
    </div>
  );
}

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #EDE9FE", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 4px rgba(124,58,237,0.06)" }}>
      <div style={{ padding: "1.125rem 1.5rem", borderBottom: "1px solid #F3F0FF" }}>
        <h2 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600, color: "#1F1235" }}>{title}</h2>
        {subtitle && <p style={{ margin: "3px 0 0", fontSize: "0.78rem", color: "#9CA3AF" }}>{subtitle}</p>}
      </div>
      <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.125rem" }}>
        {children}
      </div>
    </div>
  );
}

function SaveRow({ saving, saved }: { saving: boolean; saved: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 4 }}>
      <button type="submit" disabled={saving} style={{ padding: "0.5rem 1.5rem", borderRadius: 50, border: "none", background: "linear-gradient(135deg,#7C3AED,#A78BFA)", color: "#fff", fontSize: "0.8rem", fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1, fontFamily: "inherit" }}>
        {saving ? "Saving…" : "Save"}
      </button>
      {saved && (
        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.8rem", color: "#10B981", fontWeight: 500 }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 16 16"><path d="M2 8l4 4 8-8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Saved
        </span>
      )}
    </div>
  );
}

type FormKey =
  | "artist_name" | "artist_bio" | "artist_email"
  | "commissions_open" | "queue_wait_weeks" | "revisions_included"
  | "instagram_url" | "facebook_url" | "twitter_url"
  | "deviantart_url" | "artstation_url"
  | "hero_photo_url" | "formspree_id";

const DEFAULTS: Record<FormKey, string> = {
  artist_name: "", artist_bio: "", artist_email: "",
  commissions_open: "true", queue_wait_weeks: "2", revisions_included: "3",
  instagram_url: "", facebook_url: "", twitter_url: "",
  deviantart_url: "", artstation_url: "",
  hero_photo_url: "", formspree_id: "",
};

export default function SettingsPage() {
  const { data, loading, saveMany } = useSiteSettings();
  const [form, setForm] = useState<Record<FormKey, string>>(DEFAULTS);

  const [siteS,   setSiteS]   = useState({ saving: false, saved: false });
  const [socialS, setSocialS] = useState({ saving: false, saved: false });
  const [commS,   setCommS]   = useState({ saving: false, saved: false });

  const [pwForm,   setPwForm]   = useState({ next: "", confirm: "" });
  const [pwError,  setPwError]  = useState<string | null>(null);
  const [pwSaved,  setPwSaved]  = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  const set = (k: FormKey, v: string) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!loading && Object.keys(data).length > 0) {
      setForm(f => ({ ...f, ...(data as Record<FormKey, string>) }));
    }
  }, [loading, data]);

  const saveSection = async (
    keys: FormKey[],
    setState: React.Dispatch<React.SetStateAction<{ saving: boolean; saved: boolean }>>
  ) => {
    setState({ saving: true, saved: false });
    const subset = Object.fromEntries(keys.map(k => [k, form[k]]));
    await saveMany(subset);
    setState({ saving: false, saved: true });
    setTimeout(() => setState(s => ({ ...s, saved: false })), 3000);
  };

  if (loading) return (
    <div style={{ maxWidth: 680, padding: "2rem 2.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {[200, 160, 180, 140].map(h => <div key={h} style={{ height: h, borderRadius: 16, background: "#F5F3FF" }} />)}
    </div>
  );

  return (
    <div style={{ maxWidth: 680, padding: "2rem 2.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* ── Site Identity ── */}
      <Card title="Site Identity" subtitle="Displayed across the public portfolio.">
        <form onSubmit={e => { e.preventDefault(); saveSection(["artist_name","artist_bio","artist_email","hero_photo_url"], setSiteS); }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}>
            <Field label="Artist / Display Name">
              <input value={form.artist_name} onChange={e => set("artist_name", e.target.value)} style={inputStyle} placeholder="deimint" />
            </Field>
            <Field label="Short Bio" hint="Shown in About section and Footer.">
              <textarea value={form.artist_bio} onChange={e => set("artist_bio", e.target.value)} style={{ ...inputStyle, resize: "none" }} rows={3} placeholder="Creating art that tells stories…" />
            </Field>
            <Field label="Contact Email" hint="Shown in Contact panel and Footer.">
              <input value={form.artist_email} onChange={e => set("artist_email", e.target.value)} style={inputStyle} type="email" placeholder="contact@deimint.com" />
            </Field>
            <Field label="About Photo URL" hint="Portrait photo shown in the About section.">
              <input value={form.hero_photo_url} onChange={e => set("hero_photo_url", e.target.value)} style={inputStyle} placeholder="https://…" />
              {form.hero_photo_url && (
                <img src={form.hero_photo_url} alt="preview" style={{ marginTop: 6, height: 72, width: 72, objectFit: "cover", borderRadius: 10, border: "1px solid #EDE9FE" }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
              )}
            </Field>
            <SaveRow saving={siteS.saving} saved={siteS.saved} />
          </div>
        </form>
      </Card>

      {/* ── Commission Settings ── */}
      <Card title="Commission Settings" subtitle="Controls Hero badge, About banner, Contact form, and Navbar.">
        <form onSubmit={e => { e.preventDefault(); saveSection(["commissions_open","queue_wait_weeks","revisions_included","formspree_id"], setCommS); }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <Field label="Commissions Status">
                <select value={form.commissions_open} onChange={e => set("commissions_open", e.target.value)} style={inputStyle}>
                  <option value="true">Open ✓</option>
                  <option value="false">Closed ✗</option>
                </select>
              </Field>
              <Field label="Queue Wait (weeks)" hint="~X week wait shown in About + Contact.">
                <input value={form.queue_wait_weeks} onChange={e => set("queue_wait_weeks", e.target.value)} style={inputStyle} type="number" min="0" />
              </Field>
            </div>
            <Field label="Revisions Included" hint="Shown in the Contact info panel.">
              <input value={form.revisions_included} onChange={e => set("revisions_included", e.target.value)} style={inputStyle} type="number" min="0" placeholder="3" />
            </Field>
            <Field label="Formspree ID" hint="Optional email forwarding. Leave blank to use Supabase only.">
              <input value={form.formspree_id} onChange={e => set("formspree_id", e.target.value)} style={inputStyle} placeholder="abcd1234" />
            </Field>
            <SaveRow saving={commS.saving} saved={commS.saved} />
          </div>
        </form>
      </Card>

      {/* ── Social Links ── */}
      <Card title="Social Links" subtitle="Shown in Footer and Contact panel. Leave blank to hide the icon.">
        <form onSubmit={e => { e.preventDefault(); saveSection(["instagram_url","facebook_url","twitter_url","deviantart_url","artstation_url"], setSocialS); }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}>
            {([
              { key: "instagram_url",  label: "Instagram",  placeholder: "https://instagram.com/yourusername" },
              { key: "facebook_url",   label: "Facebook",   placeholder: "https://facebook.com/yourpage" },
              { key: "twitter_url",    label: "X / Twitter",placeholder: "https://x.com/yourhandle" },
              { key: "deviantart_url", label: "DeviantArt", placeholder: "https://deviantart.com/yourusername" },
              { key: "artstation_url", label: "ArtStation", placeholder: "https://artstation.com/yourusername" },
            ] as { key: FormKey; label: string; placeholder: string }[]).map(({ key, label, placeholder }) => (
              <Field key={key} label={label}>
                <input value={form[key]} onChange={e => set(key, e.target.value)} style={inputStyle} placeholder={placeholder} />
              </Field>
            ))}
            <SaveRow saving={socialS.saving} saved={socialS.saved} />
          </div>
        </form>
      </Card>

      {/* ── Password ── */}
      <Card title="Change Password">
        <form onSubmit={async e => {
          e.preventDefault();
          setPwError(null);
          if (pwForm.next !== pwForm.confirm) { setPwError("Passwords don't match."); return; }
          if (pwForm.next.length < 8) { setPwError("Minimum 8 characters."); return; }
          setPwSaving(true);
          const { error } = await supabase.auth.updateUser({ password: pwForm.next });
          setPwSaving(false);
          if (error) { setPwError(error.message); return; }
          setPwSaved(true);
          setPwForm({ next: "", confirm: "" });
          setTimeout(() => setPwSaved(false), 3000);
        }}>
          <Field label="New Password" hint="Minimum 8 characters.">
            <input value={pwForm.next} onChange={e => setPwForm(f => ({ ...f, next: e.target.value }))} style={inputStyle} type="password" placeholder="••••••••" />
          </Field>
          <Field label="Confirm Password">
            <input value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} style={inputStyle} type="password" placeholder="Repeat new password" />
          </Field>
          {pwError && <p style={{ margin: 0, padding: "0.625rem 0.875rem", borderRadius: 10, background: "#FEF2F2", color: "#DC2626", fontSize: "0.8rem" }}>{pwError}</p>}
          <SaveRow saving={pwSaving} saved={pwSaved} />
        </form>
      </Card>

    </div>
  );
}