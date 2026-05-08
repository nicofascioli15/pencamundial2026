import { NextResponse } from "next/server";
import { TODOS_PARTIDOS } from "@/lib/mundial";

export async function GET() {
  try {
    const ahora = new Date();

    // Fecha actual Uruguay
    const hoyUY = new Intl.DateTimeFormat("sv-SE", {
      timeZone: "America/Montevideo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(ahora);

    // Buscar partidos de hoy
    let partidos = TODOS_PARTIDOS.filter(
      (p) => p.fecha === hoyUY
    );

    let fechaObjetivo = hoyUY;

    // Si no hay partidos hoy, buscar próxima fecha con partidos
    if (partidos.length === 0) {
      const fechasFuturas = TODOS_PARTIDOS
        .map((p) => p.fecha)
        .filter((f) => f >= hoyUY)
        .sort();

      const proximaFecha = fechasFuturas[0];

      if (proximaFecha) {
        fechaObjetivo = proximaFecha;
        partidos = TODOS_PARTIDOS.filter(
          (p) => p.fecha === proximaFecha
        );
      }
    }

    // Ordenar por hora
    partidos.sort((a, b) => a.hora.localeCompare(b.hora));

    return NextResponse.json({
      ok: true,
      fechaHoy: fechaObjetivo,
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
