import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) setError(err.message);
    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        background: "linear-gradient(135deg, #f0fff1 0%, #e9e0f8 50%, #f0fff1 100%)",
        fontFamily: "var(--font-sans, 'Outfit', sans-serif)",
      }}
    >
      {/* Card */}
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          borderRadius: "24px",
          padding: "2.5rem",
          background: "rgba(255,255,255,0.80)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.95)",
          boxShadow: "0 24px 80px rgba(86,3,173,0.14)",
        }}
      >
        {/* Logo */}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginBottom:"2rem" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg,#5603ad,#8367c7)",
              color: "white",
              fontSize: "1.25rem",
              fontWeight: 700,
              marginBottom: "1rem",
            }}
          >
            d
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display,'Playfair Display',Georgia,serif)",
              fontSize: "1.75rem",
              fontWeight: 700,
              color: "#1a0f2e",
              margin: 0,
            }}
          >
            Admin Portal
          </h1>
          <p style={{ fontSize:"0.85rem", color:"#8a7fab", marginTop:"4px" }}>
            deimint · Artist Dashboard
          </p>
        </div>

        <form onSubmit={handleLogin}>
          {/* Email */}
          <div style={{ marginBottom:"1rem" }}>
            <label style={{ display:"block", fontFamily:"'JetBrains Mono',monospace", fontSize:"0.6rem", letterSpacing:"0.25em", textTransform:"uppercase", color:"#8a7fab", marginBottom:"6px" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="artist@deimint.com"
              required
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                borderRadius: "12px",
                border: "1px solid rgba(131,103,199,0.25)",
                background: "rgba(255,255,255,0.8)",
                color: "#1a0f2e",
                fontSize: "0.875rem",
                outline: "none",
                fontFamily: "inherit",
              }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom:"1.25rem" }}>
            <label style={{ display:"block", fontFamily:"'JetBrains Mono',monospace", fontSize:"0.6rem", letterSpacing:"0.25em", textTransform:"uppercase", color:"#8a7fab", marginBottom:"6px" }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                borderRadius: "12px",
                border: "1px solid rgba(131,103,199,0.25)",
                background: "rgba(255,255,255,0.8)",
                color: "#1a0f2e",
                fontSize: "0.875rem",
                outline: "none",
                fontFamily: "inherit",
              }}
            />
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                marginBottom: "1rem",
                padding: "0.75rem 1rem",
                borderRadius: "12px",
                background: "rgba(229,62,62,0.08)",
                color: "#c53030",
                fontSize: "0.85rem",
                border: "1px solid rgba(229,62,62,0.2)",
              }}
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.85rem",
              borderRadius: "50px",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              background: "linear-gradient(135deg,#5603ad,#8367c7)",
              color: "white",
              fontSize: "0.9rem",
              fontWeight: 600,
              fontFamily: "inherit",
              opacity: loading ? 0.7 : 1,
              boxShadow: "0 4px 20px rgba(86,3,173,0.3)",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            {loading ? (
              <>
                <svg style={{ width:"16px", height:"16px", animation:"spin 1s linear infinite" }} viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.25"/>
                  <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Signing in…
              </>
            ) : "Sign In →"}
          </button>
        </form>

        <p style={{ textAlign:"center", marginTop:"1.25rem", fontFamily:"'JetBrains Mono',monospace", fontSize:"0.6rem", color:"#8a7fab" }}>
          Forgot password? Reset via Supabase dashboard.
        </p>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}