import { useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useGalleryAdmin } from "@/admin/hooks/useAdmin";
import type { GalleryItem } from "@/types";

const MEDIUMS = ["Digital Art", "Traditional / Oil", "Watercolour", "Gouache", "Mixed Media", "Charcoal", "Other"];

interface FormState {
  title: string; medium: string; year: number;
  image_url: string; alt_text: string; description: string;
  featured: boolean; sort_order: number;
}
const EMPTY: FormState = {
  title: "", medium: "Digital Art", year: new Date().getFullYear(),
  image_url: "", alt_text: "", description: "", featured: false, sort_order: 0,
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "0.625rem 0.875rem", borderRadius: 10,
  border: "1px solid #EDE9FE", background: "#FAFAFA", fontSize: "0.875rem",
  color: "#1F1235", outline: "none", boxSizing: "border-box", fontFamily: "inherit",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
      <label style={{ fontSize:"0.65rem", fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", color:"#9CA3AF" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

// ── Image uploader ────────────────────────────────────────────
function ImageUploader({
  currentUrl,
  onUploaded,
}: {
  currentUrl: string;
  onUploaded: (url: string) => void;
}) {
  const fileRef        = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress,  setProgress]  = useState(0);
  const [dragOver,  setDragOver]  = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const uploadFile = async (file: File) => {
    setError(null);

    // Validate type
    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed.");
      return;
    }
    // Validate size (5 MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError("File must be under 5 MB.");
      return;
    }

    setUploading(true);
    setProgress(10);

    try {
      // Build a unique filename: timestamp_originalname
      const ext      = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const path     = `artworks/${filename}`;

      setProgress(30);

      const { error: uploadError } = await supabase.storage
        .from("gallery")
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (uploadError) throw uploadError;

      setProgress(80);

      // Get the public URL
      const { data } = supabase.storage.from("gallery").getPublicUrl(path);
      setProgress(100);
      onUploaded(data.publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
      {/* Drop zone */}
      <div
        onClick={() => !uploading && fileRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragOver ? "#7C3AED" : "#EDE9FE"}`,
          borderRadius: 12,
          padding: "1.5rem 1rem",
          textAlign: "center",
          cursor: uploading ? "not-allowed" : "pointer",
          background: dragOver ? "rgba(124,58,237,0.04)" : "#FAFAFA",
          transition: "all 0.2s",
        }}
      >
        {uploading ? (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
            <svg style={{ width:24, height:24, animation:"spin 1s linear infinite", color:"#7C3AED" }} viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.2"/>
              <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            {/* Progress bar */}
            <div style={{ width:"100%", height:4, background:"#EDE9FE", borderRadius:2 }}>
              <div style={{ height:"100%", width:`${progress}%`, background:"linear-gradient(90deg,#7C3AED,#A78BFA)", borderRadius:2, transition:"width 0.3s ease" }}/>
            </div>
            <span style={{ fontSize:"0.75rem", color:"#7C3AED" }}>Uploading… {progress}%</span>
          </div>
        ) : (
          <>
            <svg style={{ width:28, height:28, margin:"0 auto 8px", display:"block", color: dragOver ? "#7C3AED" : "#C4B5FD" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 16v-8M8 12l4-4 4 4"/>
              <path d="M20 16.7A5 5 0 0018 7h-1.26A8 8 0 104 15.25"/>
            </svg>
            <p style={{ margin:0, fontSize:"0.8rem", color:"#6D28D9", fontWeight:600 }}>
              Click to upload or drag & drop
            </p>
            <p style={{ margin:"4px 0 0", fontSize:"0.72rem", color:"#9CA3AF" }}>
              PNG, JPG, GIF, WebP · max 5 MB
            </p>
          </>
        )}
      </div>

      {/* Or paste URL manually */}
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <div style={{ flex:1, height:1, background:"#EDE9FE" }}/>
        <span style={{ fontSize:"0.7rem", color:"#9CA3AF" }}>or paste URL</span>
        <div style={{ flex:1, height:1, background:"#EDE9FE" }}/>
      </div>

      <input
        value={currentUrl}
        onChange={e => onUploaded(e.target.value)}
        style={inputStyle}
        placeholder="https://…"
      />

      {/* Preview */}
      {currentUrl && (
        <div style={{ position:"relative" }}>
          <img
            src={currentUrl}
            alt="preview"
            style={{ width:"100%", height:140, objectFit:"cover", borderRadius:10, border:"1px solid #EDE9FE", display:"block" }}
            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <button
            onClick={() => onUploaded("")}
            style={{ position:"absolute", top:8, right:8, width:28, height:28, borderRadius:"50%", background:"rgba(15,5,40,0.6)", border:"none", color:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}
          >
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 16 16">
              <path d="M3 3l10 10M13 3L3 13" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      )}

      {error && (
        <p style={{ margin:0, padding:"0.5rem 0.75rem", borderRadius:8, background:"#FEF2F2", color:"#DC2626", fontSize:"0.78rem" }}>
          {error}
        </p>
      )}

      <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleFileChange}/>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────
function GalleryModal({ item, onClose, onSave }: {
  item: GalleryItem | null;
  onClose: () => void;
  onSave: (d: FormState) => Promise<void>;
}) {
  const [form, setForm] = useState<FormState>(
    item
      ? { title:item.title, medium:item.medium, year:item.year, image_url:item.image_url, alt_text:item.alt_text, description:item.description??"", featured:item.featured, sort_order:item.sort_order }
      : EMPTY
  );
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState<string | null>(null);

  const set = (k: keyof FormState, v: string | number | boolean) =>
    setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.title.trim())     { setError("Title is required."); return; }
    if (!form.image_url.trim()) { setError("Image is required — upload or paste a URL."); return; }
    setSaving(true);
    try { await onSave(form); onClose(); }
    catch (e) { setError(e instanceof Error ? e.message : "Save failed."); }
    finally { setSaving(false); }
  };

  return (
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(15,10,30,0.4)", backdropFilter:"blur(4px)", zIndex:40 }}/>
      <div style={{ position:"fixed", inset:0, zIndex:50, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
        <div onClick={e => e.stopPropagation()} style={{ width:"100%", maxWidth:540, background:"#fff", borderRadius:20, boxShadow:"0 24px 60px rgba(124,58,237,0.15)", overflow:"hidden" }}>
          {/* Header */}
          <div style={{ padding:"1.25rem 1.5rem", borderBottom:"1px solid #F3F0FF", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <h2 style={{ margin:0, fontSize:"1rem", fontWeight:600, color:"#1F1235" }}>
              {item ? "Edit Artwork" : "Add Artwork"}
            </h2>
            <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:"#9CA3AF", padding:4, display:"flex" }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 16 16">
                <path d="M3 3l10 10M13 3L3 13" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Body */}
          <div style={{ padding:"1.5rem", display:"flex", flexDirection:"column", gap:"1rem", maxHeight:"65vh", overflowY:"auto" }}>
            <Field label="Title *">
              <input value={form.title} onChange={e => set("title", e.target.value)} style={inputStyle} placeholder="Artwork title"/>
            </Field>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
              <Field label="Medium">
                <select value={form.medium} onChange={e => set("medium", e.target.value)} style={inputStyle}>
                  {MEDIUMS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </Field>
              <Field label="Year">
                <input value={form.year} onChange={e => set("year", parseInt(e.target.value) || new Date().getFullYear())} style={inputStyle} type="number" min="1900" max="2100"/>
              </Field>
            </div>

            {/* Image uploader */}
            <Field label="Image *">
              <ImageUploader
                currentUrl={form.image_url}
                onUploaded={url => set("image_url", url)}
              />
            </Field>

            <Field label="Alt Text (SEO)">
              <input value={form.alt_text} onChange={e => set("alt_text", e.target.value)} style={inputStyle} placeholder="Describe the image for screen readers"/>
            </Field>

            <Field label="Description">
              <textarea value={form.description} onChange={e => set("description", e.target.value)} style={{ ...inputStyle, resize:"none" }} rows={2} placeholder="Optional caption or story…"/>
            </Field>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem", alignItems:"end" }}>
              <Field label="Sort Order">
                <input value={form.sort_order} onChange={e => set("sort_order", parseInt(e.target.value) || 0)} style={inputStyle} type="number" min="0"/>
              </Field>
              <div style={{ display:"flex", alignItems:"center", gap:10, paddingBottom:2 }}>
                <button type="button" onClick={() => set("featured", !form.featured)} style={{
                  position:"relative", width:44, height:24, borderRadius:12, border:"none", cursor:"pointer",
                  background: form.featured ? "linear-gradient(135deg,#7C3AED,#A78BFA)" : "#E5E7EB",
                  transition:"background 0.2s", flexShrink:0,
                }}>
                  <span style={{ position:"absolute", top:3, left:form.featured ? 22 : 3, width:18, height:18, borderRadius:"50%", background:"#fff", transition:"left 0.2s", boxShadow:"0 1px 3px rgba(0,0,0,0.2)" }}/>
                </button>
                <span style={{ fontSize:"0.8rem", color:"#4B5563", fontWeight:500 }}>Featured</span>
              </div>
            </div>

            {error && (
              <p style={{ margin:0, padding:"0.625rem 0.875rem", borderRadius:10, background:"#FEF2F2", color:"#DC2626", fontSize:"0.8rem" }}>
                {error}
              </p>
            )}
          </div>

          {/* Footer */}
          <div style={{ padding:"1rem 1.5rem", borderTop:"1px solid #F3F0FF", display:"flex", justifyContent:"flex-end", gap:8 }}>
            <button onClick={onClose} style={{ padding:"0.5rem 1.25rem", borderRadius:50, border:"1px solid #EDE9FE", background:"#fff", color:"#6D28D9", fontSize:"0.8rem", fontWeight:500, cursor:"pointer", fontFamily:"inherit" }}>
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving} style={{ padding:"0.5rem 1.5rem", borderRadius:50, border:"none", background:"linear-gradient(135deg,#7C3AED,#A78BFA)", color:"#fff", fontSize:"0.8rem", fontWeight:600, cursor:saving?"not-allowed":"pointer", opacity:saving?0.7:1, fontFamily:"inherit" }}>
              {saving ? "Saving…" : item ? "Save Changes" : "Add Artwork"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────
export default function GalleryAdminPage() {
  const { data, loading, create, update, remove } = useGalleryAdmin();
  const [modal,    setModal]    = useState<"create" | GalleryItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleSave = async (form: FormState) => {
    const payload = { ...form, description: form.description || null };
    if (modal && modal !== "create") await update((modal as GalleryItem).id, payload);
    else await create(payload as Omit<GalleryItem, "id" | "created_at" | "updated_at">);
  };

  return (
    <div style={{ maxWidth:1100, padding:"0 0 2rem" }}>
      <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:"1.5rem" }}>
        <button onClick={() => setModal("create")} style={{ padding:"0.5rem 1.25rem", borderRadius:50, border:"none", background:"linear-gradient(135deg,#7C3AED,#A78BFA)", color:"#fff", fontSize:"0.8rem", fontWeight:600, cursor:"pointer", fontFamily:"inherit", boxShadow:"0 4px 12px rgba(124,58,237,0.3)" }}>
          + Add Artwork
        </button>
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))", gap:"1rem" }}>
          {[...Array(6)].map((_,i) => (
            <div key={i} style={{ aspectRatio:"1", borderRadius:16, background:"#F5F3FF", animation:"pulse 1.5s ease-in-out infinite" }}/>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && data.length === 0 && (
        <div style={{ textAlign:"center", padding:"5rem", color:"#9CA3AF" }}>
          <svg style={{ margin:"0 auto 1rem", display:"block", opacity:0.3 }} width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
            <path d="M21 15l-5-5L5 21"/>
          </svg>
          <p style={{ margin:0, fontSize:"0.875rem" }}>No artwork yet. Add your first piece!</p>
        </div>
      )}

      {/* Grid */}
      {!loading && data.length > 0 && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))", gap:"1rem" }}>
          {data.map(item => (
            <div
              key={item.id}
              style={{ position:"relative", borderRadius:16, overflow:"hidden", boxShadow:"0 2px 8px rgba(124,58,237,0.1)", background:"#F5F3FF", aspectRatio:"1" }}
              onMouseEnter={e => { (e.currentTarget.querySelector(".go") as HTMLElement).style.opacity = "1"; }}
              onMouseLeave={e => { (e.currentTarget.querySelector(".go") as HTMLElement).style.opacity = "0"; }}
            >
              <img src={item.image_url} alt={item.alt_text} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}/>

              {item.featured && (
                <span style={{ position:"absolute", top:8, left:8, padding:"3px 10px", borderRadius:20, background:"linear-gradient(135deg,#7C3AED,#A78BFA)", color:"#fff", fontSize:"0.6rem", fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase" }}>
                  Featured
                </span>
              )}

              <div className="go" style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(15,5,40,0.85) 0%, rgba(15,5,40,0.2) 60%, transparent 100%)", opacity:0, transition:"opacity 0.2s", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:12 }}>
                <p style={{ margin:"0 0 2px", color:"#fff", fontSize:"0.85rem", fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.title}</p>
                <p style={{ margin:"0 0 10px", color:"rgba(255,255,255,0.65)", fontSize:"0.7rem", textTransform:"uppercase", letterSpacing:"0.06em" }}>
                  {item.medium} · {item.year}
                </p>
                <div style={{ display:"flex", gap:6 }}>
                  <button onClick={() => setModal(item)} style={{ flex:1, padding:"6px", borderRadius:8, border:"none", background:"rgba(255,255,255,0.2)", color:"#fff", fontSize:"0.75rem", cursor:"pointer", backdropFilter:"blur(4px)", fontFamily:"inherit" }}>
                    Edit
                  </button>
                  <button onClick={() => setDeleteId(item.id)} style={{ padding:"6px 10px", borderRadius:8, border:"none", background:"rgba(220,38,38,0.5)", color:"#fff", fontSize:"0.75rem", cursor:"pointer", fontFamily:"inherit" }}>
                    Del
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Create modal */}
      {modal !== null && (
        <GalleryModal
          item={modal === "create" ? null : modal as GalleryItem}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {/* Delete confirm */}
      {deleteId && (
        <>
          <div onClick={() => setDeleteId(null)} style={{ position:"fixed", inset:0, background:"rgba(15,10,30,0.4)", backdropFilter:"blur(4px)", zIndex:40 }}/>
          <div style={{ position:"fixed", inset:0, zIndex:50, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
            <div style={{ width:"100%", maxWidth:360, background:"#fff", borderRadius:20, padding:"2rem", textAlign:"center", boxShadow:"0 24px 60px rgba(124,58,237,0.15)" }}>
              <div style={{ width:48, height:48, borderRadius:"50%", background:"#FEF2F2", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 1rem" }}>
                <svg width="20" height="20" fill="none" stroke="#DC2626" strokeWidth="2" viewBox="0 0 16 16">
                  <polyline points="2 4 14 4"/><path d="M5 4V2h6v2M6 7v5M10 7v5"/><path d="M3 4l1 10h8l1-10"/>
                </svg>
              </div>
              <p style={{ margin:"0 0 8px", fontSize:"1rem", fontWeight:600, color:"#1F1235" }}>Remove Artwork?</p>
              <p style={{ margin:"0 0 1.5rem", fontSize:"0.85rem", color:"#6B7280" }}>This cannot be undone.</p>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={() => setDeleteId(null)} style={{ flex:1, padding:"0.625rem", borderRadius:50, border:"1px solid #EDE9FE", background:"#fff", color:"#6D28D9", fontSize:"0.8rem", fontWeight:500, cursor:"pointer", fontFamily:"inherit" }}>
                  Cancel
                </button>
                <button
                  onClick={async () => { await remove(deleteId); setDeleteId(null); }}
                  style={{ flex:1, padding:"0.625rem", borderRadius:50, border:"none", background:"linear-gradient(135deg,#DC2626,#EF4444)", color:"#fff", fontSize:"0.8rem", fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>
    </div>
  );
}