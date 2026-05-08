// lib/mundial.ts — Fixture OFICIAL Mundial 2026
// Fuente: FIFA / Infobae - Horarios en hora de Montevideo (UTC-3) = hora Argentina

export const GRUPOS: Record<string, string[]> = {
  A: ["México", "Corea del Sur", "Sudáfrica", "República Checa"],
  B: ["Canadá", "Bosnia y Herzegovina", "Qatar", "Suiza"],
  C: ["Brasil", "Marruecos", "Escocia", "Haití"],
  D: ["Estados Unidos", "Australia", "Paraguay", "Turquía"],
  E: ["Alemania", "Ecuador", "Costa de Marfil", "Curazao"],
  F: ["Países Bajos", "Japón", "Túnez", "Suecia"],
  G: ["Bélgica", "Irán", "Egipto", "Nueva Zelanda"],
  H: ["España", "Uruguay", "Arabia Saudita", "Cabo Verde"],
  I: ["Francia", "Senegal", "Irak", "Noruega"],
  J: ["Argentina", "Argelia", "Austria", "Jordania"],
  K: ["Portugal", "Colombia", "Uzbekistán", "RD Congo"],
  L: ["Inglaterra", "Croacia", "Ghana", "Panamá"],
};

export const FLAGS: Record<string, string> = {
  "México": "🇲🇽", "Corea del Sur": "🇰🇷", "Sudáfrica": "🇿🇦", "República Checa": "🇨🇿",
  "Canadá": "🇨🇦", "Bosnia y Herzegovina": "🇧🇦", "Qatar": "🇶🇦", "Suiza": "🇨🇭",
  "Brasil": "🇧🇷", "Marruecos": "🇲🇦", "Escocia": "🏴󠁧󠁢󠁳󠁣󠁴󠁿", "Haití": "🇭🇹",
  "Estados Unidos": "🇺🇸", "Australia": "🇦🇺", "Paraguay": "🇵🇾", "Turquía": "🇹🇷",
  "Alemania": "🇩🇪", "Ecuador": "🇪🇨", "Costa de Marfil": "🇨🇮", "Curazao": "🇨🇼",
  "Países Bajos": "🇳🇱", "Japón": "🇯🇵", "Túnez": "🇹🇳", "Suecia": "🇸🇪",
  "Bélgica": "🇧🇪", "Irán": "🇮🇷", "Egipto": "🇪🇬", "Nueva Zelanda": "🇳🇿",
  "España": "🇪🇸", "Uruguay": "🇺🇾", "Arabia Saudita": "🇸🇦", "Cabo Verde": "🇨🇻",
  "Francia": "🇫🇷", "Senegal": "🇸🇳", "Irak": "🇮🇶", "Noruega": "🇳🇴",
  "Argentina": "🇦🇷", "Argelia": "🇩🇿", "Austria": "🇦🇹", "Jordania": "🇯🇴",
  "Portugal": "🇵🇹", "Colombia": "🇨🇴", "Uzbekistán": "🇺🇿", "RD Congo": "🇨🇩",
  "Inglaterra": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "Croacia": "🇭🇷", "Ghana": "🇬🇭", "Panamá": "🇵🇦",
};

export const getFlag = (equipo: string) => FLAGS[equipo] ?? "🏳️";

export interface Partido {
  id: string;
  fase: "Grupos" | "Octavos" | "Cuartos" | "Semis" | "Final";
  grupo?: string;
  local: string;
  visitante: string;
  fecha: string;
  hora: string; // Hora Montevideo (UTC-3)
}

export interface Resultado { local: number; visitante: number; }
export interface PuntosConfig { resultado_exacto: number; ganador_correcto: number; empate_correcto: number; }
export const PUNTOS_DEFAULT: PuntosConfig = { resultado_exacto: 3, ganador_correcto: 1, empate_correcto: 1 };

