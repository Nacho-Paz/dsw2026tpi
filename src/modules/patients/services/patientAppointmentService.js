import { instance } from '../../shared/api/axiosInstance';

export async function getDoctorsForPatient() {
  const { data } = await instance.get('/api/doctors', {
    params: { pageSize: 100, pageIndex: 0 },
  });
  return data.data ?? [];
}

export async function getDoctorAvailabilities(doctorId) {
  const { data } = await instance.get(
    `/api/doctors/${doctorId}/availabilities`
  );
  return Array.isArray(data) ? data : [];
}

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
