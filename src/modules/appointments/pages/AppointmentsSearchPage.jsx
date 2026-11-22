import Card from '../../shared/components/Card';
import Button from '../../shared/components/Button';
import TablePagination from '../../shared/components/TablePagination';
import AppointmentRow from '../components/AppointmentRow';
import {
  FilterIcon,
  RefreshIcon,
  SearchIcon,
} from '../components/AppointmentIcons';
import {
  MAX_DNI_LENGTH,
  MIN_DNI_LENGTH,
  PAGE_SIZE,
  useAppointmentsSearch,
} from '../hooks/useAppointmentsSearch';

const TABLE_COLUMNS = 4;

function TableMessage({ children }) {
  return (
    <tr>
      <td
        colSpan={TABLE_COLUMNS}
        className="px-6 py-10 text-center text-sm text-med-text-muted"
      >
        {children}
      </td>
    </tr>
  );
}

function AppointmentsSearchPage() {
  const {
    filters,
    applied,
    page,
    items,
    total,
    loading,
    error,
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
  } = useAppointmentsSearch();

  const handleSubmit = (e) => {
    e.preventDefault();
    applyFilters();
  };

  const isEmpty = !loading && !error && items.length === 0;

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

      {/* Criterios de búsqueda */}
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
                  onChange={(e) => updateFilter('dni', e.target.value)}
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
                onChange={(e) => changeSpecialty(e.target.value)}
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

            {/* Aplicar filtros */}
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

        {/* Chips de filtros activos */}
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

      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-lg text-sm bg-med-danger-bg text-med-danger-text"
        >
          <span>{error}</span>
          <Button
            onClick={reload}
            className="bg-med-primary-700 hover:bg-med-primary-800 text-white"
          >
            Reintentar
          </Button>
        </div>
      )}

      {/* Registros de citas */}
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
              {loading && <TableMessage>Cargando turnos...</TableMessage>}

              {isEmpty && (
                <TableMessage>No hay turnos para los filtros elegidos.</TableMessage>
              )}

              {!loading &&
                items.map((item) => (
                  <AppointmentRow
                    key={item.appointmentId}
                    item={item}
                    fallbackDate={applied.date}
                  />
                ))}
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