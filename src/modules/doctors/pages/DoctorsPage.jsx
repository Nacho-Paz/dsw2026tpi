import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../shared/components/Card';
import Button from '../../shared/components/Button';
import { deleteDoctor, getDoctors } from '../services/doctorService';

const MIN_SEARCH_LENGTH = 3;
const MAX_SEARCH_LENGTH = 100;
const SEARCH_DELAY_MS = 400;


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

function ClockIcon() {
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
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function EyeIcon() {
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
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  );
}

function PencilIcon() {
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
        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
      />
    </svg>
  );
}

function TrashIcon() {
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
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );
}


const getInitials = (name) =>
  name
    .replace(/^dra?\.\s*/i, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();

  
function DoctorsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  
  const trimmed = searchTerm.trim();
  const query = trimmed.length >= MIN_SEARCH_LENGTH ? trimmed : '';
  const searchTooShort = trimmed.length > 0 && !query;  

  useEffect(() => {
  let ignore = false;

  const timer = setTimeout(
    async () => {
      setLoading(true);
      setError('');
      try {
        const result = await getDoctors(query);
        if (ignore) return;
        setDoctors(result.data);
        setTotal(result.total);
      } catch (err) {
        if (!ignore) {
          setError(
            err.response?.data?.message ??
              'No se pudo cargar el listado. Verificá la conexión e intentá de nuevo.'
          );
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    },
    query ? SEARCH_DELAY_MS : 0
  );

  return () => {
    ignore = true;
    clearTimeout(timer);
  };
}, [query, reloadKey]);

async function handleDelete(doctor) {
  if (!window.confirm(`¿Eliminar a ${doctor.name}?`)) return;

  try {
    await deleteDoctor(doctor.id);
    setReloadKey((key) => key + 1);
  } catch (err) {
    setError(
      err.response?.data?.message ??
        'No se pudo eliminar el doctor. Intentá de nuevo.'
    );
  }
}

  return (
    <div className="flex flex-col gap-6">
      {/* Título y Acciones de Cabecera */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-med-text-main">
            Directorio de Doctores
          </h1>
          <p className="text-sm text-med-text-sub mt-1">
            Gestione el personal médico y supervise su disponibilidad actual.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Barra de Búsqueda */}
          <div className="relative min-w-[240px] flex-1 sm:flex-initial">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-med-text-muted">
                <SearchIcon />
              </span>

            <input
              type="text"
              placeholder="Buscar doctor por nombre..."
              aria-label="Buscar doctor por nombre"
              maxLength={MAX_SEARCH_LENGTH}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-med-border rounded-lg text-med-text-main placeholder-med-text-muted focus:outline-none focus:ring-1 focus:ring-med-primary-600"
            />
          </div>

          {searchTooShort && (
              <p className="mt-1 text-xs text-med-text-muted">
                Escribí al menos {MIN_SEARCH_LENGTH} letras para filtrar.
              </p>
            )}
          </div>

          <Button
            onClick={() => navigate('/admin/availability')}
            className="flex items-center gap-2 bg-med-primary-900 hover:bg-med-primary-800 text-white"
          >
            <ClockIcon />
            <span>Agregar Disponibilidad Horaria</span>
          </Button>

          <Button
            onClick={() => navigate('/admin/doctors/new')}
            className="flex items-center gap-1.5 bg-med-primary-700 hover:bg-med-primary-800 text-white"
          >
            <span>+</span>
            <span>Nuevo Doctor</span>
          </Button>
        </div>
      </div>

       {error && (
        <p
          role="alert"
          className="px-4 py-3 rounded-lg text-sm bg-med-danger-bg text-med-danger-text"
        >
          {error}
        </p>
      )}

      {/* Tabla Principal */}
      <Card className="p-0 overflow-hidden border-med-border">
        <div className="p-5 border-b border-med-border">
          <h2 className="text-base font-bold text-med-primary-900">
            Registros de Doctores
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-med-primary-50/70 text-[11px] uppercase tracking-wider text-med-text-sub border-b border-med-border">
              <tr>
                <th className="px-6 py-3.5">Nombre del Doctor</th>
                <th className="px-6 py-3.5">Especialidad</th>
                <th className="px-6 py-3.5 text-center">
                  Estado de Disponibilidad
                </th>
                <th className="px-6 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-med-border-subtle">
              {doctors.map((doc) => (
                <tr
                  key={doc.id}
                  className="hover:bg-gray-50/70 transition-colors"
                >
                  {/* Doctor Info */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-xl bg-med-primary-100 flex items-center justify-center text-xl">
                          {doc.avatar}
                        </div>
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                            doc.statusType === 'active'
                              ? 'bg-emerald-500'
                              : 'bg-rose-500'
                          }`}
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-med-primary-900 leading-tight">
                          {doc.name}
                        </p>
                        <p className="text-xs text-med-text-muted mt-0.5">
                          ID: {doc.id}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Especialidad Badge en Píldora */}
                  <td className="px-6 py-4">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-med-primary-100 text-med-primary-700">
                      {doc.specialty}
                    </span>
                  </td>

                  {/* Estado de Disponibilidad */}
                  <td className="px-6 py-4 text-center">
                    {doc.statusType === 'active' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-med-active-bg text-med-active-text">
                        <span className="w-1.5 h-1.5 rounded-full bg-med-active-text" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-med-danger-bg text-med-danger-text">
                        <span className="w-1.5 h-1.5 rounded-full bg-med-danger-text" />
                        On Leave
                      </span>
                    )}
                  </td>

                  {/* Botones de Acciones (Ojo, Lápiz, Basurero) */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 text-med-primary-600">
                      <button
                        title="Ver detalle"
                        className="p-1.5 rounded-lg hover:bg-med-primary-50 text-med-primary-600 hover:text-med-primary-900 transition"
                        onClick={() => navigate(`/admin/availability?doctorId=${doc.id}`)}
                      >
                        <EyeIcon />
                      </button>

                      <button
                        title="Editar profesional"
                        className="p-1.5 rounded-lg hover:bg-med-primary-50 text-med-primary-600 hover:text-med-primary-900 transition"
                        onClick={() => navigate(`/admin/doctors/${doc.id}/edit`)}
                      >
                        <PencilIcon />
                      </button>

                      <button
                        title="Eliminar profesional"
                        className="p-1.5 rounded-lg hover:bg-red-50 text-med-danger-text transition"
                        onClick={() =>
                          handleDelete(doc)
                        }
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginador normalizado idéntico a Búsqueda y Filtrado de Citas */}
        {!loading && !error && (
          <div className="p-4 bg-med-primary-50/50 border-t border-med-border text-xs text-med-text-muted">
            Mostrando {doctors.length} de {total} registros
          </div>
        )}

        </div>
      </Card>
    </div>
  );
}

export default DoctorsPage;
