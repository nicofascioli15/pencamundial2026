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
  fase: "Grupos" | "Dieciseisavos" | "Octavos" | "Cuartos" | "Semis" | "Final";
  grupo?: string;
  local: string;
  visitante: string;
  fecha: string;
  hora: string; // Hora Montevideo (UTC-3)
}

export interface Resultado { local: number; visitante: number; }
export interface PuntosConfig { resultado_exacto: number; ganador_diferencia: number; ganador_correcto: number; empate_correcto: number; }
export const PUNTOS_DEFAULT: PuntosConfig = { resultado_exacto: 8, ganador_diferencia: 5, ganador_correcto: 3, empate_correcto: 3 };

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
  { id:"G053", fase:"Grupos", grupo:"A", local:"República Checa",  visitante:"México",             fecha:"2026-06-24", hora:"22:00" },
  { id:"G054", fase:"Grupos", grupo:"A", local:"Sudáfrica",        visitante:"Corea del Sur",      fecha:"2026-06-24", hora:"22:00" },
  { id:"G055", fase:"Grupos", grupo:"D", local:"Turquía",          visitante:"Estados Unidos",     fecha:"2026-06-25", hora:"23:00" },
  { id:"G056", fase:"Grupos", grupo:"D", local:"Paraguay",         visitante:"Australia",          fecha:"2026-06-25", hora:"23:00" },
  { id:"G057", fase:"Grupos", grupo:"E", local:"Ecuador",          visitante:"Alemania",           fecha:"2026-06-25", hora:"17:00" },
  { id:"G058", fase:"Grupos", grupo:"E", local:"Curazao",          visitante:"Costa de Marfil",    fecha:"2026-06-25", hora:"17:00" },
  { id:"G059", fase:"Grupos", grupo:"F", local:"Japón",            visitante:"Suecia",             fecha:"2026-06-25", hora:"20:00" },
  { id:"G060", fase:"Grupos", grupo:"F", local:"Túnez",            visitante:"Países Bajos",       fecha:"2026-06-25", hora:"20:00" },
  { id:"G061", fase:"Grupos", grupo:"G", local:"Nueva Zelanda",    visitante:"Bélgica",            fecha:"2026-06-27", hora:"00:00" },
  { id:"G062", fase:"Grupos", grupo:"G", local:"Egipto",           visitante:"Irán",               fecha:"2026-06-27", hora:"00:00" },
  { id:"G063", fase:"Grupos", grupo:"H", local:"Uruguay",          visitante:"España",             fecha:"2026-06-26", hora:"21:00" },
  { id:"G064", fase:"Grupos", grupo:"H", local:"Cabo Verde",       visitante:"Arabia Saudita",     fecha:"2026-06-26", hora:"21:00" },
  { id:"G065", fase:"Grupos", grupo:"I", local:"Noruega",          visitante:"Francia",            fecha:"2026-06-26", hora:"16:00" },
  { id:"G066", fase:"Grupos", grupo:"I", local:"Senegal",          visitante:"Irak",               fecha:"2026-06-26", hora:"16:00" },
  { id:"G067", fase:"Grupos", grupo:"J", local:"Argelia",          visitante:"Austria",            fecha:"2026-06-27", hora:"23:00" },
  { id:"G068", fase:"Grupos", grupo:"J", local:"Jordania",         visitante:"Argentina",          fecha:"2026-06-27", hora:"23:00" },
  { id:"G069", fase:"Grupos", grupo:"K", local:"Colombia",         visitante:"Portugal",           fecha:"2026-06-27", hora:"20:30" },
  { id:"G070", fase:"Grupos", grupo:"K", local:"RD Congo",         visitante:"Uzbekistán",         fecha:"2026-06-27", hora:"20:30" },
  { id:"G071", fase:"Grupos", grupo:"L", local:"Panamá",           visitante:"Inglaterra",         fecha:"2026-06-27", hora:"18:00" },
  { id:"G072", fase:"Grupos", grupo:"L", local:"Croacia",          visitante:"Ghana",              fecha:"2026-06-27", hora:"18:00" },
];

