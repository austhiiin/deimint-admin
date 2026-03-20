import { useState, useEffect } from "react";
import { useSiteSettings } from "@/admin/hooks/useAdmin";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
  const { data, loading, saveMany } = useSiteSettings();
  const [form, setForm] = useState({ artist_name:"", artist_bio:"", artist_email:"", commissions_open:"true", queue_wait_weeks:"2" });
  const [saving, setSaving]   = useState(false);
  const [saved,  setSaved]    = useState(false);

  // Password change
  const [pwForm, setPwForm]   = useState({ current:"", next:"", confirm:"" });
  const [pwError, setPwError] = useState<string|null>(null);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwSaving,setPwSaving]= useState(false);

  useEffect(() => {
    if (!loading && Object.keys(data).length > 0) {
      setForm(f => ({ ...f, ...data }));
    }
  }, [loading, data]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await saveMany(form);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    if (pwForm.next !== pwForm.confirm) { setPwError("Passwords don't match."); return; }
    if (pwForm.next.length < 8)         { setPwError("Minimum 8 characters."); return; }
    setPwSaving(true);
    const { error } = await supabase.auth.updateUser({ password: pwForm.next });
    setPwSaving(false);
    if (error) { setPwError(error.message); return; }
    setPwSaved(true);
    setPwForm({ current:"", next:"", confirm:"" });
    setTimeout(() => setPwSaved(false), 3000);
  };

  if (loading) return <div className="h-32 rounded-2xl animate-pulse" style={{ background:"rgba(131,103,199,0.07)" }}/>;

  return (
    <div className="max-w-2xl space-y-8">
      {/* Profile settings */}
      <div className="rounded-2xl overflow-hidden" style={{ background:"rgba(255,255,255,0.7)",backdropFilter:"blur(16px)",border:"1px solid rgba(255,255,255,0.9)",boxShadow:"0 4px 16px rgba(86,3,173,0.06)" }}>
        <div className="px-6 py-4 border-b" style={{ borderColor:"rgba(131,103,199,0.1)" }}>
          <h2 style={{ fontFamily:"var(--font-display)",fontSize:"1rem",fontWeight:700,color:"var(--fg)" }}>Site Settings</h2>
          <p style={{ fontFamily:"var(--font-sans)",fontSize:"0.78rem",color:"var(--fg-subtle)",marginTop:"2px" }}>These values appear throughout the public site.</p>
        </div>
        <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
          <div>
            <label className="field-label">Artist / Display Name</label>
            <input value={form.artist_name} onChange={e=>setForm(f=>({...f,artist_name:e.target.value}))} className="input-glass" placeholder="deimint"/>
          </div>
          <div>
            <label className="field-label">Short Bio</label>
            <textarea value={form.artist_bio} onChange={e=>setForm(f=>({...f,artist_bio:e.target.value}))} className="input-glass resize-none" rows={3} placeholder="Creating art that tells stories…"/>
          </div>
          <div>
            <label className="field-label">Contact Email</label>
            <input value={form.artist_email} onChange={e=>setForm(f=>({...f,artist_email:e.target.value}))} className="input-glass" type="email" placeholder="contact@deimint.com"/>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="field-label">Commissions Open</label>
              <select value={form.commissions_open} onChange={e=>setForm(f=>({...f,commissions_open:e.target.value}))} className="input-glass">
                <option value="true">Open ✓</option>
                <option value="false">Closed ✗</option>
              </select>
            </div>
            <div>
              <label className="field-label">Queue Wait (weeks)</label>
              <input value={form.queue_wait_weeks} onChange={e=>setForm(f=>({...f,queue_wait_weeks:e.target.value}))} className="input-glass" type="number" min="0"/>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary text-xs px-5 py-2.5" style={{ opacity:saving?0.7:1 }}>
              {saving ? "Saving…" : "Save Settings"}
            </button>
            {saved && <span style={{ fontFamily:"var(--font-mono)",fontSize:"0.65rem",color:"#10b981" }}>✓ Saved</span>}
          </div>
        </form>
      </div>

      {/* Password change */}
      <div className="rounded-2xl overflow-hidden" style={{ background:"rgba(255,255,255,0.7)",backdropFilter:"blur(16px)",border:"1px solid rgba(255,255,255,0.9)",boxShadow:"0 4px 16px rgba(86,3,173,0.06)" }}>
        <div className="px-6 py-4 border-b" style={{ borderColor:"rgba(131,103,199,0.1)" }}>
          <h2 style={{ fontFamily:"var(--font-display)",fontSize:"1rem",fontWeight:700,color:"var(--fg)" }}>Change Password</h2>
        </div>
        <form onSubmit={handlePasswordChange} className="px-6 py-5 space-y-4">
          <div>
            <label className="field-label">New Password</label>
            <input value={pwForm.next} onChange={e=>setPwForm(f=>({...f,next:e.target.value}))} className="input-glass" type="password" placeholder="Min. 8 characters"/>
          </div>
          <div>
            <label className="field-label">Confirm Password</label>
            <input value={pwForm.confirm} onChange={e=>setPwForm(f=>({...f,confirm:e.target.value}))} className="input-glass" type="password" placeholder="Repeat new password"/>
          </div>
          {pwError && <p className="text-sm px-3 py-2 rounded-xl" style={{ background:"rgba(229,62,62,0.08)",color:"#c53030" }}>{pwError}</p>}
          <div className="flex items-center gap-3">
            <button type="submit" disabled={pwSaving} className="btn-primary text-xs px-5 py-2.5" style={{ opacity:pwSaving?0.7:1 }}>
              {pwSaving?"Updating…":"Update Password"}
            </button>
            {pwSaved && <span style={{ fontFamily:"var(--font-mono)",fontSize:"0.65rem",color:"#10b981" }}>✓ Updated</span>}
          </div>
        </form>
      </div>

      <style>{`.field-label{display:block;font-family:var(--font-mono);font-size:0.6rem;letter-spacing:0.2em;text-transform:uppercase;color:var(--fg-subtle);margin-bottom:6px;}`}</style>
    </div>
  );
}