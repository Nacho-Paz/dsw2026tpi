import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import { instance } from '../../../shared/services/axiosInstance';
import useAuth from '../../auth/hooks/useAuth';
import {
  getDoctors,
  getDoctorAvailabilities,
} from '../../doctors/services/doctorService';
import { getSpecialties } from '../../specialties/services/specialtyService';

function getDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getMonday(date) {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayOfWeek = (monday.getDay() + 6) % 7;

  monday.setDate(monday.getDate() - dayOfWeek);

  return monday;
}

function formatCalendarDate(date) {
  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'short',
  }).format(date);
}

function PatientHome() {
  const navigate = useNavigate();
  const { patientDni } = useAuth();
  const [specialties, setSpecialties] = useState([]);
  const [specialtyId, setSpecialtyId] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState('');
  const [rules, setRules] = useState([]);
  const [slotId, setSlotId] = useState('');
  const [weekOffset, setWeekOffset] = useState(0);
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
      rules
        .flatMap((rule) =>
          (rule.slots ?? [])
            .filter(
              (slot) => slot.status?.toUpperCase() === 'AVAILABLE' && slot.id
            )
            .map((slot) => ({
              ...slot,
              day: rule.day,
            }))
        )
        .sort((a, b) =>
          `${a.slotDate} ${a.startTime}`.localeCompare(
            `${b.slotDate} ${b.startTime}`
          )
        ),
    [rules]
  );

  const weekDays = useMemo(() => {
    const monday = getMonday(new Date());

    monday.setDate(monday.getDate() + weekOffset * 7);

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(monday);

      date.setDate(monday.getDate() + index);

      return date;
    });
  }, [weekOffset]);

  const slotsByDate = useMemo(
    () =>
      slots.reduce((groupedSlots, slot) => {
        const date = slot.slotDate?.slice(0, 10);

        if (!date) return groupedSlots;

        if (!groupedSlots[date]) groupedSlots[date] = [];

        groupedSlots[date].push(slot);

        return groupedSlots;
      }, {}),
    [slots]
  );

  const selectedSlot = slots.find((slot) => slot.id === slotId);
  const nextWeekStart = new Date(weekDays[0]);

  nextWeekStart.setDate(nextWeekStart.getDate() + 7);
  const canGoNextWeek =
    slots.length > 0 &&
    getDateKey(nextWeekStart) <= slots[slots.length - 1].slotDate;

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
      setRules((currentRules) =>
        currentRules.map((rule) => ({
          ...rule,
          slots: (rule.slots ?? []).filter((slot) => slot.id !== slotId),
        }))
      );
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
                setWeekOffset(0);
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
              onChange={(event) => {
                setDoctorId(event.target.value);
                setWeekOffset(0);
              }}
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
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-med-text-main">
                  Horarios disponibles
                </h2>
                <p className="text-xs text-med-text-muted mt-1">
                  Elegí un día y un horario de 30 minutos.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setWeekOffset((current) => current - 1)}
                  disabled={weekOffset === 0 || loadingSlots}
                  aria-label="Ver semana anterior"
                >
                  ‹
                </Button>
                <span className="min-w-32 text-center text-xs font-medium text-med-text-sub">
                  {formatCalendarDate(weekDays[0])} –{' '}
                  {formatCalendarDate(weekDays[6])}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setWeekOffset((current) => current + 1)}
                  disabled={!canGoNextWeek || loadingSlots}
                  aria-label="Ver semana siguiente"
                >
                  ›
                </Button>
              </div>
            </div>

            {loadingSlots ? (
              <p className="py-8 text-center text-sm text-med-text-muted">
                Cargando horarios…
              </p>
            ) : slots.length === 0 ? (
              <p className="py-8 text-center text-sm text-med-text-muted">
                No hay horarios disponibles para este médico.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
                {weekDays.map((date) => {
                  const dateKey = getDateKey(date);
                  const daySlots = slotsByDate[dateKey] ?? [];

                  return (
                    <section
                      key={dateKey}
                      className="min-h-36 rounded-lg border border-med-border bg-white p-2"
                    >
                      <div className="mb-2 border-b border-med-border pb-2 text-center">
                        <p className="text-[10px] font-semibold uppercase text-med-text-muted">
                          {date.toLocaleDateString('es-AR', {
                            weekday: 'short',
                          })}
                        </p>
                        <p className="text-sm font-bold text-med-text-main">
                          {date.getDate()}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {daySlots.length === 0 ? (
                          <p className="pt-2 text-center text-[10px] text-med-text-muted">
                            Sin horarios
                          </p>
                        ) : (
                          daySlots.map((slot) => (
                            <button
                              key={slot.id}
                              type="button"
                              aria-pressed={slotId === slot.id}
                              onClick={() => setSlotId(slot.id)}
                              className={`rounded-md border px-1 py-1.5 text-[11px] font-medium transition ${
                                slotId === slot.id
                                  ? 'border-med-primary-700 bg-med-primary-700 text-white'
                                  : 'border-med-border text-med-text-main hover:border-med-primary-600 hover:bg-med-primary-50'
                              }`}
                            >
                              {slot.startTime}
                            </button>
                          ))
                        )}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}

            {selectedSlot && (
              <p className="rounded-lg bg-med-primary-50 p-3 text-xs text-med-primary-900">
                Turno seleccionado: {selectedSlot.slotDate} a las{' '}
                {selectedSlot.startTime}
              </p>
            )}
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

          <Button type="submit" disabled={saving || !slotId}>
            {saving ? 'Reservando…' : 'Confirmar turno'}
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default PatientHome;
