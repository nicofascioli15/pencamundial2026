"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { TODOS_PARTIDOS, CIUDADES, GRUPOS, getFlag, calcularPuntos, type Partido, type Resultado, type PuntosConfig, PUNTOS_DEFAULT } from "@/lib/mundial";
import { LOGO_SVG } from "@/lib/logo";

const css = `
  .app{max-width:430px;margin:0 auto;min-height:100vh;background:#fff;box-shadow:0 0 60px rgba(18,57,82,.1);display:flex;flex-direction:column;width:100%}
  .header{background:#123952;position:sticky;top:0;z-index:100}
  .header-top{display:flex;justify-content:space-between;align-items:center;padding:13px 16px}
  .logo-wrap{display:flex;align-items:center;gap:8px;min-width:0;flex:1}
  .logo-svg{flex-shrink:0}
  .logo-div{width:1px;height:20px;background:rgba(255,255,255,.2);flex-shrink:0}
  .logo-txt{font-size:11px;font-weight:600;color:rgba(255,255,255,.9);line-height:1.2;white-space:nowrap}
  .logo-txt span{display:block;font-size:9px;font-weight:400;color:#e8a020;letter-spacing:2px;text-transform:uppercase}
  .user-pill{display:flex;align-items:center;gap:6px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);border-radius:24px;padding:5px 11px 5px 7px;cursor:pointer;flex-shrink:0}
  .user-av{width:22px;height:22px;background:#e8a020;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#123952;flex-shrink:0}
  .user-name{font-size:12px;font-weight:600;color:#fff}
  .user-pts{font-size:10px;color:rgba(255,255,255,.55)}
  .hero{background:linear-gradient(90deg,#1d5278,#123952);border-top:1px solid rgba(255,255,255,.06);padding:8px 16px;display:flex;align-items:center;justify-content:space-between}
  .hero-flag{font-size:18px}
  .hero-title{font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,.6);text-align:center}
  .hero-date{font-family:'DM Mono',monospace;font-size:12px;color:#e8a020;text-align:center;margin-top:1px}
  .nav{display:flex;background:#fff;border-bottom:2px solid #dde4ec}
  .nb{flex:1;padding:11px 2px 9px;border:none;background:transparent;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:10px;font-weight:600;color:#6b7280;display:flex;flex-direction:column;align-items:center;gap:2px;position:relative;transition:color .2s}
  .nb em{font-style:normal;font-size:17px}
  .nb.on{color:#123952}
  .nb.on::after{content:'';position:absolute;bottom:-2px;left:15%;right:15%;height:2px;background:#123952;border-radius:2px 2px 0 0}
  .content{padding:14px 14px 80px;flex:1}

  /* ── HOY SECTION ── */
  .hoy-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
  .hoy-title{font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#123952;display:flex;align-items:center;gap:6px}
  .hoy-fecha{font-family:'DM Mono',monospace;font-size:11px;color:#6b7280}
  .hoy-card{border-radius:16px;overflow:hidden;margin-bottom:14px;box-shadow:0 4px 20px rgba(18,57,82,.1)}
  .hoy-partido{background:#fff;border:1px solid #dde4ec;border-radius:14px;padding:14px;margin-bottom:8px;position:relative;overflow:hidden}
  .hoy-partido.proximo::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#123952,#1d5278)}
  .hoy-partido.jugando::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#e8a020,#f0c040);animation:shimmer 1.5s infinite}
  .hoy-partido.finalizado::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:#2e9e6b}
  @keyframes shimmer{0%,100%{opacity:1}50%{opacity:.5}}
  .hoy-estado{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
  .estado-badge{font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:3px 8px;border-radius:4px}
  .estado-proximo{background:#e8f0f6;color:#123952}
  .estado-jugando{background:rgba(232,160,32,.15);color:#e8a020;animation:pulse-text 1.5s infinite}
  .estado-finalizado{background:rgba(46,158,107,.1);color:#2e9e6b}
  @keyframes pulse-text{0%,100%{opacity:1}50%{opacity:.6}}
  .hoy-hora{font-family:'DM Mono',monospace;font-size:12px;font-weight:600;color:#123952}
  .hoy-equipos{display:flex;align-items:center;gap:8px;margin-bottom:12px}
  .hoy-eq{flex:1;text-align:center}
  .hoy-flag{font-size:30px;display:block;margin-bottom:3px}
  .hoy-name{font-size:11px;font-weight:700;color:#1a1f24;line-height:1.2}
  .hoy-vs{font-family:'DM Mono',monospace;font-size:12px;color:#6b7280}
  .hoy-res{text-align:center;background:#e8f0f6;border-radius:10px;padding:5px 12px}
  .hoy-score{font-family:'Playfair Display',serif;font-size:28px;font-weight:900;color:#123952;line-height:1}
  .hoy-res-lbl{font-size:8px;color:#6b7280;letter-spacing:1px;text-transform:uppercase}
  .hoy-pick{display:flex;align-items:center;gap:6px;padding-top:10px;border-top:1px solid #dde4ec}
  .hoy-pick-lbl{font-size:10px;color:#6b7280;font-weight:600;white-space:nowrap}
  .hoy-pick-val{font-family:'Playfair Display',serif;font-size:16px;font-weight:900;color:#123952;background:#e8f0f6;padding:4px 12px;border-radius:8px;margin-left:auto}
  .hoy-pick-none{font-size:11px;color:#6b7280;margin-left:auto;font-style:italic}
  .hoy-pick-pts{font-size:11px;font-weight:700;padding:3px 8px;border-radius:8px}
  .pts-ex{background:rgba(232,160,32,.15);color:#e8a020}
  .pts-ok{background:rgba(46,158,107,.1);color:#2e9e6b}
  .pts-no{background:rgba(220,38,38,.06);color:#dc2626}
  .hoy-inputs{display:flex;align-items:center;gap:6px;margin-left:auto}
  .hoy-si{width:42px;text-align:center;padding:7px 4px;border-radius:8px;border:1.5px solid #dde4ec;background:#f2f7fb;color:#123952;font-family:'Playfair Display',serif;font-size:18px;font-weight:700;outline:none;transition:border-color .2s}
  .hoy-si:focus{border-color:#123952}
  .hoy-save{padding:7px 12px;border:none;border-radius:8px;background:#123952;color:#fff;font-family:'DM Sans',sans-serif;font-weight:700;font-size:12px;cursor:pointer;transition:all .2s;white-space:nowrap}
  .hoy-save:disabled{opacity:.4;cursor:default}
  .hoy-save.saved{background:#f2f7fb;color:#2e9e6b;border:1.5px solid #2e9e6b}
  .bloqueado-lbl{font-size:10px;color:#6b7280;margin-left:auto;display:flex;align-items:center;gap:4px}

  /* ── PROG CARD ── */
  .prog-card{background:linear-gradient(135deg,#123952,#1d5278);border-radius:14px;padding:14px 16px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center;box-shadow:0 4px 20px rgba(18,57,82,.2)}
  .prog-lbl{font-size:11px;color:rgba(255,255,255,.65);margin-bottom:5px}
  .prog-bar{width:140px;height:4px;background:rgba(255,255,255,.15);border-radius:4px;overflow:hidden}
  .prog-fill{height:100%;background:#e8a020;border-radius:4px;transition:width .5s}
  .prog-sub{font-size:10px;color:rgba(255,255,255,.5);margin-top:4px}
  .prog-num{font-family:'Playfair Display',serif;font-size:34px;font-weight:900;color:#e8a020;line-height:1}
  .prog-pts{font-size:10px;color:rgba(255,255,255,.5)}
  .sync{display:flex;align-items:center;gap:5px;font-size:11px;color:#2e9e6b;font-weight:500;margin-bottom:11px}
  .sync-dot{width:6px;height:6px;border-radius:50%;background:#2e9e6b;animation:pulse 2s infinite;flex-shrink:0}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
  .filtros{display:flex;gap:5px;margin-bottom:11px;overflow-x:auto;padding-bottom:2px}
  .fb{padding:5px 12px;border-radius:20px;border:1.5px solid #dde4ec;background:transparent;color:#6b7280;font-size:11px;font-weight:600;cursor:pointer;white-space:nowrap;font-family:'DM Sans',sans-serif;transition:all .2s}
  .fb.on{background:#123952;border-color:#123952;color:#fff}
  .grupo-lbl{font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#123952;background:#e8f0f6;padding:3px 9px;border-radius:5px;display:inline-block;margin:11px 0 7px}
  .partido{border:1px solid #dde4ec;border-radius:13px;padding:13px;margin-bottom:9px;background:#fff;box-shadow:0 2px 10px rgba(18,57,82,.06)}
  .partido-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:11px}
  .fase-tag{font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#6b7280;background:#f5f5f5;padding:3px 8px;border-radius:4px}
  .fecha-hora{display:flex;flex-direction:column;align-items:flex-end;gap:1px}
  .fecha-txt{font-family:'DM Mono',monospace;font-size:10px;color:#6b7280}
  .hora-txt{font-family:'DM Mono',monospace;font-size:11px;font-weight:500;color:#123952}
  .equipos{display:flex;align-items:center;gap:8px;margin-bottom:11px}
  .eq{flex:1;text-align:center}
  .eq-flag{font-size:26px;display:block;margin-bottom:3px}
  .eq-name{font-size:10px;font-weight:600;color:#494d4f;line-height:1.2}
  .vs{font-family:'DM Mono',monospace;font-size:11px;color:#6b7280}
  .res-box{text-align:center;background:#e8f0f6;border-radius:10px;padding:4px 10px}
  .res-score{font-family:'Playfair Display',serif;font-size:24px;font-weight:900;color:#123952;line-height:1.1}
  .res-lbl{font-size:8px;color:#6b7280;letter-spacing:1px;text-transform:uppercase}
  .pick-row{display:flex;align-items:center;gap:7px;padding-top:11px;border-top:1px solid #dde4ec}
  .si{flex:1;text-align:center;padding:9px 6px;border-radius:9px;border:1.5px solid #dde4ec;background:#f2f7fb;color:#123952;font-family:'Playfair Display',serif;font-size:20px;font-weight:700;outline:none;width:100%;transition:border-color .2s}
  .si:focus{border-color:#123952}
  .si:disabled{opacity:.5;background:#f5f5f5}
  .score-sep{font-size:16px;color:#6b7280;font-weight:300}
  .save-btn{padding:9px 14px;border:none;border-radius:9px;background:#123952;color:#fff;font-family:'DM Sans',sans-serif;font-weight:700;font-size:12px;cursor:pointer;white-space:nowrap;transition:all .2s}
  .save-btn:hover{background:#1d5278}
  .save-btn:disabled{opacity:.5;cursor:default}
  .save-btn.saved{background:#f2f7fb;color:#2e9e6b;border:1.5px solid #2e9e6b}
  .locked-btn{padding:9px 12px;border:1.5px solid #dde4ec;border-radius:9px;background:transparent;color:#6b7280;font-size:11px;font-weight:600;white-space:nowrap}
  .chip{display:inline-block;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700}
  .chip-ex{background:rgba(232,160,32,.12);color:#e8a020;border:1px solid rgba(232,160,32,.3)}
  .chip-ok{background:rgba(46,158,107,.1);color:#2e9e6b;border:1px solid rgba(46,158,107,.2)}
  .chip-no{background:rgba(220,38,38,.06);color:#dc2626;border:1px solid rgba(220,38,38,.15)}
  .sec-title{font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#123952;margin:4px 0 12px;display:flex;align-items:center;gap:8px}
  .sec-title::after{content:'';flex:1;height:1px;background:#dde4ec}
  .tr{display:flex;align-items:center;padding:11px 13px;border:1px solid #dde4ec;border-radius:12px;margin-bottom:7px;gap:11px;background:#fff;box-shadow:0 2px 8px rgba(18,57,82,.05)}
  .tr.top{border-color:#e8a020;background:rgba(232,160,32,.03)}
  .tr.me{border-color:#123952;background:#f2f7fb}
  .t-pos{font-family:'Playfair Display',serif;font-size:20px;font-weight:900;color:#dde4ec;min-width:22px}
  .tr.top .t-pos{color:#e8a020}
  .t-user{flex:1}
  .t-name{font-weight:700;font-size:14px}
  .t-stats{font-size:11px;color:#6b7280;margin-top:1px}
  .t-pts{font-family:'Playfair Display',serif;font-size:28px;font-weight:900;color:#123952}
  .t-medal{font-size:18px}
  .grupo-box{border:1px solid #dde4ec;border-radius:13px;margin-bottom:13px;overflow:hidden;box-shadow:0 2px 10px rgba(18,57,82,.06)}
  .grupo-box-hdr{background:#123952;padding:9px 13px;display:flex;justify-content:space-between;align-items:center}
  .grupo-box-title{font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,.9)}
  .gtable{width:100%;border-collapse:collapse}
  .gtable th{font-size:8px;font-weight:700;letter-spacing:1px;color:#6b7280;text-transform:uppercase;padding:6px 7px;text-align:center;background:#f5f5f5;border-bottom:1px solid #dde4ec}
  .gtable th:first-child{text-align:left;padding-left:11px}
  .gtable td{padding:8px 7px;text-align:center;font-size:12px;border-bottom:1px solid rgba(221,228,236,.4)}
  .gtable td:first-child{text-align:left;padding-left:11px}
  .gtable tr:last-child td{border-bottom:none}
  .gtable tr.cls{background:rgba(18,57,82,.03)}
  .eq-cell{display:flex;align-items:center;gap:6px;font-weight:600}
  .pts-td{font-family:'Playfair Display',serif;font-size:15px;font-weight:900;color:#123952}
  .toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#123952;color:#fff;padding:10px 20px;border-radius:24px;font-weight:700;font-size:13px;z-index:999;animation:fadeUp 2.6s forwards;box-shadow:0 4px 18px rgba(18,57,82,.4);white-space:nowrap}
  @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  @keyframes fadeUp{0%{opacity:0;transform:translateX(-50%) translateY(8px)}15%{opacity:1;transform:translateX(-50%) translateY(0)}80%{opacity:1}100%{opacity:0;transform:translateX(-50%) translateY(-8px)}}
  .empty{text-align:center;padding:36px 16px;color:#6b7280}
  .empty em{display:block;font-size:44px;font-style:normal;margin-bottom:10px}
  .info-card{background:#f2f7fb;border:1px solid #dde4ec;border-radius:14px;padding:18px;margin-bottom:12px}
  .pts-row{display:flex;justify-content:space-between;align-items:center;padding:11px 0;border-bottom:1px solid #dde4ec}
  .pts-row:last-child{border-bottom:none}
  .pts-lbl{font-weight:600;font-size:14px}
  .countdown{font-size:10px;font-weight:700;color:#e8a020;display:flex;align-items:center;gap:4px}
  .countdown.urgente{color:#dc2626}
  .live-badge{display:inline-flex;align-items:center;gap:5px;background:rgba(220,38,38,.1);border:1px solid rgba(220,38,38,.3);border-radius:20px;padding:3px 10px;font-size:10px;font-weight:700;color:#dc2626}
  .live-dot{width:7px;height:7px;border-radius:50%;background:#dc2626;animation:pulse 1s infinite}
  .alert-picks{background:rgba(232,160,32,.1);border:1px solid rgba(232,160,32,.3);border-radius:12px;padding:10px 14px;margin-bottom:12px;display:flex;align-items:center;gap:8px}
  .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:200;display:flex;align-items:flex-end;justify-content:center}
  .modal-box{background:#fff;border-radius:20px 20px 0 0;width:100%;max-width:430px;max-height:80vh;overflow-y:auto;padding:20px 16px 40px}
  .modal-handle{width:40px;height:4px;background:#dde4ec;border-radius:4px;margin:0 auto 16px}
  .modal-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
  .modal-close{background:transparent;border:none;font-size:20px;cursor:pointer;color:#6b7280}
  .modal-pick-row{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #f0f0f0}
  .modal-pick-row:last-child{border-bottom:none}
  .pts-val{font-family:'Playfair Display',serif;font-size:22px;font-weight:900;color:#123952}
`;

