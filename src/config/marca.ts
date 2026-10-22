// Todo lo que cambia con la marca vive acá y en src/components/marca/. El nombre es Avalya
// (provisorio: la marca se define más adelante); el dominio todavía no está definido (sale de APP_URL).
// Colores: src/app/globals.css (tokens --color-*). Tipografía: src/app/fuentes.ts.

export const MARCA = {
  // Nombre del producto tal como se lee en pantalla, mails y certificados.
  nombre: 'Avalya',
  // Versión corta para lugares chicos (pestaña del navegador, encabezado en celular).
  nombreCorto: 'Avalya',
  // Una línea que explica qué es.
  bajada: 'La formación de tu profesional de la estética, verificada.',
  descripcion:
    'Certificados verificables y perfil profesional para cosmetólogas, cosmiatras y médicas estéticas.',
  // Quién lo hace. Aparece en el pie y en los textos legales.
  responsable: 'Impulso Creativo',
  // Para consultas de instituciones y de privacidad.
  emailContacto: 'hola@impulsocreativo.com.ar',
} as const;
