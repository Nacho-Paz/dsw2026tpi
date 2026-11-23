import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';
import { useDashboardOverview } from '../hooks/useDashboardOverview';

function MetricCard({ label, value, detail }) {
  return (
    <Card className="flex flex-col justify-between p-6">
      <span className="text-[11px] font-bold uppercase tracking-wider text-med-text-sub">
        {label}
      </span>
      <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-med-primary-900">
        {value}
      </p>
      <span className="mt-3 text-xs text-med-text-muted">{detail}</span>
    </Card>
  );
}

function OverviewPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const { overview, loading, error, reload } = useDashboardOverview();

  const doctors = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return overview?.doctors ?? [];

    return (overview?.doctors ?? []).filter((doctor) =>
      doctor.name?.toLowerCase().includes(query)
    );
  }, [overview, searchTerm]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-med-text-main">
            Vista General de Gestión
          </h1>
          <p className="text-sm text-med-text-sub mt-1">
            Resumen actualizado del personal, especialidades y turnos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => navigate('/admin/doctors/new')}>
            + Agregar Nuevo Doctor
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate('/admin/specialties')}
          >
            Ver Especialidades
          </Button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-med-danger-bg px-4 py-3 text-sm text-med-danger-text"
        >
          <span>{error}</span>
          <Button onClick={reload}>Reintentar</Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <MetricCard
          label="Doctores registrados"
          value={loading ? '—' : (overview?.totalDoctors ?? 0)}
          detail="Total informado por el sistema"
        />
        <MetricCard
          label="Especialidades disponibles"
          value={loading ? '—' : (overview?.totalSpecialties ?? 0)}
          detail="Especialidades cargadas"
        />
        <MetricCard
          label="Turnos para hoy"
          value={loading ? '—' : (overview?.totalAppointmentsToday ?? 0)}
          detail="Turnos registrados en la fecha actual"
        />
      </div>

      <Card className="p-0 overflow-hidden border-med-border">
        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-med-border">
          <div>
            <h2 className="text-base font-bold text-med-primary-900">
              Directorio de Profesionales Médicos
            </h2>
            <p className="mt-1 text-xs text-med-text-muted">
              Se muestran los primeros cinco registros del directorio.
            </p>
          </div>
          <input
            type="search"
            aria-label="Buscar doctor en el resumen"
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full sm:w-72 px-3 py-1.5 text-xs bg-med-primary-50/70 border border-med-border rounded-lg text-med-text-main placeholder-med-text-muted focus:outline-none focus:ring-1 focus:ring-med-primary-600"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-med-primary-50/70 text-[11px] uppercase tracking-wider text-med-text-sub border-b border-med-border">
              <tr>
                <th className="px-6 py-3.5">Nombre del Doctor</th>
                <th className="px-6 py-3.5">Especialidad</th>
                <th className="px-6 py-3.5">Matrícula</th>
                <th className="px-6 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-med-border-subtle text-sm">
              {loading && (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-10 text-center text-med-text-muted"
                  >
                    Cargando resumen...
                  </td>
                </tr>
              )}
              {!loading && !error && doctors.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-10 text-center text-med-text-muted"
                  >
                    No se encontraron médicos para mostrar.
                  </td>
                </tr>
              )}
              {!loading &&
                doctors.map((doctor) => (
                  <tr
                    key={doctor.id}
                    className="hover:bg-gray-50/70 transition-colors"
                  >
                    <td className="px-6 py-4 font-semibold text-med-primary-900">
                      {doctor.name}
                    </td>
                    <td className="px-6 py-4 text-med-text-sub">
                      {doctor.specialty?.name ?? 'Sin especialidad'}
                    </td>
                    <td className="px-6 py-4 text-med-text-sub">
                      {doctor.licenseNumber ?? '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/admin/doctors/${doctor.id}/edit`, {
                            state: { doctor },
                          })
                        }
                        className="text-xs font-semibold text-med-primary-700 hover:text-med-primary-900"
                      >
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-med-primary-50/50 border-t border-med-border flex justify-end">
          <Button variant="outline" onClick={() => navigate('/admin/doctors')}>
            Ver directorio completo
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default OverviewPage;
