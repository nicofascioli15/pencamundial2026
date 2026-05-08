"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LOGO_SVG } from "@/lib/logo";

export default function LoginPage() {
  const router = useRouter();
  const [modo, setModo] = useState<"login"|"registro">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [invite, setInvite] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(false);

  const css = `
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:#123952;font-family:'DM Sans',sans-serif}
    .wrap{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 20px;background:linear-gradient(160deg,#123952 0%,#1d5278 100%)}
    .logo-wrap{margin-bottom:28px;text-align:center}
    .logo-svg{height:44px;color:#fff;display:block;margin:0 auto}
    .divider{width:40px;height:2px;background:#e8a020;margin:14px auto 12px;border-radius:2px}
    .subtitle{font-family:'DM Sans',sans-serif;font-size:14px;color:rgba(255,255,255,.7);text-align:center;letter-spacing:.5px}
    .subtitle strong{color:#e8a020}
    .card{width:100%;max-width:360px;background:#fff;border-radius:20px;padding:26px 22px;box-shadow:0 20px 60px rgba(0,0,0,.3)}
    .tabs{display:flex;margin-bottom:22px;border-bottom:2px solid #dde4ec}
    .tab{flex:1;padding:10px;background:transparent;border:none;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;color:#6b7280;cursor:pointer;transition:color .2s}
    .tab.on{color:#123952;border-bottom:2px solid #123952;margin-bottom:-2px}
    label{display:block;font-size:11px;font-weight:700;letter-spacing:1.5px;color:#6b7280;margin-bottom:5px;text-transform:uppercase}
    input{width:100%;padding:12px 14px;border-radius:10px;border:1.5px solid #dde4ec;background:#f2f7fb;color:#1a1f24;font-size:15px;font-family:'DM Sans',sans-serif;outline:none;margin-bottom:14px;transition:border-color .2s}
    input:focus{border-color:#123952}
    .btn{width:100%;padding:14px;border:none;border-radius:12px;background:#123952;color:#fff;font-family:'DM Sans',sans-serif;font-size:15px;font-weight:700;cursor:pointer;box-shadow:0 4px 16px rgba(18,57,82,.4);transition:all .2s;margin-top:4px}
    .btn:hover{background:#1d5278;transform:translateY(-1px)}
    .btn:disabled{opacity:.6;cursor:default;transform:none}
    .err{background:rgba(220,38,38,.08);border:1px solid rgba(220,38,38,.25);border-radius:10px;padding:10px 14px;color:#dc2626;font-size:13px;margin-bottom:14px;text-align:center}
    .ok{background:rgba(46,158,107,.08);border:1px solid rgba(46,158,107,.25);border-radius:10px;padding:10px 14px;color:#2e9e6b;font-size:13px;margin-bottom:14px;text-align:center}
  `;

  const handleLogin = async () => {
    setErr(""); setLoading(true);
    const r = await fetch("/api/auth/login", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ username, password }),
    });
    const d = await r.json();
    setLoading(false);
    if (!r.ok) { setErr(d.error); return; }
    router.push(d.isAdmin ? "/admin" : "/penca");
  };

  const handleRegistro = async () => {
    setErr(""); setLoading(true);
    const r = await fetch("/api/auth/registro", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ username, password, nombre, inviteCode: invite }),
    });
    const d = await r.json();
    setLoading(false);
    if (!r.ok) { setErr(d.error); return; }
    setOk("¡Cuenta creada! Ya podés iniciar sesión.");
    setModo("login"); setErr("");
  };

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&display=swap" rel="stylesheet" />
      <style>{css}</style>
      <div className="wrap">
        <div className="logo-wrap">
          <div className="logo-svg" dangerouslySetInnerHTML={{ __html: LOGO_SVG }} />
          <div className="divider" />
          <div className="subtitle">Penca <strong>Mundial 2026</strong></div>
        </div>
        <div className="card">
          <div className="tabs">
            <button className={`tab ${modo==="login"?"on":""}`} onClick={() => { setModo("login"); setErr(""); setOk(""); }}>Ingresar</button>
            <button className={`tab ${modo==="registro"?"on":""}`} onClick={() => { setModo("registro"); setErr(""); setOk(""); }}>Registrarse</button>
          </div>
          {err && <div className="err">⚠️ {err}</div>}
          {ok && <div className="ok">✅ {ok}</div>}
          {modo === "registro" && <>
            <label>Nombre completo</label>
            <input placeholder="Ej: Juan García" value={nombre} onChange={e => setNombre(e.target.value)} />
          </>}
          <label>Usuario</label>
          <input placeholder="Ej: jgarcia" value={username} onChange={e => setUsername(e.target.value)} autoCapitalize="none" />
          <label>Contraseña</label>
          <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key==="Enter" && modo==="login" && handleLogin()} />
          {modo === "registro" && <>
            <label>🔑 Código de invitación</label>
            <input placeholder="Pedíselo a Fascioli" value={invite} onChange={e => setInvite(e.target.value)} />
          </>}
          <button className="btn" disabled={loading} onClick={modo==="login" ? handleLogin : handleRegistro}>
            {loading ? "Cargando..." : modo==="login" ? "Ingresar →" : "Crear cuenta"}
          </button>
        </div>
      </div>
    </>
  );
}
