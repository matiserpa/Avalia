// Consultas del formulario de contacto del sitio comercial (/contacto).
//
// - Se guarda sólo lo necesario para responder, con el momento en que aceptó el aviso de
//   privacidad y la versión de los textos legales.
// - Contra el spam: un campo trampa que una persona no ve (si viene lleno, se descarta sin avisar),
//   un tope de consultas por mail por día (las de más se descartan sin avisar: ya tenemos cómo
//   responderle) y un tope general por hora.
// - En modo demo no se guarda ni se manda nada: el sitio de la demo es público y cualquiera entra
//   al panel de administración, así que lo que alguien escriba de verdad quedaría a la vista.
// - El aviso a la agencia sale después de responder (`programar`), para no demorar la respuesta.
// - Se borran solas a los 12 meses de llegar, como dice la política de privacidad.

import 'server-only';
import { and, count, desc, eq, gt, lt } from 'drizzle-orm';
import { db } from '@/db';
import { consultas, TIPOS_CONSULTA, type TipoConsulta } from '@/db/schema';
import { MARCA } from '@/config/marca';
import { modoDemo, urlBase } from '@/lib/config';
import { enviarCorreo } from '@/lib/correo/enviar';
import { correoConsulta } from '@/lib/correo/plantillas';
import { VERSION_LEGALES } from '@/lib/legales';
import { emailValido, normalizarEmail } from '@/lib/texto';

export const MAXIMOS = { nombre: 120, email: 200, telefono: 40, organizacion: 160, ciudad: 80, mensaje: 2000 } as const;
const MAX_POR_MAIL_POR_DIA = 3;
const MAX_POR_HORA = 60;
const CONSERVACION_MS = 365 * 24 * 60 * 60 * 1000;

async function borrarVencidas(): Promise<void> {
  await db.delete(consultas).where(lt(consultas.creadaEn, new Date(Date.now() - CONSERVACION_MS)));
}

export const NOMBRES_TIPO: Record<TipoConsulta, string> = {
  instituto: 'Instituto o escuela',
  asociacion: 'Asociación profesional',
  congreso: 'Congreso o jornada',
  profesional: 'Profesional',
  otro: 'Otro',
};

export type CamposConsulta = 'tipo' | 'nombre' | 'email' | 'telefono' | 'organizacion' | 'ciudad' | 'mensaje' | 'acepto';
export type ErroresConsulta = Partial<Record<CamposConsulta, string>>;

export type DatosConsulta = {
  tipo: string;
  nombre: string;
  email: string;
  telefono: string;
  organizacion: string;
  ciudad: string;
  mensaje: string;
  acepto: boolean;
  // Campo trampa: invisible para las personas.
  trampa: string;
};

type Valores = {
  tipo: TipoConsulta;
  nombre: string;
  email: string;
  telefono: string | null;
  organizacion: string | null;
  ciudad: string | null;
  mensaje: string | null;
};

