import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../../shared/components/Button';
import { getAllDoctors } from '../services/DoctorsService';
import { useDoctorAvailability } from '../hooks/useDoctorAvailability';

const TIME_INPUT =
  'border border-med-border rounded-lg px-3 py-1.5 text-xs bg-white text-med-text-main disabled:bg-slate-100 disabled:text-slate-400 focus:outline-none focus:ring-2 focus:ring-med-primary-600';

function AvailabilityForm() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const doctorId = searchParams.get('doctorId') ?? '';

  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [doctorsError, setDoctorsError] = useState('');

  const {
    days,
    loading,
    saving,
    error,
    notice,
    toggleDay,
    changeTime,
    save,
  } = useDoctorAvailability(doctorId);

  // Carga la lista una vez; si el ?doctorId= no existe, elige el primero
  useEffect(() => {
    let ignore = false;

    const loadDoctors = async () => {
      try {
        const list = await getAllDoctors();
        if (ignore) return;
        setDoctors(list);
        if (list.length > 0 && !list.some((d) => d.id === doctorId)) {
          setSearchParams({ doctorId: list[0].id }, { replace: true });
        }
      } catch {
        if (!ignore) {
          setDoctorsError('No se pudo cargar la lista de profesionales.');
        }
      } finally {
        if (!ignore) setLoadingDoctors(false);
      }
    };

    loadDoctors();
    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const errorMessage = doctorsError || error;
  const busy = saving || loading;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-6"
    >
      <div className="lg:col-span-4 flex flex-col gap-5">
        <div className="bg-white border border-med-border rounded-xl p-5 shadow-sm flex flex-col gap-1.5">
          <label
            htmlFor="doctor-select"
            className="text-xs font-semibold text-med-text-main"
          >
            Seleccionar Profesional
          </label>
          <select
            id="doctor-select"
            value={doctorId}
            onChange={(e) => setSearchParams({ doctorId: e.target.value })}
            disabled={loadingDoctors || saving}
            className="w-full border border-med-border rounded-lg px-3.5 py-2.5 text-sm bg-white text-med-text-main focus:outline-none focus:ring-2 focus:ring-med-primary-600"
          >
            {doctors.length === 0 && (
              <option value="">
                {loadingDoctors
                  ? 'Cargando profesionales...'
                  : 'Sin profesionales registrados'}
              </option>
            )}
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name}
                {doc.specialty?.name ? ` - ${doc.specialty.name}` : ''}
              </option>
            ))}
          </select>
        </div>

        <p className="bg-slate-50 border border-med-border rounded-xl p-4 text-xs text-med-text-muted leading-relaxed">
          La disponibilidad se configura para el mes en curso, desde hoy en
          adelante y sin contar feriados. Los turnos ya reservados se conservan.
        </p>
      </div>

      <div className="lg:col-span-8 bg-white border border-med-border rounded-xl shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 px-6 py-4 border-b border-med-border">
          <h3 className="font-bold text-lg text-med-primary-900">
            Configuración de Horarios
          </h3>
          <span className="text-xs text-med-text-muted">
            Turnos automáticos de 30 minutos
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-med-text-muted">
            Cargando disponibilidad del profesional...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-med-border text-[11px] font-bold text-med-text-muted uppercase">
                  <th className="py-3 px-6">Día</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4">Entrada</th>
                  <th className="py-3 px-6">Salida</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-med-border text-sm">
                {days.map((day) => (
                  <tr
                    key={day.key}
                    className={!day.active ? 'bg-slate-50/50 text-med-text-muted' : ''}
                  >
                    <td className="py-3.5 px-6 font-medium text-med-text-main">
                      {day.label}
                    </td>
                    <td className="py-3.5 px-4">
                      <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          aria-label={`Atiende los ${day.label}`}
                          checked={day.active}
                          onChange={() => toggleDay(day.key)}
                        />
                        <div className="w-10 h-5 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all relative peer-checked:bg-med-primary-600" />
                        <span
                          className={`text-xs font-semibold ${
                            day.active ? 'text-med-primary-600' : 'text-slate-400'
                          }`}
                        >
                          {day.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </label>
                    </td>
                    <td className="py-3.5 px-4">
                      <input
                        type="time"
                        step="1800"
                        aria-label={`Entrada del ${day.label}`}
                        disabled={!day.active}
                        value={day.active ? day.startTime : ''}
                        onChange={(e) =>
                          changeTime(day.key, 'startTime', e.target.value)
                        }
                        className={TIME_INPUT}
                      />
                    </td>
                    <td className="py-3.5 px-6">
                      <input
                        type="time"
                        step="1800"
                        aria-label={`Salida del ${day.label}`}
                        disabled={!day.active}
                        value={day.active ? day.endTime : ''}
                        onChange={(e) =>
                          changeTime(day.key, 'endTime', e.target.value)
                        }
                        className={TIME_INPUT}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-6 border-t border-med-border flex flex-col gap-3">
          {errorMessage && (
            <p role="alert" className="text-xs text-red-600 font-medium">
              {errorMessage}
            </p>
          )}
          {notice && (
            <p role="status" className="text-xs text-emerald-600 font-medium">
              {notice}
            </p>
          )}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/doctors')}
              disabled={saving}
            >
              Volver
            </Button>
            <Button type="submit" disabled={busy || !doctorId}>
              {saving ? 'Guardando...' : 'Guardar Disponibilidad'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

export default AvailabilityForm;
