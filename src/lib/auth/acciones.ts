'use server';

// Acciones de sesión compartidas por todos los paneles.

import { redirect } from 'next/navigation';
import { cerrarSesion } from './sesion';

export async function salir() {
  await cerrarSesion();
  redirect('/');
}
