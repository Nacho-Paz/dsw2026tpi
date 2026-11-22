import useAppointments from "../hooks/useAppointments";
import AppointmentsFilterForm from "../components/AppointmentsFilterForm";
import AppointmentsTable from "../components/AppointmentsTable";
import { PAGE_SIZE } from "../constants/appointmentConstants";

function AppointmentsSearchPage() {
  const a = useAppointments();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-med-text-main">
          Búsqueda y Filtrado de Citas
        </h1>
        <p className="text-sm text-med-text-sub mt-1">
          Gestione y supervise el flujo de pacientes del departamento.
        </p>
      </div>

      <AppointmentsFilterForm
        filters={a.filters}
        appliedFilters={a.appliedFilters}
        specialties={a.specialties}
        doctors={a.filteredDoctors}
        allDoctors={a.doctors}
        loading={a.loading}
        loadingCatalogs={a.loadingCatalogs}
        catalogError={a.catalogError}
        lastUpdated={a.lastUpdated}
        onInputChange={a.changeFilter}
        onApplyFilters={a.applyFilters}
        onClearFilters={a.clearFilters}
        onRemoveFilter={a.removeFilter}
      />

      {/* TODO: pasar onSelect con el Modal de shared/ para "Ver Detalle" */}
      <AppointmentsTable
        appointments={a.appointments}
        loading={a.loading}
        error={a.error}
        pageIndex={a.pageIndex}
        pageSize={PAGE_SIZE}
        total={a.total}
        onPageChange={a.setPageIndex}
        onRetry={a.retry}
      />
    </div>
  );
}

export default AppointmentsSearchPage;