interface User { username: string; nombre: string; isAdmin: boolean; }
interface TablaRow { username: string; nombre: string; pts: number; exactos: number; ganadores: number; jugados: number; totalPicks: number; }
interface FilaGrupo { equipo: string; pj: number; g: number; e: number; p: number; gf: number; ga: number; dg: number; pts: number; }

const FASES = ["Grupos","Octavos","Cuartos","Semis","Final"];
const GRUPOS_KEYS = Object.keys(GRUPOS);

// Determinar estado de un partido basado en hora Montevideo
function getEstadoPartido(fecha: string, hora: string, tieneResultado: boolean): "proximo"|"jugando"|"finalizado" {
  if (tieneResultado) return "finalizado";
  const [h, m] = hora.split(":").map(Number);
  const partidoMs = new Date(`${fecha}T${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:00`).getTime() + 3*60*60*1000;
  const finMs = partidoMs + 13*60*1000; // +110min aprox duración
  const ahora = Date.now();
  if (ahora < partidoMs) return "proximo";
  if (ahora < finMs) return "jugando";
  return "finalizado";
}

function esBloqueado(fecha: string, hora: string): boolean {
  const [h, m] = hora.split(":").map(Number);
  const partidoMs = new Date(`${fecha}T${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:00`).getTime() + 3*60*60*1000;
  const bloqueoMs = partidoMs - (10 * 60 * 1000);
  return Date.now() >= bloqueoMs;
}

