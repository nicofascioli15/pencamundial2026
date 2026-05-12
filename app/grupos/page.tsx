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

  const colores = ["#123952", "#e8a020", "#2e9e6b", "#9333ea", "#dc2626", "#0891b2"];

  if (cargando) return (
    <div style={{display:"flex",justifyContent:"center",alignItems:"center",minHeight:"100vh",background:"#f2f7fb"}}>
      <img src="/pelota.png" style={{width:60,animation:"spin 1s linear infinite"}}/>
    </div>
  );

  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:"#f2f7fb",minHeight:"100vh"}}>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <div style={{background:"#123952",padding:"16px 16px 0"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <button onClick={()=>router.push("/penca")} style={{background:"transparent",border:"none",color:"rgba(255,255,255,.7)",fontSize:20,cursor:"pointer"}}>←</button>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:16,fontWeight:700,color:"#fff"}}>Mis Grupos</div>
            <div style={{fontSize:9,color:"#e8a020",letterSpacing:3,textTransform:"uppercase"}}>Penca Mundial 2026</div>
          </div>
          <div style={{width:28}}/>
        </div>
      </div>

      <div style={{padding:16}}>
        {/* Botones crear/unirse */}
        <div style={{display:"flex",gap:8,marginBottom:16}}>
          <button onClick={()=>{setModalCrear(true);setErr("");}} style={{flex:1,padding:13,border:"none",borderRadius:12,background:"#123952",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer"}}>➕ Crear grupo</button>
          <button onClick={()=>{setModalUnirse(true);setErr("");}} style={{flex:1,padding:13,border:"1.5px solid #dde4ec",borderRadius:12,background:"#fff",color:"#123952",fontWeight:700,fontSize:13,cursor:"pointer"}}>🔑 Unirme</button>
        </div>

        {/* Lista de grupos */}
        {grupos.map((g, idx) => (
          <div key={g.id} onClick={()=>router.push(`/penca?grupo=${g.id}`)}
            style={{background:"#fff",border:"1px solid #dde4ec",borderRadius:16,padding:16,marginBottom:10,boxShadow:"0 2px 12px rgba(18,57,82,.06)",cursor:"pointer",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",left:0,top:0,bottom:0,width:4,background:colores[idx % colores.length],borderRadius:"4px 0 0 4px"}}/>
            <div style={{paddingLeft:8}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                <div>
                  <div style={{fontSize:16,fontWeight:700,color:"#1a1f24"}}>{g.nombre}</div>
                  <div style={{fontSize:11,color:"#6b7280",marginTop:2}}>👥 {g.miembros} participantes</div>
                </div>
                {g.codigo !== "GLOBAL" && (
                  <div style={{fontFamily:"monospace",fontSize:11,fontWeight:700,background:"#f2f7fb",color:"#123952",padding:"3px 8px",borderRadius:6}}>{g.codigo}</div>
                )}
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:10,borderTop:"1px solid #f0f0f0"}}>
                <div>
                  <div style={{fontSize:12,fontWeight:600,color:"#1a1f24"}}>Tu posición</div>
                  <div style={{fontSize:11,color:"#6b7280"}}>✅ {g.miExactos} · 👍 {g.miGanadores}</div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{fontFamily:"Georgia,serif",fontSize:28,fontWeight:900,color:"#123952"}}>{g.miPts}</div>
                  <div style={{fontFamily:"Georgia,serif",fontSize:22,fontWeight:900,color:"#e8a020"}}>{g.miPos > 0 ? `#${g.miPos}` : "—"}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Crear */}
      {modalCrear && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>setModalCrear(false)}>
          <div style={{background:"#fff",borderRadius:"20px 20px 0 0",width:"100%",maxWidth:430,padding:"24px 20px 40px"}} onClick={e=>e.stopPropagation()}>
            <div style={{width:40,height:4,background:"#dde4ec",borderRadius:4,margin:"0 auto 20px"}}/>
            <div style={{fontSize:18,fontWeight:700,marginBottom:16}}>Crear grupo</div>
            <label style={{fontSize:11,fontWeight:700,color:"#6b7280",letterSpacing:1,textTransform:"uppercase",display:"block",marginBottom:6}}>Nombre del grupo</label>
            <input value={nombreNuevo} onChange={e=>setNombreNuevo(e.target.value)} placeholder="Ej: Amigos de Nico" style={{width:"100%",padding:"12px 14px",borderRadius:10,border:"1.5px solid #dde4ec",fontSize:15,outline:"none",marginBottom:6,boxSizing:"border-box"}}/>
            {err && <div style={{fontSize:12,color:"#dc2626",fontWeight:600,marginBottom:10}}>⚠️ {err}</div>}
            <button onClick={crearGrupo} disabled={loading} style={{width:"100%",marginTop:10,padding:14,border:"none",borderRadius:12,background:"#123952",color:"#fff",fontWeight:700,fontSize:15,cursor:"pointer"}}>
              {loading ? "Creando..." : "Crear grupo →"}
            </button>
          </div>
        </div>
      )}

      {/* Modal Unirse */}
      {modalUnirse && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>setModalUnirse(false)}>
          <div style={{background:"#fff",borderRadius:"20px 20px 0 0",width:"100%",maxWidth:430,padding:"24px 20px 40px"}} onClick={e=>e.stopPropagation()}>
            <div style={{width:40,height:4,background:"#dde4ec",borderRadius:4,margin:"0 auto 20px"}}/>
            <div style={{fontSize:18,fontWeight:700,marginBottom:16}}>Unirme a un grupo</div>
            <label style={{fontSize:11,fontWeight:700,color:"#6b7280",letterSpacing:1,textTransform:"uppercase",display:"block",marginBottom:6}}>Código del grupo</label>
            <input value={codigoUnirse} onChange={e=>setCodigoUnirse(e.target.value.toUpperCase())} placeholder="Ej: PEPE2" autoCapitalize="characters" style={{width:"100%",padding:"12px 14px",borderRadius:10,border:"1.5px solid #dde4ec",fontSize:15,fontFamily:"monospace",outline:"none",marginBottom:6,boxSizing:"border-box"}}/>
            {err && <div style={{fontSize:12,color:"#dc2626",fontWeight:600,marginBottom:10}}>⚠️ {err}</div>}
            <button onClick={unirseGrupo} disabled={loading} style={{width:"100%",marginTop:10,padding:14,border:"none",borderRadius:12,background:"#123952",color:"#fff",fontWeight:700,fontSize:15,cursor:"pointer"}}>
              {loading ? "Uniéndome..." : "Unirme →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
