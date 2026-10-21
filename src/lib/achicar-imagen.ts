// Achica una foto en el navegador antes de subirla. Las fotos de celular pesan 3 a 12 MB y el
// hosting (Vercel) rechaza cualquier envío de más de 4,5 MB. En el servidor igual se vuelve a
// achicar a 512 px: esto es sólo para que el envío entre.

export const MAX_MB_SUBIDA = 4;
const LADO_MAXIMO = 1600;

export type ImagenAchicada = { archivo: File; error?: undefined } | { archivo?: undefined; error: string };

export async function achicarImagen(archivo: File): Promise<ImagenAchicada> {
  let resultado = archivo;
  const rasterizable = /^image\/(jpeg|png|webp|avif|heic|heif)$/.test(archivo.type);
  if (rasterizable && archivo.size > 1024 * 1024) {
    try {
      const imagen = await createImageBitmap(archivo, { imageOrientation: 'from-image' });
      const escala = Math.min(1, LADO_MAXIMO / Math.max(imagen.width, imagen.height));
      const lienzo = document.createElement('canvas');
      lienzo.width = Math.round(imagen.width * escala);
      lienzo.height = Math.round(imagen.height * escala);
      lienzo.getContext('2d')?.drawImage(imagen, 0, 0, lienzo.width, lienzo.height);
      imagen.close();
      // PNG conserva la transparencia de los logos; el resto, JPEG.
      const tipo = archivo.type === 'image/png' ? 'image/png' : 'image/jpeg';
      const blob = await new Promise<Blob | null>((listo) => lienzo.toBlob(listo, tipo, 0.85));
      if (blob && blob.size < archivo.size) {
        const nombre = archivo.name.replace(/\.[^.]+$/, '') + (tipo === 'image/png' ? '.png' : '.jpg');
        resultado = new File([blob], nombre, { type: tipo });
      }
    } catch {
      // El navegador no la pudo abrir (por ejemplo, HEIC fuera de Safari): va como está.
    }
  }
  if (resultado.size > MAX_MB_SUBIDA * 1024 * 1024) {
    return { error: `La imagen pesa más de ${MAX_MB_SUBIDA} MB. Probá con una más liviana o con una captura de pantalla.` };
  }
  return { archivo: resultado };
}

// Imágenes que se están achicando, por formulario: si se envía antes de que terminen, el envío
// espera (si no, saldría la foto original, de más de 4,5 MB, y el hosting la rechazaría).
const enPreparacion = new WeakMap<HTMLFormElement, Promise<unknown>>();

// Para el onSubmit del formulario: frena el envío mientras se achica una imagen y lo vuelve a
// mandar cuando termina.
export function esperarImagenes(ev: { currentTarget: HTMLFormElement; preventDefault(): void }) {
  const form = ev.currentTarget;
  const espera = enPreparacion.get(form);
  if (!espera) return;
  ev.preventDefault();
  void espera.finally(() => form.requestSubmit());
}

// Reemplaza el archivo elegido en el campo por el achicado. Si no se puede, vacía el campo.
export function prepararCampoImagen(campo: HTMLInputElement): Promise<{ archivo: File | null; error?: string }> {
  const form = campo.form;
  const espera = reemplazarPorAchicada(campo);
  if (form) {
    enPreparacion.set(form, espera);
    void espera.finally(() => {
      if (enPreparacion.get(form) === espera) enPreparacion.delete(form);
    });
  }
  return espera;
}

async function reemplazarPorAchicada(campo: HTMLInputElement): Promise<{ archivo: File | null; error?: string }> {
  const elegido = campo.files?.[0];
  if (!elegido) return { archivo: null };
  const r = await achicarImagen(elegido);
  if (r.error !== undefined) {
    campo.value = '';
    return { archivo: null, error: r.error };
  }
  if (r.archivo !== elegido) {
    try {
      const dt = new DataTransfer();
      dt.items.add(r.archivo);
      campo.files = dt.files;
    } catch {
      // Navegadores sin DataTransfer: se sube la original (el servidor avisa si pesa demasiado).
      return { archivo: elegido };
    }
  }
  return { archivo: r.archivo };
}
