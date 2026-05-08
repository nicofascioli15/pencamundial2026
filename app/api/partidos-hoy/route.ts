import { NextResponse } from "next/server";
import { TODOS_PARTIDOS } from "@/lib/mundial";

export async function GET() {
  try {
    const hoy = new Date();

    // Ordenar todos los partidos por fecha
    const partidosOrdenados = [...TODOS_PARTIDOS].sort((a, b) => {
      const da = new Date(`${a.fecha}T${a.hora}:00`).getTime();
      const db = new Date(`${b.fecha}T${b.hora}:00`).getTime();
      return da - db;
    });

    // Buscar próximos partidos futuros
    const partidosFuturos = partidosOrdenados.filter((p) => {
      const fechaPartido = new Date(`${p.fecha}T${p.hora}:00`);
      return fechaPartido.getTime() >= hoy.getTime();
    });

    if (partidosFuturos.length === 0) {
      return NextResponse.json({
        ok: true,
        partidos: [],
        fechaHoy: null,
      });
    }

    // Tomar la próxima fecha disponible
    const proximaFecha = partidosFuturos[0].fecha;

    // Traer todos los partidos de esa fecha
    const partidos = partidosFuturos.filter(
      (p) => p.fecha === proximaFecha
    );

    return NextResponse.json({
      ok: true,
      fechaHoy: proximaFecha,
      partidos,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json({
      ok: false,
      partidos: [],
    });
  }
}