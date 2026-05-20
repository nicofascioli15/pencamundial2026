"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function UnirsePage() {
  const router = useRouter();
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [modo, setModo] = useState<"unirse"|"login"|"registro">("unirse");

  // Campos auth
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [authErr, setAuthErr] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get("codigo");
    if (c) setCodigo(c.toUpperCase());
  }, []);

  // Intentar unirse — si no está logueado muestra login/registro
  const intentarUnirse = async (codigoParam = codigo) => {
    setLoading(true); setErr("");
    const r = await fetch("/api/grupos/unirse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codigo: codigoParam })
    }).then(r => r.json());
    setLoading(false);
    if (r.error === "No autorizado") { setModo("login"); return; }
    if (r.error) { setErr(r.error); return; }
    router.push("/penca?tab=misgrupos");
  };

  const handleLogin = async () => {
    setAuthErr(""); setAuthLoading(true);
    const r = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    }).then(r => r.json());
    setAuthLoading(false);
    if (r.error) { setAuthErr(r.error); return; }
    // logueado — unirse automáticamente
    await intentarUnirse();
  };

  const handleRegistro = async () => {
    setAuthErr(""); setAuthLoading(true);
    const r = await fetch("/api/auth/registro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, nombre })
    }).then(r => r.json());
    setAuthLoading(false);
    if (r.error) { setAuthErr(r.error); return; }
    // registrado — unirse automáticamente
    await intentarUnirse();
  };

  const css = `
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'DM Sans',system-ui,sans-serif}
    .wrap{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 20px;background:linear-gradient(160deg,#060e18 0%,#123952 60%,#1d5278 100%)}
    .card{width:100%;max-width:360px;background:#fff;border-radius:20px;padding:28px 22px;box-shadow:0 20px 60px rgba(0,0,0,.4)}
    .logo{height:40px;display:block;margin:0 auto 16px}
    .titulo{font-size:19px;font-weight:800;color:#123952;text-align:center;margin-bottom:4px}
    .subtitulo{font-size:13px;color:#6b7280;text-align:center;margin-bottom:20px}
    .codigo-box{text-align:center;background:#f2f7fb;border:2px solid #dde4ec;border-radius:14px;padding:14px;margin-bottom:18px}
    .codigo-lbl{font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#6b7280;margin-bottom:4px}
    .codigo-val{font-family:monospace;font-size:28px;font-weight:900;color:#123952;letter-spacing:6px}
    .btn{width:100%;padding:14px;border:none;border-radius:12px;background:linear-gradient(135deg,#123952,#1d5278);color:#fff;font-size:15px;font-weight:700;cursor:pointer;box-shadow:0 4px 16px rgba(18,57,82,.3)}
    .btn:disabled{opacity:.6;cursor:default}
    .err{background:rgba(220,38,38,.08);border:1px solid rgba(220,38,38,.2);border-radius:10px;padding:10px 14px;color:#dc2626;font-size:13px;margin-bottom:12px;text-align:center}
    .tabs{display:flex;margin-bottom:18px;border-bottom:2px solid #dde4ec}
    .tab{flex:1;padding:10px;background:transparent;border:none;font-size:14px;font-weight:600;color:#6b7280;cursor:pointer}
    .tab.on{color:#123952;border-bottom:2px solid #123952;margin-bottom:-2px}
    label{display:block;font-size:11px;font-weight:700;letter-spacing:1px;color:#6b7280;margin-bottom:5px;text-transform:uppercase}
    input{width:100%;padding:11px 13px;border-radius:10px;border:1.5px solid #dde4ec;background:#f2f7fb;font-size:14px;outline:none;margin-bottom:12px}
    input:focus{border-color:#123952}
    .link{background:transparent;border:none;color:#6b7280;font-size:12px;cursor:pointer;text-decoration:underline;display:block;text-align:center;margin-top:10px}
    .divider{display:flex;align-items:center;gap:8px;margin:14px 0;color:#9ca3af;font-size:11px}
    .divider::before,.divider::after{content:'';flex:1;height:1px;background:#dde4ec}
    .tribar{height:3px;background:linear-gradient(90deg,#E61D25 33%,#3CAC3B 33% 66%,#2A398D 66%);border-radius:3px;margin-bottom:20px}
  `;

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&display=swap" rel="stylesheet"/>
      <style>{css}</style>
      <div className="wrap">
        <div className="card">
          <div className="tribar"/>
          <img src="/logo.svg" className="logo" alt="Fascioli"/>

          {/* PASO 1 — Unirse directo */}
          {modo === "unirse" && <>
            <div className="titulo">¡Te invitaron a un grupo!</div>
            <div className="subtitulo">Penca Mundial 2026</div>
            {codigo && (
              <div className="codigo-box">
                <div className="codigo-lbl">Código del grupo</div>
                <div className="codigo-val">{codigo}</div>
              </div>
            )}
            {!codigo && (
              <div style={{marginBottom:16}}>
                <label>Código del grupo</label>
                <input value={codigo} onChange={e=>setCodigo(e.target.value.toUpperCase())} placeholder="Ej: PEPE2" style={{textAlign:"center",letterSpacing:4,fontFamily:"monospace",fontSize:20}}/>
              </div>
            )}
            {err && <div className="err">⚠️ {err}</div>}
            <button className="btn" onClick={()=>intentarUnirse()} disabled={loading||!codigo.trim()}>
              {loading ? "Uniéndome..." : "Unirme al grupo →"}
            </button>
          </>}

          {/* PASO 2 — Login o Registro */}
          {(modo === "login" || modo === "registro") && <>
            <div className="titulo">Primero iniciá sesión</div>
            <div className="subtitulo">Después te unimos al grupo automáticamente</div>
            {codigo && (
              <div style={{textAlign:"center",background:"#f2f7fb",borderRadius:10,padding:"8px 14px",marginBottom:16,fontSize:12,color:"#6b7280"}}>
                🏘️ Grupo: <strong style={{color:"#123952",fontFamily:"monospace",letterSpacing:2}}>{codigo}</strong>
              </div>
            )}
            <div className="tabs">
              <button className={`tab ${modo==="login"?"on":""}`} onClick={()=>{setModo("login");setAuthErr("");}}>Iniciar sesión</button>
              <button className={`tab ${modo==="registro"?"on":""}`} onClick={()=>{setModo("registro");setAuthErr("");}}>Registrarme</button>
            </div>

            {modo === "login" && <>
              <label>Usuario</label>
              <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="tu_usuario" autoCapitalize="none"/>
              <label>Contraseña</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••"/>
              {authErr && <div className="err">⚠️ {authErr}</div>}
              <button className="btn" onClick={handleLogin} disabled={authLoading}>
                {authLoading ? "Ingresando..." : "Ingresar y unirme →"}
              </button>
            </>}

            {modo === "registro" && <>
              <label>Tu nombre</label>
              <input value={nombre} onChange={e=>setNombre(e.target.value)} placeholder="Ej: Nico Fascioli"/>
              <label>Usuario</label>
              <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="sin espacios, ej: nico99" autoCapitalize="none"/>
              <label>Contraseña</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••"/>
              {authErr && <div className="err">⚠️ {authErr}</div>}
              <button className="btn" onClick={handleRegistro} disabled={authLoading}>
                {authLoading ? "Registrándome..." : "Crear cuenta y unirme →"}
              </button>
            </>}

            <button className="link" onClick={()=>setModo("unirse")}>← Volver</button>
          </>}
        </div>
      </div>
    </>
  );
}
