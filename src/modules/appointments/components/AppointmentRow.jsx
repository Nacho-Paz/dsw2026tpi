import { formatDate } from '../../shared/helpers/dates';
import { AppointmentIcon } from './AppointmentIcons';

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

// fallbackDate: hoy SearchItem no trae la fecha del turno, así que se muestra
// la fecha del filtro. Cuando el back agregue slotDate, startTime y endTime,
// esta fila los usa sola.
function AppointmentRow({ item, fallbackDate }) {
  const status = STATUS[item.appointmentStatus?.toUpperCase()];

  return (
    <tr className="hover:bg-gray-50/70 transition-colors">
      {/* Fecha y hora */}
      <td className="px-6 py-4">
        <p className="font-bold text-med-primary-900 text-sm">
          {formatDate(item.slotDate ?? fallbackDate)}
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
            <p className="text-xs text-med-text-muted">{item.doctor?.name}</p>
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
            className={`w-1.5 h-1.5 rounded-full ${status?.dot ?? 'bg-gray-400'}`}
          />
          {status?.label ?? item.appointmentStatus}
        </span>
      </td>
    </tr>
  );
}

export default AppointmentRow;