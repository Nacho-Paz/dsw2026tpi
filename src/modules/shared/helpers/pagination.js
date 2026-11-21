// Convierte el número de página de la UI (empieza en 1) al pageIndex del backend
export function toPageIndex(page) {
  const n = Number(page);
  return Number.isFinite(n) && n > 1 ? n - 1 : 0;
}