const ELIMINATORIAS: Partido[] = [
  // ── DIECISEISAVOS (Round of 32) ── June 28 - July 3
  { id:"R32_01", fase:"Dieciseisavos", local:"2° Gr. A",              visitante:"2° Gr. B",              fecha:"2026-06-28", hora:"16:00" },
  { id:"R32_02", fase:"Dieciseisavos", local:"1° Gr. C",              visitante:"2° Gr. F",              fecha:"2026-06-29", hora:"14:00" },
  { id:"R32_03", fase:"Dieciseisavos", local:"1° Gr. E",              visitante:"Mejor 3° A/B/C/D/F",   fecha:"2026-06-29", hora:"17:30" },
  { id:"R32_04", fase:"Dieciseisavos", local:"1° Gr. F",              visitante:"2° Gr. C",              fecha:"2026-06-29", hora:"22:00" },
  { id:"R32_05", fase:"Dieciseisavos", local:"2° Gr. E",              visitante:"2° Gr. I",              fecha:"2026-06-30", hora:"14:00" },
  { id:"R32_06", fase:"Dieciseisavos", local:"1° Gr. I",              visitante:"Mejor 3° C/D/F/G/H",   fecha:"2026-06-30", hora:"18:00" },
  { id:"R32_07", fase:"Dieciseisavos", local:"1° Gr. A",              visitante:"Mejor 3° C/E/F/H/I",   fecha:"2026-06-30", hora:"22:00" },
  { id:"R32_08", fase:"Dieciseisavos", local:"1° Gr. L",              visitante:"Mejor 3° E/H/I/J/K",   fecha:"2026-07-01", hora:"13:00" },
  { id:"R32_09", fase:"Dieciseisavos", local:"1° Gr. G",              visitante:"Mejor 3° A/E/H/I/J",   fecha:"2026-07-01", hora:"17:00" },
  { id:"R32_10", fase:"Dieciseisavos", local:"1° Gr. D",              visitante:"Mejor 3° B/E/F/I/J",   fecha:"2026-07-01", hora:"21:00" },
  { id:"R32_11", fase:"Dieciseisavos", local:"1° Gr. H",              visitante:"2° Gr. J",              fecha:"2026-07-02", hora:"16:00" },
  { id:"R32_12", fase:"Dieciseisavos", local:"2° Gr. K",              visitante:"2° Gr. L",              fecha:"2026-07-02", hora:"20:00" },
  { id:"R32_13", fase:"Dieciseisavos", local:"1° Gr. B",              visitante:"Mejor 3° E/F/G/I/J",   fecha:"2026-07-03", hora:"00:00" },
  { id:"R32_14", fase:"Dieciseisavos", local:"2° Gr. D",              visitante:"2° Gr. G",              fecha:"2026-07-03", hora:"15:00" },
  { id:"R32_15", fase:"Dieciseisavos", local:"1° Gr. J",              visitante:"2° Gr. H",              fecha:"2026-07-03", hora:"19:00" },
  { id:"R32_16", fase:"Dieciseisavos", local:"1° Gr. K",              visitante:"Mejor 3° D/E/I/J/L",   fecha:"2026-07-03", hora:"22:30" },

  // ── OCTAVOS (Round of 16) ── July 4-7
  { id:"R16_1",  fase:"Octavos", local:"Gan. R32_01", visitante:"Gan. R32_04", fecha:"2026-07-04", hora:"14:00" },
  { id:"R16_2",  fase:"Octavos", local:"Gan. R32_03", visitante:"Gan. R32_06", fecha:"2026-07-04", hora:"18:00" },
  { id:"R16_3",  fase:"Octavos", local:"Gan. R32_02", visitante:"Gan. R32_05", fecha:"2026-07-05", hora:"17:00" },
  { id:"R16_4",  fase:"Octavos", local:"Gan. R32_07", visitante:"Gan. R32_08", fecha:"2026-07-05", hora:"21:00" },
  { id:"R16_5",  fase:"Octavos", local:"Gan. R32_12", visitante:"Gan. R32_11", fecha:"2026-07-06", hora:"16:00" },
  { id:"R16_6",  fase:"Octavos", local:"Gan. R32_10", visitante:"Gan. R32_09", fecha:"2026-07-06", hora:"21:00" },
  { id:"R16_7",  fase:"Octavos", local:"Gan. R32_15", visitante:"Gan. R32_14", fecha:"2026-07-07", hora:"13:00" },
  { id:"R16_8",  fase:"Octavos", local:"Gan. R32_13", visitante:"Gan. R32_16", fecha:"2026-07-07", hora:"17:00" },

  // ── CUARTOS (Quarterfinals) ── July 9-11
  { id:"QF_1",   fase:"Cuartos", local:"Gan. R16_2",  visitante:"Gan. R16_1",  fecha:"2026-07-09", hora:"17:00" },
  { id:"QF_2",   fase:"Cuartos", local:"Gan. R16_3",  visitante:"Gan. R16_4",  fecha:"2026-07-10", hora:"16:00" },
  { id:"QF_3",   fase:"Cuartos", local:"Gan. R16_5",  visitante:"Gan. R16_6",  fecha:"2026-07-11", hora:"18:00" },
  { id:"QF_4",   fase:"Cuartos", local:"Gan. R16_7",  visitante:"Gan. R16_8",  fecha:"2026-07-11", hora:"22:00" },

  // ── SEMIS ── July 14-15
  { id:"SF_1",   fase:"Semis",   local:"Gan. QF_1",   visitante:"Gan. QF_2",   fecha:"2026-07-14", hora:"16:00" },
  { id:"SF_2",   fase:"Semis",   local:"Gan. QF_3",   visitante:"Gan. QF_4",   fecha:"2026-07-15", hora:"16:00" },

  // ── FINAL ── July 18-19
  { id:"3RO",    fase:"Final",   local:"Perdedor SF_1", visitante:"Perdedor SF_2", fecha:"2026-07-18", hora:"18:00" },
  { id:"FINAL",  fase:"Final",   local:"Gan. SF_1",     visitante:"Gan. SF_2",     fecha:"2026-07-19", hora:"16:00" },
];

