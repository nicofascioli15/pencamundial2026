"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { TODOS_PARTIDOS, CIUDADES, GRUPOS, getFlag, calcularPuntos, type Partido, type Resultado, type PuntosConfig, PUNTOS_DEFAULT } from "@/lib/mundial";
import { LOGO_SVG } from "@/lib/logo";

const css = `
  .app{max-width:430px;margin:0 auto;min-height:100vh;background:linear-gradient(180deg,#ffffff 0%,#f6f9fc 100%);box-shadow:0 0 60px rgba(18,57,82,.1);display:flex;flex-direction:column;width:100%}
  @media(max-width:430px){.app{max-width:100%;box-shadow:none;margin:0}}
  .header{position:sticky;top:0;z-index:100;overflow:hidden;background:#090a0d}
  .header::before{content:'';position:absolute;top:-60px;left:50%;transform:translateX(-50%);width:280px;height:160px;background:radial-gradient(ellipse,rgba(201,168,76,.07) 0%,transparent 70%);pointer-events:none}
  .header-tribar{display:none}
  .header-gold-line{height:1px;background:linear-gradient(90deg,transparent 0%,rgba(201,168,76,.6) 30%,rgba(232,200,106,.8) 50%,rgba(201,168,76,.6) 70%,transparent 100%);position:relative;z-index:3}
  .header-top{display:flex;justify-content:space-between;align-items:flex-start;padding:14px 16px 10px;position:relative;z-index:2}
  .logo-wrap{display:flex;align-items:center;gap:9px;min-width:0;flex:1}
  .logo-svg{flex-shrink:0}
  .logo-div{width:1px;height:22px;background:rgba(255,255,255,.15);flex-shrink:0}
  .logo-txt{font-size:11px;font-weight:700;color:rgba(255,255,255,.9);line-height:1.2;white-space:nowrap}
  .logo-txt span{display:block;font-size:8px;font-weight:600;letter-spacing:2.5px;text-transform:uppercase;background:linear-gradient(90deg,#E61D25,#3CAC3B,#2A398D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
  .user-pill{display:flex;align-items:center;gap:6px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:24px;padding:5px 11px 5px 6px;cursor:pointer;flex-shrink:0;backdrop-filter:blur(10px)}
  .user-av{width:24px;height:24px;background:linear-gradient(135deg,#e8a020,#f5c842);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:#060e18;flex-shrink:0;box-shadow:0 2px 8px rgba(232,160,32,.4)}
  .user-name{font-size:11px;font-weight:700;color:#fff}
  .user-pts{font-size:9px;color:rgba(255,255,255,.4)}
  .hero{padding:6px 16px 16px;display:flex;align-items:flex-end;justify-content:space-between;gap:10px;position:relative;z-index:2}
  .hero-penca-lbl{font-size:8px;font-weight:700;letter-spacing:3.5px;text-transform:uppercase;color:rgba(255,255,255,.2);margin-bottom:5px}
  .hero-title{font-family:'Bebas Neue',sans-serif;font-size:50px;line-height:.88;color:#fff;letter-spacing:1px}
  .hero-title .year{color:#c9a84c;text-shadow:0 0 30px rgba(201,168,76,.3)}
  .hero-date{font-size:9px;color:rgba(255,255,255,.2);margin-top:7px;font-weight:500;letter-spacing:.3px;display:flex;align-items:center;gap:5px}
  .hero-trophy{font-size:58px;filter:drop-shadow(0 4px 20px rgba(201,168,76,.5));animation:trophy-float 4s ease-in-out infinite;flex-shrink:0}
  .hero-trophy-lbl{font-size:7.5px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#c9a84c;opacity:.7;text-align:center;margin-top:3px}
  @keyframes trophy-float{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-8px) rotate(1.5deg)}}
  .hero-divider{height:1px;background:linear-gradient(90deg,transparent,rgba(201,168,76,.25),transparent);position:relative;z-index:2;margin:0 16px}
  .nav{display:flex;background:#0d0e11;border-top:1px solid rgba(255,255,255,.06)}
  .nb{flex:1;padding:9px 2px 8px;border:none;background:transparent;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:7.5px;font-weight:700;color:rgba(255,255,255,.22);display:flex;flex-direction:column;align-items:center;gap:3px;position:relative;transition:color .2s;letter-spacing:.3px;text-transform:uppercase}
  .nb em{font-style:normal;font-size:14px}
  .nb.on{color:#c9a84c}
  .nb.on::after{content:'';position:absolute;bottom:0;left:25%;right:25%;height:1.5px;background:#c9a84c;border-radius:2px 2px 0 0;opacity:.8}
  .content{padding:14px 14px 80px;flex:1;animation:softIn .22s ease-out}@keyframes softIn{from{opacity:.0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}

  /* ── HOY SECTION ── */
  .hoy-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
  .hoy-title{font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#123952;display:flex;align-items:center;gap:6px}
  .hoy-fecha{font-family:'DM Mono',monospace;font-size:11px;color:#6b7280}
  .hoy-card{
  border-radius:0;
  overflow:visible;
  margin-bottom:22px;
  box-shadow:none;
  border:none;
  background:transparent;
}
  .hoy-partido{
  background:linear-gradient(180deg,#ffffff 0%,#fbfdff 100%);
  border:1px solid rgba(221,228,236,.88);
  border-radius:26px;
  padding:20px;
  margin-bottom:16px;
  position:relative;
  overflow:hidden;
  box-shadow:
    0 18px 42px rgba(18,57,82,.10),
    0 4px 12px rgba(18,57,82,.04);
  transition:
    transform .18s ease,
    box-shadow .18s ease,
    border-color .18s ease;
}
  .hoy-partido:active{transform:scale(.992)}
  .hoy-partido:hover{box-shadow:0 12px 28px rgba(18,57,82,.10)}
  .hoy-partido.proximo::before{
  content:'';
  position:absolute;
  top:0;
  left:22px;
  right:22px;
  height:4px;
  border-radius:999px;
  background:linear-gradient(90deg,#123952 0%,#123952 72%,#e8a020 100%);
}
  .hoy-partido.jugando::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#e8a020,#f0c040);animation:shimmer 1.5s infinite}
  .hoy-partido.finalizado::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:#2e9e6b}
  .hoy-partido.entretiempo{box-shadow:0 0 0 1px rgba(232,160,32,.25),0 8px 24px rgba(232,160,32,.16)}
  .hoy-partido.entretiempo::before{content:'';position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,#e8a020,#f0c040,#e8a020);background-size:200% 100%;animation:liveBar 2s linear infinite}
  .estado-entretiempo{background:rgba(232,160,32,.15);color:#e8a020}
  @keyframes shimmer{0%,100%{opacity:1}50%{opacity:.5}}
  @keyframes liveBar{0%{background-position:0% 50%}100%{background-position:200% 50%}}
  .hoy-estado{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
  .estado-badge{font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:3px 8px;border-radius:4px}
  .estado-proximo{background:#e8f0f6;color:#123952}
  .estado-jugando{background:rgba(232,160,32,.15);color:#e8a020;animation:pulse-text 1.5s infinite}
  .estado-finalizado{background:rgba(46,158,107,.1);color:#2e9e6b}
  @keyframes pulse-text{0%,100%{opacity:1}50%{opacity:.6}}
  .hoy-hora{font-family:'DM Mono',monospace;font-size:12px;font-weight:600;color:#123952}
  .hoy-equipos{display:flex;align-items:center;gap:8px;margin-bottom:12px}
  .hoy-eq{flex:1;text-align:center}
  .hoy-flag{font-size:38px;display:block;margin-bottom:4px}
  .hoy-name{font-size:13px;font-weight:700;color:#1a1f24;line-height:1.2}
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
  .hoy-si{width:42px;text-align:center;padding:7px 4px;border-radius:11px;border:1.5px solid #dde4ec;background:#f2f7fb;color:#123952;font-family:'Playfair Display',serif;font-size:18px;font-weight:700;outline:none;transition:border-color .2s}
  .hoy-si:focus{border-color:#123952}
  .hoy-save{padding:7px 12px;border:none;border-radius:10px;background:linear-gradient(135deg,#123952,#1d5278);color:#fff;box-shadow:0 5px 14px rgba(18,57,82,.24);font-family:'DM Sans',sans-serif;font-weight:700;font-size:12px;cursor:pointer;transition:all .2s;white-space:nowrap}
  .hoy-save:disabled{opacity:.4;cursor:default}
  .hoy-save.saved{background:#f2f7fb;color:#2e9e6b;border:1.5px solid #2e9e6b}
  .bloqueado-lbl{font-size:10px;color:#6b7280;margin-left:auto;display:flex;align-items:center;gap:4px}

  /* ── PROG CARD ── */
  .prog-card{background:radial-gradient(circle at top right,rgba(232,160,32,.32),transparent 34%),linear-gradient(135deg,#071f31 0%,#123952 55%,#1d5278 100%);border-radius:20px;padding:14px 16px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center;box-shadow:0 4px 20px rgba(18,57,82,.2)}
  .prog-lbl{font-size:11px;color:rgba(255,255,255,.65);margin-bottom:5px}
  .prog-bar{width:140px;height:4px;background:rgba(255,255,255,.15);border-radius:4px;overflow:hidden}
  .prog-fill{height:100%;background:#e8a020;border-radius:4px;transition:width .5s}
  .prog-sub{font-size:10px;color:rgba(255,255,255,.5);margin-top:4px}
  .prog-num{font-family:'Playfair Display',serif;font-size:34px;font-weight:900;color:#e8a020;line-height:1}
  .prog-pts{font-size:10px;color:rgba(255,255,255,.5)}
  .sync{display:flex;align-items:center;gap:5px;font-size:11px;color:#2e9e6b;font-weight:500;margin-bottom:11px}
  .sync-dot{width:6px;height:6px;border-radius:50%;background:#2e9e6b;animation:pulse 2s infinite;flex-shrink:0}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
  .filtros{display:flex;gap:7px;margin-bottom:12px;flex-wrap:wrap;overflow:visible;padding-bottom:0}
  .grupo-carrusel{display:flex;gap:8px;overflow-x:auto;padding:4px 0 10px;scrollbar-width:none;margin-bottom:16px}
  .grupo-carrusel::-webkit-scrollbar{display:none}
  .grupo-chip{flex:0 0 auto;display:flex;flex-direction:column;align-items:center;gap:5px;padding:10px 12px;border-radius:16px;border:1.5px solid #dde4ec;background:#fff;cursor:pointer;transition:all .18s;box-shadow:0 2px 8px rgba(18,57,82,.05);min-width:68px}
  .grupo-chip.on{background:linear-gradient(135deg,#123952,#1d5278);border-color:transparent;box-shadow:0 8px 20px rgba(18,57,82,.25)}
  .gc-letra{font-size:10px;font-weight:900;letter-spacing:1px;text-transform:uppercase;color:#123952}
  .grupo-chip.on .gc-letra{color:rgba(255,255,255,.9)}
  .gc-flags{font-size:14px;line-height:1.5;text-align:center;display:flex;flex-wrap:wrap;justify-content:center;gap:1px;max-width:50px}
  .todos-chip{flex:0 0 auto;display:flex;align-items:center;justify-content:center;padding:10px 16px;border-radius:16px;border:1.5px solid #dde4ec;background:#fff;cursor:pointer;transition:all .18s;font-size:12px;font-weight:800;color:#123952}
  .todos-chip.on{background:linear-gradient(135deg,#123952,#1d5278);border-color:transparent;color:#fff}
  .fase-carrusel{display:flex;gap:7px;overflow-x:auto;padding:0 0 4px;scrollbar-width:none;margin-bottom:14px}
  .fase-carrusel::-webkit-scrollbar{display:none}
  .group-card{background:#fff;border:1px solid #dde4ec;border-radius:16px;padding:16px;margin-bottom:10px;box-shadow:0 2px 12px rgba(18,57,82,.06);cursor:pointer;position:relative;overflow:hidden;transition:transform .1s}
  .group-card:active{transform:scale(.98)}
  .group-card-bar{position:absolute;left:0;top:0;bottom:0;width:4px;border-radius:4px 0 0 4px}
  .group-name{font-size:16px;font-weight:700;color:#1a1f24}
  .group-meta{font-size:11px;color:#6b7280;margin-top:3px}
  .group-code{font-family:monospace;font-size:11px;font-weight:700;background:#f2f7fb;color:#123952;padding:3px 8px;border-radius:6px;flex-shrink:0}
  .group-footer{display:flex;justify-content:space-between;align-items:center;padding-top:10px;margin-top:10px;border-top:1px solid #f0f0f0}
  .group-pos{font-size:20px;font-weight:900;color:#e8a020}
  .group-pts{font-size:24px;font-weight:900;color:#123952}
  .global-badge{background:#e8a020;color:#123952;font-size:9px;font-weight:700;padding:2px 7px;border-radius:8px;letter-spacing:1px;text-transform:uppercase}
  .action-row{display:flex;gap:8px;margin-bottom:16px}
  .btn-primary{flex:1;padding:13px;border:none;border-radius:12px;background:#123952;color:#fff;font-weight:700;font-size:13px;cursor:pointer}
  .btn-secondary{flex:1;padding:13px;border:1.5px solid #dde4ec;border-radius:12px;background:#fff;color:#123952;font-weight:700;font-size:13px;cursor:pointer}
  .fb{padding:7px 12px;border-radius:999px;border:1.5px solid #dde4ec;background:#fff;color:#6b7280;font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap;font-family:'DM Sans',sans-serif;transition:all .2s;box-shadow:0 2px 8px rgba(18,57,82,.04)}
  .fb.on{background:linear-gradient(135deg,#123952,#1d5278);border-color:#123952;color:#fff;box-shadow:0 4px 12px rgba(18,57,82,.18)}
  .grupo-lbl{font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#123952;background:#e8f0f6;padding:3px 9px;border-radius:5px;display:inline-block;margin:11px 0 7px}
  .partido{border:1px solid rgba(221,228,236,.9);border-radius:16px;padding:14px;margin-bottom:11px;background:linear-gradient(180deg,#ffffff,#f8fbfd);box-shadow:0 8px 22px rgba(18,57,82,.10);transition:transform .18s ease, box-shadow .18s ease, border-color .18s ease}.partido:active{transform:scale(.992);box-shadow:0 3px 12px rgba(18,57,82,.08)}
  .partido-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:11px}
  .fase-tag{font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#6b7280;background:#f5f5f5;padding:3px 8px;border-radius:4px}
  .fecha-hora{display:flex;flex-direction:column;align-items:flex-end;gap:1px}
  .fecha-txt{font-family:'DM Mono',monospace;font-size:10px;color:#6b7280}
  .hora-txt{font-family:'DM Mono',monospace;font-size:11px;font-weight:500;color:#123952}
  .equipos{display:flex;align-items:center;gap:8px;margin-bottom:11px}
  .eq{flex:1;text-align:center}
  .eq-flag{font-size:34px;display:block;margin-bottom:4px}
  .eq-name{font-size:12px;font-weight:600;color:#494d4f;line-height:1.2}
  .vs{font-family:'DM Mono',monospace;font-size:11px;color:#6b7280}
  .res-box{text-align:center;background:#e8f0f6;border-radius:10px;padding:4px 10px}
  .res-score{font-family:'Playfair Display',serif;font-size:24px;font-weight:900;color:#123952;line-height:1.1}
  .res-lbl{font-size:8px;color:#6b7280;letter-spacing:1px;text-transform:uppercase}
  .pick-row{display:flex;align-items:center;gap:7px;padding-top:11px;border-top:1px solid #dde4ec}
  .si{flex:1;text-align:center;padding:9px 6px;border-radius:12px;border:1.5px solid #dde4ec;background:#f2f7fb;color:#123952;font-family:'Playfair Display',serif;font-size:20px;font-weight:700;outline:none;width:100%;transition:border-color .2s}
  .si:focus{border-color:#123952}
  .si:disabled{opacity:.5;background:#f5f5f5}
  .score-sep{font-size:16px;color:#6b7280;font-weight:300}
  .save-btn{padding:9px 14px;border:none;border-radius:11px;background:linear-gradient(135deg,#123952,#1d5278);color:#fff;box-shadow:0 5px 14px rgba(18,57,82,.24);font-family:'DM Sans',sans-serif;font-weight:700;font-size:12px;cursor:pointer;white-space:nowrap;transition:all .2s}
  .save-btn:hover{background:#1d5278}
  .save-btn:disabled{opacity:.5;cursor:default}
  .save-btn.saved{background:#f2f7fb;color:#2e9e6b;border:1.5px solid #2e9e6b}
  .locked-btn{padding:9px 12px;border:1.5px solid #dde4ec;border-radius:9px;background:transparent;color:#6b7280;font-size:11px;font-weight:600;white-space:nowrap}
  .chip{display:inline-block;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700}
  .chip-ex{background:rgba(46,158,107,.12);color:#2e9e6b;border:1px solid rgba(46,158,107,.3)}
  .chip-ok{background:rgba(232,160,32,.12);color:#e8a020;border:1px solid rgba(232,160,32,.3)}
  .chip-no{background:rgba(220,38,38,.08);color:#dc2626;border:1px solid rgba(220,38,38,.2)}
  .sec-title{font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#123952;margin:4px 0 12px;display:flex;align-items:center;gap:8px}
  .sec-title::after{content:'';flex:1;height:1px;background:#dde4ec}
  .tr{
    display:flex;
    align-items:center;
    padding:14px 15px;
    border:1px solid rgba(221,228,236,.9);
    border-radius:20px;
    margin-bottom:12px;
    gap:12px;
    background:rgba(255,255,255,.98);
    box-shadow:
      0 10px 28px rgba(18,57,82,.07),
      0 2px 8px rgba(18,57,82,.03);
    transition:
      transform .18s ease,
      box-shadow .18s ease,
      border-color .18s ease,
      background .18s ease;
    animation:fadeRank .35s ease;
    position:relative;
    overflow:hidden;
  }

  .tr::before{
    content:'';
    position:absolute;
    left:0;
    top:0;
    bottom:0;
    width:4px;
    background:transparent;
    transition:all .2s ease;
  }

  .tr:active{
    transform:scale(.988);
  }

  .tr:hover{
    transform:translateY(-1px);
    box-shadow:
      0 16px 34px rgba(18,57,82,.10),
      0 3px 10px rgba(18,57,82,.04);
  }

  .tr.top{
    border-color:rgba(232,160,32,.65);
    background:
      linear-gradient(180deg,rgba(255,255,255,.98),rgba(255,250,242,.96));
    box-shadow:
      0 14px 36px rgba(232,160,32,.14),
      0 3px 12px rgba(18,57,82,.04);
  }

  .tr.top::before{
    background:linear-gradient(180deg,#f0c040,#e8a020);
  }

  .tr.me{
    border-color:#123952;
    background:
      linear-gradient(180deg,#f7fbff,#eef5fb);
    box-shadow:
      0 14px 36px rgba(18,57,82,.12),
      0 3px 10px rgba(18,57,82,.05);
  }

  .tr.me::before{
    background:#123952;
  }

  .t-pos{
    font-family:'Playfair Display',serif;
    font-size:26px;
    font-weight:900;
    color:#d5dde6;
    min-width:34px;
    text-align:center;
    transition:transform .18s ease;
  }

  .tr.top .t-pos{
    color:#e8a020;
    text-shadow:0 2px 10px rgba(232,160,32,.18);
  }

  .tr:hover .t-pos{
    transform:scale(1.06);
  }

  .t-user{
    flex:1;
  }

  .t-name{
    font-weight:800;
    font-size:15px;
    color:#111827;
    letter-spacing:-.2px;
  }

  .t-stats{
    font-size:11px;
    color:#6b7280;
    margin-top:3px;
  }

  .t-pts{
    font-family:'Playfair Display',serif;
    font-size:34px;
    font-weight:900;
    color:#123952;
    line-height:1;
    letter-spacing:-1px;
  }

  .tr.top .t-pts{
    color:#0f3550;
  }

  .t-medal{
    font-size:22px;
    filter:drop-shadow(0 3px 6px rgba(0,0,0,.12));
  }

  @keyframes fadeRank{
    from{
      opacity:0;
      transform:translateY(6px);
    }
    to{
      opacity:1;
      transform:translateY(0);
    }
  }
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
  .grupo-carrusel{display:flex;gap:8px;overflow-x:auto;padding:4px 0 10px;scrollbar-width:none;-webkit-overflow-scrolling:touch;margin-bottom:16px}
  .grupo-carrusel::-webkit-scrollbar{display:none}
  .grupo-chip{flex:0 0 auto;display:flex;flex-direction:column;align-items:center;gap:5px;padding:10px 12px;border-radius:16px;border:1.5px solid #dde4ec;background:#fff;cursor:pointer;transition:all .18s ease;box-shadow:0 2px 8px rgba(18,57,82,.05);min-width:68px}
  .grupo-chip:active{transform:scale(.95)}
  .grupo-chip.on{background:linear-gradient(135deg,#123952,#1d5278);border-color:transparent;box-shadow:0 8px 20px rgba(18,57,82,.25);transform:translateY(-2px)}
  .gc-letra{font-size:10px;font-weight:900;letter-spacing:1px;text-transform:uppercase;color:#123952}
  .grupo-chip.on .gc-letra{color:rgba(255,255,255,.9)}
  .gc-flags{font-size:14px;line-height:1.5;text-align:center;display:flex;flex-wrap:wrap;justify-content:center;gap:1px;max-width:50px}
  .todos-chip{flex:0 0 auto;display:flex;align-items:center;justify-content:center;padding:10px 16px;border-radius:16px;border:1.5px solid #dde4ec;background:#fff;cursor:pointer;transition:all .18s;box-shadow:0 2px 8px rgba(18,57,82,.05);font-size:12px;font-weight:800;color:#123952;letter-spacing:.5px}
  .todos-chip.on{background:linear-gradient(135deg,#123952,#1d5278);border-color:transparent;color:#fff;box-shadow:0 6px 16px rgba(18,57,82,.22)}
  .fase-carrusel{display:flex;gap:7px;overflow-x:auto;padding:0 0 4px;scrollbar-width:none;margin-bottom:14px}
  .fase-carrusel::-webkit-scrollbar{display:none}
  .fb{
    flex:0 0 auto!important;
    padding:9px 15px!important;
    border-radius:999px!important;
    background:rgba(255,255,255,.92)!important;
    border:1px solid rgba(18,57,82,.08)!important;
    color:#4b5563!important;
    font-size:12px!important;
    font-weight:700!important;
    letter-spacing:.2px!important;
    box-shadow:0 4px 10px rgba(18,57,82,.05)!important;
    backdrop-filter:blur(10px)!important;
    transition:all .18s ease!important;
  }

  .fb:active{
    transform:scale(.96)!important;
  }

  .fb.on{
    background:linear-gradient(135deg,#071f31,#123952 55%,#1d5278)!important;
    color:#fff!important;
    border-color:transparent!important;
    box-shadow:
      0 8px 18px rgba(18,57,82,.22),
      0 0 0 1px rgba(255,255,255,.08) inset!important;
    transform:translateY(-1px)!important;
  }

`;

