import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../shared/components/Card';
import Button from '../../shared/components/Button';
import TablePagination from '../../shared/components/TablePagination';
import DoctorRow from '../components/DoctorRow';
import { ClockIcon, SearchIcon } from '../components/DoctorIcons';
import {
  MAX_SEARCH_LENGTH,
  MIN_SEARCH_LENGTH,
  useDoctors,
} from '../hooks/useDoctors';
import Modal from '../../shared/components/Modal';

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

function DoctorsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [doctorToDelete, setDoctorToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const {
    doctors,
    total,
    loading,
    error,
    notice,
    searchTooShort,
    page,
    setPage,
    pageSize,
    reload,
    removeDoctor,
  } = useDoctors(searchTerm);

  const closeDeleteModal = () => {
    if (!deleting) setDoctorToDelete(null);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    await removeDoctor(doctorToDelete.id); // el hook ya maneja error y notice
    setDeleting(false);
    setDoctorToDelete(null);
  };

  const isEmpty = !loading && !error && doctors.length === 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Título y acciones de cabecera */}
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
          <div className="relative min-w-[240px] flex-1 sm:flex-initial">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-med-text-muted">
              <SearchIcon />
            </span>
            <input
              type="text"
              aria-label="Buscar doctor por nombre"
              placeholder="Buscar doctor por nombre..."
              value={searchTerm}
              maxLength={MAX_SEARCH_LENGTH}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-med-border rounded-lg text-med-text-main placeholder-med-text-muted focus:outline-none focus:ring-1 focus:ring-med-primary-600"
            />
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

      {searchTooShort && (
        <p className="text-xs text-med-text-muted" role="status">
          Escribí al menos {MIN_SEARCH_LENGTH} letras para buscar.
        </p>
      )}

      {notice && (
        <div
          role="status"
          className="px-4 py-3 rounded-lg text-sm bg-med-active-bg text-med-active-text"
        >
          {notice}
        </div>
      )}

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

      {/* Tabla principal */}
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
              {loading && <TableMessage>Cargando doctores...</TableMessage>}

              {isEmpty && (
                <TableMessage>
                  {searchTerm.trim()
                    ? 'No se encontraron doctores con ese nombre.'
                    : 'Todavía no hay doctores registrados.'}
                </TableMessage>
              )}

              {!loading &&
                doctors.map((doctor) => (
                  <DoctorRow
                    key={doctor.id}
                    doctor={doctor}
                    onDelete={setDoctorToDelete}
                  />
                ))}
            </tbody>
          </table>
        </div>

        <TablePagination
          currentPage={page}
          totalItems={total}
          pageSize={pageSize}
          disabled={loading}
          onPageChange={setPage}
        />
      </Card>
      <Modal
  isOpen={doctorToDelete !== null}
  onClose={closeDeleteModal}
  title="Confirmar eliminación"
      >
        <div className="flex flex-col gap-5">
          <p className="text-sm text-med-text-sub">
            ¿Estás seguro de que querés eliminar a{' '}
            <span className="font-semibold text-med-text-main">
              {doctorToDelete?.name}
            </span>
            ?
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={closeDeleteModal}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default DoctorsPage;
