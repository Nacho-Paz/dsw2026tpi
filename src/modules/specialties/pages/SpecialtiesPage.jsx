import { useEffect, useState } from 'react';
import {
  createSpecialty,
  deleteSpecialty,
  getSpecialties,
  updateSpecialty,
} from '../services/specialtyService';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import TablePagination from '../../../shared/components/TablePagination';

const PAGE_SIZE = 10;

function SpecialtiesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [page, setPage] = useState(1);

  const [specialtiesList, setSpecialtiesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadSpecialties = async () => {
    setLoading(true);
    setError('');
    try {
      setSpecialtiesList(await getSpecialties());
    } catch (err) {
      setError(
        err.response?.data?.message ??
          'No se pudieron cargar las especialidades.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSpecialties();
  }, []);

  const handleCreateSpecialty = async (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (trimmedName.length < 3 || trimmedName.length > 100) {
      setError('El nombre debe tener entre 3 y 100 caracteres.');

      return;
    }

    if (trimmedDescription.length < 10 || trimmedDescription.length > 100) {
      setError('La descripción debe tener entre 10 y 100 caracteres.');

      return;
    }

    setSaving(true);
    setError('');
    try {
      if (editingId)
        await updateSpecialty(editingId, {
          name: trimmedName,
          description: trimmedDescription,
        });
      else
        await createSpecialty({
          name: trimmedName,
          description: trimmedDescription,
        });

      await loadSpecialties();
      setName('');
      setDescription('');
      setEditingId(null);
      setShowForm(false);
    } catch (err) {
      setError(
        err.response?.data?.message ?? 'No se pudo guardar la especialidad.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEditSpecialty = (spec) => {
    setEditingId(spec.id);
    setName(spec.name);
    setDescription(spec.description);
    setShowForm(true);
  };

  const handleDeleteSpecialty = async (id) => {
    if (
      !window.confirm('¿Estás segura de que querés eliminar esta especialidad?')
    )
      return;

    setError('');
    try {
      await deleteSpecialty(id);
      await loadSpecialties();

      if (editingId === id) {
        setEditingId(null);
        setName('');
        setDescription('');
        setShowForm(false);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ?? 'No se pudo eliminar la especialidad.'
      );
    }
  };

  const filteredSpecialties = specialtiesList.filter((item) =>
    searchTerm.trim().length < 3
      ? true
      : item.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredSpecialties.length / PAGE_SIZE)
  );
  const currentPage = Math.min(page, totalPages);

  const paginatedSpecialties = filteredSpecialties.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Cabecera con Título, Buscador y Botón */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-med-text-main">
            Directorio de Especialidades
          </h1>
          <p className="text-sm text-med-text-sub mt-1">
            Administre las categorías médicas, servicios y disponibilidad del
            personal especializado.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Buscador */}
          <div className="relative min-w-[240px] flex-1 sm:flex-initial">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-med-text-muted">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Buscar especialidad..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-med-border rounded-lg text-med-text-main placeholder-med-text-muted focus:outline-none focus:ring-1 focus:ring-med-primary-600"
            />
          </div>

          {/* Botón Nueva Especialidad */}

          <Button
            onClick={() => {
              setEditingId(null);
              setName('');
              setDescription('');
              setShowForm(true);
            }}
            className="flex items-center gap-1.5 bg-med-primary-900 hover:bg-med-primary-800 text-white font-medium"
          >
            <span>+</span>
            <span>Nueva Especialidad</span>
          </Button>
        </div>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}

      {showForm && (
        <Card className="p-5 border-med-border">
          <h2 className="text-lg font-bold text-med-primary-900 mb-4">
            {editingId !== null ? 'Editar Especialidad' : 'Nueva Especialidad'}
          </h2>

          <form
            onSubmit={handleCreateSpecialty}
            className="flex flex-col gap-4"
          >
            <div>
              <label className="block text-sm font-medium text-med-text-main mb-1">
                Nombre de la especialidad
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Oftalmología"
                required
                className="w-full border border-med-border rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-med-primary-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-med-text-main mb-1">
                Descripción
              </label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ingresá una descripción"
                rows="3"
                required
                className="w-full border border-med-border rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-med-primary-600"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setName('');
                  setDescription('');
                }}
                className="px-4 py-2 rounded-lg border border-med-border text-med-text-sub hover:bg-gray-100"
              >
                Cancelar
              </button>

              <Button
                type="submit"
                className="bg-med-primary-900 hover:bg-med-primary-800 text-white"
              >
                {saving
                  ? 'Guardando...'
                  : editingId
                    ? 'Guardar cambios'
                    : 'Guardar especialidad'}{' '}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Tabla Principal de Especialidades */}
      <Card className="p-0 overflow-hidden border-med-border">
        <div className="p-5 border-b border-med-border">
          <h2 className="text-base font-bold text-med-primary-900">
            Registros de Especialidades
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-med-primary-50/70 text-[11px] uppercase tracking-wider text-med-text-sub border-b border-med-border">
              <tr>
                <th className="px-6 py-3.5">Nombre de la Especialidad</th>
                <th className="px-6 py-3.5">Descripción</th>
                <th className="px-6 py-3.5 text-center">Estado</th>
                <th className="px-6 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-med-border-subtle">
              {loading ? (
                <tr>
                  <td className="px-6 py-4" colSpan="4">
                    Cargando especialidades...
                  </td>
                </tr>
              ) : filteredSpecialties.length === 0 ? (
                <tr>
                  <td className="px-6 py-4" colSpan="4">
                    No hay especialidades para mostrar.
                  </td>
                </tr>
              ) : (
                paginatedSpecialties.map((spec) => (
                  <tr
                    key={spec.id}
                    className="hover:bg-gray-50/70 transition-colors"
                  >
                    {/* Nombre con icono en caja celeste */}

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-med-primary-100 text-med-primary-700 flex items-center justify-center shrink-0">
                          {spec.icon}
                        </div>
                        <span className="font-semibold text-med-primary-900">
                          {spec.name}
                        </span>
                      </div>
                    </td>

                    {/* Descripción */}

                    <td className="px-6 py-4 text-med-text-sub max-w-md">
                      {spec.description}
                    </td>

                    {/* Estado (Active / Inactive) */}
                    <td className="px-6 py-4 text-center">
                      {spec.status === 'Active' ? (
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-med-active-bg text-med-active-text">
                          Active
                        </span>
                      ) : (
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* Acciones: Editar y Eliminar */}

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 text-med-text-muted">
                        <button
                          title="Editar especialidad"
                          className="p-1.5 rounded-lg hover:bg-med-primary-50 text-med-text-muted hover:text-med-primary-900 transition"
                          onClick={() => handleEditSpecialty(spec)}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                          </svg>
                        </button>

                        <button
                          title="Eliminar especialidad"
                          className="p-1.5 rounded-lg hover:bg-red-50 text-med-danger-text transition"
                          onClick={() => handleDeleteSpecialty(spec.id)}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredSpecialties.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      </Card>
    </div>
  );
}

export default SpecialtiesPage;
