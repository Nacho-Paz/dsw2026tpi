// Fecha de hoy en hora LOCAL con formato YYYY-MM-DD.
// (toISOString() usa UTC y de noche daría el día siguiente)
export const getToday = () => new Date().toLocaleDateString('en-CA');

// '2026-10-28' -> '28 oct 2026'.
// Se arma con año/mes/día a mano porque new Date('2026-10-28') se interpreta
// en UTC y en Argentina (UTC-3) mostraría el día anterior.
export const formatDate = (value) => {
  if (!value || !/^\d{4}-\d{2}-\d{2}/.test(value)) return value ?? '';

  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};