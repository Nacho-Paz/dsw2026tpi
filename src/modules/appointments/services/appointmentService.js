import { instance } from '../../../shared/services/axiosInstance';
import { getSpecialties } from '../../specialties/services/specialtyService';
import { getAllDoctors } from '../../doctors/services/doctorService';

// Respuesta del backend (Pagination<T>): { pageSize, pageIndex, total, data }
export const searchAppointments = async ({
  dni,
  specialtyId,
  doctorId,
  date,
  pageIndex = 1, // el backend es 1-based
  pageSize = 10,
} = {}) => {
  const params = { pageIndex, pageSize };

  if (dni?.trim()) params.dni = dni.trim();

  if (specialtyId) params.specialtyId = specialtyId;

  if (doctorId) params.doctorId = doctorId;

  if (date) params.date = date; // yyyy-MM-dd

  const { data } = await instance.get('/api/appointments/search', { params });

  return { items: data.data ?? [], total: data.total ?? 0 };
};

export { getSpecialties, getAllDoctors as getDoctors };

const AppointmentsService = {
  searchAppointments,
  getSpecialties,
  getDoctors: getAllDoctors,
};

export default AppointmentsService;
