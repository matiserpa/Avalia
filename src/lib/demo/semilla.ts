// Datos de prueba para el ambiente demo y el desarrollo local.
//
// Todo es inventado: instituciones "Demo", personas ficticias y mails @demo.example (un dominio
// reservado que no existe, así que ningún mail puede llegarle a nadie real).
//
// El recorrido de la reunión:
// 1. Instituto Demo tiene cargado "Congreso Demo 2026" con 5 egresadas SIN emitir.
// 2. Se emiten los 5 certificados en vivo.
// 3. Camila Sosa abre su mail en la bandeja de prueba y activa su pasaporte.
// 4. Alguien escanea el QR de su certificado y lo ve verificado.
// Además, Valentina Ríos ya tiene un perfil completo y público, para mostrar cómo queda.

import sharp from 'sharp';
import { sql } from 'drizzle-orm';
import { db } from '@/db';
import {
  certificados,
  consultas,
  cursos,
  egresadas,
  eventos,
  imagenes,
  instituciones,
  perfiles,
  usuarios,
  type Canal,
  type TipoEvento,
} from '@/db/schema';
import { generarCodigo } from '@/lib/certificados/codigo';
import { DEMO } from './datos';
import { VERSION_LEGALES } from '@/lib/legales';

export { DEMO };

const TABLAS = [
  'consultas',
  'eventos',
  'correos',
  'sesiones',
  'codigos_ingreso',
  'enlaces_activacion',
  'certificados',
  'egresadas',
  'cursos',
  'perfiles',
  'usuarios',
  'instituciones',
  'imagenes',
];

export async function cargarDemoSiHaceFalta(): Promise<void> {
  const r = await db.execute(sql`select count(*)::int as n from instituciones`);
  const filas = (Array.isArray(r) ? r : (r as unknown as { rows: { n: number }[] }).rows) as { n: number }[];
  if (Number(filas[0]?.n ?? 0) === 0) await cargarDemo();
}

export async function reiniciarDemo(): Promise<void> {
  await db.execute(sql.raw(`truncate table ${TABLAS.join(', ')} restart identity cascade`));
  await cargarDemo();
}