export const TODOS_PARTIDOS: Partido[] = [...PARTIDOS_GRUPOS, ...ELIMINATORIAS];

export const CIUDADES: Record<string, string> = {
  // Grupos - Jornada 1
  "G001": "Ciudad de México", "G002": "Monterrey",
  "G003": "Vancouver",        "G004": "Houston",
  "G005": "Houston",          "G006": "Nueva York",
  "G007": "Miami",            "G008": "Vancouver",
  "G009": "Philadelphia",     "G010": "Dallas",
  "G011": "Kansas City",      "G012": "Houston",
  // Grupos - Jornada 2
  "G013": "Kansas City",      "G014": "Nueva York",
  "G015": "Houston",          "G016": "Dallas",
  "G017": "Seattle",          "G018": "Vancouver",
  "G019": "San Francisco",    "G020": "Boston",
  "G021": "Houston",          "G022": "Miami",
  "G023": "Atlanta",          "G024": "Ciudad de México",
  // Grupos - Jornada 3 (segunda ronda)
  "G025": "Atlanta",          "G026": "Vancouver",
  "G027": "Seattle",          "G028": "Monterrey",
  "G029": "Nueva York",       "G030": "Dallas",
  "G031": "Los Ángeles",      "G032": "Boston",
  "G033": "Kansas City",      "G034": "San Francisco",
  "G035": "Philadelphia",     "G036": "Miami",
  "G037": "Los Ángeles",      "G038": "Dallas",
  "G039": "Boston",           "G040": "Houston",
  "G041": "Ciudad de México", "G042": "Toronto",
  "G043": "San Francisco",    "G044": "Los Ángeles",
  "G045": "Kansas City",      "G046": "Miami",
  "G047": "Seattle",          "G048": "New Jersey",
  // Grupos - Jornada 3 (tercera ronda)
  "G049": "Vancouver",        "G050": "Seattle",
  "G051": "Atlanta",          "G052": "Miami",
  "G053": "Ciudad de México", "G054": "Monterrey",
  "G055": "Los Ángeles",      "G056": "San Francisco",
  "G057": "Nueva York",       "G058": "Philadelphia",
  "G059": "Dallas",           "G060": "Kansas City",
  "G061": "Boston",           "G062": "Toronto",
  "G063": "Miami",            "G064": "Houston",
  "G065": "Boston",           "G066": "Toronto",
  "G067": "Dallas",           "G068": "Ciudad de México",
  "G069": "Kansas City",      "G070": "Seattle",
  "G071": "Atlanta",          "G072": "Los Ángeles",
  // Dieciseisavos
  "R32_01": "Los Ángeles",    "R32_02": "Houston",
  "R32_03": "Boston",         "R32_04": "Monterrey",
  "R32_05": "Dallas",         "R32_06": "Nueva York",
  "R32_07": "Ciudad de México","R32_08": "Atlanta",
  "R32_09": "Seattle",        "R32_10": "San Francisco",
  "R32_11": "Los Ángeles",    "R32_12": "Toronto",
  "R32_13": "Vancouver",      "R32_14": "Dallas",
  "R32_15": "Miami",          "R32_16": "Kansas City",
  // Octavos
  "R16_1": "Houston",         "R16_2": "Philadelphia",
  "R16_3": "Nueva York",      "R16_4": "Ciudad de México",
  "R16_5": "Dallas",          "R16_6": "Seattle",
  "R16_7": "Atlanta",         "R16_8": "Vancouver",
  // Cuartos
  "QF_1": "Boston",           "QF_2": "Seattle",
  "QF_3": "Atlanta",          "QF_4": "Vancouver",
  // Semis y Final
  "SF_1": "Dallas",           "SF_2": "Los Ángeles",
  "3RO": "Miami",             "FINAL": "Nueva York",
};

export function calcularPuntos(pred: Resultado, res: Resultado, config: PuntosConfig): number {
  if (pred.local === res.local && pred.visitante === res.visitante) return config.resultado_exacto;
  const predGana = pred.local > pred.visitante ? "L" : pred.local < pred.visitante ? "V" : "E";
  const resGana  = res.local  > res.visitante  ? "L" : res.local  < res.visitante  ? "V" : "E";
  if (predGana !== resGana) return 0;
  if (predGana === "E") return config.empate_correcto;
  const predDif = Math.abs(pred.local - pred.visitante);
  const resDif  = Math.abs(res.local  - res.visitante);
  if (predDif === resDif) return config.ganador_diferencia;
  return config.ganador_correcto;
}
