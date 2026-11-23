import { getStatusInfo } from '../constants/appointmentConstants';

function StatusBadge({ status }) {
  const { label, badgeClass, dotClass } = getStatusInfo(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${badgeClass}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
      {label}
    </span>
  );
}

export default StatusBadge;