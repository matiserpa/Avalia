// Versión de los términos y la política de privacidad. Se guarda con el consentimiento de cada
// profesional (usuarios.version_legales): si los textos cambian, se sube la versión.
export const VERSION_LEGALES = '2026-10-borrador-2';
export const FECHA_LEGALES = 'octubre de 2026';

// ¿Aceptó la versión vigente? Si los textos cambiaron, se le vuelve a pedir antes de usar el panel.
export function consentimientoVigente(u: { aceptoLegalesEn: Date | null; versionLegales: string | null }): boolean {
  return Boolean(u.aceptoLegalesEn) && u.versionLegales === VERSION_LEGALES;
}