const limpiar = (s: string) => String(s ?? '').replace(/\s+/g, ' ').trim();
// El mensaje conserva los saltos de línea, pero no más de dos seguidos.
const limpiarMensaje = (s: string) =>
  String(s ?? '')
    .replace(/\r\n?/g, '\n')
    .replace(/[^\S\n]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

export function validarConsulta(d: DatosConsulta): { ok: true; valores: Valores } | { ok: false; errores: ErroresConsulta } {
  const errores: ErroresConsulta = {};
  const tipo = limpiar(d.tipo);
  const nombre = limpiar(d.nombre);
  const email = normalizarEmail(d.email);
  const telefono = limpiar(d.telefono);
  const organizacion = limpiar(d.organizacion);
  const ciudad = limpiar(d.ciudad);
  const mensaje = limpiarMensaje(d.mensaje);

  if (!(TIPOS_CONSULTA as readonly string[]).includes(tipo)) errores.tipo = 'Elegí una opción.';
  if (!nombre) errores.nombre = 'Escribí tu nombre y apellido.';
  else if (nombre.length > MAXIMOS.nombre) errores.nombre = `Usá hasta ${MAXIMOS.nombre} caracteres.`;
  if (!email) errores.email = 'Escribí tu mail.';
  else if (email.length > MAXIMOS.email || !emailValido(email)) {
    errores.email = 'Revisá el mail: tiene que tener una @ y terminar en algo como .com o .com.ar.';
  }
  if (telefono) {
    const digitos = telefono.replace(/\D/g, '');
    if (telefono.length > MAXIMOS.telefono || !/^[\d\s()+-]+$/.test(telefono) || digitos.length < 6 || digitos.length > 15) {
      errores.telefono = 'Revisá el número: escribilo con el código de área, sólo con números.';
    }
  }
  if (organizacion.length > MAXIMOS.organizacion) errores.organizacion = `Usá hasta ${MAXIMOS.organizacion} caracteres.`;
  if (ciudad.length > MAXIMOS.ciudad) errores.ciudad = `Usá hasta ${MAXIMOS.ciudad} caracteres.`;
  if (mensaje.length > MAXIMOS.mensaje) errores.mensaje = 'Usá hasta 2.000 caracteres. Lo que falte, lo hablamos por mail.';
  if (!d.acepto) errores.acepto = 'Para responderte necesitamos que aceptes el aviso de privacidad.';

  if (Object.keys(errores).length) return { ok: false, errores };
  return {
    ok: true,
    valores: {
      tipo: tipo as TipoConsulta,
      nombre,
      email,
      telefono: telefono || null,
      organizacion: organizacion || null,
      ciudad: ciudad || null,
      mensaje: mensaje || null,
    },
  };
}

export type ResultadoConsulta =
  | { ok: true; demo: boolean }
  | { ok: false; errores: ErroresConsulta }
  | { ok: false; error: string };

export async function recibirConsulta(
  d: DatosConsulta,
  // Cuándo mandar el aviso. En una acción de servidor, `after` de Next: después de responder.
  programar: (tarea: () => Promise<void>) => void | Promise<void> = (tarea) => tarea(),
): Promise<ResultadoConsulta> {
  // Un robot completó el campo invisible: le decimos que salió bien y no guardamos nada.
  if (limpiar(d.trampa)) return { ok: true, demo: modoDemo() };

  const v = validarConsulta(d);
  if (!v.ok) return v;
  if (modoDemo()) return { ok: true, demo: true };

  await borrarVencidas();
  const ahora = Date.now();
  const [{ porMail }] = await db
    .select({ porMail: count() })
    .from(consultas)
    .where(and(eq(consultas.email, v.valores.email), gt(consultas.creadaEn, new Date(ahora - 24 * 60 * 60 * 1000))));
  if (porMail >= MAX_POR_MAIL_POR_DIA) return { ok: true, demo: false };

  const [{ enLaHora }] = await db
    .select({ enLaHora: count() })
    .from(consultas)
    .where(gt(consultas.creadaEn, new Date(ahora - 60 * 60 * 1000)));
  if (enLaHora >= MAX_POR_HORA) {
    return { ok: false, error: `Estamos recibiendo muchas consultas. Probá de nuevo en un rato o escribinos a ${MARCA.emailContacto}.` };
  }

  const [fila] = await db
    .insert(consultas)
    .values({ ...v.valores, aceptoPrivacidadEn: new Date(ahora), versionLegales: VERSION_LEGALES })
    .returning();

  await programar(async () => {
    const envio = await enviarCorreo(
      correoConsulta({
        para: MARCA.emailContacto,
        tipo: NOMBRES_TIPO[fila.tipo],
        nombre: fila.nombre,
        email: fila.email,
        telefono: fila.telefono,
        organizacion: fila.organizacion,
        ciudad: fila.ciudad,
        mensaje: fila.mensaje,
        enlace: `${urlBase()}/admin/consultas`,
      }),
    );
    if (!envio.ok) console.error('No salió el aviso de una consulta nueva.');
  });
  return { ok: true, demo: false };
}

// ---------- panel de administración ----------

export async function listarConsultas() {
  await borrarVencidas();
  return db.select().from(consultas).orderBy(desc(consultas.creadaEn)).limit(500);
}

export async function marcarRespondida(id: string, respondida: boolean): Promise<boolean> {
  const r = await db
    .update(consultas)
    .set({ respondidaEn: respondida ? new Date() : null })
    .where(eq(consultas.id, id))
    .returning({ id: consultas.id });
  return r.length > 0;
}

export async function borrarConsulta(id: string): Promise<boolean> {
  const r = await db.delete(consultas).where(eq(consultas.id, id)).returning({ id: consultas.id });
  return r.length > 0;
}
