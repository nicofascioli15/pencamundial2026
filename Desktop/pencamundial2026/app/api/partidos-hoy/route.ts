import { NextResponse } from "next/server";
import { TODOS_PARTIDOS } from "@/lib/mundial";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Hora actual en Montevideo (UTC-3)
    const ahoraMVD = new Date(Date.now() - 3 * 60 * 60 * 1000);
    const hoyStr = ahoraMVD.toISOString().split("T")[0];

    // Ordenar todos los partidos futuros por fecha+hora
    const partidosFuturos = [...TODOS_PARTIDOS]
      .filter(p => {
        // Incluir partidos de hoy que aún no empezaron, y todos los futuros
        if (p.fecha > hoyStr) return true;
        if (p.fecha === hoyStr) {
          const [h, m] = p.hora.split(":").map(Number);
          const partidoMs = new Date(`${p.fecha}T${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:00`).getTime() + 3*60*60*1000;
          return Date.now() < partidoMs + 110*60*1000; // incluir hasta 110min después
        }
        return false;
      })
      .sort((a, b) => {
        const da = new Date(`${a.fecha}T${a.hora}:00`).getTime();
        const db = new Date(`${b.fecha}T${b.hora}:00`).getTime();
        return da - db;
      });

    if (partidosFuturos.length === 0) {
      return NextResponse.json({ ok: true, proximaFecha: null, partidos: [], siguientesDias: [] });
    }

    // Próxima fecha con partidos
    const proximaFecha = partidosFuturos[0].fecha;
    const partidosProximos = partidosFuturos.filter(p => p.fecha === proximaFecha);

    // Siguientes fechas (hasta 3 días más, excluyendo la próxima)
    const fechasSiguientes = Array.from(new Set(
      partidosFuturos
        .filter(p => p.fecha !== proximaFecha)
        .map(p => p.fecha)
    )).slice(0, 3);

    const siguientesDias = fechasSiguientes.map(fecha => ({
      fecha,
      partidos: partidosFuturos.filter(p => p.fecha === fecha),
    }));

    return NextResponse.json({
      ok: true,
      proximaFecha,
      partidos: partidosProximos,
      siguientesDias,
      fechaHoy: hoyStr,
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: false, partidos: [], siguientesDias: [] });
  }
}
