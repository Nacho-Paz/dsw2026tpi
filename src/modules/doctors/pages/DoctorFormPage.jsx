import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../shared/components/Card';
import Button from '../../shared/components/Button';
import { createDoctor } from '../services/doctorService';
import { getAllSpecialties } from '../../specialties/services/SpecialtiesService'; //TODO

const FIELD =
  'w-full px-3 py-2 text-sm bg-white border border-med-border rounded-lg text-med-text-main focus:outline-none focus:ring-1 focus:ring-med-primary-600';
const MOCK_SPECIALTIES = [
  { id: 'PEGA-ACA-UN-GUID-REAL', name: 'Cardiología' },
  { id: 'PEGA-ACA-OTRO-GUID-REAL', name: 'Neurología' },
];

function DoctorFormPage() {
  const navigate = useNavigate();
  const [specialties, setSpecialties] = useState([]);
  const [loadingSpecialties, setLoadingSpecialties] = useState(true);
  const [form, setForm] = useState({ name: '', specialtyId: '', licenseNumber: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let ignore = false;

    const loadSpecialties = async () => {
      try {
        const list = await getAllSpecialties();
        if (!ignore) setSpecialties(list);
      } catch {
        if (!ignore) setServerError('No se pudo cargar la lista de especialidades.');
      } finally {
        if (!ignore) setLoadingSpecialties(false);
      }
    };

    loadSpecialties();
    return () => {
      ignore = true;
    };
  }, []);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const validate = () => {
    const next = {};
    const name = form.name.trim();
    if (name.length < 3 || name.length > 100)
      next.name = 'El nombre debe tener entre 3 y 100 caracteres.';
    if (!form.specialtyId) next.specialtyId = 'Seleccioná una especialidad.';
    if (!form.licenseNumber.trim()) next.licenseNumber = 'La licencia es obligatoria.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    setServerError('');
    if (!validate()) return;
    setSaving(true);
    try {
      await createDoctor({
        name: form.name.trim(),
        licenseNumber: form.licenseNumber.trim(),
        specialtyId: form.specialtyId,
      });
      navigate('/admin/doctors');
    } catch (err) {
      setServerError(err.response?.data?.message ?? 'No se pudo guardar el doctor.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-med-text-main">Registrar Nuevo Doctor</h1>
        <p className="text-sm text-med-text-sub mt-1">
          Completá todos los campos obligatorios para integrar al nuevo facultativo.
        </p>
      </div>

      {serverError && (
        <div role="alert" className="px-4 py-3 rounded-lg text-sm bg-med-danger-bg text-med-danger-text">
          {serverError}
        </div>
      )}

      <Card className="p-6 flex flex-col gap-5">
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-med-primary-900">
          Nombre completo del doctor
          <input name="name" value={form.name} onChange={handleChange}
            maxLength={100} placeholder="Ej: Dr. Alejandro Martínez" className={FIELD} />
          {errors.name && <span className="text-xs font-normal text-med-danger-text">{errors.name}</span>}
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
            {loadingSpecialties ? 'Cargando especialidades...' : 'Seleccione especialidad'}
            </option>
            {specialties.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>

            {errors.specialtyId && <span className="text-xs font-normal text-med-danger-text">{errors.specialtyId}</span>}
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-semibold text-med-primary-900">
            Número de licencia médica
            <input name="licenseNumber" value={form.licenseNumber} onChange={handleChange}
              placeholder="ID-45920-X" className={FIELD} />
            {errors.licenseNumber && <span className="text-xs font-normal text-med-danger-text">{errors.licenseNumber}</span>}
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-med-border">
          <Button onClick={() => navigate('/admin/doctors')}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={saving}
            className="bg-med-primary-700 hover:bg-med-primary-800 text-white">
            {saving ? 'Guardando...' : 'Guardar Doctor'}
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default DoctorFormPage;