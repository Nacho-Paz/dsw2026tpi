import { instance } from '../../shared/api/axiosInstance';
import { toPageIndex } from '../../shared/helpers/pagination';

// Con VITE_USE_MOCK=true (en .env.development.local) la búsqueda usa datos de prueba.
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Mismo formato que AppointmentModel.SearchItem del back (hoy sin fecha ni hora).
const mockDoctors = [
  {
    doctorId: '1',
    name: 'Dr. Alejandro Rivera',
    specialty: { specialtyId: 'a', name: 'Cardiología Clínica' },
  },
  {
    doctorId: '2',
    name: 'Dra. Elena Martínez',
    specialty: { specialtyId: 'b', name: 'Pediatría Avanzada' },
  },
  {
    doctorId: '3',
    name: 'Dr. Marcos Torres',
    specialty: { specialtyId: 'c', name: 'Neurocirugía' },
  },
];

const mockStatuses = ['BOOKED', 'BOOKED', 'ATTENDED', 'CANCELLED', 'NO_SHOW'];

const mockAppointments = Array.from({ length: 12 }, (_, i) => ({
  appointmentId: `t${i + 1}`,
  appointmentStatus: mockStatuses[i % mockStatuses.length],
  patient: { dni: 40123456 + i, fullName: `Paciente de Prueba ${i + 1}` },
  doctor: mockDoctors[i % mockDoctors.length],
}));

// GET /api/appointments/search   (solo Administrador)
// El controller recibe pageSize, pageIndex, specialtyId, doctorId, dni y date.
// Los filtros vacíos no se envían. El dni va solo con números (sin puntos).
// Respuesta (PaginatedResponse): { pageSize, pageIndex, total, data: [SearchItem] }
// SearchItem: { appointmentId, appointmentStatus, patient: { dni, fullName },
//               doctor: { doctorId, name, specialty: { specialtyId, name } } }
export const searchAppointments = async ({
  page = 1,
  pageSize = 10,
  specialtyId,
  doctorId,
  dni,
  date,
}) => {
  if (USE_MOCK) {
    await wait(500);
    const filtered = mockAppointments.filter(
      (item) =>
        (!dni || String(item.patient.dni) === String(dni)) &&
        (!doctorId || item.doctor.doctorId === doctorId) &&
        (!specialtyId || item.doctor.specialty.specialtyId === specialtyId)
    );
    const start = (page - 1) * pageSize;
    return {
      pageSize,
      pageIndex: toPageIndex(page),
      total: filtered.length,
      data: filtered.slice(start, start + pageSize),
    };
  }

  const res = await instance.get('/api/appointments/search', {
    params: {
      pageSize,
      pageIndex: toPageIndex(page),
      specialtyId: specialtyId || undefined,
      doctorId: doctorId || undefined,
      dni: dni || undefined,
      date,
    },
  });
  return res.data;
};

// GET /api/appointments?date=YYYY-MM-DD   (solo Administrador)
export const getAppointmentsByDate = (date) =>
  instance
    .get('/api/appointments', { params: { date } })
    .then((res) => res.data);

// GET /api/appointments/patient?dni=   (Paciente o Administrador)
export const getPatientAppointments = (dni) =>
  instance
    .get('/api/appointments/patient', { params: { dni } })
    .then((res) => res.data);

// POST /api/appointments   (solo Paciente)
// Body según AppointmentModel.Request del back:
//   { doctorId, availabilitySlotId, patient: { dni }, reason }
// OJO: el campo es availabilitySlotId (la consigna decía availabilityId).
export const createAppointment = (appointment) =>
  instance.post('/api/appointments', appointment).then((res) => res.data);

// DELETE /api/appointments/{id}   (cancela el turno)
export const cancelAppointment = (id) =>
  instance.delete(`/api/appointments/${id}`);