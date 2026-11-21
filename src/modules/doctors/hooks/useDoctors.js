import { useCallback, useEffect, useState } from 'react';
import { deleteDoctor, getDoctors } from '../services/doctorService.js';

export const MIN_SEARCH_LENGTH = 3;
export const MAX_SEARCH_LENGTH = 100;
const SEARCH_DELAY_MS = 400;

const LOAD_ERROR =
  'No se pudo cargar el listado. Verificá la conexión e intentá de nuevo.';
const DELETE_ERROR = 'No se pudo eliminar el doctor. Intentá de nuevo.';

export function useDoctors(searchTerm) {
  const [doctors, setDoctors] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const trimmed = searchTerm.trim();
  const query = trimmed.length >= MIN_SEARCH_LENGTH ? trimmed : '';
  const searchTooShort = trimmed.length > 0 && !query;

  useEffect(() => {
    let ignore = false;

    const timer = setTimeout(
      async () => {
        setLoading(true);
        setError('');
        try {
          const result = await getDoctors(query);
          if (ignore) return;
          setDoctors(result.data);
          setTotal(result.total);
        } catch (err) {
          if (!ignore) {
            setError(err.response?.data?.message ?? LOAD_ERROR);
          }
        } finally {
          if (!ignore) setLoading(false);
        }
      },
      query ? SEARCH_DELAY_MS : 0
    );

    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [query, reloadKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  const removeDoctor = useCallback(async (id) => {
    setError('');
    setNotice('');
    try {
      await deleteDoctor(id);
      setNotice('Doctor eliminado correctamente.');
      setReloadKey((key) => key + 1);
    } catch (err) {
      setError(err.response?.data?.message ?? DELETE_ERROR);
    }
  }, []);

  return {
    doctors,
    total,
    loading,
    error,
    notice,
    searchTooShort,
    reload,
    removeDoctor,
  };
}