export default function PencaPage() {
  const router = useRouter();
  const [grupoActivo, setGrupoActivo] = useState<string>("fascioli");
  const [nombreGrupo, setNombreGrupo] = useState<string>("PencaFascioli");
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gId = params.get("grupo") ?? "fascioli";
    const tabParam = params.get("tab");
    if (tabParam) setTab(tabParam as any);
    setGrupoActivo(gId);
    if (gId === "fascioli") { setNombreGrupo("PencaFascioli"); return; }
    fetch("/api/grupos").then(r=>r.json()).then(d => {
      const g = d.grupos?.find((g: any) => g.id === gId);
      if (g) setNombreGrupo(g.nombre);
    });
  }, []);

  useEffect(() => {
    if (grupoActivo) cargarDatos();
  }, [grupoActivo]);

  // Recargar datos cuando cambia el grupo
  useEffect(() => {
    if (grupoActivo) cargarDatos();
  }, [grupoActivo]);
  const [user, setUser] = useState<User|null>(null);
  const [tab, setTab] = useState<"picks"|"grupos"|"tabla"|"info"|"misgrupos">("picks");
  const [predicciones, setPredicciones] = useState<Record<string,Resultado>>({});
  const [resultados, setResultados] = useState<Record<string,Resultado>>({});
  const [tabla, setTabla] = useState<TablaRow[]>([]);
  const [tablaGrupos, setTablaGrupos] = useState<Record<string,FilaGrupo[]>>({});
  const [config, setConfig] = useState<PuntosConfig>(PUNTOS_DEFAULT);
  const [filtroFase, setFiltroFase] = useState("Grupos");
  const [filtroGrupo, setFiltroGrupo] = useState("Todos");
  const [guardados, setGuardados] = useState<Record<string,boolean>>({});
  const [toast, setToast] = useState<string|null>(null);
  const [cargando, setCargando] = useState(true);
  const [ultimaSync, setUltimaSync] = useState<string|null>(null);
  const [partidosHoy, setPartidosHoy] = useState<Partido[]>([]);
  const [siguientesDias, setSiguientesDias] = useState<{fecha:string;partidos:Partido[]}[]>([]);
  const [fechaHoy, setFechaHoy] = useState<string>("");
  const [perfilUsuario, setPerfilUsuario] = useState<{username:string;nombre:string;predicciones:Record<string,Resultado>}|null>(null);
  const [notifActiva, setNotifActiva] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pullY, setPullY] = useState(0);
  const touchStartY = useRef(0);

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker.ready.then(reg => {
        reg.pushManager.getSubscription().then(sub => {
          setNotifActiva(!!sub);
        });
      });
    }
  }, []);
  const [showInstallModal, setShowInstallModal] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2700); };

  const cargarDatos = useCallback(async () => {
    const gId = new URLSearchParams(window.location.search).get("grupo") ?? "fascioli";
    const [pRes,rRes,tRes,cRes,gRes,hRes] = await Promise.all([
      fetch(`/api/grupos/predicciones?grupoId=${gId}`).then(r=>r.json()),
      fetch("/api/resultados").then(r=>r.json()),
      fetch(`/api/grupos/tabla?grupoId=${gId}`).then(r=>r.json()),
      fetch("/api/config").then(r=>r.json()),
      fetch("/api/mundial-grupos").then(r=>r.json()),
      fetch("/api/partidos-hoy").then(r=>r.json()),
    ]);
    setPredicciones(pRes.predicciones??{});
    setResultados(rRes.resultados??{});
    setTabla(tRes.tabla??[]);
    setConfig(cRes.config??PUNTOS_DEFAULT);
    setTablaGrupos(gRes.tablaGrupos??{});
    setPartidosHoy(hRes.partidos??[]);
    setSiguientesDias(hRes.siguientesDias??[]);
    setFechaHoy(hRes.fechaHoy??"");
  }, []);

  const sincronizar = useCallback(async () => {
    try {
      const r = await fetch("/api/sync").then(r=>r.json());
      if (r.ok) {
        setUltimaSync(new Date().toLocaleTimeString("es-UY",{hour:"2-digit",minute:"2-digit"}));
        if (r.actualizados > 0) { await cargarDatos(); showToast(`✅ ${r.actualizados} resultado${r.actualizados>1?"s":""} actualizado${r.actualizados>1?"s":""}`); }
      }
    } catch {}
  }, [cargarDatos]);

  useEffect(() => {
    (async () => {
      const me = await fetch("/api/auth/me").then(r=>r.json());
      if (!me.user) { router.push("/login"); return; }
      if (me.user.isAdmin) { router.push("/admin"); return; }
      setUser(me.user);
      await cargarDatos();
      await sincronizar();
      setCargando(false);
    })();
  }, [router,cargarDatos,sincronizar]);

  useEffect(() => {
    const iv = setInterval(sincronizar, 2*60*1000);
    return () => clearInterval(iv);
  }, [sincronizar]);

  const guardarPick = async (partidoId: string, local: number, visitante: number) => {
    const r = await fetch("/api/grupos/predicciones",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({grupoId:new URLSearchParams(window.location.search).get("grupo")??"fascioli",partidoId,local,visitante})});
    if (r.ok) {
      setPredicciones(p=>({...p,[partidoId]:{local,visitante}}));
      setGuardados(g=>({...g,[partidoId]:true}));
      setTimeout(()=>setGuardados(g=>({...g,[partidoId]:false})),2000);
    } else {
      const d = await r.json();
      showToast(d.error??"Error al guardar");
    }
  };

  const esIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
  const esPWA = () => window.matchMedia("(display-mode: standalone)").matches;

  useEffect(() => {
    const visto = localStorage.getItem("install_modal_visto");
    if (!visto && !esPWA()) {
      setTimeout(() => setShowInstallModal(true), 1500);
      localStorage.setItem("install_modal_visto", "1");
    }
  }, []);

  const toggleNotif = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || (esIOS() && !esPWA())) {
      setShowInstallModal(true);
      return;
    }
    if (notifActiva) {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) await sub.unsubscribe();
      await fetch("/api/push", { method: "DELETE" });
      setNotifActiva(false);
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm !== "granted") { alert("Permiso de notificaciones denegado."); return; }
    const reg = await navigator.serviceWorker.register("/sw.js");
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: "BHdDXVbt5sF9xeVGCmLbnKW0fQPaQKFZNiOWn6MkV3RsUJ6sWqRZwoPvLflel8dLFjWtWFnreujWcMbNcK2hCTo"
    });
    await fetch("/api/push", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(sub) });
    setNotifActiva(true);
  };
  const cargarPerfil = async (username: string, nombre: string) => {
    const r = await fetch(`/api/predicciones/usuario?username=${encodeURIComponent(username)}`).then(r=>r.json());
    setPerfilUsuario({username, nombre, predicciones: r.predicciones??{}});
  };
  const logout = async () => { await fetch("/api/auth/logout",{method:"POST"}); router.push("/login"); };

  if (cargando) return <div style={{display:"flex",justifyContent:"center",alignItems:"center",minHeight:"100vh",flexDirection:"column",gap:16,background:"#f2f7fb"}}><img src="/pelota.png" style={{width:80,height:80,objectFit:"contain"}} /><span style={{color:"#6b7280",fontFamily:"DM Sans,sans-serif"}}>Cargando...</span></div>;



  const myPos = tabla.findIndex(r=>r.username===user?.username)+1;
  const myPts = tabla.find(r=>r.username===user?.username)?.pts??0;
  const totalPicks = Object.keys(predicciones).length;
  const inicial = user?.nombre?.charAt(0)?.toUpperCase()??"?";

  const fmtFechaLarga = (f: string) => {
    const d = new Date(f+"T12:00:00");
    const esHoy = f === fechaHoy;
    if (esHoy) return "Hoy";
    return d.toLocaleDateString("es-UY",{weekday:"long",day:"numeric",month:"long"});
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@500&display=swap" rel="stylesheet"/>
      <style>{`*{box-sizing:border-box}html,body{margin:0;padding:0;width:100%;overflow-x:hidden}`}</style><style>{css}</style>
      <div className="app"
    onTouchStart={e=>{ touchStartY.current = e.touches[0].clientY; }}
    onTouchMove={e=>{
      const diff = e.touches[0].clientY - touchStartY.current;
      if (diff > 0 && window.scrollY === 0) setPullY(Math.min(diff, 80));
    }}
    onTouchEnd={async ()=>{
      if (pullY > 60) {
        setRefreshing(true);
        await cargarDatos();
        setRefreshing(false);
      }
      setPullY(0);
    }}
  >
        {/* HEADER */}
        <div className="header">
          <div className="header-top">
            <div className="logo-wrap">
              <img src="/logo.svg" alt="Fascioli" style={{height:32,display:"block"}} />
              <div className="logo-div"/>
              <div className="logo-txt">Penca<br/><span>Mundial 2026</span></div>
            </div>
            <div className="user-pill" onClick={logout}>
              <div className="user-av">{inicial}</div>
              <div><div className="user-name">{user?.nombre}</div><div className="user-pts">{myPos>0?`#${myPos} · `:""}{myPts} pts · salir</div></div>
            </div>
          </div>
          <div className="hero">
            <span className="hero-flag">🏆</span>
            <div><div className="hero-title">Copa del Mundo FIFA</div><div className="hero-date">11 JUN — 19 JUL 2026 · Hora UY</div><div style={{fontSize:11,color:"#e8a020",fontWeight:700,marginTop:4}}>Pronósticos para: <span style={{textDecoration:"underline"}}>{nombreGrupo}</span></div></div>
            <img src="/pelota.png" style={{height:28,objectFit:"contain"}} />
          </div>
          <nav className="nav">
            {([["picks","🎯","Pronósticos"],["grupos","📊","Grupos"],["tabla","🏆","Tabla"],["info","ℹ️","Info"],["misgrupos","🏘️","Mis grupos"]] as [string,string,string][]).map(([id,ic,lb])=>(
              <button key={id} className={`nb ${tab===id?"on":""}`} onClick={()=>{ if(id==="misgrupos"){ router.push("/grupos"); return; } setTab(id as any); }}><em>{ic}</em>{lb}</button>
            ))}
          </nav>
        </div>

        <div className="content">

          {/* ── PRONÓSTICOS ── */}
          {tab==="picks"&&<>
            <div className="prog-card">
              <div>
                <div className="prog-lbl">Tu progreso</div>
                <div className="prog-bar"><div className="prog-fill" style={{width:`${(totalPicks/TODOS_PARTIDOS.length)*100}%`}}/></div>
                <div className="prog-sub">{totalPicks} de {TODOS_PARTIDOS.length} pronósticos</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div className="prog-num">{myPts}</div>
                <div className="prog-pts">puntos</div>
              </div>
            </div>
            {ultimaSync&&<div className="sync"><div className="sync-dot"/>Resultados actualizados a las {ultimaSync}</div>}
            <div className="filtros">
              {FASES.map(f=><button key={f} className={`fb ${filtroFase===f?"on":""}`} onClick={()=>setFiltroFase(f)}>{f}</button>)}
            </div>
            {filtroFase==="Grupos"&&<div className="filtros">
              {["Todos",...GRUPOS_KEYS].map(g=>(
                <button key={g} className={`fb ${filtroGrupo===g?"on":""}`} onClick={()=>setFiltroGrupo(g)}>{g==="Todos"?"Todos":`Gr. ${g}`}</button>
              ))}
            </div>}
            {(()=>{
              const filtrados = TODOS_PARTIDOS
                .filter(p=>{
                  if (p.fase!==filtroFase) return false;
                  if (filtroFase==="Grupos"&&filtroGrupo!=="Todos"&&p.grupo!==filtroGrupo) return false;
                  return true;
                })
                .sort((a,b)=>new Date(`${a.fecha}T${a.hora}:00`).getTime()-new Date(`${b.fecha}T${b.hora}:00`).getTime());
              const fechasUnicas = Array.from(new Set(filtrados.map(p=>p.fecha)));
              const proximaFechaDestacada = partidosHoy[0]?.fecha;
              return fechasUnicas.map((fecha,idx)=>{
                const ps = filtrados.filter(p=>p.fecha===fecha);
                const esProxima = fecha===proximaFechaDestacada && partidosHoy.length>0;
                if (esProxima) {
                  return (
                    <div key={fecha} style={{marginBottom:20}}>
                      <div style={{background:"linear-gradient(135deg,#123952,#1d5278)",borderRadius:"14px 14px 0 0",padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <div>
                          <div style={{fontSize:9,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:"rgba(255,255,255,.6)",marginBottom:3}}>⚡ Próxima jornada</div>
                          <div style={{fontFamily:"'DM Mono',monospace",fontSize:13,color:"#e8a020",fontWeight:500}}>{fmtFechaLarga(fecha)}</div>
                        </div>
                        <div style={{fontSize:28}}>🏆</div>
                      </div>
                      <div style={{border:"1px solid #123952",borderTop:"none",borderRadius:"0 0 14px 14px",overflow:"hidden"}}>
                        {ps.map((p,i)=>{
                          const estado=getEstadoPartido(p.fecha,p.hora,!!resultados[p.id]);
                          const pred=predicciones[p.id];
                          const res=resultados[p.id];
                          const bloq=esBloqueado(p.fecha,p.hora)||!!res;
                          const puntos=res&&pred?calcularPuntos(pred,res,config):null;
                          return (
                            <div key={p.id} style={{borderTop:i>0?"1px solid #dde4ec":"none"}}>
                              <HoyCard ciudad={CIUDADES[p.id]} partido={p} estado={estado} pred={pred} res={res} bloqueado={bloq} puntos={puntos} config={config} guardado={guardados[p.id]} onGuardar={(l,v)=>guardarPick(p.id,l,v)}/>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={fecha} style={{marginBottom:16}}>
                    <div style={{fontSize:10,fontWeight:600,color:"#494d4f",background:"#f5f5f5",padding:"4px 10px",borderRadius:6,display:"inline-block",marginBottom:7}}>{fmtFechaLarga(fecha)}</div>
                    {ps.map(p=>(
                      <PartidoCard key={p.id} partido={p} pred={predicciones[p.id]} res={resultados[p.id]} config={config} guardado={guardados[p.id]} onGuardar={guardarPick} bloqueado={esBloqueado(p.fecha,p.hora)}/>
                    ))}
                  </div>
                );
              });
            })()}
          </>}

          {/* ── GRUPOS ── */}
          {tab==="grupos"&&<>
            <div className="sec-title">Posiciones por grupo</div>
            {ultimaSync&&<div className="sync" style={{marginBottom:12}}><div className="sync-dot"/>Actualizado a las {ultimaSync}</div>}
            {GRUPOS_KEYS.map(g=>{
              const filas=tablaGrupos[g]??[];
              return(
                <div key={g} className="grupo-box">
                  <div className="grupo-box-hdr">
                    <span className="grupo-box-title">Grupo {g}</span>
                    <span style={{fontSize:16}}>{(tablaGrupos[g]??[]).map(f=>getFlag(f.equipo)).join(" ")}</span>
                  </div>
                  <table className="gtable">
                    <thead><tr><th>#</th><th>Equipo</th><th>PJ</th><th>G</th><th>E</th><th>P</th><th>GD</th><th>Pts</th></tr></thead>
                    <tbody>
                      {filas.map((f,i)=>(
                        <tr key={f.equipo} className={i<2?"cls":""}>
                          <td><span style={{fontSize:11,fontWeight:700,color:"#6b7280"}}>{i+1}</span></td>
                          <td><div className="eq-cell"><span style={{fontSize:15}}>{getFlag(f.equipo)}</span><span style={{fontSize:11}}>{f.equipo}</span></div></td>
                          <td>{f.pj}</td><td>{f.g}</td><td>{f.e}</td><td>{f.p}</td>
                          <td style={{color:f.dg>0?"#2e9e6b":f.dg<0?"#dc2626":"#6b7280"}}>{f.dg>0?`+${f.dg}`:f.dg}</td>
                          <td><span className="pts-td">{f.pts}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
            <p style={{fontSize:11,color:"#6b7280",textAlign:"center",marginTop:4}}>🟦 Clasifican los 2 primeros de cada grupo + mejores 8 terceros</p>
          </>}

          {/* ── TABLA ── */}
          {tab==="tabla"&&<>
            <div className="sec-title">Clasificación penca</div>
            {tabla.length===0&&<div className="empty"><em>👥</em>Aún no hay participantes</div>}
            {tabla.map((u,i)=>(
              <div key={u.username} className={`tr ${i<3?"top":""} ${u.username===user?.username?"me":""}`} onClick={()=>cargarPerfil(u.username,u.nombre)} style={{cursor:"pointer"}}>
                <div className="t-pos">{i+1}</div>
                <div className="t-user">
                  <div className="t-name">{u.nombre}{u.username===user?.username?" 👤":""}</div>
                  <div className="t-stats">✅ {u.exactos} exactos · 👍 {u.ganadores} ganadores · {u.jugados} jugados</div>
                </div>
                <div className="t-pts">{u.pts}</div>
                <div className="t-medal">{["🥇","🥈","🥉"][i]??""}</div>
              </div>
            ))}
          </>}

          {/* ── INFO ── */}
          {tab==="info"&&<>
            <div className="info-card">
              <div className="sec-title">Sistema de puntos</div>
              <div className="pts-row"><div><div className="pts-lbl">🎯 Resultado exacto</div><div style={{fontSize:11,color:"#6b7280"}}>Acertás los goles exactos de ambos equipos</div></div><div className="pts-val">{config.resultado_exacto} pts</div></div>
              <div className="pts-row"><div><div className="pts-lbl">🎯 Ganador + diferencia</div><div style={{fontSize:11,color:"#6b7280"}}>Acertás el ganador y la diferencia de goles</div></div><div className="pts-val">{config.ganador_diferencia} pts</div></div>
              <div className="pts-row"><div><div className="pts-lbl">👍 Ganador correcto</div><div style={{fontSize:11,color:"#6b7280"}}>Acertás el ganador o que hay empate</div></div><div className="pts-val">{config.ganador_correcto} pts</div></div>
              <div className="pts-row"><div><div className="pts-lbl">❌ Sin puntos</div><div style={{fontSize:11,color:"#6b7280"}}>No acertás ni el ganador ni el empate</div></div><div className="pts-val" style={{color:"#dc2626"}}>0 pts</div></div>
            </div>
            <div className="info-card">
              <div className="sec-title">Reglas</div>
              <p style={{fontSize:13,color:"#6b7280",lineHeight:1.7}}>
                🔒 Los pronósticos se bloquean automáticamente <strong style={{color:"#123952"}}>3 minutos antes</strong> del inicio de cada partido.<br/><br/>⏱️ Se contabilizan solo los <strong style={{color:"#123952"}}>90 minutos reglamentarios</strong>, sin incluir prórroga ni penales.<br/><br/>
                🔄 Los resultados se actualizan solos cada 2 minutos desde football-data.org.<br/><br/>🏘️ Si pronosticás en cualquier grupo, ese pick se copia automáticamente a los grupos donde todavía no tenés pronóstico para ese partido. Si querés diferenciarte en un grupo, cambialo manualmente.<br/><br/>
                🕐 Todos los horarios están en <strong style={{color:"#123952"}}>hora Uruguay (UTC-3)</strong>.
              </p>
            </div>
          </>}
        </div>
        {(pullY > 0 || refreshing) && (
          <div style={{position:"fixed",top:pullY > 0 ? Math.min(pullY-40,20) : 8,left:"50%",transform:"translateX(-50%)",background:"#123952",color:"#fff",borderRadius:20,padding:"6px 16px",fontSize:12,fontWeight:700,zIndex:200,transition:"top .2s",display:"flex",alignItems:"center",gap:6}}>
            <span style={{display:"inline-block",animation:refreshing?"spin 1s linear infinite":"none"}}>
              {refreshing ? "↻" : pullY > 60 ? "↑ Soltar" : "↓ Actualizar"}
            </span>
          </div>
        )}
        {toast&&<div className="toast">{toast}</div>}
        {showInstallModal&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>setShowInstallModal(false)}>
            <div style={{background:"#fff",borderRadius:"20px 20px 0 0",width:"100%",maxWidth:430,padding:"24px 20px 40px"}} onClick={e=>e.stopPropagation()}>
              <div style={{width:40,height:4,background:"#dde4ec",borderRadius:4,margin:"0 auto 20px"}}/>
              <div style={{fontSize:20,marginBottom:8}}>🔔 Activar notificaciones</div>
              <div style={{fontSize:14,color:"#6b7280",marginBottom:20,lineHeight:1.6}}>Para recibir alertas cuando están por cerrarse los pronósticos, instalá la app en tu pantalla de inicio.</div>
              {esIOS()
                ? <div style={{background:"#f2f7fb",borderRadius:12,padding:16,fontSize:13,color:"#123952",lineHeight:1.8}}>
                    <strong>En iPhone:</strong><br/>
                    1. Tocá el botón compartir <strong>⬆️</strong> en Safari<br/>
                    2. Elegí <strong>"Agregar a pantalla de inicio"</strong><br/>
                    3. Abrí la app desde el ícono y activá las notificaciones
                  </div>
                : <div style={{background:"#f2f7fb",borderRadius:12,padding:16,fontSize:13,color:"#123952",lineHeight:1.8}}>
                    <strong>En Android:</strong><br/>
                    1. Tocá el menú <strong>⋮</strong> en Chrome<br/>
                    2. Elegí <strong>"Agregar a pantalla de inicio"</strong><br/>
                    3. Abrí la app desde el ícono y activá las notificaciones
                  </div>
              }
              <button onClick={()=>setShowInstallModal(false)} style={{width:"100%",marginTop:16,padding:14,border:"none",borderRadius:12,background:"#123952",color:"#fff",fontWeight:700,fontSize:15,cursor:"pointer"}}>Entendido</button>
            </div>
          </div>
        )}
        <button onClick={toggleNotif} style={{position:"fixed",bottom:24,right:16,background:notifActiva?"#2e9e6b":"#123952",color:"#fff",border:"none",borderRadius:50,width:48,height:48,fontSize:20,cursor:"pointer",boxShadow:"0 4px 16px rgba(0,0,0,.25)",zIndex:100}}>{notifActiva?"🔔":"🔕"}</button>
        {perfilUsuario&&<PerfilModal perfil={perfilUsuario} resultados={resultados} config={config} onClose={()=>setPerfilUsuario(null)}/>}
      </div>
    </>
  );
}

/* ── HoyCard ── */
function HoyCard({ partido, estado, pred, res, bloqueado, puntos, config, guardado, ciudad, onGuardar }: {
  partido: Partido; estado: "proximo"|"jugando"|"finalizado";
  pred?: Resultado; res?: Resultado; bloqueado: boolean;
  puntos: number|null; config: PuntosConfig;
  guardado?: boolean; ciudad?: string; onGuardar: (l: number, v: number) => void;
}) {
  const [lv, setLv] = useState<string|number>(pred?.local??"");
  const [vv, setVv] = useState<string|number>(pred?.visitante??"");
  useEffect(()=>{ setLv(pred?.local??""); setVv(pred?.visitante??""); },[pred]);

  const estadoLabel = estado==="proximo" ? "Próximo" : estado==="jugando" ? "⚡ En juego" : "Finalizado";
  const ptsClass = puntos===null?"":puntos===config.resultado_exacto?"pts-ex":puntos>0?"pts-ok":"pts-no";

  return (
    <div className={`hoy-partido ${estado}`}>
      <div className="hoy-estado">
        <span className={`estado-badge estado-${estado}`}>{estadoLabel}</span>
        <span className="hoy-hora">{partido.hora} hs</span>
        {ciudad&&<span style={{fontSize:10,color:"#6b7280",fontWeight:500}}>📍{ciudad}</span>}
      </div>
      <div className="hoy-equipos">
        <div className="hoy-eq">
          <span className="hoy-flag">{getFlag(partido.local)}</span>
          <span className="hoy-name">{partido.local}</span>
        </div>
        {res
          ? <div className="hoy-res"><div className="hoy-score">{res.local} - {res.visitante}</div><div className="hoy-res-lbl">Final</div></div>
          : <span className="hoy-vs">VS</span>
        }
        <div className="hoy-eq">
          <span className="hoy-flag">{getFlag(partido.visitante)}</span>
          <span className="hoy-name">{partido.visitante}</span>
        </div>
      </div>
      {!bloqueado&&<div style={{padding:"6px 0"}}><CountdownBloqueo fecha={partido.fecha} hora={partido.hora}/></div>}
      <div className="hoy-pick">
        <span className="hoy-pick-lbl">Tu pronóstico:</span>
        {puntos !== null && (
          <span className={`hoy-pick-pts ${ptsClass}`}>{puntos>0?`+${puntos}`:0} pts</span>
        )}
        {bloqueado ? (
          pred
            ? <span className="hoy-pick-val">{pred.local} - {pred.visitante}</span>
            : <span className="hoy-pick-none">Sin pronóstico</span>
        ) : (
          <div className="hoy-inputs">
            <input className="hoy-si" type="number" min={0} max={20} placeholder="0" value={lv} onChange={e=>setLv(e.target.value)}/>
            <span style={{color:"#6b7280",fontSize:14}}>-</span>
            <input className="hoy-si" type="number" min={0} max={20} placeholder="0" value={vv} onChange={e=>setVv(e.target.value)}/>
            <button className={`hoy-save ${guardado?"saved":""}`} disabled={lv===""||vv===""} onClick={()=>onGuardar(Number(lv),Number(vv))}>
              {guardado?"✓":"Guardar"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── PartidoCard ── */
function PartidoCard({ partido, pred, res, config, guardado, onGuardar, bloqueado }: {
  partido: Partido; pred?: Resultado; res?: Resultado;
  config: PuntosConfig; guardado?: boolean; bloqueado: boolean;
  onGuardar: (id: string, l: number, v: number) => void;
}) {
  const [lv,setLv]=useState<string|number>(pred?.local??"");
  const [vv,setVv]=useState<string|number>(pred?.visitante??"");
  useEffect(()=>{setLv(pred?.local??"");setVv(pred?.visitante??"");},[pred]);
  const puntos=res&&pred?calcularPuntos(pred,res,config):null;
  const chipCls=puntos===null?"":puntos===config.resultado_exacto?"chip-ex":puntos>0?"chip-ok":"chip-no";
  const fmtFecha=(f:string)=>new Date(f+"T12:00:00").toLocaleDateString("es-UY",{day:"numeric",month:"short"});
  const estaBlq = bloqueado || !!res;

  return(
    <div className="partido">
      <div className="partido-head">
        <span className="fase-tag">{partido.fase==="Grupos"?`Grupo ${partido.grupo}`:partido.fase}</span>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {puntos!==null&&<span className={`chip ${chipCls}`}>{puntos>0?`+${puntos}`:0} pts</span>}
          <div className="fecha-hora">
            <span className="fecha-txt">{fmtFecha(partido.fecha)}</span>
            <span className="hora-txt">{partido.hora} hs</span>
            {CIUDADES[partido.id]&&<span style={{fontSize:9,color:"#6b7280",fontWeight:500}}>📍{CIUDADES[partido.id]}</span>}
          </div>
        </div>
      </div>
      <div className="equipos">
        <div className="eq"><span className="eq-flag">{getFlag(partido.local)}</span><span className="eq-name">{partido.local}</span></div>
        {res
          ?<div className="res-box"><div className="res-score">{res.local} - {res.visitante}</div><div className="res-lbl">Final</div></div>
          :<span className="vs">VS</span>
        }
        <div className="eq"><span className="eq-flag">{getFlag(partido.visitante)}</span><span className="eq-name">{partido.visitante}</span></div>
      </div>
      <div className="pick-row">
        <input className="si" type="number" min={0} max={20} placeholder="0" value={lv} onChange={e=>setLv(e.target.value)} disabled={estaBlq}/>
        <span className="score-sep">—</span>
        <input className="si" type="number" min={0} max={20} placeholder="0" value={vv} onChange={e=>setVv(e.target.value)} disabled={estaBlq}/>
        {estaBlq
          ?<div className="locked-btn">🔒 {res ? "Final" : "Iniciado"}</div>
          :<button className={`save-btn ${guardado?"saved":""}`} disabled={lv===""||vv===""} onClick={()=>onGuardar(partido.id,Number(lv),Number(vv))}>
            {guardado?"✓ Guardado":"Guardar"}
          </button>
        }
      </div>
    </div>
  );
}

function CountdownBloqueo({ fecha, hora }: { fecha: string; hora: string }) {
  const [texto, setTexto] = useState("");
  const [urgente, setUrgente] = useState(false);
  useEffect(() => {
    const calcular = () => {
      const [h, m] = hora.split(":").map(Number);
      const bloqueoMs = new Date(`${fecha}T${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:00`).getTime()-3*60*1000;
      const diff = bloqueoMs - Date.now();
      if (diff <= 0) { setTexto(""); return; }
      const dias = Math.floor(diff/(1000*60*60*24));
      const horas = Math.floor((diff%(1000*60*60*24))/(1000*60*60));
      const mins = Math.floor((diff%(1000*60*60))/(1000*60));
      const segs = Math.floor((diff%(1000*60))/1000);
      setUrgente(diff < 60*60*1000);
      if (dias > 0) setTexto(`Cierra en ${dias}d ${horas}h ${mins}m`);
      else if (horas > 0) setTexto(`Cierra en ${horas}h ${mins}m`);
      else setTexto(`Cierra en ${mins}m ${segs}s`);
    };
    calcular();
    const iv = setInterval(calcular, 1000);
    return () => clearInterval(iv);
  }, [fecha, hora]);
  if (!texto) return null;
  return <span className={`countdown ${urgente?"urgente":""}`}>🔒 {texto}</span>;
}

function PerfilModal({ perfil, resultados, config, onClose }: {
  perfil: {username:string;nombre:string;predicciones:Record<string,Resultado>};
  resultados: Record<string,Resultado>;
  config: PuntosConfig;
  onClose: ()=>void;
}) {
  const bloqueados = TODOS_PARTIDOS.filter(p => {
    const [h, m] = p.hora.split(":").map(Number);
    const bloqueoMs = new Date(`${p.fecha}T${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:00`).getTime()-3*60*1000;
    return Date.now() >= bloqueoMs;
  });
  const conPick = bloqueados.filter(p => perfil.predicciones[p.id]);
  const fmtF = (f:string) => new Date(f+"T12:00:00").toLocaleDateString("es-UY",{day:"numeric",month:"short",weekday:"short"});
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e=>e.stopPropagation()}>
        <div className="modal-handle"/>
        <div className="modal-header">
          <div>
            <div style={{fontWeight:700,fontSize:18}}>{perfil.nombre}</div>
            <div style={{fontSize:12,color:"#6b7280",marginTop:2}}>Pronósticos bloqueados · {conPick.length} registrados</div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {conPick.length===0&&<div style={{textAlign:"center",color:"#6b7280",padding:24}}>Sin pronósticos registrados aún</div>}
        {conPick.map(p=>{
          const pred=perfil.predicciones[p.id];
          const res=resultados[p.id];
          const pts=res&&pred?calcularPuntos(pred,res,config):null;
          const chipCls=pts===null?"":pts===config.resultado_exacto?"chip-ex":pts>0?"chip-ok":"chip-no";
          return (
            <div key={p.id} className="modal-pick-row">
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:600,color:"#1a1f24"}}>{getFlag(p.local)} {p.local} vs {p.visitante} {getFlag(p.visitante)}</div>
                <div style={{fontSize:10,color:"#6b7280",marginTop:2}}>{fmtF(p.fecha)} · {p.hora} hs</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                {res&&<div style={{fontSize:13,color:"#6b7280"}}>{res.local}-{res.visitante}</div>}
                <div style={{fontSize:16,fontWeight:900,color:"#123952",background:"#e8f0f6",padding:"3px 10px",borderRadius:8}}>{pred.local}-{pred.visitante}</div>
                {pts!==null&&<span className={`chip ${chipCls}`}>{pts>0?`+${pts}`:0}p</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
