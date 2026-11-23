
import { useCallback, useEffect, useState } from 'react';
import { buildDefaultDays, WEEK_DAYS } from '../constants/weekDays';
import {
  getDoctorAvailabilities,
  saveDoctorAvailabilities,
} from '../services/DoctorService';
//import { getErrorMessage } from '../../shared/utils/getErrorMessage'; //TODO

const LOAD_ERROR = 'No se pudo obtener la disponibilidad del profesional.';
const SAVE_ERROR = 'No se pudo guardar la disponibilidad. Verificá los datos.';

const toTime = (value, fallback) => value?.slice(0, 5) || fallback;

// Convierte HH:mm a minutos para validar intervalos.
const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// Activa los días que devolvió el back.
// Acepta tanto el nombre en español (key) como en inglés (english).
function mergeWithExisting(existing) {
  return buildDefaultDays().map((day) => {
    const weekDay = WEEK_DAYS.find((w) => w.key === day.key);

    const found = existing.find((rule) => {
      const backendDay = String(rule.day).toUpperCase();

      return (
        backendDay === weekDay.key.toUpperCase() ||
        backendDay === weekDay.english.toUpperCase()
      );
    });

    if (!found) return day;

    return {
      ...day,
      active: true,
      startTime: toTime(found.startTime, day.startTime),
      endTime: toTime(found.endTime, day.endTime),
    };
  });
}

export function useDoctorAvailability(doctorId) {
  const [days, setDays] = useState(buildDefaultDays);
  const [hasSchedule, setHasSchedule] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setNotice('');
  }, [doctorId]);

  useEffect(() => {
    if (!doctorId) return;

    let ignore = false;

    const load = async () => {
      setLoading(true);
      setError('');

      try {
        const existing = await getDoctorAvailabilities(doctorId);

        if (ignore) return;

        setHasSchedule(existing.length > 0);
        setDays(mergeWithExisting(existing));
      } catch (err) {
        if (ignore) return;

        setError(getErrorMessage(err, LOAD_ERROR));
        setHasSchedule(false);
        setDays(buildDefaultDays());
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    load();

    return () => {
      ignore = true;
    };
  }, [doctorId, reloadKey]);

  const updateDay = useCallback((key, changes) => {
    setDays((prev) =>
      prev.map((day) => (day.key === key ? { ...day, ...changes } : day))
    );
  }, []);

  const toggleDay = (key) => {
    updateDay(key, {
      active: !days.find((d) => d.key === key).active,
    });
  };

  const changeTime = (key, field, value) => {
    updateDay(key, { [field]: value });
  };

  const save = async () => {
    setError('');
    setNotice('');

    const activeDays = days.filter((d) => d.active);

    // El back rechaza days vacío (ValidateRequest).
    if (activeDays.length === 0) {
      setError('Activá al menos un día de atención.');
      return;
    }

    // Validar horarios y múltiplos de 30 minutos.
    const invalid = activeDays.find(
      (d) =>
        !d.startTime ||
        !d.endTime ||
        d.startTime >= d.endTime ||
        timeToMinutes(d.startTime) % 30 !== 0 ||
        timeToMinutes(d.endTime) % 30 !== 0
    );

    if (invalid) {
      if (
        invalid.startTime &&
        invalid.endTime &&
        (timeToMinutes(invalid.startTime) % 30 !== 0 ||
          timeToMinutes(invalid.endTime) % 30 !== 0)
      ) {
        setError(
          `Los horarios deben respetar intervalos de 30 minutos (${invalid.label}).`
        );
      } else {
        setError(
          `El horario de entrada debe ser menor al de salida (${invalid.label}).`
        );
      }

      return;
    }

    setSaving(true);

    try {
      await saveDoctorAvailabilities(
        {
          doctorId,
          days: activeDays.map((d) => ({
            day: d.key,
            startTime: d.startTime,
            endTime: d.endTime,
          })),
        },
        hasSchedule
      );

      setNotice('Disponibilidad guardada correctamente.');

      // Releemos del back: es la fuente de verdad.
      setReloadKey((key) => key + 1);
    } catch (err) {
      setError(getErrorMessage(err, SAVE_ERROR));
    } finally {
      setSaving(false);
    }
  };

  return {
    days,
    hasSchedule,
    loading,
    saving,
    error,
    notice,
    toggleDay,
    changeTime,
    save,
  };
}
