import { searchAppointments } from '../../appointments/services/appointmentService';
import { getDoctors } from '../../doctors/services/doctorService';
import { getSpecialties } from '../../specialties/services/specialtyService';

const today = () => new Date().toISOString().slice(0, 10);

export async function getDashboardOverview() {
  const [doctorsResult, specialties, appointmentsResult] = await Promise.all([
    getDoctors({ page: 1, pageSize: 5 }),
    getSpecialties(),
    searchAppointments({ date: today(), pageIndex: 1, pageSize: 1 }),
  ]);

  return {
    doctors: doctorsResult.data ?? [],
    totalDoctors: doctorsResult.total ?? 0,
    totalSpecialties: specialties.length,
    totalAppointmentsToday: appointmentsResult.total ?? 0,
  };
}
