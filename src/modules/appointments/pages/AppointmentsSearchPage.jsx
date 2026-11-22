import { useEffect, useMemo, useState } from 'react';
import Card from '../../shared/components/Card';
import Button from '../../shared/components/Button';
import TablePagination from '../../shared/components/TablePagination';
import { getDoctors } from '../../doctors/services/doctorService';
import { getSpecialties } from '../../specialities/services/specialtyService';
import { searchAppointments } from '../services/appointmentService';

const PAGE_SIZE = 10;
const MIN_DNI_LENGTH = 7;
const MAX_DNI_LENGTH = 10;

// Estados que devuelve el back (appointmentStatus) -> texto y colores
const STATUS = {
  BOOKED: {
    label: 'Reservado',
    badge: 'bg-med-active-bg text-med-active-text',
    dot: 'bg-med-active-text',
  },
  ATTENDED: {
    label: 'Atendido',
    badge: 'bg-slate-100 text-slate-700',
    dot: 'bg-slate-500',
  },
  CANCELLED: {
    label: 'Cancelado',
    badge: 'bg-med-danger-bg text-med-danger-text',
    dot: 'bg-med-danger-text',
  },
  NO_SHOW: {
    label: 'No asistió',
    badge: 'bg-amber-50 text-amber-700',
    dot: 'bg-amber-500',
  },
};

// Fecha de hoy en hora LOCAL con formato YYYY-MM-DD.
// (toISOString() usa UTC y de noche daría el día siguiente)
const getToday = () => new Date().toLocaleDateString('en-CA');

// '2026-10-28' -> '28 oct 2026'. Se arma con año/mes/día a mano porque
// new Date('2026-10-28') se interpreta en UTC y mostraría el día anterior.
const formatDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}/.test(value)) return value;
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const getErrorMessage = (err, fallback) => {
  if (err.response?.status === 429) {
    return 'Hiciste demasiados pedidos seguidos. Esperá unos segundos e intentá de nuevo.';
  }
  return err.response?.data?.message ?? fallback;
};

// ---------- Íconos (solo se usan en esta página) ----------

function SearchIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
      />
    </svg>
  );
}

function AppointmentIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

// ---------- Página ----------