interface User { username: string; nombre: string; isAdmin: boolean; }
interface TablaRow { username: string; nombre: string; pts: number; ptsParciales?: number; exactos: number; ganadores: number; jugados: number; totalPicks: number; sinPronos?: number; }
interface FilaGrupo { equipo: string; pj: number; g: number; e: number; p: number; gf: number; ga: number; dg: number; pts: number; }

const FASES = ["Grupos","Dieciseisavos","Octavos","Cuartos","Semis","Final"];
const GRUPOS_KEYS = Object.keys(GRUPOS);

// Determinar estado de un partido basado en hora Montevideo

function getOddData(partido: Partido, odds: Record<string,{home:number;draw:number;away:number}>) {
  const real = odds[`${partido.local}|${partido.visitante}`];
  if (real) return real;

  const fuerza: Record<string, number> = {
    "Argentina": 92, "Brasil": 90, "Francia": 90, "España": 88, "Inglaterra": 87,
    "Portugal": 86, "Alemania": 85, "Países Bajos": 84, "Bélgica": 82, "Uruguay": 80,
    "Croacia": 79, "Colombia": 78, "Marruecos": 76, "Suiza": 75, "Dinamarca": 74,
    "Estados Unidos": 73, "México": 72, "Japón": 72, "Senegal": 71, "Ecuador": 70,
    "Corea del Sur": 69, "Australia": 67, "Canadá": 66, "Paraguay": 66, "Serbia": 66,
    "Polonia": 65, "Noruega": 65, "Turquía": 65, "Egipto": 64, "Irán": 64,
    "Túnez": 62, "Arabia Saudita": 61, "Camerún": 61, "Ghana": 61, "Costa de Marfil": 61,
    "Argelia": 60, "Escocia": 60, "Sudáfrica": 59, "Nueva Zelanda": 58, "Panamá": 57,
    "Qatar": 56, "Jordania": 55, "Uzbekistán": 55, "Cabo Verde": 54, "Haití": 53,
    "Irak": 53, "RD Congo": 53, "Kenia": 51
  };

  const fl = fuerza[partido.local] ?? 60;
  const fv = fuerza[partido.visitante] ?? 60;
  const diff = fl - fv;

  let home = 38 + Math.round(diff * 0.45);
  let away = 32 - Math.round(diff * 0.45);
  let draw = 100 - home - away;

  home = Math.max(18, Math.min(68, home));
  away = Math.max(18, Math.min(68, away));
  draw = Math.max(18, Math.min(34, draw));

  const total = home + draw + away;
  home = Math.round(home * 100 / total);
  draw = Math.round(draw * 100 / total);
  away = 100 - home - draw;

  return { home, draw, away };
}


