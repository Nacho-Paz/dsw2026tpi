import { useEffect, useMemo, useState } from 'react';
import { bookPatientAppointment } from '../services/patientAppointmentService';
import useAuth from '../../auth/hooks/useAuth';
import {
  getDoctors,
  getDoctorAvailabilities,
} from '../../doctors/services/doctorService';
import { getSpecialties } from '../../specialties/services/specialtyService';
import { getMonday } from '../utils/calendarHelpers';

const getDoctorSpecialtyId = (doctor) =>
  String(doctor.specialty?.specialtyId ?? doctor.specialty?.id);

function useBookAppointment() {
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
        (doctor) => getDoctorSpecialtyId(doctor) === String(specialtyId)
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
              (doctor) => getDoctorSpecialtyId(doctor) === String(specialty.id)
            )
          ) ?? specialtyList[0];

        setSpecialties(specialtyList);
        setDoctors(doctorList);
        setSpecialtyId(firstSpecialty?.id ?? '');
        setDoctorId(
          doctorList.find(
            (doctor) =>
              getDoctorSpecialtyId(doctor) === String(firstSpecialty?.id)
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

  // Permitir navegar hasta 4 semanas hacia adelante desde hoy
  const canGoNextWeek = useMemo(() => {
    return weekOffset < 4;
  }, [weekOffset]);

  const handleSpecialtyChange = (nextSpecialtyId) => {
    const nextDoctor = doctors.find(
      (doctor) => getDoctorSpecialtyId(doctor) === String(nextSpecialtyId)
    );

    setSpecialtyId(nextSpecialtyId);
    setDoctorId(nextDoctor?.id ?? '');
    setWeekOffset(0);
    setErrorMessage('');
  };

  const handleDoctorChange = (nextDoctorId) => {
    setDoctorId(nextDoctorId);
    setWeekOffset(0);
  };

  const goToPreviousWeek = () => setWeekOffset((current) => current - 1);
  const goToNextWeek = () => setWeekOffset((current) => current + 1);

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
      await bookPatientAppointment({
        doctorId,
        availabilitySlotId: slotId,
        dni: patientDni,
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

  return {
    // catálogos
    specialties,
    filteredDoctors,
    specialtyId,
    doctorId,
    // calendario
    weekDays,
    weekOffset,
    slots,
    slotsByDate,
    slotId,
    setSlotId,
    selectedSlot,
    canGoNextWeek,
    // formulario
    reason,
    setReason,
    // estados de UI
    loadingDoctors,
    loadingSlots,
    saving,
    errorMessage,
    successMessage,
    // acciones
    handleSpecialtyChange,
    handleDoctorChange,
    goToPreviousWeek,
    goToNextWeek,
    bookAppointment,
  };
}

export default useBookAppointment;
