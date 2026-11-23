import { instance } from '../../shared/api/axiosInstance';
import { CATALOG_PAGE_SIZE } from '../constants/appointmentConstants';

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

// TODO: reutilizar los servicios de doctors y specialties si ya existen
const getCatalog = async (url) => {
  const { data } = await instance.get(url, {
    params: { pageIndex: 1, pageSize: CATALOG_PAGE_SIZE },
  });

  return data.data ?? [];
};

export const getSpecialties = () => getCatalog('/api/specialties');
export const getDoctors = () => getCatalog('/api/doctors');

const AppointmentsService = { searchAppointments, getSpecialties, getDoctors };

export default AppointmentsService;