function partidoUYMs(fecha: string, hora: string): number {
  const [year, month, day] = fecha.split("-").map(Number);
  const [h, m] = hora.split(":").map(Number);
  return Date.UTC(year, month - 1, day, h + 3, m, 0);
}

// Tiempos del partido en minutos
const T_PRIMER_TIEMPO = 45;
const T_HIDRATACION_1 = 3;  // pausa hidratación ~min 30
const T_DESCANSO = 15;
const T_SEGUNDO_TIEMPO = 45;
const T_HIDRATACION_2 = 3;  // pausa hidratación ~min 75
const T_BUFFER_FINAL = 10;  // tiempo extra alargue/descuento

// Duración total estimada en minutos
const DUR_PRIMER_TIEMPO  = T_PRIMER_TIEMPO + T_HIDRATACION_1;   // ~48 min
const DUR_ENTRETIEMPO    = DUR_PRIMER_TIEMPO + T_DESCANSO;       // ~63 min
const DUR_SEGUNDO_TIEMPO = DUR_ENTRETIEMPO + T_SEGUNDO_TIEMPO + T_HIDRATACION_2; // ~111 min
const DUR_TOTAL          = DUR_SEGUNDO_TIEMPO + T_BUFFER_FINAL;  // ~121 min

function getEstadoPartido(fecha: string, hora: string, tieneResultado: boolean, estaEnVivo?: boolean): "proximo"|"jugando"|"entretiempo"|"finalizado" {
  if (tieneResultado) return "finalizado";
  if (estaEnVivo) return "jugando"; // La API dice que está en vivo → siempre jugando
  const [h, m] = hora.split(":").map(Number);
  const partidoMs = new Date(`${fecha}T${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:00`).getTime();
  const ahora = Date.now();
  const transcurrido = (ahora - partidoMs) / 1000 / 60; // minutos desde inicio
  if (transcurrido < 0) return "proximo";
  if (transcurrido < DUR_PRIMER_TIEMPO) return "jugando";
  if (transcurrido < DUR_ENTRETIEMPO) return "entretiempo";
  if (transcurrido < DUR_TOTAL) return "jugando";
  return "finalizado";
}

function getMinutoPartido(fecha: string, hora: string): { minuto: number; tiempo: string } | null {
  const [h, m] = hora.split(":").map(Number);
  const partidoMs = new Date(`${fecha}T${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:00`).getTime();
  const transcurrido = (Date.now() - partidoMs) / 1000 / 60;
  if (transcurrido < 0) return null;

  if (transcurrido < DUR_PRIMER_TIEMPO) {
    // Primer tiempo: descontar la pausa de hidratación si ya pasó el min 30
    const minReal = transcurrido > 32 ? Math.round(transcurrido - T_HIDRATACION_1) : Math.round(transcurrido);
    return { minuto: Math.min(minReal, 45), tiempo: "1T" };
  }
  if (transcurrido < DUR_ENTRETIEMPO) {
    return { minuto: 45, tiempo: "ET" };
  }
  // Segundo tiempo: empieza en el min 46 real
  const transcurridoST = transcurrido - DUR_ENTRETIEMPO;
  const minReal = transcurridoST > 47 ? Math.round(46 + transcurridoST - T_HIDRATACION_2) : Math.round(46 + transcurridoST);
  return { minuto: Math.min(minReal, 90), tiempo: "2T" };
}

function esBloqueado(fecha: string, hora: string): boolean {
  const partidoMs = partidoUYMs(fecha, hora);
  const bloqueoMs = partidoMs - (10 * 60 * 1000);
  return Date.now() >= bloqueoMs;
}

export default function PencaPage() {
  const router = useRouter();
  const [grupoActivo, setGrupoActivo] = useState<string>("fascioli");
  const grupoActivoRef = useRef<string>("fascioli");
  const setGrupoActivoSync = (id: string) => { grupoActivoRef.current = id; setGrupoActivo(id); };
  const [nombreGrupo, setNombreGrupo] = useState<string>("PencaFascioli");
  const [gruposTabla, setGruposTabla] = useState<{id:string;nombre:string}[]>([{id:"fascioli",nombre:"PencaFascioli"}]);
  const [tablaGrupoSeleccionado, setTablaGrupoSeleccionado] = useState<string>("fascioli");
  const [infoAbierta, setInfoAbierta] = useState(false);
  const [finalizadosAbierto, setFinalizadosAbierto] = useState(false);
  const [lineupModal, setLineupModal] = useState<{local:any;visitante:any;equipoLocal:string;equipoVisitante:string}|null>(null);
  const [loadingLineup, setLoadingLineup] = useState<string|null>(null);
  const [lineupDisponible, setLineupDisponible] = useState<Record<string,boolean>>({});
  const [nombreTablaSeleccionada, setNombreTablaSeleccionada] = useState<string>("PencaFascioli");
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gId = params.get("grupo") ?? "fascioli";
    const tabParam = params.get("tab");
    if (tabParam) setTab(tabParam as any);
    setGrupoActivo(gId);
    setTablaGrupoSeleccionado(gId);
    if (gId === "fascioli") setNombreGrupo("PencaFascioli");

    fetch("/api/grupos").then(r=>r.json()).then(d => {
      const gruposApi = d.grupos??[];
      const sinDuplicados = gruposApi.filter((g:any)=>g.id !== "fascioli");
      const lista = [{id:"fascioli",nombre:"PencaFascioli"}, ...sinDuplicados];
      setGruposTabla(lista);

      const g = lista.find((g: any) => g.id === gId);
      if (g) {
        setNombreGrupo(g.nombre);
        setNombreTablaSeleccionada(g.nombre);
      }
    });
  }, []);

  // Recargar datos cuando cambia el grupo
  useEffect(() => {
    if (grupoActivo) cargarDatos(grupoActivo);
  }, [grupoActivo]);
  const [user, setUser] = useState<User|null>(null);
  const [tab, setTab] = useState<"picks"|"proximos"|"grupos"|"tabla"|"info"|"misgrupos">("proximos");
  const [predicciones, setPredicciones] = useState<Record<string,Resultado>>({});
  const [resultados, setResultados] = useState<Record<string,Resultado>>({});
  const [tabla, setTabla] = useState<TablaRow[]>([]);
  const [tablaGrupos, setTablaGrupos] = useState<Record<string,FilaGrupo[]>>({});
  const [goleadores, setGoleadores] = useState<any[]>([]);
  const [bracketData, setBracketData] = useState<Record<string,{local:string|null;visitante:string|null}>>({});
  const [config, setConfig] = useState<PuntosConfig>(PUNTOS_DEFAULT);
  const [filtroFase, setFiltroFase] = useState("Grupos");
  const [filtroGrupo, setFiltroGrupo] = useState("Todos");
  const [guardados, setGuardados] = useState<Record<string,boolean>>({});
  const [toast, setToast] = useState<string|null>(null);
  const [cargando, setCargando] = useState(true);
  const [ultimaSync, setUltimaSync] = useState<string|null>(null);
  const [partidosHoy, setPartidosHoy] = useState<Partido[]>([]);
  const [proximaFecha, setProximaFecha] = useState<string | null>(null);
  const [siguientesDias, setSiguientesDias] = useState<{fecha:string;partidos:Partido[]}[]>([]);
  const [fechaHoy, setFechaHoy] = useState<string>("");
  const [perfilUsuario, setPerfilUsuario] = useState<{username:string;nombre:string;predicciones:Record<string,Resultado>}|null>(null);
  const [odds, setOdds] = useState<Record<string,{home:number;draw:number;away:number}>>({});
    const [notifActiva, setNotifActiva] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pullY, setPullY] = useState(0);
  const touchStartY = useRef(0);

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker.ready.then(reg => {
        reg.pushManager.getSubscription().then(async sub => {
          setNotifActiva(!!sub);
          if (!sub && esPWA() && !localStorage.getItem("notif_modal_cerrado")) {
            setTimeout(() => setShowNotifModal(true), 2000);
          }
          // Si tiene suscripción activa en el dispositivo, re-registrarla en el servidor
          if (sub) {
            try {
              await fetch("/api/push", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(sub),
              });
            } catch {}
          }
        });
      });
    }
  }, []);
  // Polling en vivo cada 20 segundos
  useEffect(() => {
    const pollLive = async () => {
      try {
        const r = await fetch("/api/live").then(r=>r.json());
        if (r.enVivo) {
          const map: Record<string, any> = {};
          for (const d of r.enVivo) map[d.partidoId] = d;
          setLiveData(map);
          // Si hay partido en vivo, recargar tabla para puntos parciales
          if (r.enVivo.length > 0) {
            const tablaRes = await fetch(`/api/grupos/tabla?grupoId=${grupoActivoRef.current}`).then(r=>r.json());
            if (tablaRes.tabla) setTabla(tablaRes.tabla);
          }
        }
        if (r.nuevosFinalizados > 0) cargarDatos();
      } catch {}
    };
    pollLive();
    const interval = setInterval(pollLive, 20000);
    return () => clearInterval(interval);
  }, []);

  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [pickPendiente, setPickPendiente] = useState<any>(null);
  const [aplicarTodosGrupos, setAplicarTodosGrupos] = useState(false);
  // Por partido: true = aplicar a todos, false = solo este grupo
  const [aplicarPorPartido, setAplicarPorPartido] = useState<Record<string,boolean>>({});

  const getAplicar = (partidoId: string) => aplicarPorPartido[partidoId] !== false;

  const toggleAplicarSiempre = (partidoId: string) => {
    setAplicarPorPartido(prev => ({ ...prev, [partidoId]: !getAplicar(partidoId) }));
  };
  const [noMostrarInstall, setNoMostrarInstall] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2700); };

  // Datos en vivo desde API
  const [liveData, setLiveData] = useState<Record<string, {estado:string;minuto:number|null;local:number;visitante:number;goles?:{minuto:string;jugador:string;esPropio:boolean;equipo:string}[]}>>({});
  const [soloSinPick, setSoloSinPick] = useState(false);

  const [gruposUser, setGruposUser] = useState<any[]>([]);
  const [cargandoGrupos, setCargandoGrupos] = useState(false);
  const [modalCrear, setModalCrear] = useState(false);
  const [modalUnirse, setModalUnirse] = useState(false);
  const [nombreNuevo, setNombreNuevo] = useState("");
  const [codigoUnirse, setCodigoUnirse] = useState("");
  const [grupoErr, setGrupoErr] = useState("");
  const [grupoLoading, setGrupoLoading] = useState(false);

  const cargarDatos = useCallback(async (grupoIdParam?: string) => {
    const gId = grupoIdParam ?? grupoActivoRef.current ?? new URLSearchParams(window.location.search).get("grupo") ?? "fascioli";
    const [pRes,rRes,tRes,cRes,gRes,oRes,hRes] = await Promise.all([
      fetch(`/api/grupos/predicciones?grupoId=${gId}`).then(r=>r.json()),
      fetch("/api/resultados").then(r=>r.json()),
      fetch(`/api/grupos/tabla?grupoId=${gId}`).then(r=>r.json()),
      fetch("/api/config").then(r=>r.json()),
      fetch("/api/mundial-grupos").then(r=>r.json()),
      fetch("/api/odds").then(r=>r.json()),
      fetch("/api/partidos-hoy").then(r=>r.json()),
    ]);
    setPredicciones(pRes.predicciones??{});
    setResultados(rRes.resultados??{});
    setTabla(tRes.tabla??[]);
    setConfig(cRes.config??PUNTOS_DEFAULT);
    setTablaGrupos(gRes.tablaGrupos??{});
    fetch("/api/standings").then(r=>r.json()).then(d=>{
      if (d.ok && d.grupos) setTablaGrupos(d.grupos);
    }).catch(()=>{});
    fetch("/api/goleadores").then(r=>r.json()).then(d=>{
      if (d.ok && d.scorers) setGoleadores(d.scorers);
    }).catch(()=>{});
    fetch("/api/bracket").then(r=>r.json()).then(d=>{
      if (d.ok && d.bracket) setBracketData(d.bracket);
    }).catch(()=>{});
    setPartidosHoy(hRes.partidos??[]);
    setProximaFecha(hRes.proximaFecha??null);
    setSiguientesDias(hRes.siguientesDias??[]);
    setFechaHoy(hRes.fechaHoy??"");
    setOdds(oRes.odds??{});
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
    // Sync automático en segundo plano al abrir la app
    fetch("/api/sync").catch(()=>{});

    (async () => {
      const me = await fetch("/api/auth/me").then(r=>r.json());
      if (!me.user) { router.push("/login"); return; }
      if (me.user.isAdmin) { router.push("/admin"); return; }
      setUser(me.user);
      await cargarDatos();
      await sincronizar();
      await cargarGrupos();
      setCargando(false);
    })();
  }, [router,cargarDatos,sincronizar]);

  useEffect(() => {
    const iv = setInterval(sincronizar, 2*60*1000);
    return () => clearInterval(iv);
  }, [sincronizar]);

  
  const cargarGrupos = async () => {
    setCargandoGrupos(true);
    const d = await fetch("/api/grupos").then(r=>r.json());
    setGruposUser(d.grupos??[]);
    setCargandoGrupos(false);
  };

  const crearGrupo = async () => {
    if (!nombreNuevo.trim()) { setGrupoErr("Ingresá un nombre"); return; }
    setGrupoLoading(true); setGrupoErr("");
    const r = await fetch("/api/grupos",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({nombre:nombreNuevo})}).then(r=>r.json());
    setGrupoLoading(false);
    if (r.error) { setGrupoErr(r.error); return; }
    setModalCrear(false); setNombreNuevo("");
    cargarGrupos(); showToast("✅ Grupo creado");
  };

  const unirseGrupoFn = async () => {
    if (!codigoUnirse.trim()) { setGrupoErr("Ingresá el código"); return; }
    setGrupoLoading(true); setGrupoErr("");
    const r = await fetch("/api/grupos/unirse",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({codigo:codigoUnirse})}).then(r=>r.json());
    setGrupoLoading(false);
    if (r.error) { setGrupoErr(r.error); return; }
    setModalUnirse(false); setCodigoUnirse("");
    cargarGrupos(); showToast("✅ Te uniste al grupo");
  };

  const salirGrupoFn = async (grupoId:string, nombre:string) => {
    if (!confirm(`¿Salir del grupo "${nombre}"?`)) return;
    const r = await fetch("/api/grupos/salir",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({grupoId})}).then(r=>r.json());
    if (r.error) { showToast("❌ "+r.error); return; }
    cargarGrupos(); showToast("✅ Saliste del grupo");
  };

  const borrarGrupoFn = async (grupoId:string, nombre:string) => {
    if (!confirm(`¿Borrar el grupo "${nombre}"?`)) return;
    const r = await fetch("/api/grupos/borrar",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({grupoId})}).then(r=>r.json());
    if (r.error) { showToast("❌ "+r.error); return; }
    cargarGrupos(); showToast("✅ Grupo eliminado");
  };

  const compartirGrupoFn = (nombre:string, codigo:string) => {
    const url = `${window.location.origin}/unirse?codigo=${codigo}`;
    const msg = `¡Únete a la Penca!\n\nJugá en el grupo *${nombre}*\n\nCódigo: *${codigo}*\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`,"_blank");
  };

  const coloresGrupo = ["#e8a020","#2e9e6b","#9333ea","#dc2626","#0891b2","#f59e0b"];

