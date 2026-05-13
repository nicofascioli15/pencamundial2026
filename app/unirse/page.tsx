"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function UnirsePage() {
  const router = useRouter();
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const c = params.get("codigo");
    if (c) setCodigo(c.toUpperCase());
  }, []);

  const unirse = async () => {
    setLoading(true); setErr("");
    const r = await fetch("/api/grupos/unirse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codigo })
    }).then(r => r.json());
    setLoading(false);
    if (r.error) { setErr(r.error); return; }
    router.push("/grupos");
  };

  return (
    <div style={{fontFamily:"system-ui",background:"linear-gradient(160deg,#123952,#1d5278)",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:"#fff",borderRadius:20,padding:"28px 22px",width:"100%",maxWidth:360,boxShadow:"0 20px 60px rgba(0,0,0,.3)"}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <img src="/logo.svg" style={{height:50,margin:"0 auto 12px",display:"block"}} alt="Fascioli"/>
          <div style={{fontSize:18,fontWeight:700,color:"#123952"}}>Unirte a un grupo</div>
          <div style={{fontSize:13,color:"#6b7280",marginTop:4}}>Penca Mundial 2026</div>
        </div>
        <label style={{fontSize:11,fontWeight:700,color:"#6b7280",letterSpacing:1,textTransform:"uppercase",display:"block",marginBottom:6}}>Código del grupo</label>
        <input value={codigo} onChange={e=>setCodigo(e.target.value.toUpperCase())} placeholder="Ej: PEPE2" style={{width:"100%",padding:"12px 14px",borderRadius:10,border:"1.5px solid #dde4ec",fontSize:16,fontFamily:"monospace",outline:"none",marginBottom:8,boxSizing:"border-box",textAlign:"center",letterSpacing:4}}/>
        {err && <div style={{fontSize:12,color:"#dc2626",fontWeight:600,marginBottom:10}}>⚠️ {err}</div>}
        <button onClick={unirse} disabled={loading||!codigo.trim()} style={{width:"100%",padding:14,border:"none",borderRadius:12,background:"#123952",color:"#fff",fontWeight:700,fontSize:15,cursor:"pointer",marginTop:8}}>
          {loading ? "Uniéndome..." : "Unirme →"}
        </button>
        <button onClick={()=>router.push("/login")} style={{width:"100%",padding:10,border:"none",background:"transparent",color:"#6b7280",fontSize:13,cursor:"pointer",marginTop:8}}>
          ¿No tenés cuenta? Registrate primero
        </button>
      </div>
    </div>
  );
}
