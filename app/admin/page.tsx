"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { TODOS_PARTIDOS, GRUPOS, getFlag, type Partido, type Resultado, type PuntosConfig, PUNTOS_DEFAULT } from "@/lib/mundial";
import { LOGO_SVG } from "@/lib/logo";

const css = `
  .app{max-width:430px;margin:0 auto;min-height:100vh;background:#fff;display:flex;flex-direction:column}
  .header{background:#123952;position:sticky;top:0;z-index:100}
  .header-top{display:flex;justify-content:space-between;align-items:center;padding:13px 16px}
  .logo-wrap{display:flex;align-items:center;gap:9px}
  .logo-svg{height:24px;color:#fff}
  .logo-svg svg{height:24px;width:auto;display:block}
  .logo-div{width:1px;height:20px;background:rgba(255,255,255,.2)}
  .admin-badge{background:#e8a020;color:#123952;font-size:10px;font-weight:700;padding:3px 10px;border-radius:10px;letter-spacing:1px}
  .logout-btn{background:transparent;border:1px solid rgba(255,255,255,.25);color:rgba(255,255,255,.7);padding:6px 12px;border-radius:10px;font-size:12px;cursor:pointer;font-family:'DM Sans',sans-serif}
  .hero{background:linear-gradient(90deg,#1d5278,#123952);border-top:1px solid rgba(255,255,255,.06);padding:8px 16px}
  .hero-txt{font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,.6);text-align:center}
  .nav{display:flex;background:#fff;border-bottom:2px solid #dde4ec}
  .nb{flex:1;padding:11px 2px 9px;border:none;background:transparent;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:10px;font-weight:600;color:#6b7280;display:flex;flex-direction:column;align-items:center;gap:2px;position:relative}
  .nb em{font-style:normal;font-size:16px}
  .nb.on{color:#123952}
  .nb.on::after{content:'';position:absolute;bottom:-2px;left:15%;right:15%;height:2px;background:#e8a020;border-radius:2px 2px 0 0}
  .content{padding:14px 14px 80px;flex:1}
  .sec-title{font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#123952;margin:4px 0 12px;display:flex;align-items:center;gap:8px}
  .sec-title::after{content:'';flex:1;height:1px;background:#dde4ec}
  .stats-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px}
  .stat-box{background:#f2f7fb;border:1px solid #dde4ec;border-radius:12px;padding:14px;text-align:center}
  .stat-num{font-family:'Playfair Display',serif;font-size:30px;font-weight:900;color:#e8a020}
  .stat-lbl{font-size:11px;color:#6b7280;margin-top:2px}
  .filtros{display:flex;gap:5px;margin-bottom:11px;overflow-x:auto;padding-bottom:2px}
  .fb{padding:5px 12px;border-radius:20px;border:1.5px solid #dde4ec;background:transparent;color:#6b7280;font-size:11px;font-weight:600;cursor:pointer;white-space:nowrap;font-family:'DM Sans',sans-serif}
  .fb.on{background:#123952;border-color:#123952;color:#fff}
  .grupo-lbl{font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#123952;background:#e8f0f6;padding:3px 9px;border-radius:5px;display:inline-block;margin:11px 0 7px}
  .partido{border:1px solid #dde4ec;border-radius:13px;padding:13px;margin-bottom:9px;background:#fff;box-shadow:0 2px 8px rgba(18,57,82,.05)}
  .partido-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:11px}
  .fase-tag{font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#6b7280;background:#f5f5f5;padding:3px 8px;border-radius:4px}
  .fecha-hora{display:flex;flex-direction:column;align-items:flex-end;gap:1px}
  .fecha-txt{font-family:'DM Mono',monospace;font-size:10px;color:#6b7280}
  .hora-txt{font-family:'DM Mono',monospace;font-size:11px;font-weight:500;color:#123952}
  .equipos{display:flex;align-items:center;gap:8px;margin-bottom:11px}
  .eq{flex:1;text-align:center}
  .eq-flag{font-size:24px;display:block;margin-bottom:3px}
  .eq-name{font-size:10px;font-weight:600;color:#494d4f;line-height:1.2}
  .vs{font-family:'DM Mono',monospace;font-size:11px;color:#6b7280}
  .res-box{text-align:center;background:#e8f0f6;border-radius:10px;padding:4px 10px}
  .res-score{font-family:'Playfair Display',serif;font-size:22px;font-weight:900;color:#123952;line-height:1.1}
  .res-lbl{font-size:8px;color:#6b7280;letter-spacing:1px;text-transform:uppercase}
  .admin-inputs{display:flex;align-items:center;gap:7px;padding-top:11px;border-top:1px dashed #e8a020}
  .ai{width:50px;text-align:center;padding:8px;border-radius:9px;border:1.5px solid #e8a020;background:#fff8ed;color:#123952;font-family:'Playfair Display',serif;font-size:18px;font-weight:700;outline:none}
  .ai-sep{font-family:'DM Mono',monospace;font-size:16px;color:#e8a020}
  .conf-btn{flex:1;padding:9px;border:none;border-radius:9px;background:#e8a020;color:#fff;font-family:'DM Sans',sans-serif;font-weight:700;font-size:13px;cursor:pointer;transition:all .2s}
  .conf-btn:disabled{opacity:.4}
  .conf-btn.done{background:#2e9e6b}
  .tr{display:flex;align-items:center;padding:11px 13px;border:1px solid #dde4ec;border-radius:12px;margin-bottom:7px;gap:11px;background:#fff;box-shadow:0 2px 8px rgba(18,57,82,.05)}
  .tr.top{border-color:#e8a020;background:rgba(232,160,32,.03)}
  .t-pos{font-family:'Playfair Display',serif;font-size:20px;font-weight:900;color:#dde4ec;min-width:22px}
  .tr.top .t-pos{color:#e8a020}
  .t-user{flex:1}
  .t-name{font-weight:700;font-size:14px}
  .t-stats{font-size:11px;color:#6b7280;margin-top:1px}
  .t-pts{font-family:'Playfair Display',serif;font-size:28px;font-weight:900;color:#123952}
  .t-medal{font-size:18px}
  .urow{display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid #dde4ec}
  .uname{font-weight:700;font-size:14px}
  .uinfo{font-size:11px;color:#6b7280;margin-top:2px}
  .cfg-row{display:flex;justify-content:space-between;align-items:center;padding:13px 0;border-bottom:1px solid #dde4ec}
  .cfg-lbl{font-weight:600;font-size:14px}
  .cfg-sub{font-size:11px;color:#6b7280;margin-top:2px}
  .num-wrap{display:flex;align-items:center;gap:10px}
  .num-btn{width:32px;height:32px;border-radius:8px;border:1.5px solid #dde4ec;background:#f2f7fb;color:#123952;font-size:18px;cursor:pointer;font-family:'DM Sans',sans-serif;font-weight:700}
  .num-val{font-family:'Playfair Display',serif;font-size:24px;font-weight:900;color:#e8a020;min-width:24px;text-align:center}
  .save-cfg-btn{width:100%;margin-top:16px;padding:14px;border:none;border-radius:12px;background:#123952;color:#fff;font-family:'DM Sans',sans-serif;font-size:15px;font-weight:700;cursor:pointer;box-shadow:0 4px 14px rgba(18,57,82,.3);transition:all .2s}
  .save-cfg-btn:hover{background:#1d5278;transform:translateY(-1px)}
  .toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#123952;color:#fff;padding:10px 20px;border-radius:24px;font-weight:700;font-size:13px;z-index:999;animation:fadeUp 2.6s forwards;box-shadow:0 4px 18px rgba(18,57,82,.4);white-space:nowrap}
  @keyframes fadeUp{0%{opacity:0;transform:translateX(-50%) translateY(8px)}15%{opacity:1;transform:translateX(-50%) translateY(0)}80%{opacity:1}100%{opacity:0;transform:translateX(-50%) translateY(-8px)}}
  .info-box{background:#f2f7fb;border:1px solid #dde4ec;border-radius:12px;padding:16px;margin-top:8px}
`;

