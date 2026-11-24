import { instance } from '../../../shared/services/axiosInstance';

export async function bookPatientAppointment({
  doctorId,
  availabilitySlotId,
  dni,
  reason,
}) {
  const { data } = await instance.post('/api/appointments', {
    doctorId,
    availabilitySlotId,
    patient: { dni: Number(dni) },
    reason,
  });

  return data;
}

export async function getPatientAppointments(dni) {
  const { data } = await instance.get('/api/appointments/patient', {
    params: { dni },
  });

  return Array.isArray(data) ? data : [];
}

export async function cancelPatientAppointment(appointmentId) {
  await instance.delete(`/api/appointments/${appointmentId}`);
}
