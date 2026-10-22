// Tarea diaria (vercel.json, "crons"): borra las consultas del sitio que pasaron los 12 meses,
// como dice la política de privacidad. Sólo la llama Vercel, con CRON_SECRET.

import { connection } from 'next/server';
import { borrarVencidas } from '@/features/comercial/consultas';
import { esTareaProgramada } from '@/lib/auth/guardas';

export async function GET(req: Request) {
  await connection();
  if (!esTareaProgramada(req)) return new Response('No autorizado', { status: 401 });
  await borrarVencidas();
  return Response.json({ ok: true });
}
