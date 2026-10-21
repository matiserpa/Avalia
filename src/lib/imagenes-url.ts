// Separado de imagenes.ts para poder usarlo en componentes de cliente (imagenes.ts usa sharp).
export function urlImagen(id: string | null | undefined): string | null {
  return id ? `/img/${id}` : null;
}