interface TablaRow { username:string; nombre:string; pts:number; exactos:number; ganadores:number; jugados:number; totalPicks:number; }
interface UserRow { username:string; nombre:string; picks:number; creadoEn?:string; }
const FASES=["Grupos","Dieciseisavos","Octavos","Cuartos","Semis","Final"];
const GRUPOS_KEYS=Object.keys(GRUPOS);

export default function AdminPage() {
  const router=useRouter();
  const [tab,setTab]=useState<"resultados"|"tabla"|"usuarios"|"config"|"notif">("resultados");
  const [notifTitulo,setNotifTitulo]=useState("⚽ Penca Mundial 2026");
  const [notifCuerpo,setNotifCuerpo]=useState("");
  const [notifEnviando,setNotifEnviando]=useState(false);
  const [notifOk,setNotifOk]=useState<string|null>(null);
  const [resultados,setResultados]=useState<Record<string,Resultado>>({});
  const [tabla,setTabla]=useState<TablaRow[]>([]);
  const [usuarios,setUsuarios]=useState<UserRow[]>([]);
  const [grupos,setGrupos]=useState<{id:string;nombre:string;codigo:string;miembros:number}[]>([]);
  const [editando,setEditando]=useState<string|null>(null);
  const [editNombre,setEditNombre]=useState("");
  const [editPass,setEditPass]=useState("");
  const [editando2,setEditando2]=useState(false);
  const [config,setConfig]=useState<PuntosConfig>(PUNTOS_DEFAULT);
  const [filtroFase,setFiltroFase]=useState("Grupos");
  const [bracketData,setBracketData]=useState<Record<string,{local:string|null;visitante:string|null}>>({});
  const [filtroGrupo,setFiltroGrupo]=useState("Todos");
  const [confirmados,setConfirmados]=useState<Record<string,boolean>>({});
  const [toast,setToast]=useState<string|null>(null);
  const [cargando,setCargando]=useState(true);
  const [tablaGrupoSeleccionado, setTablaGrupoSeleccionado] = useState("fascioli");
  const [nombreTablaSeleccionada, setNombreTablaSeleccionada] = useState("PencaFascioli");
  const [gruposTabla, setGruposTabla] = useState<{id:string;nombre:string}[]>([{id:"fascioli",nombre:"PencaFascioli"}]);

  const showToast=(msg:string)=>{setToast(msg);setTimeout(()=>setToast(null),2700);};

  const editarUsuario = async (username: string) => {
    setEditando2(true);
    await fetch("/api/usuarios",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({username,nombre:editNombre||undefined,password:editPass||undefined})});
    setEditando(null); setEditNombre(""); setEditPass(""); setEditando2(false);
    refrescarTodo();
  };
  const borrarUsuario = async (username: string, nombre: string) => {
    if (!confirm(`¿Borrar a ${nombre} y todos sus pronósticos?`)) return;
    await fetch("/api/usuarios",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({username})});
    refrescarTodo();
  };
  const enviarNotif = async () => {
    if (!notifCuerpo.trim()) return;
    setNotifEnviando(true); setNotifOk(null);
    const r = await fetch("/api/push/send",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({titulo:notifTitulo,cuerpo:notifCuerpo})}).then(r=>r.json());
    setNotifEnviando(false);
    const enviados = r.enviados ?? 0;
    setNotifOk(r.error ? `❌ Error: ${r.error}` : `✅ Enviado a ${enviados} usuario${enviados!==1?"s":""}`);
  };
  const refrescarTodo=useCallback(async()=>{
    const [rRes,tRes,uRes,gRes,cRes]=await Promise.all([
      fetch("/api/resultados").then(r=>r.json()),
      fetch("/api/tabla").then(r=>r.json()),
      fetch("/api/usuarios").then(r=>r.json()),
      fetch("/api/admin/grupos").then(r=>r.json()),
      fetch("/api/config").then(r=>r.json()),
    ]);
    setResultados(rRes.resultados??{});
    setTabla(tRes.tabla??[]);
    setUsuarios(uRes.usuarios??[]);
    setGrupos(gRes.grupos??[]);
    fetch("/api/bracket").then(r=>r.json()).then(d=>{if(d.ok)setBracketData(d.bracket??{});}).catch(()=>{});
    const sinDuplicados = (gRes.grupos??[]).filter((g:any)=>g.id !== "fascioli");
    setGruposTabla([{id:"fascioli",nombre:"PencaFascioli"}, ...sinDuplicados]);
    setConfig(cRes.config??PUNTOS_DEFAULT);
  },[]);

  useEffect(()=>{
    (async()=>{
      const me=await fetch("/api/auth/me").then(r=>r.json());
      if(!me.user?.isAdmin){router.push("/login");return;}
      await refrescarTodo();
      setCargando(false);
    })();
  },[]);

  const guardarResultado=async(partidoId:string,local:number,visitante:number)=>{
    const r=await fetch("/api/resultados",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({partidoId,local,visitante})});
    if(r.ok){
      setResultados(prev=>({...prev,[partidoId]:{local,visitante}}));
      setConfirmados(c=>({...c,[partidoId]:true}));
      setTimeout(()=>setConfirmados(c=>({...c,[partidoId]:false})),2000);
      showToast("✅ Resultado guardado");
      refrescarTodo();
    } else { const d=await r.json(); showToast("❌ "+(d.error??"Error")); }
  };

  const cambiarTablaGrupo = async (grupoId: string) => {
    setTablaGrupoSeleccionado(grupoId);
    const g = gruposTabla.find(g=>g.id===grupoId);
    setNombreTablaSeleccionada(g?.nombre ?? "Tabla");
    const r = await fetch(`/api/grupos/tabla?grupoId=${grupoId}`).then(r=>r.json());
    setTabla(r.tabla??[]);
  };

  const guardarConfig=async()=>{
    const r=await fetch("/api/config",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(config)});
    if(r.ok) showToast("✅ Configuración guardada");
    else { const d=await r.json(); showToast("❌ "+(d.error??"Error")); }
  };

  const logout=async()=>{await fetch("/api/auth/logout",{method:"POST"});router.push("/login");};

  if(cargando) return <div style={{display:"flex",justifyContent:"center",alignItems:"center",minHeight:"100vh",background:"#f2f7fb"}}><span style={{fontSize:48}}>⚙️</span></div>;

  const partidos=TODOS_PARTIDOS.filter(p=>{
    if(p.fase!==filtroFase) return false;
    if(filtroFase==="Grupos"&&filtroGrupo!=="Todos"&&p.grupo!==filtroGrupo) return false;
    return true;
  });
  const totalConRes=Object.keys(resultados).length;

  return(
    <>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@500&display=swap" rel="stylesheet"/>
      <style>{css}</style>
      <div className="app">
        <div className="header">
          <div className="header-top">
            <div className="logo-wrap">
              <div className="logo-svg" dangerouslySetInnerHTML={{__html:LOGO_SVG}}/>
              <div className="logo-div"/>
              <span className="admin-badge">⚡ ADMIN</span>
            </div>
            <button className="logout-btn" onClick={logout}>Cerrar sesión</button>
          </div>
          <div className="hero"><div className="hero-txt">Panel de administración · Penca Mundial 2026</div></div>
          <nav className="nav">
            {([["resultados","⚽","Resultados"],["tabla","🏆","Tabla"],["usuarios","👥","Usuarios"],["config","⚙️","Config"],["notif","🔔","Notif"]] as [string,string,string][]).map(([id,ic,lb])=>(
              <button key={id} className={`nb ${tab===id?"on":""}`} onClick={()=>setTab(id as any)}><em>{ic}</em>{lb}</button>
            ))}
          </nav>
        </div>

        <div className="content">
          {/* ── RESULTADOS ── */}
          {tab==="resultados"&&<>
            <div className="stats-grid">
              <div className="stat-box"><div className="stat-num">{totalConRes}</div><div className="stat-lbl">Resultados cargados</div></div>
              <div className="stat-box"><div className="stat-num">{TODOS_PARTIDOS.length-totalConRes}</div><div className="stat-lbl">Partidos pendientes</div></div>
            </div>
            <div className="filtros">
              {FASES.map(f=><button key={f} className={`fb ${filtroFase===f?"on":""}`} onClick={()=>setFiltroFase(f)}>{f}</button>)}
            </div>
            {filtroFase==="Grupos"&&<div className="filtros">
              {["Todos",...GRUPOS_KEYS].map(g=>(
                <button key={g} className={`fb ${filtroGrupo===g?"on":""}`} onClick={()=>setFiltroGrupo(g)}>{g==="Todos"?"Todos":`Gr. ${g}`}</button>
              ))}
            </div>}
            {filtroFase==="Grupos"&&filtroGrupo==="Todos"
              ?GRUPOS_KEYS.map(g=>{
                  const ps=partidos.filter(p=>p.grupo===g);
                  return ps.length?(<div key={g}><div className="grupo-lbl">Grupo {g}</div>{ps.map(p=><AdminPartidoCard key={p.id} partido={p} resActual={resultados[p.id]} confirmado={confirmados[p.id]} bracketData={bracketData} onGuardar={guardarResultado} onBorrar={async(id)=>{ if(!confirm("¿Borrar este resultado?")) return; await fetch("/api/resultados/borrar",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({partidoId:id})}); refrescarTodo(); }}/>)}</div>):null;
                })
              :partidos.map(p=><AdminPartidoCard key={p.id} partido={p} resActual={resultados[p.id]} confirmado={confirmados[p.id]} bracketData={bracketData} onGuardar={guardarResultado} onBorrar={async(id)=>{ if(!confirm("¿Borrar este resultado?")) return; await fetch("/api/resultados/borrar",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({partidoId:id})}); refrescarTodo(); }}/>)
            }
          </>}

          {/* ── TABLA ── */}
          {tab==="tabla"&&<>
            <div className="sec-title">Clasificación penca</div>

            {/* Selector de grupo */}
            <div style={{background:"#fff",border:"1px solid #dde4ec",borderRadius:14,padding:14,marginBottom:14,boxShadow:"0 2px 8px rgba(18,57,82,.05)"}}>
              <div style={{fontSize:10,fontWeight:800,letterSpacing:1.8,textTransform:"uppercase",color:"#6b7280",marginBottom:8}}>Ver tabla de</div>
              <select
                value={tablaGrupoSeleccionado}
                onChange={e=>cambiarTablaGrupo(e.target.value)}
                style={{width:"100%",appearance:"none" as any,border:"1.5px solid #dde4ec",borderRadius:10,padding:"10px 12px",background:"#f2f7fb",color:"#123952",fontSize:14,fontWeight:700,outline:"none"}}
              >
                {gruposTabla.map(g=>(
                  <option key={g.id} value={g.id}>{g.nombre}</option>
                ))}
              </select>
              <div style={{marginTop:8,fontSize:12,color:"#6b7280"}}>
                🏆 Mostrando: <strong style={{color:"#123952"}}>{nombreTablaSeleccionada}</strong> · {tabla.length} participantes
              </div>
            </div>
            {tabla.map((u,i)=>(
              <div key={u.username} className={`tr ${i<3?"top":""}`}>
                <div className="t-pos">{i+1}</div>
                <div className="t-user">
                  <div className="t-name">{u.nombre}</div>
                  <div className="t-stats">✅ {u.exactos} · 👍 {u.ganadores} · 📊 {u.jugados}/{u.totalPicks}</div>
                </div>
                <div className="t-pts">{u.pts}</div>
                <div className="t-medal">{["🥇","🥈","🥉"][i]??""}</div>
              </div>
            ))}
          </>}

          {/* ── USUARIOS ── */}
          {tab==="usuarios"&&<>
            <div className="sec-title">Participantes ({usuarios.length})</div>
            <div style={{display:"flex",gap:10,marginBottom:12}}>
              <div style={{background:"#f2f7fb",border:"1px solid #dde4ec",borderRadius:10,padding:"10px 14px",flex:1,textAlign:"center"}}><div style={{fontFamily:"Georgia,serif",fontSize:22,fontWeight:900,color:"#e8a020"}}>{usuarios.length}</div><div style={{fontSize:11,color:"#6b7280"}}>Usuarios</div></div>
              <div style={{background:"#f2f7fb",border:"1px solid #dde4ec",borderRadius:10,padding:"10px 14px",flex:1,textAlign:"center"}}><div style={{fontFamily:"Georgia,serif",fontSize:22,fontWeight:900,color:"#e8a020"}}>{grupos.filter(g=>g.id!=="fascioli").length}</div><div style={{fontSize:11,color:"#6b7280"}}>Grupos privados</div></div>
              <PwaCounter/>
            </div>
            <div style={{background:"#fff",border:"1px solid #dde4ec",borderRadius:14,padding:"0 14px",boxShadow:"0 2px 8px rgba(18,57,82,.05)"}}>
              {usuarios.length===0&&<p style={{color:"#6b7280",fontSize:14,padding:"16px 0"}}>Sin participantes aún.</p>}
              {usuarios.map(u=>(
                <div key={u.username}>
                  <div className="urow" style={{cursor:"pointer"}} onClick={()=>{setEditando(editando===u.username?null:u.username);setEditNombre(u.nombre);setEditPass("");}}>
                    <div><div className="uname">{u.nombre}</div><div className="uinfo">@{u.username} · {u.creadoEn?new Date(u.creadoEn).toLocaleDateString("es-UY"):"—"}</div><div style={{fontSize:10,color:"#2e9e6b",marginTop:2}}>{(u as any).grupos?.length ? (u as any).grupos.join(", ") : "Solo PencaFascioli"}</div></div>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <span style={{color:"#123952",fontWeight:700,fontSize:13}}>{u.picks} picks</span>
                      <span style={{fontSize:14,color:"#6b7280"}}>{editando===u.username?"▲":"▼"}</span>
                    </div>
                  </div>
                  {editando===u.username&&(
                    <div style={{padding:"12px 0 16px",borderTop:"1px dashed #dde4ec",display:"flex",flexDirection:"column",gap:8}}>
                      <div>
                        <div style={{fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:4,textTransform:"uppercase",letterSpacing:1}}>Nombre</div>
                        <input value={editNombre} onChange={e=>setEditNombre(e.target.value)} style={{width:"100%",padding:"9px 12px",borderRadius:9,border:"1.5px solid #dde4ec",fontSize:14,outline:"none",boxSizing:"border-box"}}/>
                      </div>
                      <div>
                        <div style={{fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:4,textTransform:"uppercase",letterSpacing:1}}>Nueva contraseña (opcional)</div>
                        <input type="password" value={editPass} onChange={e=>setEditPass(e.target.value)} placeholder="Dejar vacío para no cambiar" style={{width:"100%",padding:"9px 12px",borderRadius:9,border:"1.5px solid #dde4ec",fontSize:14,outline:"none",boxSizing:"border-box"}}/>
                      </div>
                      <div style={{display:"flex",gap:8,marginTop:4}}>
                        <button onClick={()=>editarUsuario(u.username)} disabled={editando2} style={{flex:1,padding:"10px",border:"none",borderRadius:9,background:"#123952",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer"}}>
                          {editando2?"Guardando...":"Guardar cambios"}
                        </button>
                        <button onClick={()=>borrarUsuario(u.username,u.nombre)} style={{padding:"10px 14px",border:"1.5px solid #dc2626",borderRadius:9,background:"transparent",color:"#dc2626",fontWeight:700,fontSize:13,cursor:"pointer"}}>
                          🗑 Borrar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>}

                    {tab==="notif"&&<>
            <div className="sec-title">Enviar notificación</div>
            <div style={{background:"#fff",border:"1px solid #dde4ec",borderRadius:14,padding:16,boxShadow:"0 2px 8px rgba(18,57,82,.05)"}}>
              <div style={{fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:6,textTransform:"uppercase",letterSpacing:1}}>Título</div>
              <input value={notifTitulo} onChange={e=>setNotifTitulo(e.target.value)} style={{width:"100%",padding:"10px 12px",borderRadius:9,border:"1.5px solid #dde4ec",fontSize:14,outline:"none",marginBottom:14,boxSizing:"border-box"}}/>
              <div style={{fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:6,textTransform:"uppercase",letterSpacing:1}}>Mensaje</div>
              <textarea value={notifCuerpo} onChange={e=>setNotifCuerpo(e.target.value)} placeholder="Ej: ¡Faltan 30 minutos para Argentina vs Argelia! No te olvides de pronosticar." rows={4} style={{width:"100%",padding:"10px 12px",borderRadius:9,border:"1.5px solid #dde4ec",fontSize:14,outline:"none",resize:"none",boxSizing:"border-box",fontFamily:"inherit"}}/>
              {notifOk&&<div style={{fontSize:13,color:"#2e9e6b",fontWeight:600,margin:"10px 0"}}>{notifOk}</div>}
              <button onClick={enviarNotif} disabled={notifEnviando||!notifCuerpo.trim()} style={{width:"100%",marginTop:12,padding:13,border:"none",borderRadius:10,background:"#123952",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer"}}>
                {notifEnviando?"Enviando...":"🔔 Enviar a todos"}
              </button>
            </div>
            <div style={{background:"#f2f7fb",border:"1px solid #dde4ec",borderRadius:14,padding:16,marginTop:12}}>
              <div style={{fontSize:12,fontWeight:700,color:"#123952",marginBottom:8}}>💡 Cuándo usarlo</div>
              <div style={{fontSize:12,color:"#6b7280",lineHeight:1.7}}>
                · Recordar picks antes de un partido importante<br/>
                · Avisar un resultado polémico<br/>
                · Anunciar cambios en la penca<br/>
                · Solo llega a usuarios que activaron las notificaciones
              </div>
            </div>
          </>}
          {/* ── CONFIG ── */}
                    {tab==="config"&&<>
            {/* Migración grupos */}
            <div style={{background:"#fff8ed",border:"1px solid #e8a020",borderRadius:14,padding:16,marginBottom:14}}>
              <div style={{fontSize:12,fontWeight:700,color:"#b07800",marginBottom:8}}>⚙️ Migrar usuarios al grupo global</div>
              <div style={{fontSize:12,color:"#6b7280",marginBottom:10}}>Agrega todos los usuarios existentes a PencaFascioli. Ejecutar una sola vez.</div>
              <button onClick={async()=>{
                const r = await fetch("/api/admin/migrar-grupos",{method:"POST"}).then(r=>r.json());
                alert(`✅ Migrados: ${r.migrados} usuarios`);
              }} style={{padding:"10px 16px",border:"none",borderRadius:9,background:"#e8a020",color:"#123952",fontWeight:700,fontSize:13,cursor:"pointer"}}>
                Ejecutar migración
              </button>
            </div>
            <div className="sec-title">Sistema de puntos</div>
            <div style={{background:"#fff",border:"1px solid #dde4ec",borderRadius:14,padding:"0 16px",boxShadow:"0 2px 8px rgba(18,57,82,.05)"}}>
              {[
                ["🎯 Resultado exacto","Acertás goles exactos de ambos","resultado_exacto"],
                ["🎯 Ganador + diferencia","Acertás ganador y diferencia","ganador_diferencia"],
                ["👍 Ganador correcto","Acertás el ganador","ganador_correcto"],
                ["🤝 Empate correcto","Acertás que hay empate","empate_correcto"],
              ].map(([lbl,sub,key],idx)=>(
                <div key={key} className="cfg-row" style={idx===2?{border:"none"}:{}}>
                  <div><div className="cfg-lbl">{lbl}</div><div className="cfg-sub">{sub}</div></div>
                  <div className="num-wrap">
                    <button className="num-btn" onClick={()=>setConfig(c=>({...c,[key]:Math.max(1,(c as any)[key]-1)}))}>−</button>
                    <span className="num-val">{(config as any)[key]}</span>
                    <button className="num-btn" onClick={()=>setConfig(c=>({...c,[key]:(c as any)[key]+1}))}>+</button>
                  </div>
                </div>
              ))}
            </div>
            <button className="save-cfg-btn" onClick={guardarConfig}>Guardar configuración</button>
            <div className="info-box" style={{marginTop:16}}>
              <div className="sec-title">Código de invitación</div>
              <p style={{fontSize:13,color:"#6b7280",lineHeight:1.6}}>El código está configurado en la variable <strong style={{color:"#123952"}}>INVITE_CODE</strong> en Vercel → Settings → Environment Variables.</p>
            </div>
          </>}
        </div>
        {toast&&<div className="toast">{toast}</div>}
      </div>
    </>
  );
}

function AdminPartidoCard({partido,resActual,confirmado,onGuardar,onBorrar,bracketData}:{
  partido:Partido;resActual?:Resultado;confirmado?:boolean;
  onGuardar:(id:string,l:number,v:number)=>void; onBorrar:(id:string)=>void;
  bracketData?:Record<string,{local:string|null;visitante:string|null}>;
}) {
  const [lv,setLv]=useState<string|number>(resActual?.local??"");
  const [vv,setVv]=useState<string|number>(resActual?.visitante??"");
  useEffect(()=>{setLv(resActual?.local??"");setVv(resActual?.visitante??"");},[resActual]);
  const fmtFecha=(f:string)=>new Date(f+"T12:00:00").toLocaleDateString("es-UY",{day:"numeric",month:"short"});

  return(
    <div className="partido">
      <div className="partido-head">
        <span className="fase-tag">{partido.fase==="Grupos"?`Grupo ${partido.grupo}`:partido.fase}</span>
        <div className="fecha-hora">
          <span className="fecha-txt">{fmtFecha(partido.fecha)}</span>
          <span className="hora-txt">{partido.hora} hs</span>
        </div>
      </div>
      <div className="equipos">
        <div className="eq"><span className="eq-flag">{getFlag(bracketData?.[partido.id]?.local??partido.local)}</span><span className="eq-name">{bracketData?.[partido.id]?.local??partido.local}</span></div>
        {resActual
          ?<div className="res-box"><div className="res-score">{resActual.local} - {resActual.visitante}</div><div className="res-lbl">Cargado ✓</div></div>
          :<span className="vs">VS</span>
        }
        <div className="eq"><span className="eq-flag">{getFlag(bracketData?.[partido.id]?.visitante??partido.visitante)}</span><span className="eq-name">{bracketData?.[partido.id]?.visitante??partido.visitante}</span></div>
      </div>
      <div className="admin-inputs">
        <input className="ai" type="number" min={0} max={20} placeholder="0" value={lv} onChange={e=>setLv(e.target.value)}/>
        <span className="ai-sep">-</span>
        <input className="ai" type="number" min={0} max={20} placeholder="0" value={vv} onChange={e=>setVv(e.target.value)}/>
        <button className={`conf-btn ${confirmado?"done":""}`} disabled={lv===""||vv===""} onClick={()=>onGuardar(partido.id,Number(lv),Number(vv))}>
          {confirmado?"✓ Guardado":resActual?"Actualizar":"Confirmar"}
        </button>
        {resActual&&<button onClick={()=>onBorrar(partido.id)} style={{padding:"9px 12px",border:"1.5px solid #dc2626",borderRadius:9,background:"transparent",color:"#dc2626",fontWeight:700,fontSize:13,cursor:"pointer"}}>🗑</button>}
      </div>
    </div>
  );
}

function PwaCounter() {
  const [total, setTotal] = useState<number|null>(null);
  useEffect(()=>{
    fetch("/api/pwa-install").then(r=>r.json()).then(d=>setTotal(d.total??0));
  },[]);
  return (
    <div style={{background:"#f2f7fb",border:"1px solid #dde4ec",borderRadius:10,padding:"10px 14px",flex:1,textAlign:"center"}}>
      <div style={{fontFamily:"Georgia,serif",fontSize:22,fontWeight:900,color:"#2e9e6b"}}>{total??"-"}</div>
      <div style={{fontSize:11,color:"#6b7280"}}>App instalada 📲</div>
    </div>
  );
}
