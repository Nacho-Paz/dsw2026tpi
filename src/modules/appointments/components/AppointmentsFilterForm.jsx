import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import ActiveFilterChip from './ActiveFilterChip';
import { SearchIcon, RefreshIcon, FilterIcon } from './AppointmentIcons';
import { MAX_DNI_LENGTH } from '../constants/appointmentConstants';

const inputClass =
  'w-full px-3 py-2 text-xs bg-white border border-med-border rounded-lg text-med-text-main focus:outline-none focus:ring-1 focus:ring-med-primary-600';
const selectClass = `${inputClass} appearance-none pr-8 cursor-pointer disabled:bg-gray-50 disabled:text-med-text-muted`;

function Field({ id, label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold text-med-text-sub">
        {label}
      </label>
      {children}
    </div>
  );
}

const Arrow = () => (
  <span className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-[10px] text-med-text-muted">
    ▼
  </span>
);

function AppointmentsFilterForm({
  filters,
  appliedFilters,
  specialties,
  doctors,
  allDoctors,
  loading,
  loadingCatalogs,
  catalogError,
  lastUpdated,
  onInputChange,
  onApplyFilters,
  onClearFilters,
  onRemoveFilter,
}) {
  const specialtyName = specialties.find(
    (s) => String(s.id) === String(appliedFilters.specialtyId)
  )?.name;
  const doctorName = allDoctors.find(
    (d) => String(d.id) === String(appliedFilters.doctorId)
  )?.name;
  const hasActiveFilters = Object.values(appliedFilters).some(Boolean);
  const noDoctors = Boolean(filters.specialtyId) && doctors.length === 0;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between pb-4 border-b border-med-border-subtle">
        <h2 className="text-base font-bold text-med-primary-900">
          Criterios de Búsqueda
        </h2>
        <div className="flex items-center gap-1.5 text-xs text-med-text-muted">
          <RefreshIcon />
          <span>Última actualización: {lastUpdated}</span>
        </div>
      </div>

      {catalogError && (
        <p role="alert" className="mt-3 text-xs text-red-600 font-medium">
          {catalogError}
        </p>
      )}

      <form
        onSubmit={onApplyFilters}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mt-4 items-end"
      >
        <Field id="filter-dni" label="DNI del Paciente">
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
                onInputChange(
                  'dni',
                  e.target.value.replace(/\D/g, '').slice(0, MAX_DNI_LENGTH)
                )
              }
              placeholder="DNI sin puntos..."
              className={`${inputClass} pl-9`}
            />
          </div>
        </Field>

        <Field id="filter-specialty" label="Especialidad">
          <div className="relative">
            <select
              id="filter-specialty"
              value={filters.specialtyId}
              onChange={(e) => onInputChange('specialtyId', e.target.value)}
              disabled={loadingCatalogs}
              className={selectClass}
            >
              <option value="">
                {loadingCatalogs
                  ? 'Cargando especialidades...'
                  : 'Todas las especialidades'}
              </option>
              {specialties.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <Arrow />
          </div>
        </Field>

        <Field id="filter-doctor" label="Doctor">
          <div className="relative">
            <select
              id="filter-doctor"
              value={filters.doctorId}
              onChange={(e) => onInputChange('doctorId', e.target.value)}
              disabled={loadingCatalogs || noDoctors}
              className={selectClass}
            >
              <option value="">
                {loadingCatalogs
                  ? 'Cargando doctores...'
                  : noDoctors
                    ? 'No hay doctores en esta especialidad'
                    : 'Todos los doctores'}
              </option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <Arrow />
          </div>
        </Field>

        <Field id="filter-date" label="Fecha">
          <input
            id="filter-date"
            type="date"
            value={filters.date}
            onChange={(e) => onInputChange('date', e.target.value)}
            className={inputClass}
          />
        </Field>

        <div className="flex items-center gap-2">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-med-primary-900 hover:bg-med-primary-800 text-white font-medium py-2 rounded-lg"
          >
            <FilterIcon />
            <span>{loading ? 'Buscando...' : 'Aplicar'}</span>
          </Button>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              disabled={loading}
              className="px-3 py-2 text-xs font-medium text-med-text-sub bg-white border border-med-border rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Limpiar
            </button>
          )}
        </div>
      </form>

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-med-border-subtle">
          {appliedFilters.dni && (
            <ActiveFilterChip
              label="DNI"
              value={appliedFilters.dni}
              onRemove={() => onRemoveFilter('dni')}
            />
          )}
          {appliedFilters.specialtyId && (
            <ActiveFilterChip
              label="Especialidad"
              value={specialtyName ?? appliedFilters.specialtyId}
              onRemove={() => onRemoveFilter('specialtyId')}
            />
          )}
          {appliedFilters.doctorId && (
            <ActiveFilterChip
              label="Doctor"
              value={doctorName ?? appliedFilters.doctorId}
              onRemove={() => onRemoveFilter('doctorId')}
            />
          )}
          {appliedFilters.date && (
            <ActiveFilterChip
              label="Fecha"
              value={appliedFilters.date}
              onRemove={() => onRemoveFilter('date')}
              className="bg-emerald-50 text-emerald-700 border border-emerald-200"
            />
          )}
        </div>
      )}
    </Card>
  );
}

export default AppointmentsFilterForm;
