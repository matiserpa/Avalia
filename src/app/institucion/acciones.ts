'use server';

// Acciones del panel de la institución. Cada una vuelve a chequear la sesión y usa el
// institucionId de la sesión, nunca uno que venga del formulario.

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { crearCurso, type ErroresCurso, type CamposCurso } from '@/features/institucion/cursos';
import { agregarEgresada, cargarFilas, editarEgresada, quitarEgresada, revisarFilas, type CamposEgresada, type ErroresEgresada } from '@/features/institucion/egresadas';
import { anularCertificado, emitirCurso, linkParaCompartir, reenviarMail } from '@/features/institucion/emision';
import { leerPlanilla, textoDeArchivo, type FilaPlanilla } from '@/features/institucion/planilla';
import { requerirInstitucion } from '@/lib/auth/guardas';

const texto = (fd: FormData, k: string) => String(fd.get(k) ?? '');

// ---------- cursos ----------

export type EstadoCurso = { intento: number; errores?: ErroresCurso; valores?: CamposCurso };

export async function nuevoCurso(prev: EstadoCurso, fd: FormData): Promise<EstadoCurso> {
  const s = await requerirInstitucion();
  const valores: CamposCurso = {
    nombre: texto(fd, 'nombre'),
    tipo: texto(fd, 'tipo'),
    cargaHoraria: texto(fd, 'cargaHoraria'),
    fecha: texto(fd, 'fecha'),
    docente: texto(fd, 'docente'),
  };
  const r = await crearCurso(s.institucionId, valores);
  if (!r.ok) return { intento: prev.intento + 1, errores: r.errores, valores };
  redirect(`/institucion/cursos/${r.id}?nuevo=1`);
}

// ---------- egresadas ----------

// Con errores, el formulario se vuelve a armar (intento + 1) con lo que se escribió: React vacía
// los formularios al terminar la acción.
export type EstadoEgresada = { intento: number; ok?: boolean; errores?: ErroresEgresada; error?: string; valores?: CamposEgresada };

export async function agregar(prev: EstadoEgresada, fd: FormData): Promise<EstadoEgresada> {
  const s = await requerirInstitucion();
  const cursoId = texto(fd, 'cursoId');
  const valores = { nombre: texto(fd, 'nombre'), apellido: texto(fd, 'apellido'), email: texto(fd, 'email') };
  const r = await agregarEgresada(s.institucionId, cursoId, valores);
  if (!r.ok) return { intento: prev.intento + 1, errores: r.errores, valores };
  revalidatePath(`/institucion/cursos/${cursoId}`);
  return { intento: prev.intento + 1, ok: true };
}

export async function corregir(prev: EstadoEgresada, fd: FormData): Promise<EstadoEgresada> {
  const s = await requerirInstitucion();
  const valores = { nombre: texto(fd, 'nombre'), apellido: texto(fd, 'apellido'), email: texto(fd, 'email') };
  const r = await editarEgresada(s.institucionId, texto(fd, 'egresadaId'), valores);
  if (!r.ok) return { intento: prev.intento + 1, errores: r.errores, valores };
  revalidatePath(`/institucion/cursos/${texto(fd, 'cursoId')}`);
  return { intento: prev.intento + 1, ok: true };
}

export async function quitar(_prev: EstadoEgresada, fd: FormData): Promise<EstadoEgresada> {
  const s = await requerirInstitucion();
  const r = await quitarEgresada(s.institucionId, texto(fd, 'egresadaId'));
  if (!r.ok) return { intento: 0, error: r.error };
  revalidatePath(`/institucion/cursos/${texto(fd, 'cursoId')}`);
  return { intento: 0, ok: true };
}

// ---------- planilla ----------

export type EstadoPlanilla =
  | { paso: 'pegar'; error?: string; errorArchivo?: string; texto?: string }
  | { paso: 'revisar'; filas: FilaPlanilla[]; avisos: string[] };

