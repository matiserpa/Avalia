// Modelo de datos del proyecto (el nombre de la marca vive en src/config/marca.ts).
//
// Tres ideas lo ordenan:
// 1. El certificado es de la institución: guarda una COPIA del nombre de la titular al momento
//    de emitirse, y no se edita nunca. Si hubo un error, se anula y se emite otro.
// 2. La cuenta es de la profesional: se crea recién cuando acepta términos y privacidad, y al
//    borrarla se van su perfil, su foto, su contacto y sus métricas. Los certificados quedan,
//    desvinculados, porque son registro de la institución (decisión a validar con el abogado).
// 3. No guardamos lo que no usamos: ni DNI, ni IP, ni navegador de quien visita.
//
// Detalle completo en docs/modelo-de-datos.md.

import { sql } from 'drizzle-orm';
import {
  boolean,
  customType,
  date,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

// PGlite devuelve Uint8Array y postgres-js devuelve Buffer: los dos son Uint8Array.
const bytea = customType<{ data: Uint8Array; driverData: Uint8Array }>({
  dataType() {
    return 'bytea';
  },
});

const ahora = () => timestamp({ withTimezone: true }).notNull().defaultNow();
const momento = () => timestamp({ withTimezone: true });

// ---------- imágenes (logos de instituciones y fotos de perfil) ----------
// Se guardan en la base: son pocas y chicas (se achican a 512 px en WebP al subirlas), y así el
// piloto no depende de un servicio de archivos aparte.
export const imagenes = pgTable('imagenes', {
  id: uuid().primaryKey().defaultRandom(),
  mime: text().notNull(),
  datos: bytea().notNull(),
  ancho: integer().notNull(),
  alto: integer().notNull(),
  creadaEn: ahora(),
});

// ---------- instituciones ----------
export const instituciones = pgTable('instituciones', {
  id: uuid().primaryKey().defaultRandom(),
  nombre: text().notNull(),
  ciudad: text(),
  logoId: uuid().references(() => imagenes.id, { onDelete: 'set null' }),
  creadaEn: ahora(),
});

// ---------- usuarios ----------
// Toda persona que ingresa: profesionales, personas de una institución y administradores.
// Quién es admin lo dice la variable ADMIN_EMAILS, no la base.
export const usuarios = pgTable(
  'usuarios',
  {
    id: uuid().primaryKey().defaultRandom(),
    // Siempre en minúsculas y sin espacios (ver normalizarEmail).
    email: text().notNull(),
    // Si es parte del equipo de una institución. Una persona, una institución: alcanza para el piloto.
    institucionId: uuid().references(() => instituciones.id, { onDelete: 'set null' }),
    // Consentimiento explícito (Ley 25.326). Null = todavía no aceptó: no puede usar el panel.
    aceptoLegalesEn: momento(),
    versionLegales: text(),
    creadoEn: ahora(),
    ultimoIngresoEn: momento(),
  },
  (t) => [uniqueIndex('usuarios_email_unico').on(t.email)],
);

// ---------- perfiles ----------
// Sólo las profesionales tienen perfil. Arranca privado: publicarlo es un paso explícito.
export const perfiles = pgTable(
  'perfiles',
  {
    usuarioId: uuid()
      .primaryKey()
      .references(() => usuarios.id, { onDelete: 'cascade' }),
    // Lo que va en el link corto: /p/valentina-rios
    slug: text().notNull(),
    nombre: text().notNull(),
    apellido: text().notNull(),
    // Todo lo que sigue lo declara ella: en pantalla nunca lleva el sello de verificado.
    profesion: text(),
    ciudad: text(),
    matricula: text(),
    mostrarMatricula: boolean().notNull().default(false),
    contactoTipo: text({ enum: ['whatsapp', 'instagram'] }),
    contactoValor: text(),
    fotoId: uuid().references(() => imagenes.id, { onDelete: 'set null' }),
    publico: boolean().notNull().default(false),
    publicadoEn: momento(),
    creadoEn: ahora(),
    actualizadoEn: ahora(),
  },
  (t) => [uniqueIndex('perfiles_slug_unico').on(t.slug)],
);

// ---------- cursos ----------
export const tipoCurso = pgEnum('tipo_curso', ['formacion', 'masterclass', 'congreso', 'workshop', 'jornada']);

export const cursos = pgTable(
  'cursos',
  {
    id: uuid().primaryKey().defaultRandom(),
    institucionId: uuid()
      .notNull()
      .references(() => instituciones.id, { onDelete: 'restrict' }),
    nombre: text().notNull(),
    tipo: tipoCurso().notNull(),
    // En horas; admite medias horas (una masterclass de 2,5 h).
    cargaHoraria: numeric({ precision: 6, scale: 1, mode: 'number' }).notNull(),
    // Fecha de realización, o de finalización si dura varios meses. Es la que figura en el certificado.
    fecha: date({ mode: 'string' }).notNull(),
    // Docente o disertante. Texto libre: puede ser más de una persona.
    docente: text(),
    creadoEn: ahora(),
  },
  (t) => [index('cursos_institucion').on(t.institucionId)],
);

// ---------- egresadas ----------
// Las personas que la institución carga en un curso. Todavía no son certificados: lo son
// cuando se emiten. Nada de DNI: la planilla puede traerlo, pero no se guarda.
export const egresadas = pgTable(
  'egresadas',
  {
    id: uuid().primaryKey().defaultRandom(),
    cursoId: uuid()
      .notNull()
      .references(() => cursos.id, { onDelete: 'cascade' }),
    nombre: text().notNull(),
    apellido: text().notNull(),
    email: text().notNull(),
    creadaEn: ahora(),
  },
  (t) => [uniqueIndex('egresadas_curso_email').on(t.cursoId, t.email)],
);

// ---------- certificados ----------
export const estadoCertificado = pgEnum('estado_certificado', ['valido', 'anulado']);

export const certificados = pgTable(
  'certificados',
  {
    id: uuid().primaryKey().defaultRandom(),
    // 8 caracteres en base 32 de Crockford, sin I, L, O ni U. Se muestra como XXXX-XXXX.
    codigo: text().notNull(),
    egresadaId: uuid()
      .notNull()
      .references(() => egresadas.id, { onDelete: 'restrict' }),
    cursoId: uuid()
      .notNull()
      .references(() => cursos.id, { onDelete: 'restrict' }),
    institucionId: uuid()
      .notNull()
      .references(() => instituciones.id, { onDelete: 'restrict' }),
    // Copia de los datos de la egresada al emitir: el certificado no cambia aunque cambie la carga.
    titularNombre: text().notNull(),
    titularApellido: text().notNull(),
    email: text().notNull(),
    // La profesional dueña, cuando ya tiene cuenta. Si borra la cuenta, vuelve a null.
    usuarioId: uuid().references(() => usuarios.id, { onDelete: 'set null' }),
    activadoEn: momento(),
    // Ocultarlo del perfil NO lo invalida: el código sigue verificando.
    visibleEnPerfil: boolean().notNull().default(true),
    estado: estadoCertificado().notNull().default('valido'),
    emitidoEn: ahora(),
    anuladoEn: momento(),
    motivoAnulacion: text(),
    // Último envío del mail de activación, y el error si el proveedor lo rechazó.
    mailEnviadoEn: momento(),
    mailError: text(),
  },
  (t) => [
    uniqueIndex('certificados_codigo_unico').on(t.codigo),
    index('certificados_email').on(t.email),
    index('certificados_usuario').on(t.usuarioId),
    index('certificados_curso').on(t.cursoId),
    // Una egresada tiene a lo sumo un certificado válido por curso (los anulados no cuentan).
    uniqueIndex('certificados_egresada_valido')
      .on(t.egresadaId)
      .where(sql`estado = 'valido'`),
  ],
);

// ---------- enlaces de activación ----------
// El link del mail ("Activar mi pasaporte") y el que la institución copia para mandar por
// WhatsApp. Se guarda sólo el hash: el link completo existe únicamente en el mail o el mensaje.
export const enlacesActivacion = pgTable('enlaces_activacion', {
  id: uuid().primaryKey().defaultRandom(),
  certificadoId: uuid()
    .notNull()
    .references(() => certificados.id, { onDelete: 'cascade' }),
  tokenHash: text().notNull().unique(),
  creadoEn: ahora(),
  expiraEn: momento().notNull(),
  usadoEn: momento(),
});

// ---------- códigos de ingreso ----------
// Ingreso sin contraseña: un código de 6 dígitos por mail, válido 10 minutos y 5 intentos.
export const codigosIngreso = pgTable(
  'codigos_ingreso',
  {
    id: uuid().primaryKey().defaultRandom(),
    email: text().notNull(),
    codigoHash: text().notNull(),
    intentos: integer().notNull().default(0),
    creadoEn: ahora(),
    expiraEn: momento().notNull(),
    usadoEn: momento(),
  },
  (t) => [index('codigos_email').on(t.email)],
);

// ---------- sesiones ----------
// La cookie lleva el token; acá sólo su hash.
export const sesiones = pgTable(
  'sesiones',
  {
    tokenHash: text().primaryKey(),
    usuarioId: uuid()
      .notNull()
      .references(() => usuarios.id, { onDelete: 'cascade' }),
    creadaEn: ahora(),
    expiraEn: momento().notNull(),
  },
  (t) => [index('sesiones_usuario').on(t.usuarioId)],
);

// ---------- eventos (métricas del piloto) ----------
// Sin IP, sin navegador, sin cookies de seguimiento: sólo qué pasó, sobre qué y por qué canal.
// Las visitas de la propia profesional a su perfil no se registran.
export const TIPOS_EVENTO = [
  'perfil_visita', // alguien abrió un perfil público
  'verificacion', // alguien abrió la verificación de un certificado (válido o anulado)
  'verificacion_fallida', // código que no existe
  'compartir', // la profesional tocó copiar link, compartir, descargar QR o historia (canal dice cuál)
  'pdf_descarga', // la profesional descargó el PDF de un certificado
  'perfil_publicado',
  'cuenta_activada',
] as const;

export const CANALES = [
  'qr', // QR del certificado o del consultorio
  'historia', // imagen de historia de Instagram
  'link', // link copiado o compartido
  'codigo', // código escrito a mano en /verificar
  'perfil', // desde un perfil a la verificación
  'verificacion', // desde una verificación al perfil
  'directo', // sin marca
  // canales de "compartir":
  'copiar_link',
  'compartir_nativo',
  'qr_consultorio',
  'imagen_historia',
] as const;

export const eventos = pgTable(
  'eventos',
  {
    id: uuid().primaryKey().defaultRandom(),
    tipo: text({ enum: TIPOS_EVENTO }).notNull(),
    canal: text({ enum: CANALES }),
    // El perfil involucrado. Al borrar la cuenta se borran sus eventos.
    perfilUsuarioId: uuid().references(() => usuarios.id, { onDelete: 'cascade' }),
    certificadoId: uuid().references(() => certificados.id, { onDelete: 'cascade' }),
    institucionId: uuid().references(() => instituciones.id, { onDelete: 'cascade' }),
    creadoEn: ahora(),
  },
  (t) => [index('eventos_tipo_fecha').on(t.tipo, t.creadoEn)],
);

// ---------- correos ----------
// Registro de cada mail. Sirve para el "no me llegó" (¿salió? ¿lo rechazó el proveedor?) y, en
// modo demo, como bandeja de entrada en pantalla. El cuerpo se guarda SOLO en modo bandeja:
// en producción lleva links de ingreso que no tienen por qué quedar en la base.
export const correos = pgTable(
  'correos',
  {
    id: uuid().primaryKey().defaultRandom(),
    para: text().notNull(),
    asunto: text().notNull(),
    plantilla: text().notNull(),
    html: text(),
    texto: text(),
    estado: text({ enum: ['enviado', 'error', 'bandeja'] }).notNull(),
    error: text(),
    certificadoId: uuid().references(() => certificados.id, { onDelete: 'set null' }),
    creadoEn: ahora(),
  },
  (t) => [index('correos_para').on(t.para)],
);

export type Institucion = typeof instituciones.$inferSelect;
export type Usuario = typeof usuarios.$inferSelect;
export type Perfil = typeof perfiles.$inferSelect;
export type Curso = typeof cursos.$inferSelect;
export type TipoCurso = (typeof tipoCurso.enumValues)[number];
export type Egresada = typeof egresadas.$inferSelect;
export type Certificado = typeof certificados.$inferSelect;
export type TipoEvento = (typeof TIPOS_EVENTO)[number];
export type Canal = (typeof CANALES)[number];
