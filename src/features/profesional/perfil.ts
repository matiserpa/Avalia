// El perfil que completa la profesional: lo que declara ella (nunca lleva sello) y su foto.

import 'server-only';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { certificados, perfiles } from '@/db/schema';
import { slugLibre } from '@/lib/auth/activacion';
import type { SesionActual } from '@/lib/auth/sesion';
import { registrarEvento } from '@/lib/eventos';
import { borrarImagen, guardarImagen } from '@/lib/imagenes';
import { capitalizarNombre, linkWhatsapp, usuarioInstagram } from '@/lib/texto';

export type CamposPerfil = {
  nombre: string;
  apellido: string;
  profesion: string;
  ciudad: string;
  matricula: string;
  mostrarMatricula: boolean;
  contactoTipo: '' | 'whatsapp' | 'instagram';
  contactoValor: string;
};

export type ErroresPerfil = Partial<Record<keyof CamposPerfil | 'foto' | 'acepto', string>>;

const limpio = (v: FormDataEntryValue | null, max: number) =>
  String(v ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, max);

// Lee y valida el formulario. Los mensajes de error van al lado de cada campo.
export function leerFormularioPerfil(fd: FormData): { campos: CamposPerfil; errores: ErroresPerfil } {
  const profesionElegida = limpio(fd.get('profesion'), 60);
  const contactoTipo = String(fd.get('contactoTipo') ?? '');
  const campos: CamposPerfil = {
    nombre: limpio(fd.get('nombre'), 60),
    apellido: limpio(fd.get('apellido'), 60),
    profesion: profesionElegida === 'otra' ? limpio(fd.get('profesionOtra'), 60) : profesionElegida,
    ciudad: limpio(fd.get('ciudad'), 80),
    matricula: limpio(fd.get('matricula'), 40),
    mostrarMatricula: fd.get('mostrarMatricula') === 'si',
    contactoTipo: contactoTipo === 'whatsapp' || contactoTipo === 'instagram' ? contactoTipo : '',
    contactoValor: limpio(fd.get('contactoValor'), 80),
  };
  const errores: ErroresPerfil = {};
  if (!campos.nombre) errores.nombre = 'Escribí tu nombre.';
  if (!campos.apellido) errores.apellido = 'Escribí tu apellido.';
  if (profesionElegida === 'otra' && !campos.profesion) errores.profesion = 'Escribí tu profesión.';
  if (campos.mostrarMatricula && !campos.matricula) errores.matricula = 'Escribí tu matrícula o destildá "Mostrarla en mi perfil".';
  if (campos.contactoTipo === 'whatsapp') {
    if (!linkWhatsapp(campos.contactoValor)) errores.contactoValor = 'Revisá el número: con código de área, por ejemplo 299 412 3456.';
  } else if (campos.contactoTipo === 'instagram') {
    const u = usuarioInstagram(campos.contactoValor);
    if (!u) errores.contactoValor = 'Revisá el usuario: por ejemplo @tu.usuario.';
    else campos.contactoValor = u;
  } else {
    campos.contactoValor = '';
  }
  return { campos, errores };
}

export async function guardarPerfil(
  usuarioId: string,
  campos: CamposPerfil,
  foto: { archivo: File | null; quitar: boolean },
): Promise<{ ok: true } | { ok: false; errores: ErroresPerfil }> {
  const [actual] = await db
    .select({ fotoId: perfiles.fotoId, slug: perfiles.slug, publicadoEn: perfiles.publicadoEn })
    .from(perfiles)
    .where(eq(perfiles.usuarioId, usuarioId))
    .limit(1);
  if (!actual) return { ok: false, errores: { nombre: 'No encontramos tu perfil. Volvé a ingresar.' } };
  // Mientras nunca se publicó, el link sigue al nombre. Después ya se compartió y no cambia.
  const slug = actual.publicadoEn ? actual.slug : await slugLibre(`${campos.nombre} ${campos.apellido}`, usuarioId);

  let fotoId = actual.fotoId;
  if (foto.archivo && foto.archivo.size > 0) {
    const r = await guardarImagen(foto.archivo, { recortarCuadrada: true });
    if (!r.ok) return { ok: false, errores: { foto: r.error } };
    fotoId = r.id;
  } else if (foto.quitar) {
    fotoId = null;
  }

  await db
    .update(perfiles)
    .set({
      slug,
      nombre: campos.nombre,
      apellido: campos.apellido,
      profesion: campos.profesion || null,
      ciudad: campos.ciudad || null,
      matricula: campos.matricula || null,
      mostrarMatricula: campos.mostrarMatricula && Boolean(campos.matricula),
      contactoTipo: campos.contactoTipo || null,
      contactoValor: campos.contactoValor || null,
      fotoId,
      actualizadoEn: new Date(),
    })
    .where(eq(perfiles.usuarioId, usuarioId));
  // La foto anterior no queda guardada en ningún lado.
  if (actual.fotoId && actual.fotoId !== fotoId) await borrarImagen(actual.fotoId);
  return { ok: true };
}

