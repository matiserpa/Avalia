// Datos fijos de las muestras del sitio comercial (perfil, vista previa en un chat y verificación).
// Son inventados y no dependen de la base: se ven igual en la demo y en el piloto, donde estas
// personas no existen. Sin mails, sin teléfonos y con una matrícula claramente ficticia.

import type { TipoCurso } from '@/db/schema';
import type { CertificadoVerificado } from '@/features/publico/verificacion';

export const INSTITUCIONES_MUESTRA = {
  instituto: { nombre: 'Instituto Demo', ciudad: 'Cipolletti, Río Negro', logo: '/comercial/logo-instituto-demo.svg' },
  asociacion: { nombre: 'Asociación Demo de Cosmiatría', ciudad: 'Neuquén', logo: '/comercial/logo-asociacion-demo.svg' },
} as const;

export type CertificadoMuestra = {
  curso: string;
  tipo: TipoCurso;
  horas: number;
  fecha: string;
  institucion: keyof typeof INSTITUCIONES_MUESTRA;
};

export const PROFESIONAL_MUESTRA = {
  nombre: 'Valentina',
  apellido: 'Ríos',
  profesion: 'Cosmiatra',
  ciudad: 'Neuquén',
  matricula: 'MP 0000',
  // Tiene 4 certificados verificados; las muestras enseñan los dos de 2025.
  totalCertificados: 4,
  certificados: [
    { curso: 'Formación Demo en Cosmiatría', tipo: 'formacion', horas: 280, fecha: '2025-12-12', institucion: 'instituto' },
    { curso: 'Taller Demo de Dermaplaning', tipo: 'workshop', horas: 6, fecha: '2025-06-07', institucion: 'asociacion' },
  ] satisfies CertificadoMuestra[],
};

// La verificación de su formación en el Instituto Demo, con la forma que usa /v/[código].
export const VERIFICACION_MUESTRA: CertificadoVerificado = {
  id: 'muestra',
  codigo: 'VR4K7M2P',
  estado: 'valido',
  titularNombre: PROFESIONAL_MUESTRA.nombre,
  titularApellido: PROFESIONAL_MUESTRA.apellido,
  emitidoEn: new Date('2025-12-12T18:00:00-03:00'),
  anuladoEn: null,
  usuarioId: null,
  curso: { nombre: 'Formación Demo en Cosmiatría', tipo: 'formacion', cargaHoraria: 280, fecha: '2025-12-12', docente: null },
  institucion: { id: 'muestra', nombre: INSTITUCIONES_MUESTRA.instituto.nombre, ciudad: INSTITUCIONES_MUESTRA.instituto.ciudad, logoId: null },
  perfil: null,
};
