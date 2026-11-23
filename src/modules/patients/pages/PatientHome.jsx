import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../shared/components/Card';
import Button from '../../shared/components/Button';
import { instance } from '../../shared/api/axiosInstance';
import useAuth from '../../auth/hook/useAuth';
import {
  getDoctors,
  getDoctorAvailabilities,
} from '../../doctors/services/doctorService';
import { getSpecialties } from '../../specialties/services/specialtyService';

function PatientHome() {
  const navigate = useNavigate();
  const { patientDni } = useAuth();
  const [specialties, setSpecialties] = useState([]);
  const [specialtyId, setSpecialtyId] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState('');
  const [rules, setRules] = useState([]);
  const [slotId, setSlotId] = useState('');
  const [reason, setReason] = useState('');
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const filteredDoctors = useMemo(
    () =>
      doctors.filter(
        (doctor) =>
          String(doctor.specialty?.specialtyId ?? doctor.specialty?.id) ===
          String(specialtyId)
      ),
    [doctors, specialtyId]
  );

  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        const [specialtyList, doctorPage] = await Promise.all([
          getSpecialties(),
          getDoctors({ page: 1, pageSize: 100 }),
        ]);
        const doctorList = doctorPage.data ?? [];
        const firstSpecialty =
          specialtyList.find((specialty) =>
            doctorList.some(
              (doctor) =>
                String(
                  doctor.specialty?.specialtyId ?? doctor.specialty?.id
                ) === String(specialty.id)
            )
          ) ?? specialtyList[0];

        setSpecialties(specialtyList);
        setDoctors(doctorList);
        setSpecialtyId(firstSpecialty?.id ?? '');
        setDoctorId(
          doctorList.find(
            (doctor) =>
              String(doctor.specialty?.specialtyId ?? doctor.specialty?.id) ===
              String(firstSpecialty?.id)
          )?.id ?? ''
        );
      } catch (error) {
        setErrorMessage(
          error?.response?.status === 403
            ? 'El backend todavía no permite consultar especialidades y médicos.'
            : error?.response?.data?.message ||
                'No se pudieron cargar las especialidades y los médicos.'
        );
      } finally {
        setLoadingDoctors(false);
      }
    };

    loadCatalogs();
  }, []);

  useEffect(() => {
    if (!doctorId) {
      setRules([]);
      setSlotId('');
      setLoadingSlots(false);

      return;
    }

    let ignore = false;

    const loadAvailability = async () => {
      setLoadingSlots(true);
      setSlotId('');
      setErrorMessage('');

      try {
        const availability = await getDoctorAvailabilities(doctorId);

        if (!ignore) setRules(availability);
      } catch (error) {
        if (!ignore) {
          setErrorMessage(
            error?.response?.status === 403
              ? 'El backend todavía no permite consultar disponibilidades.'
              : error?.response?.data?.message ||
                  'No se pudieron cargar las disponibilidades.'
          );
        }
      } finally {
        if (!ignore) setLoadingSlots(false);
      }
    };

    loadAvailability();

    return () => {
      ignore = true;
    };
  }, [doctorId]);

  const slots = useMemo(
    () =>
      rules.flatMap((rule) =>
        (rule.slots ?? [])
          .filter(
            (slot) => slot.status?.toUpperCase() === 'AVAILABLE' && slot.id
          )
          .map((slot) => ({
            ...slot,
            day: rule.day,
          }))
      ),
    [rules]
  );

  const bookAppointment = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!patientDni) {
      setErrorMessage('No se encontró el DNI de tu sesión. Vuelve a ingresar.');

      return;
    }

    if (!doctorId || !slotId) {
      setErrorMessage('Selecciona un médico y un horario disponible.');

      return;
    }

    if (reason.trim().length < 5) {
      setErrorMessage('El motivo debe tener al menos 5 caracteres.');

      return;
    }

    try {
      setSaving(true);
      await instance.post('api/appointments', {
        doctorId,
        availabilitySlotId: slotId,
        patient: { dni: Number(patientDni) },
        reason: reason.trim(),
      });

      setSuccessMessage('¡Turno reservado correctamente!');
      setSlotId('');
      setReason('');
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
          'No se pudo reservar el turno. Puede que el horario ya no esté disponible.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-med-primary-900">
          Reservar turno médico
        </h1>
        <p className="text-sm text-med-text-sub mt-1">
          Selecciona un médico, un horario y el motivo de la consulta.
        </p>
      </div>

      {errorMessage && (
        <p
          role="alert"
          className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
        >
          {errorMessage}
        </p>
      )}

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800">
          <p>{successMessage}</p>
          <button
            type="button"
            className="underline font-semibold mt-1"
            onClick={() => navigate('/appointments')}
          >
            Ver mis turnos
          </button>
        </div>
      )}

      <Card className="p-6">
        <form onSubmit={bookAppointment} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="specialty" className="text-sm font-semibold">
              Especialidad
            </label>
            <select
              id="specialty"
              value={specialtyId}
              onChange={(event) => {
                const nextSpecialtyId = event.target.value;
                const nextDoctor = doctors.find(
                  (doctor) =>
                    String(
                      doctor.specialty?.specialtyId ?? doctor.specialty?.id
                    ) === String(nextSpecialtyId)
                );

                setSpecialtyId(nextSpecialtyId);
                setDoctorId(nextDoctor?.id ?? '');
                setErrorMessage('');
              }}
              disabled={loadingDoctors || specialties.length === 0}
              className="w-full border border-med-border rounded-lg px-3 py-2.5 text-sm"
            >
              {specialties.length === 0 ? (
                <option value="">
                  {loadingDoctors
                    ? 'Cargando especialidades…'
                    : 'No hay especialidades disponibles'}
                </option>
              ) : (
                specialties.map((specialty) => (
                  <option key={specialty.id} value={specialty.id}>
                    {specialty.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="doctor" className="text-sm font-semibold">
              Médico
            </label>
            <select
              id="doctor"
              value={doctorId}
              onChange={(event) => setDoctorId(event.target.value)}
              disabled={loadingDoctors || filteredDoctors.length === 0}
              className="w-full border border-med-border rounded-lg px-3 py-2.5 text-sm"
            >
              {loadingDoctors ? (
                <option>Cargando médicos…</option>
              ) : filteredDoctors.length === 0 ? (
                <option value="">No hay médicos para esta especialidad</option>
              ) : (
                filteredDoctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name}
                    {doctor.specialty?.name
                      ? ` · ${doctor.specialty.name}`
                      : ''}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="slot" className="text-sm font-semibold">
              Horario disponible
            </label>
            <select
              id="slot"
              value={slotId}
              onChange={(event) => setSlotId(event.target.value)}
              disabled={loadingSlots || slots.length === 0}
              className="w-full border border-med-border rounded-lg px-3 py-2.5 text-sm"
            >
              <option value="">
                {loadingSlots
                  ? 'Cargando horarios…'
                  : slots.length
                    ? 'Selecciona un horario'
                    : 'No hay slots reservables en la respuesta del backend'}
              </option>
              {slots.map((slot) => (
                <option key={slot.id} value={slot.id}>
                  {slot.slotDate} · {slot.startTime}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="reason" className="text-sm font-semibold">
              Motivo de la consulta
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              minLength={5}
              rows={3}
              className="w-full border border-med-border rounded-lg px-3 py-2.5 text-sm"
              placeholder="Describe brevemente el motivo"
            />
          </div>

          <Button type="submit" disabled={saving || slots.length === 0}>
            {saving ? 'Reservando…' : 'Confirmar turno'}
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default PatientHome;