// Publicar es un paso explícito. La primera vez se registra para las métricas del piloto.
export async function publicarPerfil(usuarioId: string): Promise<void> {
  const [p] = await db.select({ publicadoEn: perfiles.publicadoEn }).from(perfiles).where(eq(perfiles.usuarioId, usuarioId)).limit(1);
  if (!p) return;
  await db
    .update(perfiles)
    .set({ publico: true, publicadoEn: p.publicadoEn ?? new Date(), actualizadoEn: new Date() })
    .where(eq(perfiles.usuarioId, usuarioId));
  if (!p.publicadoEn) await registrarEvento({ tipo: 'perfil_publicado', perfilUsuarioId: usuarioId });
}

export async function ocultarPerfil(usuarioId: string): Promise<void> {
  await db.update(perfiles).set({ publico: false, actualizadoEn: new Date() }).where(eq(perfiles.usuarioId, usuarioId));
}

// Los datos guardados, como valores iniciales del formulario.
export function valoresDePerfil(p: {
  nombre: string;
  apellido: string;
  profesion: string | null;
  ciudad: string | null;
  matricula: string | null;
  mostrarMatricula: boolean;
  contactoTipo: 'whatsapp' | 'instagram' | null;
  contactoValor: string | null;
}): CamposPerfil {
  return {
    nombre: p.nombre,
    apellido: p.apellido,
    profesion: p.profesion ?? '',
    ciudad: p.ciudad ?? '',
    matricula: p.matricula ?? '',
    mostrarMatricula: p.mostrarMatricula,
    contactoTipo: p.contactoTipo ?? '',
    contactoValor: p.contactoValor ?? '',
  };
}

// Procesa el formulario del perfil (bienvenida y edición): valida, guarda y devuelve el estado
// para mostrar. La sesión y los permisos los chequea quien la llama.
export async function procesarFormularioPerfil(
  usuarioId: string,
  fd: FormData,
  intento: number,
): Promise<{ intento: number; ok?: boolean; errores?: ErroresPerfil; valores: CamposPerfil; habiaArchivo?: boolean }> {
  const archivo = fd.get('foto');
  const habiaArchivo = archivo instanceof File && archivo.size > 0;
  const { campos, errores } = leerFormularioPerfil(fd);
  if (Object.keys(errores).length > 0) return { intento, errores, valores: campos, habiaArchivo };
  const r = await guardarPerfil(usuarioId, campos, {
    archivo: archivo instanceof File ? archivo : null,
    quitar: fd.get('quitarFoto') === 'si',
  });
  if (!r.ok) return { intento, errores: r.errores, valores: campos, habiaArchivo };
  return { intento, ok: true, valores: campos };
}

// Valores iniciales del formulario de bienvenida. Si todavía no tiene perfil (entró con código y no
// aceptó), el nombre sale del certificado más reciente emitido a su mail.
export async function valoresInicialesPerfil(s: SesionActual): Promise<CamposPerfil> {
  if (s.perfil) return valoresDePerfil(s.perfil);
  const [c] = await db
    .select({ nombre: certificados.titularNombre, apellido: certificados.titularApellido })
    .from(certificados)
    .where(eq(certificados.email, s.usuario.email))
    .orderBy(desc(certificados.emitidoEn))
    .limit(1);
  return valoresDePerfil({
    nombre: capitalizarNombre(c?.nombre ?? ''),
    apellido: capitalizarNombre(c?.apellido ?? ''),
    profesion: null,
    ciudad: null,
    matricula: null,
    mostrarMatricula: false,
    contactoTipo: null,
    contactoValor: null,
  });
}
