import StatusBadge from "./StatusBadge";
import { AppointmentIcon } from './AppointmentIcons';

function formatDate(dateStr) {
  if (!dateStr) return "Sin fecha";
  const [year, month, day] = dateStr.slice(0, 10).split("-"); // slice por si llega con hora
  if (!year || !month || !day) return dateStr;
  return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString("es-AR", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

const formatTime = (t) => (t ? t.slice(0, 5) : "—");

function AppointmentRow({ item, onSelect }) {
  return (
    <tr className="hover:bg-gray-50/70 transition-colors">
      <td className="px-6 py-4">
        <p className="font-bold text-med-primary-900 text-sm">{formatDate(item.slotDate)}</p>
        <p className="text-xs text-med-text-muted mt-0.5">{formatTime(item.startTime)}</p>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-med-primary-100 text-med-primary-700 flex items-center justify-center shrink-0">
            <AppointmentIcon />
          </div>
          <div>
            <p className="font-semibold text-med-primary-900">{item.doctor?.specialty?.name ?? "—"}</p>
            <p className="text-xs text-med-text-muted">{item.doctor?.name ?? "—"}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <p className="font-semibold text-med-text-main">{item.patient?.fullName ?? "—"}</p>
        <p className="text-xs text-med-text-muted mt-0.5">DNI: {item.patient?.dni ?? "—"}</p>
      </td>
      <td className="px-6 py-4 text-center">
        <StatusBadge status={item.appointmentStatus} />
      </td>
      <td className="px-6 py-4 text-right">
        {onSelect && (
          <button
            type="button"
            onClick={() => onSelect(item)}
            className="text-xs font-semibold text-med-primary-700 hover:text-med-primary-900 hover:underline"
          >
            Ver Detalle
          </button>
        )}
      </td>
    </tr>
  );
}

export default AppointmentRow;