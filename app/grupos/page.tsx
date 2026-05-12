"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface GrupoResumen {
  id: string;
  nombre: string;
  codigo: string;
  miembros: number;
  miPos: number;
  miPts: number;
  miExactos: number;
  miGanadores: number;
}

export default function GruposPage() {
  const router = useRouter();
  const [grupos, setGrupos] = useState<GrupoResumen[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modalCrear, setModalCrear] = useState(false);
  const [modalUnirse, setModalUnirse] = useState(false);
  const [nombreNuevo, setNombreNuevo] = useState("");
  const [codigoUnirse, setCodigoUnirse] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const css = `
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'DM Sans',system-ui,sans-serif;background:#f2f7fb;min-height:100vh}
    .header{background:#123952;padding:14px 16px;display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;z-index:10}
    .back-btn{background:transparent;border:none;color:rgba(255,255,255,.7);font-size:22px;cursor:pointer;padding:0 8px 0 0}
    .header-title{font-size:15px;font-weight:700;color:#fff}
    .header-sub{font-size:9px;color:#e8a020;letter-spacing:3px;text-transform:uppercase;margin-top:2px}
    .logo-img{height:28px;display:block}
    .content{padding:16px;max-width:430px;margin:0 auto}
    .action-row{display:flex;gap:8px;margin-bottom:16px}
    .btn-primary{flex:1;padding:13px;border:none;border-radius:12px;background:#123952;color:#fff;font-weight:700;font-size:13px;cursor:pointer}
    .btn-secondary{flex:1;padding:13px;border:1.5px solid #dde4ec;border-radius:12px;background:#fff;color:#123952;font-weight:700;font-size:13px;cursor:pointer}
    .sec-title{font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#123952;margin-bottom:12px;display:flex;align-items:center;gap:8px}
    .sec-title::after{content:'';flex:1;height:1px;background:#dde4ec}
    .group-card{background:#fff;border:1px solid #dde4ec;border-radius:16px;padding:16px;margin-bottom:10px;box-shadow:0 2px 12px rgba(18,57,82,.06);cursor:pointer;position:relative;overflow:hidden;transition:transform .1s}
    .group-card:active{transform:scale(.98)}
    .group-card-bar{position:absolute;left:0;top:0;bottom:0;width:4px;border-radius:4px 0 0 4px}
    .group-name{font-size:16px;font-weight:700;color:#1a1f24}
    .group-meta{font-size:11px;color:#6b7280;margin-top:3px}
    .group-code{font-family:monospace;font-size:11px;font-weight:700;background:#f2f7fb;color:#123952;padding:3px 8px;border-radius:6px;flex-shrink:0}
    .group-footer{display:flex;justify-content:space-between;align-items:center;padding-top:10px;margin-top:10px;border-top:1px solid #f0f0f0}
    .group-pos{font-size:22px;font-weight:900;color:#e8a020;font-family:Georgia,serif}
    .group-pts{font-size:26px;font-weight:900;color:#123952;font-family:Georgia,serif}
    .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:200;display:flex;align-items:flex-end;justify-content:center}
    .modal-box{background:#fff;border-radius:20px 20px 0 0;width:100%;max-width:430px;padding:24px 20px 40px}
    .modal-handle{width:40px;height:4px;background:#dde4ec;border-radius:4px;margin:0 auto 20px}
    .modal-title{font-size:18px;font-weight:700;margin-bottom:16px}
    .input-label{font-size:11px;font-weight:700;color:#6b7280;letter-spacing:1px;text-transform:uppercase;display:block;margin-bottom:6px}
    .input{width:100%;padding:12px 14px;border-radius:10px;border:1.5px solid #dde4ec;font-size:15px;outline:none;margin-bottom:6px;font-family:inherit}
    .error{font-size:12px;color:#dc2626;font-weight:600;margin-bottom:10px}
    .btn-full{width:100%;margin-top:10px;padding:14px;border:none;border-radius:12px;background:#123952;color:#fff;font-weight:700;font-size:15px;cursor:pointer}
    .global-badge{background:#e8a020;color:#123952;font-size:9px;font-weight:700;padding:2px 7px;border-radius:8px;letter-spacing:1px;text-transform:uppercase}
  `;

  const colores = ["#e8a020", "#2e9e6b", "#9333ea", "#dc2626", "#0891b2", "#f59e0b"];

  useEffect(() => {
    fetch("/api/grupos").then(r => r.json()).then(d => {
      setGrupos(d.grupos ?? []);
      setCargando(false);
    });
  }, []);

  const crearGrupo = async () => {
    if (!nombreNuevo.trim()) { setErr("Ingresá un nombre"); return; }
    setLoading(true); setErr("");
    const r = await fetch("/api/grupos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: nombreNuevo })
    }).then(r => r.json());
    setLoading(false);
    if (r.error) { setErr(r.error); return; }
    setModalCrear(false); setNombreNuevo("");
    fetch("/api/grupos").then(r => r.json()).then(d => setGrupos(d.grupos ?? []));
  };

  const unirseGrupo = async () => {
    if (!codigoUnirse.trim()) { setErr("Ingresá el código"); return; }
    setLoading(true); setErr("");
    const r = await fetch("/api/grupos/unirse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codigo: codigoUnirse })
    }).then(r => r.json());
    setLoading(false);
    if (r.error) { setErr(r.error); return; }
    setModalUnirse(false); setCodigoUnirse("");
    fetch("/api/grupos").then(r => r.json()).then(d => setGrupos(d.grupos ?? []));
  };

  if (cargando) return (
    <div style={{display:"flex",justifyContent:"center",alignItems:"center",minHeight:"100vh",background:"#f2f7fb",flexDirection:"column",gap:12}}>
      <img src="/pelota.png" style={{width:60,animation:"spin 1s linear infinite"}}/>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      <span style={{color:"#6b7280",fontSize:13}}>Cargando grupos...</span>
    </div>
  );

  return (
    <div>
      <style>{css}</style>

      <div className="header">
        <button className="back-btn" onClick={()=>router.push("/penca")}>←</button>
        <div style={{textAlign:"center"}}>
          <div className="header-title">Mis Grupos</div>
          <div className="header-sub">Penca Mundial 2026</div>
        </div>
        <img src="/logo.svg" className="logo-img" alt="Fascioli"/>
      </div>

      <div className="content">
        <div className="action-row" style={{marginTop:16}}>
          <button className="btn-primary" onClick={()=>{setModalCrear(true);setErr("");}}>➕ Crear grupo</button>
          <button className="btn-secondary" onClick={()=>{setModalUnirse(true);setErr("");}}>🔑 Unirme</button>
        </div>

        <div className="sec-title">Mis grupos ({grupos.length})</div>

        {grupos.map((g, idx) => (
          <div key={g.id} className="group-card" onClick={()=>router.push(`/penca?grupo=${g.id}`)}>
            <div className="group-card-bar" style={{background: g.id==="fascioli" ? "#123952" : colores[idx % colores.length]}}/>
            <div style={{paddingLeft:8}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div className="group-name">{g.nombre}</div>
                    {g.id==="fascioli" && <span className="global-badge">GLOBAL</span>}
                  </div>
                  <div className="group-meta">👥 {g.miembros} participante{g.miembros!==1?"s":""}</div>
                </div>
                {g.codigo !== "GLOBAL" && <div className="group-code">{g.codigo}</div>}
              </div>
              <div className="group-footer">
                <div>
                  <div style={{fontSize:12,fontWeight:600,color:"#1a1f24"}}>Tu posición</div>
                  <div style={{fontSize:11,color:"#6b7280",marginTop:2}}>✅ {g.miExactos} · 👍 {g.miGanadores}</div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div className="group-pts">{g.miPts} pts</div>
                  {g.miPos > 0 && <div className="group-pos">#{g.miPos}</div>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalCrear && (
        <div className="modal-overlay" onClick={()=>setModalCrear(false)}>
          <div className="modal-box" onClick={e=>e.stopPropagation()}>
            <div className="modal-handle"/>
            <div className="modal-title">Crear grupo</div>
            <label className="input-label">Nombre del grupo</label>
            <input className="input" value={nombreNuevo} onChange={e=>setNombreNuevo(e.target.value)} placeholder="Ej: Amigos de Nico"/>
            {err && <div className="error">⚠️ {err}</div>}
            <button className="btn-full" onClick={crearGrupo} disabled={loading}>
              {loading ? "Creando..." : "Crear grupo →"}
            </button>
          </div>
        </div>
      )}

      {modalUnirse && (
        <div className="modal-overlay" onClick={()=>setModalUnirse(false)}>
          <div className="modal-box" onClick={e=>e.stopPropagation()}>
            <div className="modal-handle"/>
            <div className="modal-title">Unirme a un grupo</div>
            <label className="input-label">Código del grupo</label>
            <input className="input" value={codigoUnirse} onChange={e=>setCodigoUnirse(e.target.value.toUpperCase())} placeholder="Ej: PEPE2" style={{fontFamily:"monospace"}}/>
            {err && <div className="error">⚠️ {err}</div>}
            <button className="btn-full" onClick={unirseGrupo} disabled={loading}>
              {loading ? "Uniéndome..." : "Unirme →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
