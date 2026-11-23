import { useNavigate } from 'react-router-dom';

import { EyeIcon, PencilIcon, TrashIcon } from './DoctorIcons';

const getInitials = (name) =>
  name
    .replace(/^dra?\.?\s*/i, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();

const ACTION_BUTTON =
  'p-1.5 rounded-lg hover:bg-med-primary-50 text-med-primary-600 hover:text-med-primary-900 transition';

function DoctorRow({ doctor, onDelete }) {
  const navigate = useNavigate();

  return (
    <tr className="hover:bg-gray-50/70 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-med-primary-100 flex items-center justify-center text-xl">
            {doctor.avatar ?? (
              <span className="text-xs font-bold text-med-primary-700">
                {getInitials(doctor.name)}
              </span>
            )}
          </div>

          <div>
            <p className="font-semibold text-med-primary-900 leading-tight">
              {doctor.name}
            </p>
            <p className="text-xs text-med-text-muted mt-0.5">
              Matrícula: {doctor.licenseNumber}
            </p>
          </div>
        </div>
      </td>

      <td className="px-6 py-4">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-med-primary-100 text-med-primary-700">
          {doctor.specialty?.name}
        </span>
      </td>

      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            title="Ver disponibilidad"
            aria-label={`Ver disponibilidad de ${doctor.name}`}
            className={ACTION_BUTTON}
            onClick={() =>
              navigate(`/admin/availability?doctorId=${doctor.id}`)
            }
          >
            <EyeIcon />
          </button>

          <button
            title="Editar profesional"
            aria-label={`Editar a ${doctor.name}`}
            className={ACTION_BUTTON}
            onClick={() =>
              navigate(`/admin/doctors/${doctor.id}/edit`, { state: { doctor } })
            }
          >
            <PencilIcon />
          </button>

          <button
            title="Eliminar profesional"
            aria-label={`Eliminar a ${doctor.name}`}
            className="p-1.5 rounded-lg hover:bg-red-50 text-med-danger-text transition"
            onClick={() => onDelete(doctor)}
          >
            <TrashIcon />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default DoctorRow;