function AppointmentsSearchPage() {
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

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');

  const [specialties, setSpecialties] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const dniInvalid = filters.dni !== '' && filters.dni.length < MIN_DNI_LENGTH;

  // Opciones de los selects (se cargan una sola vez)
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
      } catch (err) {
        if (!ignore) {
          setError(
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
  }, []);

  // Búsqueda: corre al entrar, al aplicar filtros y al cambiar de página
  useEffect(() => {
    let ignore = false;

    async function loadAppointments() {
      setLoading(true);
      setError('');
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
          setError(
            getErrorMessage(err, 'No se pudieron cargar los turnos. Intentá de nuevo.')
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
  }, [applied, page]);

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

  const updateFilter = (field, value) =>
    setFilters((current) => ({ ...current, [field]: value }));

  function handleSubmit(e) {
    e.preventDefault();
    if (dniInvalid) return;
    setApplied({ ...filters });
    setPage(1);
  }

  // Chips con los filtros que se aplicaron en la última búsqueda
  const specialtyName = specialties.find(
    (specialty) => specialty.id === applied.specialtyId
  )?.name;
  const doctorName = doctors.find((doctor) => doctor.id === applied.doctorId)?.name;
  const chips = [
    applied.dni && `DNI: ${applied.dni}`,
    specialtyName && `Especialidad: ${specialtyName}`,
    doctorName && `Doctor: ${doctorName}`,
    applied.date && `Fecha: ${formatDate(applied.date)}`,
  ].filter(Boolean);

  return (
    <div className="flex flex-col gap-6">
      {/* Título de la página */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-med-text-main">
          Búsqueda y Filtrado de Citas
        </h1>
        <p className="text-sm text-med-text-sub mt-1">
          Gestione y supervise el flujo de pacientes del departamento.
        </p>
      </div>

      {/* Card Superior: Criterios de Búsqueda */}
      <Card className="p-6">
        <div className="flex items-center justify-between pb-4 border-b border-med-border-subtle">
          <h2 className="text-base font-bold text-med-primary-900">
            Criterios de Búsqueda
          </h2>
          {lastUpdated && (
            <div className="flex items-center gap-1.5 text-xs text-med-text-muted">
              <RefreshIcon />
              <span>Última actualización: {lastUpdated}</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mt-4 items-end">
            {/* DNI */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="filter-dni"
                className="text-xs font-semibold text-med-text-sub"
              >
                DNI del Paciente
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-med-text-muted">
                  <SearchIcon />
                </span>
                <input
                  id="filter-dni"
                  type="text"
                  inputMode="numeric"
                  value={filters.dni}
                  onChange={(e) =>
                    updateFilter(
                      'dni',
                      e.target.value.replace(/\D/g, '').slice(0, MAX_DNI_LENGTH)
                    )
                  }
                  placeholder="Ej: 40123456"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-med-border rounded-lg text-med-text-main placeholder-med-text-muted focus:outline-none focus:ring-1 focus:ring-med-primary-600"
                />
              </div>
              {dniInvalid && (
                <p className="text-xs text-med-danger-text">
                  El DNI debe tener entre {MIN_DNI_LENGTH} y {MAX_DNI_LENGTH}{' '}
                  dígitos.
                </p>
              )}
            </div>

            {/* Especialidad */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="filter-specialty"
                className="text-xs font-semibold text-med-text-sub"
              >
                Especialidad
              </label>
              <select
                id="filter-specialty"
                value={filters.specialtyId}
                onChange={(e) =>
                  // al cambiar de especialidad se limpia el doctor elegido
                  setFilters((current) => ({
                    ...current,
                    specialtyId: e.target.value,
                    doctorId: '',
                  }))
                }
                className="w-full px-3 py-2 text-xs bg-white border border-med-border rounded-lg text-med-text-main focus:outline-none focus:ring-1 focus:ring-med-primary-600"
              >
                <option value="">Todas las Especialidades</option>
                {specialties.map((specialty) => (
                  <option key={specialty.id} value={specialty.id}>
                    {specialty.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Doctor */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="filter-doctor"
                className="text-xs font-semibold text-med-text-sub"
              >
                Doctor
              </label>
              <select
                id="filter-doctor"
                value={filters.doctorId}
                onChange={(e) => updateFilter('doctorId', e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-med-border rounded-lg text-med-text-main focus:outline-none focus:ring-1 focus:ring-med-primary-600"
              >
                <option value="">Todos los Doctores</option>
                {doctorOptions.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha (el back la exige) */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="filter-date"
                className="text-xs font-semibold text-med-text-sub"
              >
                Fecha
              </label>
              <input
                id="filter-date"
                type="date"
                required
                value={filters.date}
                onChange={(e) => updateFilter('date', e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-med-border rounded-lg text-med-text-main focus:outline-none focus:ring-1 focus:ring-med-primary-600"
              />
            </div>

            {/* Botón Aplicar Filtros */}
            <div>
              <Button
                type="submit"
                disabled={loading || dniInvalid}
                className="w-full flex items-center justify-center gap-2 bg-med-primary-900 hover:bg-med-primary-800 text-white font-medium py-2 rounded-lg"
              >
                <FilterIcon />
                <span>Aplicar Filtros</span>
              </Button>
            </div>
          </div>
        </form>

        {/* Chips de Filtros Activos */}
        {chips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-med-border-subtle">
            {chips.map((chip) => (
              <span
                key={chip}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-sky-100/70 text-sky-800"
              >
                {chip}
              </span>
            ))}
          </div>
        )}
      </Card>

      {/* Mensaje de error */}
      {error && (
        <p
          role="alert"
          className="px-4 py-3 rounded-lg text-sm bg-med-danger-bg text-med-danger-text"
        >
          {error}
        </p>
      )}

      {/* Card Inferior: Registros de Citas */}
      <Card className="p-0 overflow-hidden border-med-border">
        <div className="p-5 border-b border-med-border">
          <h2 className="text-base font-bold text-med-primary-900">
            Registros de Citas
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-med-primary-50/70 text-[11px] uppercase tracking-wider text-med-text-sub border-b border-med-border">
              <tr>
                <th className="px-6 py-3.5">Fecha</th>
                <th className="px-6 py-3.5">Especialidad</th>
                <th className="px-6 py-3.5">Paciente</th>
                <th className="px-6 py-3.5 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-med-border-subtle">
              {loading && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-med-text-muted"
                  >
                    Cargando turnos...
                  </td>
                </tr>
              )}

              {!loading && !error && items.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-med-text-muted"
                  >
                    No hay turnos para los filtros elegidos.
                  </td>
                </tr>
              )}

              {!loading &&
                items.map((item) => {
                  const status = STATUS[item.appointmentStatus?.toUpperCase()];

                  return (
                    <tr
                      key={item.appointmentId}
                      className="hover:bg-gray-50/70 transition-colors"
                    >
                      {/* Fecha y hora.
                          Hoy SearchItem no trae fecha ni hora: se muestra la fecha
                          del filtro. Cuando agregues slotDate, startTime y endTime
                          al DTO, esta celda los usa sola. */}
                      <td className="px-6 py-4">
                        <p className="font-bold text-med-primary-900 text-sm">
                          {formatDate(item.slotDate ?? applied.date)}
                        </p>
                        {item.startTime && (
                          <p className="text-xs text-med-text-muted mt-0.5">
                            {item.startTime}
                            {item.endTime && ` – ${item.endTime}`}
                          </p>
                        )}
                      </td>

                      {/* Especialidad y doctor */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-med-primary-100 text-med-primary-700 flex items-center justify-center shrink-0">
                            <AppointmentIcon />
                          </div>
                          <div>
                            <p className="font-semibold text-med-primary-900">
                              {item.doctor?.specialty?.name}
                            </p>
                            <p className="text-xs text-med-text-muted">
                              {item.doctor?.name}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Paciente y DNI */}
                      <td className="px-6 py-4">
                        <p className="font-semibold text-med-text-main">
                          {item.patient?.fullName}
                        </p>
                        <p className="text-xs text-med-text-muted mt-0.5">
                          DNI: {Number(item.patient?.dni).toLocaleString('es-AR')}
                        </p>
                      </td>

                      {/* Estado */}
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                            status?.badge ?? 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              status?.dot ?? 'bg-gray-400'
                            }`}
                          />
                          {status?.label ?? item.appointmentStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {!error && (
          <TablePagination
            currentPage={page}
            totalPages={Math.max(1, Math.ceil(total / PAGE_SIZE))}
            totalItems={total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        )}
      </Card>
    </div>
  );
}

export default AppointmentsSearchPage;