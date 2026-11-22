import { useEffect, useMemo, useState } from 'react';
import { getDoctors } from '../../doctors/services/doctorService';
import { getSpecialties } from '../../specialities/services/specialtyService';
import { formatDate, getToday } from '../../shared/helpers/dates';
import { getErrorMessage } from '../../shared/helpers/errors';
import { searchAppointments } from '../services/appointmentService';

export const PAGE_SIZE = 10;
export const MIN_DNI_LENGTH = 7;
export const MAX_DNI_LENGTH = 10;

export function useAppointmentsSearch() {
  // "filters" es lo que el usuario está escribiendo;
  // "applied" son los filtros con los que se hizo la última búsqueda.
  const [filters, setFilters] = useState(() => ({
    dni: '',
    specialtyId: '',
    doctorId: '',
    date: getToday(),
  }));
  const [applied, setApplied] = useState(filters);
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchError, setSearchError] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');

  const [specialties, setSpecialties] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [optionsError, setOptionsError] = useState('');

  const dniInvalid = filters.dni !== '' && filters.dni.length < MIN_DNI_LENGTH;

  // Opciones de los selects de especialidad y doctor
  useEffect(() => {
    let ignore = false;

    async function loadOptions() {
      try {
        const [specialtiesResult, doctorsResult] = await Promise.all([
          getSpecialties({ page: 1, pageSize: 100 }),
          getDoctors({ page: 1, pageSize: 100 }),
        ]);
        if (ignore) return;
        setSpecialties(specialtiesResult.data);
        setDoctors(doctorsResult.data);
        setOptionsError('');
      } catch (err) {
        if (!ignore) {
          setOptionsError(
            getErrorMessage(
              err,
              'No se pudieron cargar las especialidades y los doctores.'
            )
          );
        }
      }
    }

    loadOptions();
    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  // Búsqueda: corre al entrar, al aplicar filtros, al cambiar de página y al reintentar
  useEffect(() => {
    let ignore = false;

    async function loadAppointments() {
      setLoading(true);
      setSearchError('');
      try {
        const result = await searchAppointments({
          ...applied,
          page,
          pageSize: PAGE_SIZE,
        });
        if (ignore) return;
        setItems(result.data);
        setTotal(result.total);
        setLastUpdated(
          new Date().toLocaleTimeString('es-AR', {
            hour: '2-digit',
            minute: '2-digit',
          })
        );
      } catch (err) {
        if (!ignore) {
          setItems([]);
          setSearchError(
            getErrorMessage(
              err,
              'No se pudieron cargar los turnos. Intentá de nuevo.'
            )
          );
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadAppointments();
    return () => {
      ignore = true;
    };
  }, [applied, page, reloadKey]);

  // Si se eligió una especialidad, el select de doctores muestra solo los de esa especialidad
  const doctorOptions = useMemo(
    () =>
      filters.specialtyId
        ? doctors.filter(
            (doctor) => doctor.specialty?.specialtyId === filters.specialtyId
          )
        : doctors,
    [doctors, filters.specialtyId]
  );

  // Chips con los filtros de la última búsqueda
  const specialtyName = specialties.find(
    (specialty) => specialty.id === applied.specialtyId
  )?.name;
  const doctorName = doctors.find((doctor) => doctor.id === applied.doctorId)
    ?.name;
  const chips = [
    applied.dni && `DNI: ${applied.dni}`,
    specialtyName && `Especialidad: ${specialtyName}`,
    doctorName && `Doctor: ${doctorName}`,
    applied.date && `Fecha: ${formatDate(applied.date)}`,
  ].filter(Boolean);

  // El DNI solo admite números (el back lo recibe como número, sin puntos)
  const updateFilter = (field, value) => {
    const clean =
      field === 'dni' ? value.replace(/\D/g, '').slice(0, MAX_DNI_LENGTH) : value;
    setFilters((current) => ({ ...current, [field]: clean }));
  };

  // Al cambiar de especialidad se limpia el doctor elegido
  const changeSpecialty = (specialtyId) =>
    setFilters((current) => ({ ...current, specialtyId, doctorId: '' }));

  const applyFilters = () => {
    if (dniInvalid) return;
    setApplied({ ...filters });
    setPage(1);
  };

  const reload = () => setReloadKey((key) => key + 1);

  return {
    filters,
    applied,
    page,
    items,
    total,
    loading,
    error: searchError || optionsError,
    lastUpdated,
    specialties,
    doctorOptions,
    chips,
    dniInvalid,
    setPage,
    updateFilter,
    changeSpecialty,
    applyFilters,
    reload,
  };
}