const MAX_CSV = 1024 * 1024;


export async function revisarPlanilla(_prev: EstadoPlanilla, fd: FormData): Promise<EstadoPlanilla> {
  const s = await requerirInstitucion();
  const cursoId = texto(fd, 'cursoId');
  let contenido = texto(fd, 'filas');
  const archivo = fd.get('archivo');
  if (archivo instanceof File && archivo.size > 0) {
    if (archivo.size > MAX_CSV) return { paso: 'pegar', errorArchivo: 'El archivo pesa más de 1 MB. Probá pegando las filas.', texto: texto(fd, 'filas') };
    contenido = textoDeArchivo(new Uint8Array(await archivo.arrayBuffer()));
  }
  const r = leerPlanilla(contenido);
  if (r.error) return { paso: 'pegar', error: r.error, texto: texto(fd, 'filas') };
  return { paso: 'revisar', filas: await revisarFilas(s.institucionId, cursoId, r.filas), avisos: r.avisos };
}

export async function confirmarCarga(fd: FormData) {
  const s = await requerirInstitucion();
  const cursoId = texto(fd, 'cursoId');
  let filas: { nombre: string; apellido: string; email: string }[] = [];
  try {
    filas = JSON.parse(texto(fd, 'filas'));
  } catch {
    filas = [];
  }
  const n = await cargarFilas(s.institucionId, cursoId, Array.isArray(filas) ? filas : []);
  revalidatePath(`/institucion/cursos/${cursoId}`);
  redirect(`/institucion/cursos/${cursoId}?cargadas=${n}`);
}

// ---------- emisión y certificados ----------

export async function emitir(fd: FormData) {
  const s = await requerirInstitucion();
  const cursoId = texto(fd, 'cursoId');
  const r = await emitirCurso(s.institucionId, cursoId, texto(fd, 'firma'));
  if (r.cambio) redirect(`/institucion/cursos/${cursoId}/emitir?cambio=1`);
  revalidatePath('/institucion');
  redirect(`/institucion/cursos/${cursoId}?emitidos=${r.emitidos}&errores=${r.mailsConError}`);
}

export type EstadoCertificado =
  | { tipo: 'nada' }
  // motivo: lo que escribió al anular, para no perderlo si hay un error.
  | { tipo: 'mensaje'; ok: boolean; texto: string; motivo?: string; intento?: number }
  | { tipo: 'link'; link: string; mensaje: string };

export async function accionCertificado(prev: EstadoCertificado, fd: FormData): Promise<EstadoCertificado> {
  const s = await requerirInstitucion();
  const certificadoId = texto(fd, 'certificadoId');
  const cursoId = texto(fd, 'cursoId');
  const que = texto(fd, 'accion');
  if (que === 'reenviar') {
    const r = await reenviarMail(s.institucionId, certificadoId);
    revalidatePath(`/institucion/cursos/${cursoId}`);
    return { tipo: 'mensaje', ok: r.ok, texto: r.ok ? 'Listo, le mandamos el mail de nuevo.' : r.error! };
  }
  if (que === 'link') {
    const r = await linkParaCompartir(s.institucionId, certificadoId);
    return r.ok ? { tipo: 'link', link: r.link, mensaje: r.mensaje } : { tipo: 'mensaje', ok: false, texto: r.error };
  }
  if (que === 'anular') {
    const r = await anularCertificado(s.institucionId, certificadoId, texto(fd, 'motivo'));
    if (!r.ok) {
      const intento = (prev.tipo === 'mensaje' ? (prev.intento ?? 0) : 0) + 1;
      return { tipo: 'mensaje', ok: false, texto: r.error!, motivo: texto(fd, 'motivo'), intento };
    }
    // La fila cambia a "sin certificado": el aviso va arriba de la página.
    revalidatePath(`/institucion/cursos/${cursoId}`);
    redirect(`/institucion/cursos/${cursoId}?anulado=1`);
  }
  return { tipo: 'nada' };
}