// Logo inventado: monograma sobre un color, como SVG → WebP.
async function logoDemo(iniciales: string, fondo: string, texto: string): Promise<string> {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
<rect width="256" height="256" rx="56" fill="${fondo}"/>
<circle cx="128" cy="128" r="92" fill="none" stroke="${texto}" stroke-opacity=".35" stroke-width="4"/>
<text x="128" y="150" font-family="Georgia, 'Times New Roman', serif" font-size="78" font-weight="700" text-anchor="middle" fill="${texto}" letter-spacing="2">${iniciales}</text>
</svg>`;
  const { data, info } = await sharp(Buffer.from(svg)).webp({ quality: 90 }).toBuffer({ resolveWithObject: true });
  const [fila] = await db
    .insert(imagenes)
    .values({ mime: 'image/webp', datos: new Uint8Array(data), ancho: info.width, alto: info.height })
    .returning({ id: imagenes.id });
  return fila.id;
}

function dia(fecha: string, hora = 18): Date {
  return new Date(`${fecha}T${String(hora).padStart(2, '0')}:00:00-03:00`);
}

function haceDias(n: number, hora = 12): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hora, (n * 7) % 60, 0, 0);
  return d;
}

export async function cargarDemo(): Promise<void> {
  // ---------- instituciones ----------
  const [instituto] = await db
    .insert(instituciones)
    .values({ nombre: 'Instituto Demo', ciudad: 'Cipolletti, Río Negro', logoId: await logoDemo('ID', '#2F3B35', '#F5F3EF') })
    .returning();
  const [asociacion] = await db
    .insert(instituciones)
    .values({
      nombre: 'Asociación Demo de Cosmiatría',
      ciudad: 'Neuquén',
      logoId: await logoDemo('AD', '#E8E0D5', '#5E4433'),
    })
    .returning();

  await db.insert(usuarios).values([
    { email: DEMO.emailInstituto, institucionId: instituto.id },
    { email: DEMO.emailAsociacion, institucionId: asociacion.id },
    { email: DEMO.emailAdmin },
  ]);

  // ---------- cursos ----------
  const [congreso] = await db
    .insert(cursos)
    .values({
      institucionId: instituto.id,
      nombre: 'Congreso Demo 2026',
      tipo: 'congreso',
      cargaHoraria: 16,
      fecha: '2026-09-19',
      docente: 'Disertantes invitadas del Congreso Demo',
    })
    .returning();
  const [formacion] = await db
    .insert(cursos)
    .values({
      institucionId: instituto.id,
      nombre: 'Formación Demo en Cosmiatría',
      tipo: 'formacion',
      cargaHoraria: 280,
      fecha: '2025-12-12',
      docente: 'Lic. Carolina Méndez',
    })
    .returning();
  const [masterclass] = await db
    .insert(cursos)
    .values({
      institucionId: instituto.id,
      nombre: 'Masterclass Demo: Peelings químicos',
      tipo: 'masterclass',
      cargaHoraria: 3,
      fecha: '2026-04-18',
      docente: 'Dra. Paula Ferraro',
    })
    .returning();
  const [workshop] = await db
    .insert(cursos)
    .values({
      institucionId: asociacion.id,
      nombre: 'Taller Demo de Dermaplaning',
      tipo: 'workshop',
      cargaHoraria: 6,
      fecha: '2025-06-07',
      docente: 'Cosm. Andrea Villalba',
    })
    .returning();
  const [jornada] = await db
    .insert(cursos)
    .values({
      institucionId: asociacion.id,
      nombre: 'Jornada Demo de Actualización en Cosmiatría',
      tipo: 'jornada',
      cargaHoraria: 8,
      fecha: '2024-11-09',
      docente: 'Comisión científica de la Asociación Demo',
    })
    .returning();

  // ---------- profesionales con cuenta ----------
  const [valentina] = await db
    .insert(usuarios)
    .values({ email: DEMO.emailValentina, aceptoLegalesEn: haceDias(40), versionLegales: VERSION_LEGALES })
    .returning();
  await db.insert(perfiles).values({
    usuarioId: valentina.id,
    slug: DEMO.slugValentina,
    nombre: 'Valentina',
    apellido: 'Ríos',
    profesion: 'Cosmiatra',
    ciudad: 'Neuquén',
    matricula: 'MP 4821',
    mostrarMatricula: true,
    contactoTipo: 'instagram',
    contactoValor: 'valentina.cosmiatra.demo',
    publico: true,
    publicadoEn: haceDias(39),
  });

  const [julieta] = await db
    .insert(usuarios)
    .values({ email: 'julieta.acosta@demo.example', aceptoLegalesEn: haceDias(30), versionLegales: VERSION_LEGALES })
    .returning();
  await db.insert(perfiles).values({
    usuarioId: julieta.id,
    slug: 'julieta-acosta',
    nombre: 'Julieta',
    apellido: 'Acosta',
    profesion: 'Cosmetóloga',
    ciudad: 'Cipolletti',
    publico: false,
  });

  const [agustina] = await db
    .insert(usuarios)
    .values({ email: 'agustina.molina@demo.example', aceptoLegalesEn: haceDias(25), versionLegales: VERSION_LEGALES })
    .returning();
  await db.insert(perfiles).values({
    usuarioId: agustina.id,
    slug: 'agustina-molina',
    nombre: 'Agustina',
    apellido: 'Molina',
    profesion: 'Dermatocosmiatra',
    ciudad: 'General Roca',
    contactoTipo: 'whatsapp',
    contactoValor: '298 4123456',
    publico: true,
    publicadoEn: haceDias(24),
  });

  // ---------- egresadas y certificados ----------
  type Persona = { nombre: string; apellido: string; email: string };
  async function cargar(cursoId: string, personas: Persona[]) {
    return db
      .insert(egresadas)
      .values(personas.map((p) => ({ cursoId, ...p })))
      .returning();
  }
  async function emitir(
    e: { id: string; nombre: string; apellido: string; email: string },
    curso: { id: string; institucionId: string; fecha: string },
    extra: Partial<typeof certificados.$inferInsert> = {},
  ) {
    const [c] = await db
      .insert(certificados)
      .values({
        codigo: generarCodigo(),
        egresadaId: e.id,
        cursoId: curso.id,
        institucionId: curso.institucionId,
        titularNombre: e.nombre,
        titularApellido: e.apellido,
        email: e.email,
        emitidoEn: dia(curso.fecha, 19),
        mailEnviadoEn: dia(curso.fecha, 19),
        ...extra,
      })
      .returning();
    return c;
  }

  // Congreso Demo 2026: 5 egresadas cargadas, sin emitir. Es lo que se emite en vivo.
  await cargar(congreso.id, [
    { nombre: 'Camila', apellido: 'Sosa', email: DEMO.emailCamila },
    { nombre: 'Lucía', apellido: 'Navarro', email: 'lucia.navarro@demo.example' },
    { nombre: 'Rocío', apellido: 'Giménez', email: 'rocio.gimenez@demo.example' },
    { nombre: 'Micaela', apellido: 'Torres', email: 'micaela.torres@demo.example' },
    { nombre: 'Daniela', apellido: 'Castro', email: 'daniela.castro@demo.example' },
  ]);

  // Formación Demo: emitida hace tiempo, con estados variados.
  const ef = await cargar(formacion.id, [
    { nombre: 'Valentina', apellido: 'Ríos', email: DEMO.emailValentina },
    { nombre: 'Julieta', apellido: 'Acosta', email: 'julieta.acosta@demo.example' },
    { nombre: 'Agustina', apellido: 'Molina', email: 'agustina.molina@demo.example' },
    { nombre: 'Martina', apellido: 'López', email: 'martina.lopez@demo.example' },
    { nombre: 'Florencia', apellido: 'Paz', email: 'florencia.paz@demo.example' },
    { nombre: 'Sofía', apellido: 'Herrera', email: 'sofia.herrera@demo.example' },
  ]);
  const porEmail = (lista: typeof ef, email: string) => lista.find((x) => x.email === email)!;
  const certValentinaFormacion = await emitir(porEmail(ef, DEMO.emailValentina), formacion, {
    codigo: DEMO.codigoValentinaFormacion,
    usuarioId: valentina.id,
    activadoEn: haceDias(40),
  });
  await emitir(porEmail(ef, 'julieta.acosta@demo.example'), formacion, { usuarioId: julieta.id, activadoEn: haceDias(30) });
  const certAgustina = await emitir(porEmail(ef, 'agustina.molina@demo.example'), formacion, {
    usuarioId: agustina.id,
    activadoEn: haceDias(25),
  });
  await emitir(porEmail(ef, 'martina.lopez@demo.example'), formacion, { codigo: DEMO.codigoNoActivado });
  await emitir(porEmail(ef, 'florencia.paz@demo.example'), formacion);
  // Sofía: el primero salió con el apellido mal escrito, se anuló y se volvió a emitir.
  const sofia = porEmail(ef, 'sofia.herrera@demo.example');
  await emitir({ ...sofia, apellido: 'Hererra' }, formacion, {
    codigo: DEMO.codigoAnulado,
    estado: 'anulado',
    anuladoEn: dia('2025-12-15', 10),
    motivoAnulacion: 'El apellido estaba mal escrito. Se emitió uno nuevo.',
  });
  await emitir(sofia, formacion, { emitidoEn: dia('2025-12-15', 11), mailEnviadoEn: dia('2025-12-15', 11) });

  // Masterclass: Valentina y dos más.
  const em = await cargar(masterclass.id, [
    { nombre: 'Valentina', apellido: 'Ríos', email: DEMO.emailValentina },
    { nombre: 'Martina', apellido: 'López', email: 'martina.lopez@demo.example' },
    { nombre: 'Agustina', apellido: 'Molina', email: 'agustina.molina@demo.example' },
  ]);
  const certValentinaMasterclass = await emitir(porEmail(em, DEMO.emailValentina), masterclass, {
    codigo: DEMO.codigoValentinaMasterclass,
    usuarioId: valentina.id,
    activadoEn: dia(masterclass.fecha, 20),
  });
  await emitir(porEmail(em, 'martina.lopez@demo.example'), masterclass);
  await emitir(porEmail(em, 'agustina.molina@demo.example'), masterclass, { usuarioId: agustina.id, activadoEn: haceDias(25) });

  // Asociación: workshop y jornada, con Valentina en los dos.
  const ew = await cargar(workshop.id, [
    { nombre: 'Valentina', apellido: 'Ríos', email: DEMO.emailValentina },
    { nombre: 'Julieta', apellido: 'Acosta', email: 'julieta.acosta@demo.example' },
  ]);
  const certValentinaWorkshop = await emitir(porEmail(ew, DEMO.emailValentina), workshop, {
    usuarioId: valentina.id,
    activadoEn: haceDias(40),
  });
  await emitir(porEmail(ew, 'julieta.acosta@demo.example'), workshop, { usuarioId: julieta.id, activadoEn: haceDias(30) });

  const ej = await cargar(jornada.id, [{ nombre: 'Valentina', apellido: 'Ríos', email: DEMO.emailValentina }]);
  await emitir(ej[0], jornada, { usuarioId: valentina.id, activadoEn: haceDias(40) });

  // ---------- métricas de ejemplo (últimas 6 semanas) ----------
  type E = { tipo: TipoEvento; canal?: Canal; perfilUsuarioId?: string; certificadoId?: string; institucionId?: string; creadoEn: Date };
  const ev: E[] = [];
  ev.push({ tipo: 'cuenta_activada', perfilUsuarioId: valentina.id, creadoEn: haceDias(40) });
  ev.push({ tipo: 'perfil_publicado', perfilUsuarioId: valentina.id, creadoEn: haceDias(39) });
  ev.push({ tipo: 'cuenta_activada', perfilUsuarioId: julieta.id, creadoEn: haceDias(30) });
  ev.push({ tipo: 'cuenta_activada', perfilUsuarioId: agustina.id, creadoEn: haceDias(25) });
  ev.push({ tipo: 'perfil_publicado', perfilUsuarioId: agustina.id, creadoEn: haceDias(24) });
  const canalesCompartir: Canal[] = ['copiar_link', 'imagen_historia', 'qr_consultorio', 'compartir_nativo'];
  for (let i = 0; i < 9; i++) {
    ev.push({ tipo: 'compartir', canal: canalesCompartir[i % 4], perfilUsuarioId: i % 3 === 0 ? agustina.id : valentina.id, creadoEn: haceDias(38 - i * 4) });
  }
  const canalesVisita: Canal[] = ['historia', 'qr', 'link', 'historia', 'directo', 'link', 'historia'];
  for (let i = 0; i < 46; i++) {
    ev.push({
      tipo: 'perfil_visita',
      canal: canalesVisita[i % canalesVisita.length],
      perfilUsuarioId: i % 4 === 0 ? agustina.id : valentina.id,
      // Más visitas cuanto más reciente: el piloto va creciendo.
      creadoEn: haceDias(37 - Math.round(37 * Math.sqrt(i / 45)), 9 + (i % 12)),
    });
  }
  const certsVerificados = [certValentinaFormacion, certValentinaMasterclass, certValentinaWorkshop, certAgustina];
  for (let i = 0; i < 17; i++) {
    const c = certsVerificados[i % certsVerificados.length];
    ev.push({
      tipo: 'verificacion',
      canal: i % 3 === 0 ? 'perfil' : i % 5 === 0 ? 'codigo' : 'qr',
      certificadoId: c.id,
      institucionId: c.institucionId,
      creadoEn: haceDias(36 - Math.round(36 * Math.sqrt(i / 16)), 10 + (i % 9)),
    });
  }
  ev.push({ tipo: 'verificacion_fallida', canal: 'codigo', creadoEn: haceDias(12) });
  await db.insert(eventos).values(ev);

  // ---------- consultas del sitio (para ver cómo llegan al panel de administración) ----------
  await db.insert(consultas).values([
    {
      tipo: 'congreso',
      nombre: 'Lorena Paz',
      email: 'lorena.paz@demo.example',
      organizacion: 'Jornadas Demo de Estética',
      ciudad: 'General Roca',
      mensaje: 'Organizamos unas jornadas en marzo con unas 200 personas. ¿Podemos emitir los certificados de asistencia con ustedes?',
      aceptoPrivacidadEn: haceDias(1, 10),
      versionLegales: VERSION_LEGALES,
      creadaEn: haceDias(1, 10),
    },
    {
      tipo: 'instituto',
      nombre: 'Mariana Ortiz',
      email: 'mariana.ortiz@demo.example',
      organizacion: 'Escuela Demo de Estética',
      ciudad: 'Neuquén',
      mensaje: 'Tenemos unas 60 egresadas por año. Queremos saber cómo sumarnos al piloto.',
      aceptoPrivacidadEn: haceDias(6, 16),
      versionLegales: VERSION_LEGALES,
      respondidaEn: haceDias(5, 11),
      creadaEn: haceDias(6, 16),
    },
  ]);
}
