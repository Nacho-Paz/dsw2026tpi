import { useCallback, useEffect, useState } from 'react';
import { getDashboardOverview } from '../services/dashboardService';

const LOAD_ERROR =
  'No se pudo cargar el resumen. Verificá la conexión e intentá de nuevo.';

export function useDashboardOverview() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function loadOverview() {
      setLoading(true);
      setError('');
      try {
        const result = await getDashboardOverview();
        if (!ignore) setOverview(result);
      } catch (err) {
        if (!ignore) {
          setError(err.response?.data?.message ?? LOAD_ERROR);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadOverview();
    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  return { overview, loading, error, reload };
}
