
import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import Card from '../../shared/components/Card';
import Button from '../../shared/components/Button';
import { createDoctor, updateDoctor } from '../services/DoctorService';
import { getAllSpecialties } from '../../specialties/services/SpecialtiesService';
import { getErrorMessage } from '../../shared/utils/getErrorMessage';

const FIELD =
  'w-full px-3 py-2 text-sm bg-white border border-med-border rounded-lg text-med-text-main focus:outline-none focus:ring-1 focus:ring-med-primary-600';

function DoctorFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { state } = useLocation();

  const isEdit = Boolean(id);

  // Solo usamos el doctor del state si corresponde al id de la URL.
  const doctorToEdit = state?.doctor?.id === id ? state.doctor : null;

  const [specialties, setSpecialties] = useState([]);
  const [loadingSpecialties, setLoadingSpecialties] = useState(true);

  const [form, setForm] = useState({
    name: doctorToEdit?.name ?? '',
    specialtyId: doctorToEdit?.specialty?.id ?? '',
    licenseNumber: doctorToEdit?.licenseNumber ?? '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let ignore = false;

    const loadSpecialties = async () => {
      try {
        const result = await getAllSpecialties();

        // Admite tanto un array directo como { data, total }.
        const list = Array.isArray(result)
          ? result
          : result?.data ?? [];

        if (!ignore) setSpecialties(list);
      } catch (err) {
        if (!ignore) {
          setServerError(
            getErrorMessage(
              err,
              'No se pudo cargar la lista de especialidades.'
            )
          );
        }
      } finally {
        if (!ignore) setLoadingSpecialties(false);
      }
    };

    loadSpecialties();

    return () => {
      ignore = true;
    };
  }, []);

  // Fallback: entraron a /edit por URL directa, sin datos para precargar.
  if (isEdit && !doctorToEdit) {
    return <Navigate to="/admin/doctors" replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = () => {
    const next = {};
    const name = form.name.trim();
    const licenseNumber = form.licenseNumber.trim();

    if (name.length < 3 || name.length > 100) {
      next.name = 'El nombre debe tener entre 3 y 100 caracteres.';
    }

    if (!form.specialtyId) {
      next.specialtyId = 'Seleccioná una especialidad.';
    }

    if (!licenseNumber) {
      next.licenseNumber = 'La matrícula es obligatoria.';
    } else if (licenseNumber.length > 50) {
      next.licenseNumber = 'La matrícula no puede superar los 50 caracteres.';
    }

    setErrors(next);

    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setServerError('');

    if (!validate()) return;

    setSaving(true);

    try {
      const payload = {
        name: form.name.trim(),
        licenseNumber: form.licenseNumber.trim(),
        specialtyId: form.specialtyId,
      };

      if (isEdit) {
        await updateDoctor(id, payload);
      } else {
        await createDoctor(payload);
      }

      navigate('/admin/doctors');
    } catch (err) {
      setServerError(
        getErrorMessage(err, 'No se pudo guardar el doctor.')
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-med-text-main">
          {isEdit ? 'Editar Doctor' : 'Registrar Nuevo Doctor'}
        </h1>

        <p className="text-sm text-med-text-sub mt-1">
          {isEdit
            ? 'Modificá los datos del profesional y guardá los cambios.'
            : 'Completá todos los campos obligatorios para integrar al nuevo facultativo.'}
        </p>
      </div>

      {serverError && (
        <div
          role="alert"
          className="px-4 py-3 rounded-lg text-sm bg-med-danger-bg text-med-danger-text"
        >
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Card className="p-6 flex flex-col gap-5">
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-med-primary-900">
            Nombre completo del doctor

            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              maxLength={100}
              placeholder="Ej: Dr. Alejandro Martínez"
              className={FIELD}
            />

            {errors.name && (
              <span className="text-xs font-normal text-med-danger-text">
                {errors.name}
              </span>
            )}
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-med-primary-900">
              Especialidad

              <select
                name="specialtyId"
                value={form.specialtyId}
                onChange={handleChange}
                disabled={loadingSpecialties || saving}
                className={FIELD}
              >
                <option value="">
                  {loadingSpecialties
                    ? 'Cargando especialidades...'
                    : 'Seleccione especialidad'}
                </option>

                {specialties.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>

              {errors.specialtyId && (
                <span className="text-xs font-normal text-med-danger-text">
                  {errors.specialtyId}
                </span>
              )}
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-semibold text-med-primary-900">
              Matrícula

              <input
                name="licenseNumber"
                value={form.licenseNumber}
                onChange={handleChange}
                maxLength={50}
                placeholder="Ej. MED-3186"
                className={FIELD}
              />

              {errors.licenseNumber && (
                <span className="text-xs font-normal text-med-danger-text">
                  {errors.licenseNumber}
                </span>
              )}
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-med-border">
            <Button
              type="button"
              onClick={() => navigate('/admin/doctors')}
              disabled={saving}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={saving || loadingSpecialties}
              className="bg-med-primary-700 hover:bg-med-primary-800 text-white"
            >
              {saving
                ? 'Guardando...'
                : isEdit
                  ? 'Guardar Cambios'
                  : 'Guardar Doctor'}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}

export default DoctorFormPage;
