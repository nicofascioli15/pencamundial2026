// app/api/partidos-hoy/route.ts
// Devuelve los partidos de hoy en hora Montevideo (UTC-3)
// Si no hay partidos hoy, devuelve los del próximo día con partidos
import { NextResponse } from "next/server";
import { TODOS_PARTIDOS } from "@/lib/mundial";

function getFechaMontevideoHoy(): string {
  // Hora actual en Montevideo (UTC-3)
  const now = new Date();
  const mvd = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  return mvd.toISOString().split("T")[0];
}

export async function GET() {
  const hoy = getFechaMontevideoHoy();

  // Partidos de hoy
  let partidos = TODOS_PARTIDOS.filter(p => p.fecha === hoy);

  // Si no hay hoy, buscar el próximo día con partidos
  if (partidos.length === 0) {
    const futuros = TODOS_PARTIDOS
      .filter(p => p.fecha > hoy)
      .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora));

    if (futuros.length > 0) {
      const proximaFecha = futuros[0].fecha;
      partidos = futuros.filter(p => p.fecha === proximaFecha);
    }
  }

  return NextResponse.json({ partidos, fechaHoy: hoy });
}
