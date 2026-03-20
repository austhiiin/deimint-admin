import { useState } from "react";
import { useGalleryAdmin } from "@/admin/hooks/useAdmin";
import type { GalleryItem } from "@/types";

const MEDIUMS = ["Digital Art","Traditional / Oil","Watercolour","Gouache","Mixed Media","Charcoal","Other"];

interface FormState { title:string; medium:string; year:number; image_url:string; alt_text:string; description:string; featured:boolean; sort_order:number; }
const EMPTY: FormState = { title:"",medium:"Digital Art",year:new Date().getFullYear(),image_url:"",alt_text:"",description:"",featured:false,sort_order:0 };

function GalleryModal({ item, onClose, onSave }: { item:GalleryItem|null; onClose:()=>void; onSave:(d:FormState)=>Promise<void>; }) {
  const [form,setForm]     = useState<FormState>(item ? { title:item.title,medium:item.medium,year:item.year,image_url:item.image_url,alt_text:item.alt_text,description:item.description??"",featured:item.featured,sort_order:item.sort_order } : EMPTY);
  const [saving,setSaving] = useState(false);
  const [error,setError]   = useState<string|null>(null);

  const set = (k:keyof FormState, v:string|number|boolean) => setForm(f=>({...f,[k]:v}));

  const handleSave = async () => {
    if (!form.title.trim() || !form.image_url.trim()) { setError("Title and Image URL are required."); return; }
    setSaving(true);
    try { await onSave(form); onClose(); } catch(e) { setError(e instanceof Error ? e.message : "Save failed."); } finally { setSaving(false); }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose}/>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-xl rounded-3xl overflow-hidden" style={{ background:"rgba(255,255,255,0.92)", backdropFilter:"blur(32px)", border:"1px solid rgba(255,255,255,0.95)", boxShadow:"0 24px 80px rgba(86,3,173,0.15)" }} onClick={e=>e.stopPropagation()}>
          <div className="px-7 py-5 border-b flex items-center justify-between" style={{ borderColor:"rgba(131,103,199,0.1)" }}>
            <h2 style={{ fontFamily:"var(--font-display)",fontSize:"1.3rem",fontWeight:700,color:"var(--fg)" }}>{item?"Edit Artwork":"Add Artwork"}</h2>
            <button onClick={onClose} style={{ color:"var(--fg-subtle)" }}><svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.8"><path d="M3 3l10 10M13 3L3 13" strokeLinecap="round"/></svg></button>
          </div>
          <div className="px-7 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="field-label">Title *</label>
                <input value={form.title} onChange={e=>set("title",e.target.value)} className="input-glass" placeholder="Artwork title"/>
              </div>
              <div>
                <label className="field-label">Medium</label>
                <select value={form.medium} onChange={e=>set("medium",e.target.value)} className="input-glass">
                  {MEDIUMS.map(m=><option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">Year</label>
                <input value={form.year} onChange={e=>set("year",parseInt(e.target.value)||new Date().getFullYear())} className="input-glass" type="number" min="1900" max="2100"/>
              </div>
              <div className="col-span-2">
                <label className="field-label">Image URL *</label>
                <input value={form.image_url} onChange={e=>set("image_url",e.target.value)} className="input-glass" placeholder="https://…"/>
                {form.image_url && <img src={form.image_url} alt="preview" className="mt-2 h-24 w-full object-cover rounded-xl" onError={e=>{(e.target as HTMLImageElement).style.display="none"}}/>}
              </div>
              <div className="col-span-2">
                <label className="field-label">Alt Text (SEO)</label>
                <input value={form.alt_text} onChange={e=>set("alt_text",e.target.value)} className="input-glass" placeholder="Describe the image for screen readers"/>
              </div>
              <div className="col-span-2">
                <label className="field-label">Description</label>
                <textarea value={form.description} onChange={e=>set("description",e.target.value)} className="input-glass resize-none" rows={2} placeholder="Optional description…"/>
              </div>
              <div>
                <label className="field-label">Sort Order</label>
                <input value={form.sort_order} onChange={e=>set("sort_order",parseInt(e.target.value)||0)} className="input-glass" type="number" min="0"/>
              </div>
              <div className="flex items-center gap-3 pt-5">
                <button
                  type="button"
                  onClick={()=>set("featured",!form.featured)}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                  style={{ background:form.featured?"linear-gradient(135deg,#5603ad,#8367c7)":"rgba(131,103,199,0.2)" }}
                >
                  <span className="inline-block h-4 w-4 rounded-full bg-white shadow transition-transform" style={{ transform:form.featured?"translateX(22px)":"translateX(2px)" }}/>
                </button>
                <label className="field-label mb-0">Featured</label>
              </div>
            </div>
            {error && <p className="text-sm px-3 py-2 rounded-xl" style={{ background:"rgba(229,62,62,0.08)",color:"#c53030" }}>{error}</p>}
          </div>
          <div className="px-7 py-4 border-t flex justify-end gap-3" style={{ borderColor:"rgba(131,103,199,0.1)" }}>
            <button onClick={onClose} className="btn-ghost px-5 py-2 text-xs">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary px-5 py-2 text-xs" style={{ opacity:saving?0.7:1 }}>{saving?"Saving…":item?"Save Changes":"Add Artwork"}</button>
          </div>
        </div>
      </div>
      <style>{`.field-label{display:block;font-family:var(--font-mono);font-size:0.6rem;letter-spacing:0.2em;text-transform:uppercase;color:var(--fg-subtle);margin-bottom:6px;}`}</style>
    </>
  );
}

export default function GalleryAdminPage() {
  const { data, loading, create, update, remove } = useGalleryAdmin();
  const [modal,setModal]     = useState<"create"|GalleryItem|null>(null);
  const [deleteId,setDeleteId] = useState<string|null>(null);

  const handleSave = async (form: FormState) => {
    const payload = { ...form };
    if (modal && modal !== "create") await update((modal as GalleryItem).id, payload);
    else await create(payload as Omit<GalleryItem,"id"|"created_at"|"updated_at"|"src"|"alt">);
  };

  return (
    <div className="max-w-6xl space-y-5">
      <div className="flex justify-end">
        <button onClick={()=>setModal("create")} className="btn-primary text-xs px-4 py-2.5">+ Add Artwork</button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(6)].map((_,i)=><div key={i} className="aspect-square rounded-2xl animate-pulse" style={{ background:"rgba(131,103,199,0.08)" }}/>)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {data.map(item => (
            <div key={item.id} className="group relative rounded-2xl overflow-hidden" style={{ boxShadow:"0 4px 16px rgba(86,3,173,0.08)" }}>
              <img src={item.image_url} alt={item.alt_text} className="w-full aspect-square object-cover"/>
              {item.featured && (
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-white text-xs" style={{ background:"linear-gradient(135deg,#5603ad,#8367c7)", fontFamily:"var(--font-mono)", fontSize:"0.55rem" }}>
                  Featured
                </span>
              )}
              {/* Hover overlay */}
              <div className="absolute inset-0 flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background:"linear-gradient(to top,rgba(86,3,173,0.7),transparent)" }}>
                <p style={{ fontFamily:"var(--font-display)",fontWeight:700,color:"white",fontSize:"0.85rem",marginBottom:"2px" }}>{item.title}</p>
                <p style={{ fontFamily:"var(--font-mono)",fontSize:"0.6rem",color:"rgba(255,255,255,0.7)",textTransform:"uppercase",letterSpacing:"0.08em" }}>{item.medium} · {item.year}</p>
                <div className="flex gap-2 mt-2">
                  <button onClick={()=>setModal(item)} className="flex-1 py-1.5 rounded-lg text-xs text-white transition-colors" style={{ background:"rgba(255,255,255,0.2)",backdropFilter:"blur(8px)",fontFamily:"var(--font-sans)" }}
                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background="rgba(255,255,255,0.35)"}
                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background="rgba(255,255,255,0.2)"}>
                    Edit
                  </button>
                  <button onClick={()=>setDeleteId(item.id)} className="px-3 py-1.5 rounded-lg text-xs text-white transition-colors" style={{ background:"rgba(229,62,62,0.4)",fontFamily:"var(--font-sans)" }}
                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background="rgba(229,62,62,0.6)"}
                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background="rgba(229,62,62,0.4)"}>
                    Del
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal !== null && <GalleryModal item={modal==="create"?null:modal as GalleryItem} onClose={()=>setModal(null)} onSave={handleSave}/>}

      {deleteId && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={()=>setDeleteId(null)}/>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm rounded-2xl p-6 text-center" style={{ background:"rgba(255,255,255,0.95)",backdropFilter:"blur(24px)",border:"1px solid rgba(255,255,255,0.9)",boxShadow:"0 16px 60px rgba(86,3,173,0.15)" }}>
              <p style={{ fontFamily:"var(--font-display)",fontSize:"1.2rem",fontWeight:700,color:"var(--fg)",marginBottom:"8px" }}>Remove Artwork?</p>
              <p style={{ fontFamily:"var(--font-sans)",fontSize:"0.85rem",color:"var(--fg-muted)",marginBottom:"20px" }}>This cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={()=>setDeleteId(null)} className="btn-ghost flex-1 justify-center text-xs">Cancel</button>
                <button onClick={async()=>{await remove(deleteId);setDeleteId(null);}} className="flex-1 py-3 rounded-full text-xs font-medium text-white" style={{ background:"linear-gradient(135deg,#e53e3e,#c53030)" }}>Delete</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}