// ── FIXTURE OFICIAL ── Horarios en hora Montevideo = hora Argentina (UTC-3)
const PARTIDOS_GRUPOS: Partido[] = [
  // ── JORNADA 1 ──
  { id:"G001", fase:"Grupos", grupo:"A", local:"México",           visitante:"Sudáfrica",          fecha:"2026-06-11", hora:"16:00" },
  { id:"G002", fase:"Grupos", grupo:"A", local:"Corea del Sur",    visitante:"República Checa",    fecha:"2026-06-11", hora:"23:00" },
  { id:"G003", fase:"Grupos", grupo:"B", local:"Canadá",           visitante:"Bosnia y Herzegovina",fecha:"2026-06-12", hora:"16:00" },
  { id:"G004", fase:"Grupos", grupo:"D", local:"Estados Unidos",   visitante:"Paraguay",           fecha:"2026-06-12", hora:"22:00" },
  { id:"G005", fase:"Grupos", grupo:"B", local:"Qatar",            visitante:"Suiza",              fecha:"2026-06-13", hora:"16:00" },
  { id:"G006", fase:"Grupos", grupo:"C", local:"Brasil",           visitante:"Marruecos",          fecha:"2026-06-13", hora:"19:00" },
  { id:"G007", fase:"Grupos", grupo:"C", local:"Haití",            visitante:"Escocia",            fecha:"2026-06-13", hora:"22:00" },
  { id:"G008", fase:"Grupos", grupo:"D", local:"Australia",        visitante:"Turquía",            fecha:"2026-06-14", hora:"01:00" },
  { id:"G009", fase:"Grupos", grupo:"E", local:"Alemania",         visitante:"Curazao",            fecha:"2026-06-14", hora:"14:00" },
  { id:"G010", fase:"Grupos", grupo:"F", local:"Países Bajos",     visitante:"Japón",              fecha:"2026-06-14", hora:"17:00" },
  { id:"G011", fase:"Grupos", grupo:"E", local:"Costa de Marfil",  visitante:"Ecuador",            fecha:"2026-06-14", hora:"20:00" },
  { id:"G012", fase:"Grupos", grupo:"F", local:"Suecia",           visitante:"Túnez",              fecha:"2026-06-14", hora:"23:00" },
  { id:"G013", fase:"Grupos", grupo:"H", local:"España",           visitante:"Cabo Verde",         fecha:"2026-06-15", hora:"13:00" },
  { id:"G014", fase:"Grupos", grupo:"G", local:"Bélgica",          visitante:"Egipto",             fecha:"2026-06-15", hora:"16:00" },
  { id:"G015", fase:"Grupos", grupo:"H", local:"Arabia Saudita",   visitante:"Uruguay",            fecha:"2026-06-15", hora:"19:00" },
  { id:"G016", fase:"Grupos", grupo:"G", local:"Irán",             visitante:"Nueva Zelanda",      fecha:"2026-06-15", hora:"22:00" },
  { id:"G017", fase:"Grupos", grupo:"I", local:"Francia",          visitante:"Senegal",            fecha:"2026-06-16", hora:"16:00" },
  { id:"G018", fase:"Grupos", grupo:"I", local:"Irak",             visitante:"Noruega",            fecha:"2026-06-16", hora:"19:00" },
  { id:"G019", fase:"Grupos", grupo:"J", local:"Argentina",        visitante:"Argelia",            fecha:"2026-06-16", hora:"22:00" },
  { id:"G020", fase:"Grupos", grupo:"J", local:"Austria",          visitante:"Jordania",           fecha:"2026-06-17", hora:"01:00" },
  { id:"G021", fase:"Grupos", grupo:"K", local:"Portugal",         visitante:"RD Congo",           fecha:"2026-06-17", hora:"14:00" },
  { id:"G022", fase:"Grupos", grupo:"L", local:"Inglaterra",       visitante:"Croacia",            fecha:"2026-06-17", hora:"17:00" },
  { id:"G023", fase:"Grupos", grupo:"L", local:"Ghana",            visitante:"Panamá",             fecha:"2026-06-17", hora:"20:00" },
  { id:"G024", fase:"Grupos", grupo:"K", local:"Uzbekistán",       visitante:"Colombia",           fecha:"2026-06-17", hora:"23:00" },

  // ── JORNADA 2 ──
  { id:"G025", fase:"Grupos", grupo:"A", local:"República Checa",  visitante:"Sudáfrica",          fecha:"2026-06-18", hora:"13:00" },
  { id:"G026", fase:"Grupos", grupo:"B", local:"Suiza",            visitante:"Bosnia y Herzegovina",fecha:"2026-06-18", hora:"16:00" },
  { id:"G027", fase:"Grupos", grupo:"B", local:"Canadá",           visitante:"Qatar",              fecha:"2026-06-18", hora:"19:00" },
  { id:"G028", fase:"Grupos", grupo:"A", local:"México",           visitante:"Corea del Sur",      fecha:"2026-06-18", hora:"22:00" },
  { id:"G029", fase:"Grupos", grupo:"D", local:"Estados Unidos",   visitante:"Australia",          fecha:"2026-06-19", hora:"16:00" },
  { id:"G030", fase:"Grupos", grupo:"C", local:"Escocia",          visitante:"Marruecos",          fecha:"2026-06-19", hora:"19:00" },
  { id:"G031", fase:"Grupos", grupo:"C", local:"Brasil",           visitante:"Haití",              fecha:"2026-06-19", hora:"22:00" },
  { id:"G032", fase:"Grupos", grupo:"D", local:"Turquía",          visitante:"Paraguay",           fecha:"2026-06-20", hora:"01:00" },
  { id:"G033", fase:"Grupos", grupo:"F", local:"Países Bajos",     visitante:"Suecia",             fecha:"2026-06-20", hora:"14:00" },
  { id:"G034", fase:"Grupos", grupo:"E", local:"Alemania",         visitante:"Costa de Marfil",    fecha:"2026-06-20", hora:"17:00" },
  { id:"G035", fase:"Grupos", grupo:"E", local:"Ecuador",          visitante:"Curazao",            fecha:"2026-06-20", hora:"21:00" },
  { id:"G036", fase:"Grupos", grupo:"F", local:"Túnez",            visitante:"Japón",              fecha:"2026-06-21", hora:"01:00" },
  { id:"G037", fase:"Grupos", grupo:"H", local:"España",           visitante:"Arabia Saudita",     fecha:"2026-06-21", hora:"13:00" },
  { id:"G038", fase:"Grupos", grupo:"G", local:"Bélgica",          visitante:"Irán",               fecha:"2026-06-21", hora:"16:00" },
  { id:"G039", fase:"Grupos", grupo:"H", local:"Uruguay",          visitante:"Cabo Verde",         fecha:"2026-06-21", hora:"19:00" },
  { id:"G040", fase:"Grupos", grupo:"G", local:"Nueva Zelanda",    visitante:"Egipto",             fecha:"2026-06-21", hora:"22:00" },
  { id:"G041", fase:"Grupos", grupo:"J", local:"Argentina",        visitante:"Austria",            fecha:"2026-06-22", hora:"14:00" },
  { id:"G042", fase:"Grupos", grupo:"I", local:"Francia",          visitante:"Irak",               fecha:"2026-06-22", hora:"18:00" },
  { id:"G043", fase:"Grupos", grupo:"I", local:"Noruega",          visitante:"Senegal",            fecha:"2026-06-22", hora:"21:00" },
  { id:"G044", fase:"Grupos", grupo:"J", local:"Jordania",         visitante:"Argelia",            fecha:"2026-06-23", hora:"00:00" },
  { id:"G045", fase:"Grupos", grupo:"K", local:"Portugal",         visitante:"Uzbekistán",         fecha:"2026-06-23", hora:"14:00" },
  { id:"G046", fase:"Grupos", grupo:"L", local:"Inglaterra",       visitante:"Ghana",              fecha:"2026-06-23", hora:"17:00" },
  { id:"G047", fase:"Grupos", grupo:"L", local:"Panamá",           visitante:"Croacia",            fecha:"2026-06-23", hora:"20:00" },
  { id:"G048", fase:"Grupos", grupo:"K", local:"Colombia",         visitante:"RD Congo",           fecha:"2026-06-23", hora:"23:00" },

  // ── JORNADA 3 ──
  { id:"G049", fase:"Grupos", grupo:"B", local:"Suiza",            visitante:"Canadá",             fecha:"2026-06-24", hora:"16:00" },
  { id:"G050", fase:"Grupos", grupo:"B", local:"Bosnia y Herzegovina", visitante:"Qatar",          fecha:"2026-06-24", hora:"16:00" },
  { id:"G051", fase:"Grupos", grupo:"C", local:"Marruecos",        visitante:"Haití",              fecha:"2026-06-24", hora:"19:00" },
  { id:"G052", fase:"Grupos", grupo:"C", local:"Escocia",          visitante:"Brasil",             fecha:"2026-06-24", hora:"19:00" },
  { id:"G053", fase:"Grupos", grupo:"A", local:"República Checa",  visitante:"México",             fecha:"2026-06-25", hora:"22:00" },
  { id:"G054", fase:"Grupos", grupo:"A", local:"Sudáfrica",        visitante:"Corea del Sur",      fecha:"2026-06-25", hora:"22:00" },
  { id:"G055", fase:"Grupos", grupo:"D", local:"Turquía",          visitante:"Estados Unidos",     fecha:"2026-06-25", hora:"22:00" },
  { id:"G056", fase:"Grupos", grupo:"D", local:"Paraguay",         visitante:"Australia",          fecha:"2026-06-25", hora:"22:00" },
  { id:"G057", fase:"Grupos", grupo:"E", local:"Ecuador",          visitante:"Alemania",           fecha:"2026-06-25", hora:"17:00" },
  { id:"G058", fase:"Grupos", grupo:"E", local:"Curazao",          visitante:"Costa de Marfil",    fecha:"2026-06-25", hora:"17:00" },
  { id:"G059", fase:"Grupos", grupo:"F", local:"Japón",            visitante:"Suecia",             fecha:"2026-06-25", hora:"20:00" },
  { id:"G060", fase:"Grupos", grupo:"F", local:"Túnez",            visitante:"Países Bajos",       fecha:"2026-06-25", hora:"20:00" },
  { id:"G061", fase:"Grupos", grupo:"G", local:"Nueva Zelanda",    visitante:"Bélgica",            fecha:"2026-06-26", hora:"16:00" },
  { id:"G062", fase:"Grupos", grupo:"G", local:"Egipto",           visitante:"Irán",               fecha:"2026-06-26", hora:"16:00" },
  { id:"G063", fase:"Grupos", grupo:"H", local:"Uruguay",          visitante:"España",             fecha:"2026-06-26", hora:"21:00" },
  { id:"G064", fase:"Grupos", grupo:"H", local:"Cabo Verde",       visitante:"Arabia Saudita",     fecha:"2026-06-26", hora:"21:00" },
  { id:"G065", fase:"Grupos", grupo:"I", local:"Noruega",          visitante:"Francia",            fecha:"2026-06-26", hora:"16:00" },
  { id:"G066", fase:"Grupos", grupo:"I", local:"Senegal",          visitante:"Irak",               fecha:"2026-06-26", hora:"16:00" },
  { id:"G067", fase:"Grupos", grupo:"J", local:"Argelia",          visitante:"Austria",            fecha:"2026-06-27", hora:"22:00" },
  { id:"G068", fase:"Grupos", grupo:"J", local:"Jordania",         visitante:"Argentina",          fecha:"2026-06-27", hora:"22:00" },
  { id:"G069", fase:"Grupos", grupo:"K", local:"Colombia",         visitante:"Portugal",           fecha:"2026-06-27", hora:"19:30" },
  { id:"G070", fase:"Grupos", grupo:"K", local:"RD Congo",         visitante:"Uzbekistán",         fecha:"2026-06-27", hora:"19:30" },
  { id:"G071", fase:"Grupos", grupo:"L", local:"Panamá",           visitante:"Inglaterra",         fecha:"2026-06-27", hora:"17:00" },
  { id:"G072", fase:"Grupos", grupo:"L", local:"Croacia",          visitante:"Ghana",              fecha:"2026-06-27", hora:"17:00" },
];

