import Card from '../../../shared/components/Card';
import TablePagination from '../../../shared/components/TablePagination';
import AppointmentRow from './AppointmentRow';
import TableMessage from './TableMessage';

const COLUMNS = ['Fecha', 'Departamento', 'Paciente', 'Estado', 'Acciones'];

function AppointmentsTable({
  appointments,
  loading,
  error,
  pageIndex,
  pageSize,
  total,
  onPageChange,
  onRetry,
  onSelect,
}) {
  return (
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
              {COLUMNS.map((c, i) => (
                <th
                  key={c}
                  className={`px-6 py-3.5 ${i === 3 ? 'text-center' : ''} ${i === 4 ? 'text-right' : ''}`}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-med-border-subtle">
            {loading ? (
              <TableMessage>Cargando citas...</TableMessage>
            ) : error ? (
              <TableMessage
                action={
                  <button
                    type="button"
                    onClick={onRetry}
                    className="ml-2 font-semibold text-med-primary-700 hover:underline"
                  >
                    Reintentar
                  </button>
                }
              >
                <span role="alert" className="text-red-600 font-medium">
                  {error}
                </span>
              </TableMessage>
            ) : appointments.length === 0 ? (
              <TableMessage>
                No se encontraron citas con los criterios seleccionados.
              </TableMessage>
            ) : (
              appointments.map((item) => (
                <AppointmentRow
                  key={item.appointmentId}
                  item={item}
                  onSelect={onSelect}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <TablePagination
        currentPage={pageIndex}
        totalItems={total}
        pageSize={pageSize}
        disabled={loading}
        onPageChange={onPageChange}
      />
    </Card>
  );
}

export default AppointmentsTable;
