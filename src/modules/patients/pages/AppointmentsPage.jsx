import { useCallback, useEffect, useState } from 'react';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import { instance } from '../../../shared/services/axiosInstance';
import useAuth from '../../auth/hooks/useAuth';

function formatDate(value) {
  if (!value) return 'Fecha no disponible';

  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'long',
  }).format(new Date(value));
}

function AppointmentsPage() {
  const { patientDni } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  const loadAppointments = useCallback(async () => {
    if (!patientDni) {
      setErrorMessage('No se encontró el DNI de la sesión. Vuelve a ingresar.');
      setLoading(false);
      return;
    }

    try {
      setErrorMessage('');
      const response = await instance.get('api/appointments/patient', {
        params: { dni: patientDni },
      });
      setAppointments(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
          'No se pudieron cargar tus turnos.'
      );
    } finally {
      setLoading(false);
    }
  }, [patientDni]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const cancelAppointment = async (appointmentId) => {
    if (!window.confirm('¿Quieres cancelar este turno?')) return;

    try {
      setCancellingId(appointmentId);
      await instance.delete(`api/appointments/${appointmentId}`);
      await loadAppointments();
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
          'No se pudo cancelar el turno.'
      );
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-med-text-main">
          Mis turnos médicos
        </h1>
        <p className="text-sm text-med-text-sub mt-1">
          Consulta y gestiona tus próximos turnos.
        </p>
      </div>

      {errorMessage && (
        <p role="alert" className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {errorMessage}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-med-text-sub">Cargando turnos…</p>
      ) : appointments.length === 0 ? (
        <Card className="p-6">
          <p className="text-med-text-sub">No tienes turnos próximos.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {appointments.map((appointment) => (
            <Card
              key={appointment.appointmentId}
              className="flex flex-col justify-between gap-4 p-6"
            >
              <div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-med-active-bg text-med-active-text">
                  {appointment.status}
                </span>
                <h2 className="text-lg font-bold text-med-primary-900 mt-3">
                  {appointment.doctorName}
                </h2>
                <p className="text-sm text-med-text-sub mt-2">
                  {formatDate(appointment.date)} · {appointment.startTime}
                </p>
              </div>

              <div className="pt-3 border-t border-med-border">
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={cancellingId === appointment.appointmentId}
                  onClick={() => cancelAppointment(appointment.appointmentId)}
                >
                  {cancellingId === appointment.appointmentId
                    ? 'Cancelando…'
                    : 'Cancelar turno'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default AppointmentsPage;
