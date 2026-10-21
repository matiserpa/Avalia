'use server';

import { notFound, redirect } from 'next/navigation';
import { modoDemo } from '@/lib/config';
import { reiniciarDemo } from '@/lib/demo/semilla';

// Vuelve los datos de prueba al punto de partida (y cierra todas las sesiones).
export async function reiniciar() {
  if (!modoDemo()) notFound();
  await reiniciarDemo();
  redirect('/demo?reiniciado=1');
}
