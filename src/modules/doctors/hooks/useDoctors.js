import { useCallback, useEffect, useState } from 'react';
import { deleteDoctor, getDoctors } from '../services/doctorService.js';

export const MIN_SEARCH_LENGTH = 3;
export const MAX_SEARCH_LENGTH = 100;
const DEFAULT_PAGE_SIZE = 10;
const SEARCH_DELAY_MS = 400;

const LOAD_ERROR =
  'No se pudo cargar el listado. Verificá la conexión e intentá de nuevo.';
const DELETE_ERROR = 'No se pudo eliminar el doctor. Intentá de nuevo.';

export function useDoctors(searchTerm, pageSize = DEFAULT_PAGE_SIZE) {
  const [doctors, setDoctors] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [page, setPage] = useState(1);

  const trimmed = searchTerm.trim();
  const query = trimmed.length >= MIN_SEARCH_LENGTH ? trimmed : '';
  const searchTooShort = trimmed.length > 0 && !query;

  // Debounce del texto de búsqueda.
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedQuery(query),
      query ? SEARCH_DELAY_MS : 0
    );
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery]);

  // Carga de datos una vez resuelto el debounce.
  useEffect(() => {
    let ignore = false;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const result = await getDoctors({
          name: debouncedQuery,
          page,
          pageSize,
        });
        if (ignore) return;
        setDoctors(result.data);
        setTotal(result.total);
      } catch (err) {
        if (!ignore) setError(err.response?.data?.message ?? LOAD_ERROR);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    load();
    return () => {
      ignore = true;
    };
  }, [debouncedQuery, page, pageSize, reloadKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  const removeDoctor = useCallback(
    async (id) => {
      setError('');
      setNotice('');
      try {
        await deleteDoctor(id);
        setNotice('Doctor eliminado correctamente.');
        if (doctors.length === 1 && page > 1) {
          setPage((p) => p - 1); // el cambio de página dispara el refetch
        } else {
          setReloadKey((key) => key + 1);
        }
      } catch (err) {
        setError(err.response?.data?.message ?? DELETE_ERROR);
      }
    },
    [doctors.length, page]
  );

  return {
    doctors,
    total,
    loading,
    error,
    notice,
    searchTooShort,
    page,
    setPage,
    pageSize,
    reload,
    removeDoctor,
  };
}
