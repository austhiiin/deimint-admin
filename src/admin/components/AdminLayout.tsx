import { useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

const PURPLE      = "#5603ad";
const PURPLE_MID  = "#8367c7";
//const MINT        = "#b3e9c7";
const FG          = "#1a0f2e";
const FG_MUTED    = "#4a3f6b";
const FG_SUBTLE   = "#8a7fab";
const BORDER_CLR  = "rgba(131,103,199,0.12)";
const GLASS_BG    = "rgba(255,255,255,0.75)";

interface NavItem { id: string; label: string; icon: React.ReactNode; }

const NAV: NavItem[] = [
  { id:"dashboard",   label:"Dashboard",   icon:<svg style={{width:16,height:16}} fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.7"><rect x="2" y="2" width="7" height="7" rx="1.5"/><rect x="11" y="2" width="7" height="7" rx="1.5"/><rect x="2" y="11" width="7" height="7" rx="1.5"/><rect x="11" y="11" width="7" height="7" rx="1.5"/></svg> },
  { id:"commissions", label:"Commissions", icon:<svg style={{width:16,height:16}} fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.7"><path d="M9 2H5a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V9"/><polyline points="9 2 9 9 16 9"/><line x1="6" y1="13" x2="14" y2="13"/><line x1="6" y1="16" x2="10" y2="16"/></svg> },
  { id:"gallery",     label:"Gallery",     icon:<svg style={{width:16,height:16}} fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.7"><rect x="2" y="2" width="7" height="9" rx="1.5"/><rect x="11" y="2" width="7" height="5" rx="1.5"/><rect x="11" y="9" width="7" height="9" rx="1.5"/><rect x="2" y="13" width="7" height="5" rx="1.5"/></svg> },
  { id:"messages",    label:"Messages",    icon:<svg style={{width:16,height:16}} fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.7"><path d="M4 4h12a2 2 0 012 2v7a2 2 0 01-2 2H6l-4 3V6a2 2 0 012-2z"/></svg> },
  { id:"settings",    label:"Settings",    icon:<svg style={{width:16,height:16}} fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.7"><circle cx="10" cy="10" r="3"/><path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M4.22 15.78l1.42-1.42M14.36 5.64l1.42-1.42"/></svg> },
];

interface AdminLayoutProps {
  user: User;
  activePage: string;
  onNavigate: (page: string) => void;
  children: React.ReactNode;
  unreadCount?: number;
}

export default function AdminLayout({ user, activePage, onNavigate, children, unreadCount = 0 }: AdminLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => { await supabase.auth.signOut(); };

  const SidebarContent = () => (
    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      {/* Brand */}
      <div style={{ padding:"1.5rem 1.25rem", borderBottom:`1px solid ${BORDER_CLR}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:"0.75rem" }}>
          <div style={{ width:36,height:36,borderRadius:10,background:`linear-gradient(135deg,${PURPLE},${PURPLE_MID})`,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:700,fontSize:"0.9rem" }}>d</div>
          <div>
            <div style={{ fontFamily:"'Playfair Display',Georgia,serif",fontWeight:700,color:FG,fontSize:"1rem" }}>deimint</div>
            <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:"0.55rem",letterSpacing:"0.1em",color:FG_SUBTLE,textTransform:"uppercase" }}>Admin</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex:1,padding:"0.75rem",display:"flex",flexDirection:"column",gap:"2px" }}>
        {NAV.map(item => {
          const active = activePage === item.id;
          return (
            <button key={item.id} onClick={() => { onNavigate(item.id); setMobileOpen(false); }}
              style={{
                width:"100%", display:"flex", alignItems:"center", gap:"0.75rem",
                padding:"0.6rem 0.75rem", borderRadius:12, border: active ? `1px solid rgba(131,103,199,0.18)` : "1px solid transparent",
                background: active ? "linear-gradient(135deg,rgba(86,3,173,0.09),rgba(131,103,199,0.06))" : "transparent",
                color: active ? PURPLE : FG_MUTED,
                fontFamily:"'Outfit',system-ui,sans-serif", fontSize:"0.875rem", fontWeight: active ? 600 : 400,
                cursor:"pointer", textAlign:"left", position:"relative",
              }}
            >
              {item.icon}
              {item.label}
              {item.id === "messages" && unreadCount > 0 && (
                <span style={{ marginLeft:"auto",background:`linear-gradient(135deg,${PURPLE},${PURPLE_MID})`,color:"white",borderRadius:999,padding:"1px 7px",fontSize:"0.62rem",fontFamily:"'JetBrains Mono',monospace" }}>
                  {unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User */}
      <div style={{ padding:"1rem 1.25rem", borderTop:`1px solid ${BORDER_CLR}` }}>
        <div style={{ display:"flex",alignItems:"center",gap:"0.6rem",marginBottom:"0.6rem" }}>
          <div style={{ width:32,height:32,borderRadius:999,background:`linear-gradient(135deg,${PURPLE},${PURPLE_MID})`,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:"0.75rem",fontWeight:700,flexShrink:0 }}>
            {user.email?.charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth:0 }}>
            <div style={{ fontFamily:"'Outfit',sans-serif",fontSize:"0.78rem",fontWeight:500,color:FG,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{user.email}</div>
            <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:"0.52rem",color:FG_SUBTLE,textTransform:"uppercase",letterSpacing:"0.1em" }}>Artist</div>
          </div>
        </div>
        <button onClick={handleSignOut}
          style={{ width:"100%",display:"flex",alignItems:"center",gap:"0.5rem",padding:"0.5rem 0.6rem",borderRadius:10,border:"none",background:"transparent",color:FG_SUBTLE,fontFamily:"'Outfit',sans-serif",fontSize:"0.8rem",cursor:"pointer" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background="rgba(229,62,62,0.07)"; (e.currentTarget as HTMLElement).style.color="#c53030"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background="transparent"; (e.currentTarget as HTMLElement).style.color=FG_SUBTLE; }}
        >
          <svg style={{width:15,height:15}} fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.7"><path d="M13 3h4a2 2 0 012 2v10a2 2 0 01-2 2h-4M9 14l4-4-4-4M1 10h12"/></svg>
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display:"flex", height:"100vh", overflow:"hidden", background:"#f7fdf8", fontFamily:"'Outfit',system-ui,sans-serif" }}>

      {/* Desktop sidebar */}
      <aside style={{ width:220,flexShrink:0,background:GLASS_BG,backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",borderRight:`1px solid ${BORDER_CLR}`,display:"flex",flexDirection:"column" }}
        className="hidden md:flex">
        <SidebarContent/>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div onClick={() => setMobileOpen(false)} style={{ position:"fixed",inset:0,zIndex:40,background:"rgba(0,0,0,0.3)",backdropFilter:"blur(4px)" }}/>
          <aside style={{ position:"fixed",left:0,top:0,bottom:0,zIndex:50,width:220,background:"rgba(255,255,255,0.97)",backdropFilter:"blur(24px)",borderRight:`1px solid ${BORDER_CLR}`,display:"flex",flexDirection:"column" }}>
            <SidebarContent/>
          </aside>
        </>
      )}

      {/* Main */}
      <div style={{ flex:1,display:"flex",flexDirection:"column",overflow:"hidden" }}>
        {/* Topbar */}
        <header style={{ flexShrink:0,height:56,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 1.5rem",background:GLASS_BG,backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)",borderBottom:`1px solid ${BORDER_CLR}` }}>
          <div style={{ display:"flex",alignItems:"center",gap:"1rem" }}>
            <button onClick={() => setMobileOpen(true)} style={{ background:"transparent",border:"none",cursor:"pointer",color:FG_MUTED,padding:4,display:"flex" }} className="md:hidden">
              <svg style={{width:20,height:20}} fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.7"><line x1="3" y1="6" x2="17" y2="6"/><line x1="3" y1="10" x2="17" y2="10"/><line x1="3" y1="14" x2="17" y2="14"/></svg>
            </button>
            <h1 style={{ fontFamily:"'Playfair Display',Georgia,serif",fontSize:"1.1rem",fontWeight:700,color:FG,textTransform:"capitalize",margin:0 }}>{activePage}</h1>
          </div>
          <a href="/" target="_blank" rel="noopener noreferrer"
            style={{ display:"flex",alignItems:"center",gap:6,padding:"4px 10px",borderRadius:8,fontFamily:"'JetBrains Mono',monospace",fontSize:"0.65rem",color:FG_SUBTLE,textDecoration:"none" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color=PURPLE; (e.currentTarget as HTMLElement).style.background="rgba(86,3,173,0.06)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color=FG_SUBTLE; (e.currentTarget as HTMLElement).style.background="transparent"; }}
          >
            <svg style={{width:13,height:13}} fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.7"><path d="M10 2h4v4M14 2L8 8M7 3H3a1 1 0 00-1 1v9a1 1 0 001 1h9a1 1 0 001-1V9"/></svg>
            View Site
          </a>
        </header>

        {/* Page */}
        <main style={{ flex:1,overflowY:"auto",padding:"1.5rem",backgroundImage:"radial-gradient(ellipse at 0% 0%,rgba(179,233,199,0.3) 0%,transparent 55%),radial-gradient(ellipse at 100% 0%,rgba(131,103,199,0.1) 0%,transparent 50%)" }}>
          {children}
        </main>
      </div>
    </div>
  );
}