const ELIMINATORIAS: Partido[] = [
  { id:"R32_01", fase:"Octavos", local:"1° Gr. A",    visitante:"2° Gr. B",    fecha:"2026-06-28", hora:"16:00" },
  { id:"R32_02", fase:"Octavos", local:"1° Gr. C",    visitante:"2° Gr. D",    fecha:"2026-06-28", hora:"20:00" },
  { id:"R32_03", fase:"Octavos", local:"1° Gr. E",    visitante:"2° Gr. F",    fecha:"2026-06-29", hora:"16:00" },
  { id:"R32_04", fase:"Octavos", local:"1° Gr. G",    visitante:"2° Gr. H",    fecha:"2026-06-29", hora:"20:00" },
  { id:"R32_05", fase:"Octavos", local:"1° Gr. I",    visitante:"2° Gr. J",    fecha:"2026-06-30", hora:"16:00" },
  { id:"R32_06", fase:"Octavos", local:"1° Gr. K",    visitante:"2° Gr. L",    fecha:"2026-06-30", hora:"20:00" },
  { id:"R32_07", fase:"Octavos", local:"1° Gr. B",    visitante:"2° Gr. A",    fecha:"2026-07-01", hora:"16:00" },
  { id:"R32_08", fase:"Octavos", local:"1° Gr. D",    visitante:"2° Gr. C",    fecha:"2026-07-01", hora:"20:00" },
  { id:"R32_09", fase:"Octavos", local:"1° Gr. F",    visitante:"2° Gr. E",    fecha:"2026-07-02", hora:"16:00" },
  { id:"R32_10", fase:"Octavos", local:"1° Gr. H",    visitante:"2° Gr. G",    fecha:"2026-07-02", hora:"20:00" },
  { id:"R32_11", fase:"Octavos", local:"1° Gr. J",    visitante:"2° Gr. I",    fecha:"2026-07-03", hora:"16:00" },
  { id:"R32_12", fase:"Octavos", local:"1° Gr. L",    visitante:"2° Gr. K",    fecha:"2026-07-03", hora:"20:00" },
  { id:"R32_13", fase:"Octavos", local:"Mejor 3° A/B/C/D", visitante:"Mejor 3° E/F/G/H", fecha:"2026-07-04", hora:"16:00" },
  { id:"R32_14", fase:"Octavos", local:"Mejor 3° I/J/K/L", visitante:"Mejor 3° resto",   fecha:"2026-07-04", hora:"20:00" },
  { id:"R32_15", fase:"Octavos", local:"Por definir", visitante:"Por definir", fecha:"2026-07-05", hora:"16:00" },
  { id:"R32_16", fase:"Octavos", local:"Por definir", visitante:"Por definir", fecha:"2026-07-05", hora:"20:00" },
  { id:"QF_1",   fase:"Cuartos", local:"Gan. R32_01", visitante:"Gan. R32_02", fecha:"2026-07-09", hora:"16:00" },
  { id:"QF_2",   fase:"Cuartos", local:"Gan. R32_03", visitante:"Gan. R32_04", fecha:"2026-07-09", hora:"20:00" },
  { id:"QF_3",   fase:"Cuartos", local:"Gan. R32_05", visitante:"Gan. R32_06", fecha:"2026-07-10", hora:"16:00" },
  { id:"QF_4",   fase:"Cuartos", local:"Gan. R32_07", visitante:"Gan. R32_08", fecha:"2026-07-10", hora:"20:00" },
  { id:"QF_5",   fase:"Cuartos", local:"Gan. R32_09", visitante:"Gan. R32_10", fecha:"2026-07-11", hora:"16:00" },
  { id:"QF_6",   fase:"Cuartos", local:"Gan. R32_11", visitante:"Gan. R32_12", fecha:"2026-07-11", hora:"20:00" },
  { id:"QF_7",   fase:"Cuartos", local:"Gan. R32_13", visitante:"Gan. R32_14", fecha:"2026-07-12", hora:"16:00" },
  { id:"QF_8",   fase:"Cuartos", local:"Gan. R32_15", visitante:"Gan. R32_16", fecha:"2026-07-12", hora:"20:00" },
  { id:"SF_1",   fase:"Semis",   local:"Gan. QF_1",   visitante:"Gan. QF_2",   fecha:"2026-07-14", hora:"21:00" },
  { id:"SF_2",   fase:"Semis",   local:"Gan. QF_3",   visitante:"Gan. QF_4",   fecha:"2026-07-15", hora:"21:00" },
  { id:"SF_3",   fase:"Semis",   local:"Gan. QF_5",   visitante:"Gan. QF_6",   fecha:"2026-07-14", hora:"17:00" },
  { id:"SF_4",   fase:"Semis",   local:"Gan. QF_7",   visitante:"Gan. QF_8",   fecha:"2026-07-15", hora:"17:00" },
  { id:"3RO",    fase:"Final",   local:"Perdedor SF_1/SF_3", visitante:"Perdedor SF_2/SF_4", fecha:"2026-07-18", hora:"17:00" },
  { id:"FINAL",  fase:"Final",   local:"Gan. SF_1/SF_3", visitante:"Gan. SF_2/SF_4", fecha:"2026-07-19", hora:"17:00" },
];

export const TODOS_PARTIDOS: Partido[] = [...PARTIDOS_GRUPOS, ...ELIMINATORIAS];

export function calcularPuntos(pred: Resultado, res: Resultado, cfg: PuntosConfig = PUNTOS_DEFAULT): number {
  if (pred.local === res.local && pred.visitante === res.visitante) return cfg.resultado_exacto;
  const gR = res.local > res.visitante ? "L" : res.local < res.visitante ? "V" : "E";
  const gP = pred.local > pred.visitante ? "L" : pred.local < pred.visitante ? "V" : "E";
  if (gR === "E" && gP === "E") return cfg.empate_correcto;
  if (gR === gP) return cfg.ganador_correcto;
  return 0;
}