const enviarPick = async (
    partidoId:string,
    local:number,
    visitante:number,
    aplicarATodos=false
  ) => {
    const r = await fetch("/api/grupos/predicciones",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        grupoId:new URLSearchParams(window.location.search).get("grupo")??"fascioli",
        partidoId,
        local,
        visitante,
        aplicarATodos
      })
    });

    if (r.ok) {
      setPredicciones((p:any)=>({...p,[partidoId]:{local,visitante}}));
      setGuardados((g:any)=>({...g,[partidoId]:true}));

      setTimeout(()=>{
        setGuardados((g:any)=>({...g,[partidoId]:false}));
      },2000);

      showToast(
        aplicarATodos
          ? "✅ Pronóstico actualizado en todos tus grupos"
          : "✅ Pronóstico guardado"
      );
    }
  };

  const guardarPick = async (
    partidoId:string,
    local:number,
    visitante:number
  ) => {
    await enviarPick(partidoId, local, visitante, getAplicar(partidoId));
  };


  const esIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
  const esPWA = () =>
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true;

  // Detectar cuando el usuario ancla la app o ya la tiene instalada
  useEffect(() => {
    // Nuevo install
    const handleInstall = () => {
      fetch("/api/pwa-install", { method: "POST" }).catch(()=>{});
    };
    window.addEventListener("appinstalled", handleInstall);

    // Ya estaba instalada (abre como PWA)
    const yaEsPWA = window.matchMedia("(display-mode: standalone)").matches
      || (window.navigator as any).standalone === true;
    if (yaEsPWA) {
      fetch("/api/pwa-install", { method: "POST" }).catch(()=>{});
    }

    return () => window.removeEventListener("appinstalled", handleInstall);
  }, []);

  useEffect(() => {
    const ocultar = localStorage.getItem("install_modal_ocultar");
    const mostradoSesion = sessionStorage.getItem("install_modal_mostrado_sesion");

    if (!ocultar && !mostradoSesion && !esPWA()) {
      const t = setTimeout(() => {
        setShowInstallModal(true);
        sessionStorage.setItem("install_modal_mostrado_sesion", "1");
      }, 1500);

      return () => clearTimeout(t);
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
    const r = await fetch(`/api/predicciones/usuario?username=${encodeURIComponent(username)}&grupoId=${encodeURIComponent(grupoActivo)}`).then(r=>r.json());
    setPerfilUsuario({username, nombre, predicciones: r.predicciones??{}});
  };
  const logout = async () => { await fetch("/api/auth/logout",{method:"POST"}); router.push("/login"); };

  const cambiarTablaGrupo = async (grupoId: string) => {
    setTablaGrupoSeleccionado(grupoId);
    const g = gruposTabla.find(g=>g.id===grupoId);
    setNombreTablaSeleccionada(g?.nombre ?? "Tabla");

    const r = await fetch(`/api/grupos/tabla?grupoId=${grupoId}`).then(r=>r.json());
    setTabla(r.tabla??[]);
  };

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
      <style>{`*{box-sizing:border-box}html,body{margin:0;padding:0;width:100%;overflow-x:hidden;background:#123952}`}</style><style>{css}</style>
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
            <div>
              <div className="hero-title">
                <span className="rc">MUN</span><span className="gc">DIAL</span><br/>
                <span className="bc">20</span><span className="yc">26</span>
              </div>
              <div className="hero-date">
                <span>🇺🇸</span><span>🇲🇽</span><span>🇨🇦</span>
                <span>11 Jun – 19 Jul 2026</span>
              </div>
              <div style={{marginTop:8,display:"inline-flex",alignItems:"center",gap:5,background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.12)",borderRadius:999,padding:"4px 10px",fontSize:10,fontWeight:700,color:"rgba(255,255,255,.55)"}}>
                🎯 <span style={{color:"#f5c842"}}>{nombreGrupo}</span>
              </div>
            </div>
            <div className="hero-trophy" style={{userSelect:"none",lineHeight:1}}>🏆</div>
          </div>
          {/* ── BARRA DE GRUPOS ── */}
          {gruposUser.length > 0 && (
            <div style={{background:"#090a0d",borderBottom:"1px solid rgba(255,255,255,.06)",padding:"10px 12px",overflowX:"auto",display:"flex",gap:8,scrollbarWidth:"none" as any}}>
              {gruposUser.map(g=>(
                <div key={g.id} onClick={()=>{window.history.replaceState(null,"",`/penca?grupo=${g.id}`);setGrupoActivoSync(g.id);setNombreGrupo(g.nombre);}} style={{flexShrink:0,display:"flex",alignItems:"center",gap:10,background:grupoActivo===g.id?"rgba(245,200,66,.1)":"rgba(255,255,255,.05)",border:`1.5px solid ${grupoActivo===g.id?"rgba(245,200,66,.4)":"rgba(255,255,255,.08)"}`,borderRadius:14,padding:"8px 14px",cursor:"pointer",transition:"all .2s"}}>
                  <div>
                    <div style={{fontSize:11,fontWeight:700,color:grupoActivo===g.id?"#f5c842":"rgba(255,255,255,.6)",whiteSpace:"nowrap",maxWidth:90,overflow:"hidden",textOverflow:"ellipsis"}}>{g.nombre}</div>
                    <div style={{fontSize:9,color:grupoActivo===g.id?"rgba(245,200,66,.6)":"rgba(255,255,255,.3)",fontWeight:700,marginTop:1}}>{g.miPos>0?`#${g.miPos} · `:""}{g.id==="fascioli"?"Global":`${g.miembros} jugadores`}</div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:grupoActivo===g.id?"#f5c842":"rgba(255,255,255,.25)",lineHeight:1}}>{g.miPts}</div>
                    <div style={{fontSize:8,color:grupoActivo===g.id?"rgba(245,200,66,.5)":"rgba(255,255,255,.2)",fontWeight:600}}>pts</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <nav className="nav">
            {([["proximos","📅","Próximos"],["picks","🎯","Pronósticos"],["tabla","🏆","Tabla"],["grupos","📊","Grupos"],["misgrupos","🏘️","Mis grupos"]] as [string,string,string][]).map(([id,ic,lb])=>(
              <button key={id} className={`nb ${tab===id?"on":""}`} onClick={()=>{ if(id==="misgrupos"){ cargarGrupos(); setTab("misgrupos"); return; } setTab(id as any); }}><em>{ic}</em>{lb}</button>
            ))}
          </nav>
        </div>

        <div className="content">

          {/* ── PRÓXIMOS ── */}
          {tab==="proximos"&&(()=>{
            const todosOrdenados = TODOS_PARTIDOS
              .sort((a,b)=>new Date(`${a.fecha}T${a.hora}:00`).getTime()-new Date(`${b.fecha}T${b.hora}:00`).getTime());
            const fechasUnicas = Array.from(new Set(todosOrdenados.map(p=>p.fecha)));
            const fechaProxima = fechasUnicas.find(fecha=>
              todosOrdenados.filter(p=>p.fecha===fecha).some(p=>getEstadoPartido(p.fecha,p.hora,!!resultados[p.id])!=="finalizado")
            );

            if (!fechaProxima) return (
              <div className="empty"><em>🏆</em>¡El Mundial terminó!</div>
            );

            const esHoyFecha = fechaProxima === fechaHoy;

            const partidosDia = todosOrdenados
              .filter(p=>p.fecha===fechaProxima)
              .filter(p=>!resultados[p.id] || !!liveData[p.id] || liveData[p.id]?.estado==="jugando" || liveData[p.id]?.estado==="entretiempo");

            return (
              <div style={{marginBottom:20}}>
                <div style={{fontSize:10,fontWeight:800,letterSpacing:2,textTransform:"uppercase",color:"#123952",marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
                  {esHoyFecha ? "🔴 Hoy" : "📅"} · {fmtFechaLarga(fechaProxima)}
                  <span style={{flex:1,height:1,background:"#dde4ec"}}/>
                </div>

                {partidosDia.map((p,i)=>{
                  const estadoCalc=getEstadoPartido(p.fecha,p.hora,!!resultados[p.id],!!liveData[p.id]);
                  const estadoLive=liveData[p.id]?.estado as "jugando"|"entretiempo"|undefined;
                  const estado = estadoLive ?? estadoCalc;
                  const pred=predicciones[p.id];
                  const res=resultados[p.id];
                  const bloq=esBloqueado(p.fecha,p.hora)||!!res;
                  const puntos=res&&pred?calcularPuntos(pred,res,config):null;
                  return(
                    <div key={p.id} style={{marginBottom:i<partidosDia.length-1?14:0}}>
                      <HoyCard ciudad={CIUDADES[p.id]} partido={p} estado={estado} pred={pred} res={res} bloqueado={bloq} puntos={puntos} config={config} guardado={guardados[p.id]} onGuardar={(l,v)=>guardarPick(p.id,l,v)} oddData={getOddData(p,odds)} liveInfo={liveData[p.id]} aplicarSiempre={getAplicar(p.id)} onToggleAplicar={()=>toggleAplicarSiempre(p.id)} loadingLineup={loadingLineup===p.id} localNombre={bracketData[p.id]?.local} visitanteNombre={bracketData[p.id]?.visitante} onVerLineup={async()=>{setLoadingLineup(p.id);const r=await fetch(`/api/lineups?partidoId=${p.id}`).then(r=>r.json());setLoadingLineup(null);if(r.ok){setLineupDisponible(prev=>({...prev,[p.id]:true}));setLineupModal({local:r.local.jugadores,visitante:r.visitante.jugadores,equipoLocal:p.local,equipoVisitante:p.visitante});}else{setLineupDisponible(prev=>({...prev,[p.id]:false}));}}}/>
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {/* ── PRONÓSTICOS ── */}
          {tab==="picks"&&<>
            {(()=>{
              const pendientes = TODOS_PARTIDOS.filter(p=>{
                if (resultados[p.id] || esBloqueado(p.fecha,p.hora) || predicciones[p.id]) return false;
                // Excluir partidos de fase knockout donde los equipos aún no se definieron
                if (p.fase !== "Grupos") {
                  const bk = bracketData[p.id];
                  if (!bk || !bk.local || !bk.visitante) return false;
                }
                return true;
              }).length;
              return pendientes > 0 ? (
                <div onClick={()=>setSoloSinPick(v=>!v)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:soloSinPick?"rgba(232,160,32,.15)":"rgba(232,160,32,.08)",border:`1px solid ${soloSinPick?"rgba(232,160,32,.5)":"rgba(232,160,32,.25)"}`,borderRadius:12,padding:"10px 14px",marginBottom:12,cursor:"pointer"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:16}}>⚠️</span>
                    <div>
                      <div style={{fontSize:12,fontWeight:700,color:"#e8a020"}}>{pendientes} pronóstico{pendientes!==1?"s":""} sin completar</div>
                      <div style={{fontSize:10,color:"rgba(232,160,32,.7)"}}>{soloSinPick?"Mostrando solo pendientes · Tocá para ver todos":"Tocá para filtrarlos"}</div>
                    </div>
                  </div>
                  <div style={{fontSize:10,fontWeight:800,color:"#e8a020",background:"rgba(232,160,32,.15)",border:"1px solid rgba(232,160,32,.3)",borderRadius:8,padding:"4px 10px"}}>{soloSinPick?"Ver todos":"Filtrar →"}</div>
                </div>
              ) : (
                <div style={{display:"flex",alignItems:"center",gap:8,background:"rgba(46,158,107,.08)",border:"1px solid rgba(46,158,107,.2)",borderRadius:12,padding:"10px 14px",marginBottom:12}}>
                  <span>✅</span>
                  <div style={{fontSize:12,fontWeight:700,color:"#2e9e6b"}}>¡Todos los pronósticos completados!</div>
                </div>
              );
            })()}


            {/* ── ACORDEÓN FINALIZADOS ── */}
            {(()=>{
              const finalizados = TODOS_PARTIDOS
                .filter(p => !!resultados[p.id])
                .sort((a,b)=>new Date(`${b.fecha}T${b.hora}`).getTime()-new Date(`${a.fecha}T${a.hora}`).getTime());
              if (!finalizados.length) return null;
              return (
                <div style={{marginTop:16,background:"#fff",border:"1px solid #dde4ec",borderRadius:14,overflow:"hidden",boxShadow:"0 2px 8px rgba(18,57,82,.05)"}}>
                  <div onClick={()=>setFinalizadosAbierto(v=>!v)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 14px",cursor:"pointer",userSelect:"none"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:16}}>✅</span>
                      <div>
                        <div style={{fontSize:12,fontWeight:700,color:"#123952"}}>Partidos finalizados</div>
                        <div style={{fontSize:10,color:"#6b7280"}}>{finalizados.length} partido{finalizados.length!==1?"s":""} jugados</div>
                      </div>
                    </div>
                    <span style={{fontSize:16,color:"#6b7280",display:"inline-block",transform:finalizadosAbierto?"rotate(180deg)":"rotate(0deg)",transition:"transform .2s"}}>▾</span>
                  </div>
                  {finalizadosAbierto&&(
                    <div style={{borderTop:"1px solid #f0f0f0",maxHeight:320,overflowY:"auto"}}>
                      {finalizados.map(p=>{
                        const pred=predicciones[p.id];
                        const res=resultados[p.id];
                        const pts=res&&pred?calcularPuntos(pred,res,config):null;
                        const chipCls=pts===null?"":pts===config.resultado_exacto?"chip-ex":pts>0?"chip-ok":"chip-no";
                        return (
                          <div key={p.id} style={{padding:"10px 14px",borderBottom:"1px solid #f5f5f5",display:"flex",alignItems:"center",gap:10}}>
                            <div style={{flex:1}}>
                              <div style={{fontSize:11,fontWeight:600,color:"#1a1f24"}}>{getFlag(bracketData?.[p.id]?.local??p.local)} {bracketData?.[p.id]?.local??p.local} vs {bracketData?.[p.id]?.visitante??p.visitante} {getFlag(bracketData?.[p.id]?.visitante??p.visitante)}</div>
                              <div style={{fontSize:10,color:"#6b7280",marginTop:2}}>{p.fecha} · {p.hora} hs</div>
                            </div>
                            <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                              {res&&<div style={{fontSize:12,color:"#6b7280",fontWeight:600}}>{res.local}-{res.visitante}</div>}
                              {pred
                                ? <div style={{fontSize:14,fontWeight:900,color:"#123952",background:"#e8f0f6",padding:"3px 10px",borderRadius:8}}>{pred.local}-{pred.visitante}</div>
                                : <div style={{fontSize:11,color:"#9ca3af",fontStyle:"italic"}}>Sin pick</div>
                              }
                              {pts!==null&&<span className={`chip ${chipCls}`}>{pts>0?`+${pts}`:0}p</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}

            {ultimaSync&&<div className="sync"><div className="sync-dot"/>Resultados actualizados a las {ultimaSync}</div>}
            {/* Carrusel de fases */}
            <div className="fase-carrusel">
              {FASES.map(f=>(
                <button key={f} className={`fb ${filtroFase===f?"on":""}`} onClick={()=>setFiltroFase(f)}>{f}</button>
              ))}
            </div>

            {/* Carrusel de grupos con banderas */}
            {filtroFase==="Grupos"&&(
              <div className="grupo-carrusel">
                <div className={`todos-chip ${filtroGrupo==="Todos"?"on":""}`} onClick={()=>setFiltroGrupo("Todos")}>
                  Todos
                </div>
                {GRUPOS_KEYS.map(g=>(
                  <div key={g} className={`grupo-chip ${filtroGrupo===g?"on":""}`} onClick={()=>setFiltroGrupo(g)}>
                    <span className="gc-letra">Gr. {g}</span>
                    <span className="gc-flags">{GRUPOS[g].map(e=>getFlag(e)).join(" ")}</span>
                  </div>
                ))}
              </div>
            )}
            {(()=>{
              const filtrados = TODOS_PARTIDOS
                .filter(p=>{
                  if (p.fase!==filtroFase) return false;
                  if (filtroFase==="Grupos"&&filtroGrupo!=="Todos"&&p.grupo!==filtroGrupo) return false;
                  if (resultados[p.id]) return false;
                  if (soloSinPick) {
                    if (predicciones[p.id] || esBloqueado(p.fecha,p.hora)) return false;
                    if (p.fase !== "Grupos") {
                      const bk = bracketData[p.id];
                      if (!bk || !bk.local || !bk.visitante) return false;
                    }
                  }
                  return true;
                })
                .sort((a,b)=>new Date(`${a.fecha}T${a.hora}:00`).getTime()-new Date(`${b.fecha}T${b.hora}:00`).getTime());
              const fechasUnicas = Array.from(new Set(filtrados.map(p=>p.fecha)));
              const proximaFechaDestacada = proximaFecha;
              return fechasUnicas.map((fecha,idx)=>{
                const ps = filtrados.filter(p=>p.fecha===fecha);
                const esProxima = fecha===proximaFechaDestacada && partidosHoy.length>0;
                if (esProxima) {
                  return (
                    <div key={fecha} style={{marginBottom:16}}>
                      <div style={{fontSize:10,fontWeight:600,color:"#494d4f",background:"#f5f5f5",padding:"4px 10px",borderRadius:6,display:"inline-block",marginBottom:7}}>{fmtFechaLarga(fecha)}</div>
                      {ps.map(p=>(
                        <PartidoCard key={p.id} partido={p} pred={predicciones[p.id]} res={resultados[p.id]} config={config} guardado={guardados[p.id]} onGuardar={guardarPick} bloqueado={esBloqueado(p.fecha,p.hora)} oddData={getOddData(p,odds)} aplicarSiempre={getAplicar(p.id)} onToggleAplicar={()=>toggleAplicarSiempre(p.id)} localNombre={bracketData[p.id]?.local} visitanteNombre={bracketData[p.id]?.visitante}/>
                      ))}
                    </div>
                  );
                }
                return (
                  <div key={fecha} style={{marginBottom:16}}>
                    <div style={{fontSize:10,fontWeight:600,color:"#494d4f",background:"#f5f5f5",padding:"4px 10px",borderRadius:6,display:"inline-block",marginBottom:7}}>{fmtFechaLarga(fecha)}</div>
                    {ps.map(p=>(
                      <PartidoCard key={p.id} partido={p} pred={predicciones[p.id]} res={resultados[p.id]} config={config} guardado={guardados[p.id]} onGuardar={guardarPick} bloqueado={esBloqueado(p.fecha,p.hora)} oddData={getOddData(p, odds)} liveInfo={liveData[p.id]} aplicarSiempre={getAplicar(p.id)} onToggleAplicar={()=>toggleAplicarSiempre(p.id)} localNombre={bracketData[p.id]?.local} visitanteNombre={bracketData[p.id]?.visitante}/>
                    ))}
                  </div>
                );
              });
            })()}

          </>}

          {/* ── GRUPOS ── */}
          {tab==="grupos"&&<>

            {/* ── GOLEADORES ARRIBA ── */}
            {goleadores.length > 0 && (
              <div style={{marginBottom:14,background:"#fff",border:"1px solid #dde4ec",borderRadius:14,overflow:"hidden",boxShadow:"0 2px 8px rgba(18,57,82,.05)"}}>
                {/* Top 3 siempre visibles */}
                <div style={{padding:"10px 14px 6px",borderBottom:"1px solid #f0f0f0"}}>
                  <div style={{fontSize:10,fontWeight:800,letterSpacing:1.5,textTransform:"uppercase",color:"#123952",marginBottom:8}}>⚽ Goleadores del torneo</div>
                  {goleadores.slice(0,3).map((s,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 0",borderBottom:i<2?"1px solid #f5f5f5":"none"}}>
                      <div style={{width:22,textAlign:"center",fontFamily:"'Bebas Neue',sans-serif",fontSize:18,color:i===0?"#e8a020":i===1?"#9ca3af":"#c97c2e",flexShrink:0}}>{i+1}</div>
                      {s.foto&&<img src={s.foto} alt={s.nombre} style={{width:26,height:26,borderRadius:"50%",objectFit:"cover",flexShrink:0}} onError={(e:any)=>e.target.style.display="none"}/>}
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:12,fontWeight:700,color:"#1a1f24",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s.nombre}</div>
                        <div style={{fontSize:10,color:"#6b7280"}}>{s.equipo}</div>
                      </div>
                      <div style={{display:"flex",gap:12,flexShrink:0}}>
                        <div style={{textAlign:"center"}}>
                          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,color:"#123952",lineHeight:1}}>{s.goles}</div>
                          <div style={{fontSize:7,color:"#6b7280",fontWeight:700,letterSpacing:.5}}>GOLES</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Resto en acordeón */}
                {goleadores.length > 3 && (
                  <div onClick={()=>setFinalizadosAbierto(v=>!v)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 14px",cursor:"pointer",userSelect:"none"}}>
                    <span style={{fontSize:11,color:"#6b7280",fontWeight:600}}>Ver todos ({goleadores.length})</span>
                    <span style={{fontSize:14,color:"#6b7280",transform:finalizadosAbierto?"rotate(180deg)":"rotate(0deg)",transition:"transform .2s",display:"inline-block"}}>▾</span>
                  </div>
                )}
                {finalizadosAbierto&&goleadores.slice(3).map((s,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 14px",borderTop:"1px solid #f5f5f5"}}>
                    <div style={{width:22,textAlign:"center",fontFamily:"'Bebas Neue',sans-serif",fontSize:14,color:"#6b7280",flexShrink:0}}>{i+4}</div>
                    {s.foto&&<img src={s.foto} alt={s.nombre} style={{width:24,height:24,borderRadius:"50%",objectFit:"cover",flexShrink:0}} onError={(e:any)=>e.target.style.display="none"}/>}
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:11,fontWeight:700,color:"#1a1f24",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s.nombre}</div>
                      <div style={{fontSize:10,color:"#6b7280"}}>{s.equipo}</div>
                    </div>
                    <div style={{display:"flex",gap:12,flexShrink:0}}>
                      <div style={{textAlign:"center"}}>
                        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,color:"#123952",lineHeight:1}}>{s.goles}</div>
                        <div style={{fontSize:7,color:"#6b7280",fontWeight:700,letterSpacing:.5}}>GOLES</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

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

            {/* Acordeón puntos y reglas */}
            <div style={{background:"#fff",border:"1px solid #dde4ec",borderRadius:14,marginBottom:14,overflow:"hidden",boxShadow:"0 2px 8px rgba(18,57,82,.05)"}}>
              <div onClick={()=>setInfoAbierta(v=>!v)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 14px",cursor:"pointer",userSelect:"none"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:16}}>📋</span>
                  <div>
                    <div style={{fontSize:12,fontWeight:700,color:"#123952"}}>Puntos y reglas</div>
                    <div style={{fontSize:10,color:"#6b7280"}}>Sistema de puntuación y condiciones</div>
                  </div>
                </div>
                <span style={{fontSize:16,color:"#6b7280",display:"inline-block",transform:infoAbierta?"rotate(180deg)":"rotate(0deg)",transition:"transform .2s"}}>▾</span>
              </div>
              {infoAbierta&&(
                <div style={{borderTop:"1px solid #f0f0f0",padding:"12px 14px"}}>
                  <div style={{fontSize:10,fontWeight:800,letterSpacing:1.5,textTransform:"uppercase",color:"#123952",marginBottom:8}}>Sistema de puntos</div>
                  <div className="pts-row"><div><div className="pts-lbl">🎯 Resultado exacto</div><div style={{fontSize:11,color:"#6b7280"}}>Acertás los goles exactos de ambos equipos</div></div><div className="pts-val">{config.resultado_exacto} pts</div></div>
                  <div className="pts-row"><div><div className="pts-lbl">🎯 Ganador + diferencia</div><div style={{fontSize:11,color:"#6b7280"}}>Acertás el ganador y la diferencia de goles</div></div><div className="pts-val">{config.ganador_diferencia} pts</div></div>
                  <div className="pts-row"><div><div className="pts-lbl">👍 Ganador correcto</div><div style={{fontSize:11,color:"#6b7280"}}>Acertás el ganador o que hay empate</div></div><div className="pts-val">{config.ganador_correcto} pts</div></div>
                  <div className="pts-row"><div><div className="pts-lbl">❌ Sin puntos</div><div style={{fontSize:11,color:"#6b7280"}}>No acertás ni el ganador ni el empate</div></div><div className="pts-val" style={{color:"#dc2626"}}>0 pts</div></div>
                  <div style={{fontSize:10,fontWeight:800,letterSpacing:1.5,textTransform:"uppercase",color:"#123952",margin:"12px 0 8px"}}>Reglas</div>
                  <p style={{fontSize:12,color:"#6b7280",lineHeight:1.7}}>
                    🔒 Pronósticos se bloquean <strong style={{color:"#123952"}}>10 min antes</strong> del partido.<br/>
                    ⏱️ Solo se cuentan los <strong style={{color:"#123952"}}>90 min reglamentarios</strong>.<br/>
                    🔄 Resultados en tiempo real desde football-data.org.<br/>
                    🕐 Horarios en <strong style={{color:"#123952"}}>hora Uruguay (UTC-3)</strong>.
                  </p>
                </div>
              )}
            </div>

            {tabla.length===0&&<div className="empty"><em>👥</em>Aún no hay participantes</div>}

            {tabla.length>0&&<div style={{fontSize:11,color:"#6b7280",textAlign:"center",padding:"6px 0 10px",fontStyle:"italic"}}>
              👆 Tocá un nombre para ver sus pronósticos cerrados
            </div>}

            {tabla.map((u,i)=>(
              <div key={u.username} className={`tr ${i<3?"top":""} ${u.username===user?.username?"me":""}`} onClick={()=>cargarPerfil(u.username,u.nombre)} style={{cursor:"pointer"}}>
                <div className="t-pos">{i+1}</div>
                <div className="t-user">
                  <div className="t-name">{u.nombre}{u.username===user?.username?" 👤":""}</div>
                  <div className="t-stats">✅ {u.exactos} exactos · 👍 {u.ganadores} ganados · ⚽ {u.jugados} jugados{u.sinPronos?` · ❌ ${u.sinPronos} sin pronóstico`:""}</div>
                </div>
                <div className="t-pts">
                  {u.pts}
                  {u.ptsParciales && u.ptsParciales > 0 ? <span style={{fontSize:10,color:"#e8a020",fontWeight:700,marginLeft:3}}>+{u.ptsParciales}*</span> : null}
                </div>
                <div className="t-medal">{["🥇","🥈","🥉"][i]??""}</div>
              </div>
            ))}

          </>}



          {/* ── MIS GRUPOS ── */}
          {tab==="misgrupos"&&<>
            <div className="action-row" style={{marginTop:4}}>
              <button className="btn-primary" onClick={()=>{setModalCrear(true);setGrupoErr("");}}>➕ Crear grupo</button>
              <button className="btn-secondary" onClick={()=>{setModalUnirse(true);setGrupoErr("");}}>🔑 Unirme</button>
            </div>

            {cargandoGrupos&&<div style={{textAlign:"center",padding:40,color:"#6b7280"}}>Cargando...</div>}

            {!cargandoGrupos&&(()=>{
              const globalG = gruposUser.find((g:any)=>g.id==="fascioli");
              const otrosG = gruposUser.filter((g:any)=>g.id!=="fascioli");
              return <>
                {globalG&&(
                  <div style={{marginBottom:12}}>
                    <div style={{fontSize:9,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:"#e8a020",marginBottom:6}}>⭐ Grupo oficial</div>
                    <div className="group-card" onClick={()=>{setGrupoActivo(globalG.id);setNombreGrupo(globalG.nombre);window.history.replaceState(null,"",`/penca?grupo=${globalG.id}`);setTab("proximos");}} style={{border:grupoActivo===globalG.id?"2px solid #e8a020":"2px solid #123952"}}>
                      <div className="group-card-bar" style={{background:"#123952",width:5}}/>
                      <div style={{paddingLeft:8}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <div className="group-name">{globalG.nombre}</div>
                            <span className="global-badge">GLOBAL</span>
                          </div>
                          <div className="group-meta">👥 {globalG.miembros} participantes</div>
                        </div>
                        <div className="group-footer">
                          <div>
                            <div style={{fontSize:12,fontWeight:600,color:"#1a1f24"}}>Tu posición</div>
                            <div style={{fontSize:11,color:"#6b7280",marginTop:2}}>✅ {globalG.miExactos} exactos · 👍 {globalG.miGanadores} ganadores</div>
                          </div>
                          <div style={{display:"flex",alignItems:"center",gap:10}}>
                            <div className="group-pts">{globalG.miPts} pts</div>
                            {globalG.miPos>0&&<div className="group-pos">#{globalG.miPos}</div>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {otrosG.length>0&&<div className="sec-title">Mis grupos privados ({otrosG.length})</div>}
                {otrosG.map((g:any,idx:number)=>(
                  <div key={g.id} className="group-card" onClick={()=>{setGrupoActivo(g.id);setNombreGrupo(g.nombre);window.history.replaceState(null,"",`/penca?grupo=${g.id}`);setTab("proximos");}} style={{border:grupoActivo===g.id?"2px solid #e8a020":"1px solid #dde4ec"}}>
                    <div className="group-card-bar" style={{background:coloresGrupo[idx%coloresGrupo.length]}}/>
                    <div style={{paddingLeft:8}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                        <div>
                          <div className="group-name">{g.nombre}</div>
                          <div className="group-meta">👥 {g.miembros} participantes</div>
                        </div>
                        {g.codigo!=="GLOBAL"&&(
                          <div style={{display:"flex",gap:6,alignItems:"center"}}>
                            <div className="group-code">{g.codigo}</div>
                            <button onClick={e=>{e.stopPropagation();compartirGrupoFn(g.nombre,g.codigo);}} style={{background:"#25D366",border:"none",borderRadius:8,padding:"4px 8px",color:"#fff",fontSize:12,cursor:"pointer",fontWeight:700}}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                            </button>
                            {g.ownerUsername===user?.username
                              ?<button onClick={e=>{e.stopPropagation();borrarGrupoFn(g.id,g.nombre);}} style={{background:"transparent",border:"1.5px solid #dc2626",borderRadius:8,padding:"4px 8px",color:"#dc2626",fontSize:12,cursor:"pointer",fontWeight:700}}>🗑</button>
                              :<button onClick={e=>{e.stopPropagation();salirGrupoFn(g.id,g.nombre);}} style={{background:"transparent",border:"1.5px solid #6b7280",borderRadius:8,padding:"4px 8px",color:"#6b7280",fontSize:12,cursor:"pointer",fontWeight:700}}>Salir</button>
                            }
                          </div>
                        )}
                      </div>
                      <div className="group-footer">
                        <div>
                          <div style={{fontSize:12,fontWeight:600,color:"#1a1f24"}}>Tu posición</div>
                          <div style={{fontSize:11,color:"#6b7280",marginTop:2}}>✅ {g.miExactos} exactos · 👍 {g.miGanadores} ganadores</div>
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          <div className="group-pts">{g.miPts} pts</div>
                          {g.miPos>0&&<div className="group-pos">#{g.miPos}</div>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {gruposUser.length===0&&(
                  <div style={{textAlign:"center",padding:40,color:"#6b7280"}}>
                    <div style={{fontSize:32,marginBottom:12}}>🏘️</div>
                    <div style={{fontWeight:700,marginBottom:4}}>No estás en ningún grupo</div>
                    <div style={{fontSize:13}}>Creá uno o unite con un código</div>
                  </div>
                )}
              </>;
            })()}

            {modalCrear&&(
              <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>setModalCrear(false)}>
                <div style={{background:"#fff",borderRadius:"20px 20px 0 0",width:"100%",maxWidth:430,padding:"24px 20px 40px"}} onClick={e=>e.stopPropagation()}>
                  <div style={{width:40,height:4,background:"#dde4ec",borderRadius:4,margin:"0 auto 20px"}}/>
                  <div style={{fontSize:18,fontWeight:700,marginBottom:16}}>Crear grupo</div>
                  <label style={{fontSize:11,fontWeight:700,color:"#6b7280",letterSpacing:1,textTransform:"uppercase",display:"block",marginBottom:6}}>Nombre del grupo</label>
                  <input value={nombreNuevo} onChange={e=>setNombreNuevo(e.target.value)} placeholder="Ej: Amigos de Nico" style={{width:"100%",padding:"12px 14px",borderRadius:10,border:"1.5px solid #dde4ec",fontSize:15,outline:"none",marginBottom:6,fontFamily:"inherit"}}/>
                  {grupoErr&&<div style={{fontSize:12,color:"#dc2626",fontWeight:600,marginBottom:10}}>⚠️ {grupoErr}</div>}
                  <button onClick={crearGrupo} disabled={grupoLoading} style={{width:"100%",marginTop:10,padding:14,border:"none",borderRadius:12,background:"#123952",color:"#fff",fontWeight:700,fontSize:15,cursor:"pointer"}}>{grupoLoading?"Creando...":"Crear grupo →"}</button>
                </div>
              </div>
            )}

            {modalUnirse&&(
              <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>setModalUnirse(false)}>
                <div style={{background:"#fff",borderRadius:"20px 20px 0 0",width:"100%",maxWidth:430,padding:"24px 20px 40px"}} onClick={e=>e.stopPropagation()}>
                  <div style={{width:40,height:4,background:"#dde4ec",borderRadius:4,margin:"0 auto 20px"}}/>
                  <div style={{fontSize:18,fontWeight:700,marginBottom:16}}>Unirme a un grupo</div>
                  <label style={{fontSize:11,fontWeight:700,color:"#6b7280",letterSpacing:1,textTransform:"uppercase",display:"block",marginBottom:6}}>Código del grupo</label>
                  <input value={codigoUnirse} onChange={e=>setCodigoUnirse(e.target.value.toUpperCase())} placeholder="Ej: PEPE2" style={{width:"100%",padding:"12px 14px",borderRadius:10,border:"1.5px solid #dde4ec",fontSize:15,outline:"none",marginBottom:6,fontFamily:"monospace"}}/>
                  {grupoErr&&<div style={{fontSize:12,color:"#dc2626",fontWeight:600,marginBottom:10}}>⚠️ {grupoErr}</div>}
                  <button onClick={unirseGrupoFn} disabled={grupoLoading} style={{width:"100%",marginTop:10,padding:14,border:"none",borderRadius:12,background:"#123952",color:"#fff",fontWeight:700,fontSize:15,cursor:"pointer"}}>{grupoLoading?"Uniéndome...":"Unirme →"}</button>
                </div>
              </div>
            )}
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
        
      {pickPendiente && (
        <div
          style={{
            position:"fixed",
            inset:0,
            background:"rgba(0,0,0,.55)",
            zIndex:500,
            display:"flex",
            alignItems:"flex-end",
            justifyContent:"center"
          }}
          onClick={()=>setPickPendiente(null)}
        >
          <div
            onClick={(e)=>e.stopPropagation()}
            style={{
              width:"100%",
              maxWidth:430,
              background:"#fff",
              borderRadius:"24px 24px 0 0",
              padding:"24px 20px 38px",
              boxShadow:"0 -12px 35px rgba(0,0,0,.25)"
            }}
          >

            <div
              style={{
                width:44,
                height:4,
                borderRadius:999,
                background:"#dde4ec",
                margin:"0 auto 18px"
              }}
            />

            <div
              style={{
                fontSize:21,
                fontWeight:800,
                color:"#123952",
                marginBottom:10
              }}
            >
              Modificar pronóstico
            </div>

            <div
              style={{
                fontSize:14,
                lineHeight:1.55,
                color:"#6b7280",
                marginBottom:18
              }}
            >
              Ya tenías un pronóstico cargado para este partido.
            </div>

            <label
              style={{
                display:"flex",
                gap:12,
                alignItems:"flex-start",
                padding:14,
                borderRadius:16,
                border:"1px solid #dde4ec",
                background:"#f4f8fb",
                cursor:"pointer"
              }}
            >
              <input
                type="checkbox"
                checked={aplicarTodosGrupos}
                onChange={(e)=>setAplicarTodosGrupos(e.target.checked)}
                style={{marginTop:2}}
              />

              <div>
                <div
                  style={{
                    fontSize:14,
                    fontWeight:800,
                    color:"#123952"
                  }}
                >
                  Aplicar este cambio a todos mis grupos
                </div>

                <div
                  style={{
                    fontSize:12,
                    marginTop:4,
                    color:"#6b7280",
                    lineHeight:1.45
                  }}
                >
                  Si no lo marcás, se actualizará únicamente en este grupo.
                </div>
              </div>
            </label>

            <div style={{display:"flex",gap:10,marginTop:20}}>

              <button
                onClick={()=>setPickPendiente(null)}
                style={{
                  flex:1,
                  padding:14,
                  borderRadius:13,
                  border:"1px solid #dde4ec",
                  background:"#fff",
                  fontWeight:700,
                  color:"#6b7280"
                }}
              >
                Cancelar
              </button>

              <button
                onClick={async()=>{
                  const pick = pickPendiente;
                  setPickPendiente(null);

                  if (pick) {
                    await enviarPick(
                      pick.partidoId,
                      pick.local,
                      pick.visitante,
                      aplicarTodosGrupos
                    );
                  }
                }}
                style={{
                  flex:1,
                  padding:14,
                  borderRadius:13,
                  border:"none",
                  background:"linear-gradient(135deg,#123952,#1d5278)",
                  color:"#fff",
                  fontWeight:800,
                  boxShadow:"0 6px 16px rgba(18,57,82,.22)"
                }}
              >
                Guardar
              </button>

            </div>

          </div>
        </div>
      )}


        {/* ── MODAL ALINEACIONES ── */}
        {lineupModal&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center",padding:"0 0 0px"}} onClick={()=>setLineupModal(null)}>
            <div style={{background:"#fff",borderRadius:"20px 20px 0 0",width:"100%",maxWidth:430,padding:"20px 16px 36px",boxShadow:"0 -8px 40px rgba(0,0,0,.2)",maxHeight:"80vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
              <div style={{width:36,height:4,background:"#dde4ec",borderRadius:4,margin:"0 auto 16px"}}/>
              <div style={{fontSize:14,fontWeight:800,color:"#123952",textAlign:"center",marginBottom:16}}>📋 Alineaciones</div>
              <div style={{display:"flex",gap:8}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:11,fontWeight:800,color:"#123952",marginBottom:8,textAlign:"center"}}>{lineupModal.equipoLocal}</div>
                  {lineupModal.local.map((j:any,i:number)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 0",borderBottom:"1px solid #f5f5f5"}}>
                      <div style={{width:20,height:20,borderRadius:"50%",background:"#123952",color:"#fff",fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{j.numero}</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:10,fontWeight:600,color:"#1a1f24"}}>{j.nombre}</div>
                        <div style={{fontSize:8,color:"#6b7280"}}>{j.posicion}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{width:1,background:"#f0f0f0",flexShrink:0}}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:11,fontWeight:800,color:"#123952",marginBottom:8,textAlign:"center"}}>{lineupModal.equipoVisitante}</div>
                  {lineupModal.visitante.map((j:any,i:number)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 0",borderBottom:"1px solid #f5f5f5",flexDirection:"row-reverse"}}>
                      <div style={{width:20,height:20,borderRadius:"50%",background:"#e8a020",color:"#fff",fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{j.numero}</div>
                      <div style={{flex:1,textAlign:"right"}}>
                        <div style={{fontSize:10,fontWeight:600,color:"#1a1f24"}}>{j.nombre}</div>
                        <div style={{fontSize:8,color:"#6b7280"}}>{j.posicion}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {showNotifModal&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center",padding:"0 0 20px"}}>
            <div style={{background:"#fff",borderRadius:"20px 20px 20px 20px",width:"100%",maxWidth:430,padding:"24px 20px 28px",boxShadow:"0 -8px 40px rgba(0,0,0,.2)"}}>
              <div style={{width:40,height:4,background:"#dde4ec",borderRadius:4,margin:"0 auto 20px"}}/>
              <div style={{textAlign:"center",marginBottom:20}}>
                <div style={{fontSize:48,marginBottom:12}}>🔔</div>
                <div style={{fontSize:18,fontWeight:800,color:"#123952",marginBottom:8}}>Activá las notificaciones</div>
                <div style={{fontSize:13,color:"#6b7280",lineHeight:1.6}}>
                  Así te avisamos cuando hay un resultado nuevo y cuando está por arrancar un partido. ¡No te perdás nada del Mundial!
                </div>
              </div>
              <button
                onClick={async ()=>{ setShowNotifModal(false); await toggleNotif(); }}
                style={{width:"100%",padding:14,border:"none",borderRadius:12,background:"linear-gradient(135deg,#123952,#1d5278)",color:"#fff",fontWeight:700,fontSize:15,cursor:"pointer",marginBottom:10,boxShadow:"0 4px 16px rgba(18,57,82,.3)"}}
              >
                🔔 Activar notificaciones
              </button>
              <button
                onClick={()=>{ setShowNotifModal(false); localStorage.setItem("notif_modal_cerrado","1"); }}
                style={{width:"100%",padding:11,border:"none",background:"transparent",color:"#6b7280",fontSize:13,cursor:"pointer"}}
              >
                Ahora no
              </button>
            </div>
          </div>
        )}

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
              <label style={{display:"flex",alignItems:"center",gap:8,marginTop:16,fontSize:13,color:"#6b7280",cursor:"pointer"}}>
                <input
                  type="checkbox"
                  checked={noMostrarInstall}
                  onChange={e=>setNoMostrarInstall(e.target.checked)}
                />
                No volver a mostrar este aviso
              </label>
              <button
                onClick={()=>{
                  if (noMostrarInstall) localStorage.setItem("install_modal_ocultar","1");
                  setShowInstallModal(false);
                }}
                style={{width:"100%",marginTop:16,padding:14,border:"none",borderRadius:12,background:"#123952",color:"#fff",fontWeight:700,fontSize:15,cursor:"pointer"}}
              >
                Entendido
              </button>
            </div>
          </div>
        )}
        <button onClick={toggleNotif} style={{position:"fixed",bottom:24,right:16,background:notifActiva?"#2e9e6b":"#123952",color:"#fff",border:"none",borderRadius:50,width:48,height:48,fontSize:20,cursor:"pointer",boxShadow:"0 4px 16px rgba(0,0,0,.25)",zIndex:100}}>{notifActiva?"🔔":"🔕"}</button>
        {perfilUsuario&&<PerfilModal perfil={perfilUsuario} resultados={resultados} liveData={liveData} config={config} bracketData={bracketData} onClose={()=>setPerfilUsuario(null)}/>}
      </div>
    </>
  );
}

/* ── HoyCard ── */
function HoyCard({ partido, estado, pred, res, bloqueado, puntos, config, guardado, ciudad, onGuardar, oddData, liveInfo, aplicarSiempre, onToggleAplicar, onVerLineup, loadingLineup, localNombre, visitanteNombre }: {
  partido: Partido; estado: "proximo"|"jugando"|"entretiempo"|"finalizado";
  pred?: Resultado; res?: Resultado; bloqueado: boolean;
  puntos: number|null; config: PuntosConfig;
  guardado?: boolean; ciudad?: string; localNombre?: string|null; visitanteNombre?: string|null; onGuardar: (l: number, v: number) => void;
  oddData?: {home:number;draw:number;away:number};
  liveInfo?: {estado:string;minuto:number|null;local:number;visitante:number;goles?:{minuto:string;jugador:string;esPropio:boolean;esPenal?:boolean;esAmarilla?:boolean;equipo:string}[]};
  aplicarSiempre?: boolean;
  onToggleAplicar?: () => void;
  onVerLineup?: () => void;
  loadingLineup?: boolean;
}) {
  const [lv, setLv] = useState<string|number>(pred?.local??"");
  const [vv, setVv] = useState<string|number>(pred?.visitante??"");
  const [segundos, setSegundos] = useState(0);
  const autoSaveRef = useRef<ReturnType<typeof setTimeout>|null>(null);

  useEffect(()=>{ setLv(pred?.local??""); setVv(pred?.visitante??""); },[pred]);

  useEffect(()=>{
    if (!liveInfo || liveInfo.estado==="entretiempo" || liveInfo.estado==="finalizado") return;
    const interval = setInterval(()=>setSegundos(s=>(s+1)%60), 1000);
    return ()=>clearInterval(interval);
  },[liveInfo]);

  const handleChange = (tipo: "l"|"v", val: string) => {
    if (tipo==="l") setLv(val); else setVv(val);
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(()=>{
      const l = tipo==="l" ? Number(val) : Number(lv);
      const v = tipo==="v" ? Number(val) : Number(vv);
      if (!isNaN(l) && !isNaN(v) && val!=="") onGuardar(l, v);
    }, 1000);
  };

  const estadoLabel = estado==="proximo" ? "Próximo" : estado==="jugando" ? "EN VIVO" : estado==="entretiempo" ? "ENTRETIEMPO" : "Finalizado";
  const ptsClass = puntos===null?"":puntos===config.resultado_exacto?"pts-ex":puntos>0?"pts-ok":"pts-no";

  return (
    <div className={`hoy-partido ${estado}`}>
      <div className="hoy-estado">
        {estado==="jugando"
          ? (() => {
              const min = getMinutoPartido(partido.fecha, partido.hora);
              const minReal = liveInfo?.minuto;
              return <span className="live-badge"><span className="live-dot"/> EN VIVO {minReal ? `· ${minReal}'` : ""}</span>;
            })()
          : estado==="entretiempo"
            ? <span className="estado-badge estado-entretiempo">⏸ Entretiempo</span>
            : <span className={`estado-badge estado-${estado}`}>{estadoLabel}</span>
        }
        <span className="hoy-hora">{partido.hora} hs</span>
        {ciudad&&<span style={{fontSize:10,color:"#6b7280",fontWeight:500}}>📍{ciudad}</span>}
      </div>
      <div className="hoy-equipos">
        <div className="hoy-eq">
          <span className="hoy-flag">{getFlag(localNombre??partido.local)}</span>
          <span className="hoy-name">{localNombre??partido.local}</span>
        </div>
        {res
          ? <div className="hoy-res"><div className="hoy-score">{res.local} - {res.visitante}</div><div className="hoy-res-lbl">Final</div></div>
          : liveInfo && (liveInfo.estado==="jugando" || liveInfo.estado==="entretiempo")
            ? <div className="hoy-res"><div className="hoy-score" style={{color:"#dc2626"}}>{liveInfo.local} - {liveInfo.visitante}</div><div className="hoy-res-lbl" style={{color:"#dc2626"}}>En vivo</div></div>
            : <span className="hoy-vs">VS</span>
        }
        <div className="hoy-eq">
          <span className="hoy-flag">{getFlag(visitanteNombre??partido.visitante)}</span>
          <span className="hoy-name">{visitanteNombre??partido.visitante}</span>
        </div>
      </div>
      {oddData&&!bloqueado&&(
        <div style={{margin:"8px 0 10px"}}>
          <div style={{display:"flex",borderRadius:6,overflow:"hidden",height:8}}>
            <div style={{width:`${oddData.home}%`,background:"#123952"}}/>
            <div style={{width:`${oddData.draw}%`,background:"#e8a020"}}/>
            <div style={{width:`${oddData.away}%`,background:"#2e9e6b"}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:4,fontSize:10,fontWeight:700}}>
            <span style={{color:"#123952"}}>{oddData.home}%</span>
            <span style={{color:"#e8a020"}}>Empate {oddData.draw}%</span>
            <span style={{color:"#2e9e6b"}}>{oddData.away}%</span>
          </div>
        </div>
      )}
      {estado==="jugando"&&(()=>{
        return (
          <div style={{fontSize:11,fontWeight:700,color:"#dc2626",textAlign:"center",margin:"6px 0 4px",letterSpacing:.3}}>
            ⚡ {liveInfo?.minuto ? `${liveInfo.minuto}' · ${liveInfo.minuto <= 45 ? "Primer tiempo" : "Segundo tiempo"}` : "Partido en vivo"}
          </div>
        );
      })()}
      {liveInfo?.goles && liveInfo.goles.length > 0 && (
        <div style={{display:"flex",justifyContent:"space-between",margin:"4px 0 8px",gap:8}}>
          <div style={{flex:1,fontSize:10,color:"#494d4f",lineHeight:1.9}}>
            {liveInfo.goles.filter(g=>g.equipo==="h").map((g,i)=>(
              <div key={i}>
                {g.esAmarilla?"🟨":"⚽"} {g.minuto}' <span style={{fontWeight:700}}>{g.jugador}</span>{g.esPropio?" (AG)":g.esPenal?" (P)":""}
              </div>
            ))}
          </div>
          <div style={{flex:1,fontSize:10,color:"#494d4f",lineHeight:1.9,textAlign:"right"}}>
            {liveInfo.goles.filter(g=>g.equipo==="a").map((g,i)=>(
              <div key={i}>
                <span style={{fontWeight:700}}>{g.jugador}</span>{g.esPropio?" (AG)":g.esPenal?" (P)":""} {g.minuto}' {g.esAmarilla?"🟨":"⚽"}
              </div>
            ))}
          </div>
        </div>
      )}
      {estado==="entretiempo"&&(
        <div style={{fontSize:11,fontWeight:700,color:"#e8a020",textAlign:"center",margin:"6px 0 8px",letterSpacing:.3}}>
          ⏸ Entretiempo · vuelve en minutos
        </div>
      )}
      {!bloqueado&&<div style={{padding:"6px 0"}}><CountdownBloqueo fecha={partido.fecha} hora={partido.hora}/></div>}
      {!bloqueado&&onToggleAplicar&&(
        <div onClick={onToggleAplicar} style={{display:"flex",alignItems:"center",gap:8,padding:"4px 2px 8px",cursor:"pointer",userSelect:"none"}}>
          <div style={{width:30,height:17,borderRadius:9,background:aplicarSiempre?"#123952":"#dde4ec",transition:"background .2s",position:"relative",flexShrink:0}}>
            <div style={{position:"absolute",top:2,left:aplicarSiempre?15:2,width:13,height:13,borderRadius:"50%",background:"#fff",transition:"left .2s",boxShadow:"0 1px 3px rgba(0,0,0,.2)"}}/>
          </div>
          <span style={{fontSize:10,color:aplicarSiempre?"#123952":"#9ca3af",fontWeight:600}}>
            {aplicarSiempre?"Aplicar a todos mis grupos":"Solo este grupo"}
          </span>
        </div>
      )}
      {bloqueado && !res && onVerLineup && liveInfo && (
        <div onClick={onVerLineup} style={{fontSize:10,color:"#6b7280",textAlign:"center",padding:"6px 0",cursor:"pointer",textDecoration:"underline"}}>
          {loadingLineup ? "Cargando..." : "📋 Ver alineaciones"}
        </div>
      )}
      <div className="hoy-pick">
        <span className="hoy-pick-lbl">Tu pronóstico:</span>
        {puntos !== null && (
          <span className={`hoy-pick-pts ${ptsClass}`}>{puntos>0?`+${puntos}`:0} pts</span>
        )}
        {puntos === null && pred && liveInfo && (estado==="jugando"||estado==="entretiempo") && (()=>{
          const ptsParcial = calcularPuntos(pred, {local:liveInfo.local, visitante:liveInfo.visitante}, config);
          const cls = ptsParcial===config.resultado_exacto?"pts-ex":ptsParcial>0?"pts-ok":"pts-no";
          return <span className={`hoy-pick-pts ${cls}`} style={{opacity:.8}}>{ptsParcial>0?`+${ptsParcial}`:0} pts*</span>;
        })()}
        {bloqueado ? (
          pred
            ? <span className="hoy-pick-val">{pred.local} - {pred.visitante}</span>
            : <span className="hoy-pick-none">Sin pronóstico</span>
        ) : (
          <div className="hoy-inputs">
            <input className="hoy-si" type="number" min={0} max={20} placeholder="0" value={lv} onChange={e=>handleChange("l",e.target.value)}/>
            <span style={{color:"#6b7280",fontSize:14}}>-</span>
            <input className="hoy-si" type="number" min={0} max={20} placeholder="0" value={vv} onChange={e=>handleChange("v",e.target.value)}/>
            {guardado&&<span style={{fontSize:18,color:"#2e9e6b",marginLeft:2}}>✓</span>}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── PartidoCard ── */
function PartidoCard({ partido, pred, res, config, guardado, onGuardar, bloqueado, oddData, liveInfo, aplicarSiempre, onToggleAplicar, localNombre, visitanteNombre }: {
  partido: Partido; pred?: Resultado; res?: Resultado;
  config: PuntosConfig; guardado?: boolean; bloqueado: boolean;
  onGuardar: (id: string, l: number, v: number) => void;
  oddData?: {home:number;draw:number;away:number};
  liveInfo?: {estado:string;minuto:number|null;local:number;visitante:number;goles?:{minuto:string;jugador:string;esPropio:boolean;esPenal?:boolean;esAmarilla?:boolean;equipo:string}[]};
  aplicarSiempre?: boolean;
  onToggleAplicar?: () => void;
  localNombre?: string|null;
  visitanteNombre?: string|null;
}) {
  const [lv,setLv]=useState<string|number>(pred?.local??"");
  const [vv,setVv]=useState<string|number>(pred?.visitante??"");
  const autoSaveRef = useRef<ReturnType<typeof setTimeout>|null>(null);
  useEffect(()=>{setLv(pred?.local??"");setVv(pred?.visitante??"");},[pred]);
  const puntos=res&&pred?calcularPuntos(pred,res,config):null;
  const chipCls=puntos===null?"":puntos===config.resultado_exacto?"chip-ex":puntos>0?"chip-ok":"chip-no";

  const handleChangePc = (tipo: "l"|"v", val: string) => {
    if (tipo==="l") setLv(val); else setVv(val);
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(()=>{
      const l = tipo==="l" ? Number(val) : Number(lv);
      const v = tipo==="v" ? Number(val) : Number(vv);
      if (!isNaN(l) && !isNaN(v) && val!=="") onGuardar(partido.id, l, v);
    }, 1000);
  };
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
        <div className="eq"><span className="eq-flag">{getFlag(localNombre??partido.local)}</span><span className="eq-name">{localNombre??partido.local}</span></div>
        {res
          ?<div className="res-box"><div className="res-score">{res.local} - {res.visitante}</div><div className="res-lbl">Final</div></div>
          :<span className="vs">VS</span>
        }
        <div className="eq"><span className="eq-flag">{getFlag(visitanteNombre??partido.visitante)}</span><span className="eq-name">{visitanteNombre??partido.visitante}</span></div>
      </div>
      {!estaBlq&&onToggleAplicar&&(
        <div onClick={onToggleAplicar} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 2px",cursor:"pointer",userSelect:"none"}}>
          <div style={{width:30,height:17,borderRadius:9,background:aplicarSiempre?"#123952":"#dde4ec",transition:"background .2s",position:"relative",flexShrink:0}}>
            <div style={{position:"absolute",top:2,left:aplicarSiempre?15:2,width:13,height:13,borderRadius:"50%",background:"#fff",transition:"left .2s",boxShadow:"0 1px 3px rgba(0,0,0,.2)"}}/>
          </div>
          <span style={{fontSize:10,color:aplicarSiempre?"#123952":"#9ca3af",fontWeight:600}}>
            {aplicarSiempre?"Aplicar a todos mis grupos":"Solo este grupo"}
          </span>
        </div>
      )}
      <div className="pick-row">
        <input className="si" type="number" min={0} max={20} placeholder="0" value={lv} onChange={e=>handleChangePc("l",e.target.value)} disabled={estaBlq}/>
        <span className="score-sep">—</span>
        <input className="si" type="number" min={0} max={20} placeholder="0" value={vv} onChange={e=>handleChangePc("v",e.target.value)} disabled={estaBlq}/>
        {estaBlq
          ?<div className="locked-btn">🔒 {res ? "Final" : "Iniciado"}</div>
          :<>{guardado&&<span style={{fontSize:18,color:"#2e9e6b",marginLeft:4}}>✓</span>}</>
        }
      </div>
      {oddData&&!estaBlq&&(
        <div style={{margin:"8px 0 4px"}}>
          <div style={{display:"flex",borderRadius:6,overflow:"hidden",height:8}}>
            <div style={{width:`${oddData.home}%`,background:"#123952"}}/>
            <div style={{width:`${oddData.draw}%`,background:"#e8a020"}}/>
            <div style={{width:`${oddData.away}%`,background:"#2e9e6b"}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:4,fontSize:10,fontWeight:700}}>
            <span style={{color:"#123952"}}>{oddData.home}%</span>
            <span style={{color:"#e8a020"}}>Empate {oddData.draw}%</span>
            <span style={{color:"#2e9e6b"}}>{oddData.away}%</span>
          </div>
        </div>
      )}
    </div>
  );
}

function CountdownBloqueo({ fecha, hora }: { fecha: string; hora: string }) {
  const [texto, setTexto] = useState("");
  const [urgente, setUrgente] = useState(false);

  useEffect(() => {
    const calcular = () => {
      const bloqueoMs = partidoUYMs(fecha, hora) - 10*60*1000;
      const diff = bloqueoMs - Date.now();

      if (diff <= 0) {
        setTexto("");
        return;
      }

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

function PerfilModal({ perfil, resultados, liveData, config, bracketData, onClose }: {
  perfil: {username:string;nombre:string;predicciones:Record<string,Resultado>};
  bracketData?: Record<string,{local:string|null;visitante:string|null}>;
  resultados: Record<string,Resultado>;
  liveData: Record<string,{estado:string;minuto:number|null;local:number;visitante:number}>;
  config: PuntosConfig;
  onClose: ()=>void;
}) {
  const bloqueados = TODOS_PARTIDOS.filter(p => {
    const bloqueoMs = partidoUYMs(p.fecha, p.hora) - 10*60*1000;
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
            <div style={{fontSize:12,color:"#6b7280",marginTop:2}}>{conPick.length} pronósticos · {bloqueados.length - conPick.length} sin completar</div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {bloqueados.length===0&&<div style={{textAlign:"center",color:"#6b7280",padding:24}}>Sin partidos bloqueados aún</div>}
        {bloqueados.map(p=>{
          const pred=perfil.predicciones[p.id];
          const res=resultados[p.id];
          const live=liveData[p.id];
          const resEfectivo = res ?? (live ? {local:live.local, visitante:live.visitante} : null);
          const esParcial = !res && !!live;
          const pts=resEfectivo&&pred?calcularPuntos(pred,resEfectivo,config):null;
          const chipCls=pts===null?"":pts===config.resultado_exacto?"chip-ex":pts>0?"chip-ok":"chip-no";
          return (
            <div key={p.id} className="modal-pick-row">
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:600,color:"#1a1f24"}}>{getFlag(bracketData?.[p.id]?.local??p.local)} {bracketData?.[p.id]?.local??p.local} vs {bracketData?.[p.id]?.visitante??p.visitante} {getFlag(bracketData?.[p.id]?.visitante??p.visitante)}</div>
                <div style={{fontSize:10,color:"#6b7280",marginTop:2}}>{fmtF(p.fecha)} · {p.hora} hs</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                {resEfectivo&&(
                  <div style={{fontSize:13,color:esParcial?"#dc2626":"#6b7280",fontWeight:esParcial?700:400}}>
                    {resEfectivo.local}-{resEfectivo.visitante}
                    {esParcial&&<span style={{fontSize:9,marginLeft:3}}>🔴</span>}
                  </div>
                )}
                {pred
                  ? <div style={{fontSize:16,fontWeight:900,color:"#123952",background:"#e8f0f6",padding:"3px 10px",borderRadius:8}}>{pred.local}-{pred.visitante}</div>
                  : <div style={{fontSize:11,color:"#9ca3af",fontStyle:"italic",padding:"3px 10px"}}>Sin pronóstico</div>
                }
                {pts!==null&&<span className={`chip ${chipCls}`} style={{opacity:esParcial?0.7:1}}>{pts>0?`+${pts}`:0}p{esParcial?"*":""}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


/* PREMIUM POLISH V2 */
<style>{`
`}</style>
