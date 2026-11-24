import { instance } from '../../../shared/services/axiosInstance';
import { toPageIndex } from '../../../shared/helpers/pagination';
import { WEEK_DAYS } from '../constants/weekDays';

// Si en .env.development.local ponés VITE_USE_MOCK=true, el servicio usa datos
// de prueba y no necesita el back. Sin esa variable, llama a la API real.
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const mockSpecialties = [
  { specialtyId: 'a', name: 'Cardiología Clínica' },
  { specialtyId: 'b', name: 'Pediatría Avanzada' },
  { specialtyId: 'c', name: 'Neurocirugía' },
  { specialtyId: 'd', name: 'Ginecología' },
];

let mockDoctors = [
  {
    id: '1',
    name: 'Dr. Alejandro Rivera',
    licenseNumber: 'MED-4920',
    specialty: mockSpecialties[0],
  },
  {
    id: '2',
    name: 'Dra. Elena Martínez',
    licenseNumber: 'MED-2104',
    specialty: mockSpecialties[1],
  },
  {
    id: '3',
    name: 'Dr. Marcos Torres',
    licenseNumber: 'MED-8831',
    specialty: mockSpecialties[2],
  },
  {
    id: '4',
    name: 'Dra. Lucía Soria',
    licenseNumber: 'MED-1192',
    specialty: mockSpecialties[3],
  },
  ...Array.from({ length: 20 }, (_, i) => ({
    id: `p${i + 1}`,
    name: `Dr. Prueba ${i + 1}`,
    licenseNumber: `MED-${5000 + i}`,
    specialty: mockSpecialties[i % mockSpecialties.length],
  })),
];

// Mock: { [doctorId]: [{ id, day: 'Monday', startTime, endTime }] }
let mockAvailabilities = {};

// GET /api/doctors?pageSize=&pageIndex=&name=
// Respuesta (PaginatedResponse): { pageSize, pageIndex, total, data: [...] }
// Cada doctor: { id, name, licenseNumber, specialty: { specialtyId, name } }
// "page" empieza en 1 (como TablePagination); el backend usa índice desde 0.
export const getDoctors = async ({ name, page = 1, pageSize = 10 } = {}) => {
  if (USE_MOCK) {
    await wait(500); // simula la demora de la red para ver "Cargando..."
    const text = (name ?? '').toLowerCase();
    const filtered = mockDoctors.filter((doctor) =>
      doctor.name.toLowerCase().includes(text)
    );
    const start = (page - 1) * pageSize;

    return {
      pageSize,
      pageIndex: toPageIndex(page),
      total: filtered.length,
      data: filtered.slice(start, start + pageSize),
    };
  }

  const res = await instance.get('/api/doctors', {
    params: {
      pageSize,
      pageIndex: toPageIndex(page),
      name: name || undefined,
    },
  });

  return res.data;
};

export const getAllDoctors = async () => {
  const result = await getDoctors({ page: 1, pageSize: 100 });

  return result.data;
};

// DELETE /api/doctors/{id}  (eliminación lógica en el back)
export const deleteDoctor = async (id) => {
  if (USE_MOCK) {
    await wait(300);
    mockDoctors = mockDoctors.filter((doctor) => doctor.id !== id);

    return;
  }

  await instance.delete(`/api/doctors/${id}`);
};

export async function createDoctor({ name, licenseNumber, specialtyId }) {
  if (USE_MOCK) {
    await wait(300);
    const specialty = mockSpecialties.find(
      (s) => s.specialtyId === specialtyId
    ) ?? { specialtyId, name: 'Sin especialidad' };
    const doctor = { id: `m${Date.now()}`, name, licenseNumber, specialty };

    mockDoctors = [doctor, ...mockDoctors];

    return doctor;
  }

  const { data } = await instance.post('/api/doctors', {
    name,
    licenseNumber,
    specialtyId,
  });

  return data;
}

export async function updateDoctor(id, { name, licenseNumber, specialtyId }) {
  if (USE_MOCK) {
    await wait(300);
    const specialty = mockSpecialties.find(
      (s) => s.specialtyId === specialtyId
    ) ?? { specialtyId, name: 'Sin especialidad' };
    const updated = { id, name, licenseNumber, specialty };

    mockDoctors = mockDoctors.map((d) => (d.id === id ? updated : d));

    return updated;
  }

  const { data } = await instance.put(`/api/doctors/${id}`, {
    name,
    licenseNumber,
    specialtyId,
  });

  return data;
}

// GET /api/doctors/{id}/availabilities (mes actual). "day" viene en inglés.
export const getDoctorAvailabilities = async (doctorId) => {
  if (USE_MOCK) {
    await wait(300);

    return mockAvailabilities[doctorId] ?? [];
  }

  const { data } = await instance.get(
    `/api/doctors/${doctorId}/availabilities`
  );

  return data;
};

// POST crea, PUT reemplaza. Body: { doctorId, days: [{ day, startTime, endTime }] }
// "day" va en español (LUNES, MIÉRCOLES...).
export const saveDoctorAvailabilities = async (payload, isUpdate) => {
  if (USE_MOCK) {
    await wait(300);
    mockAvailabilities[payload.doctorId] = payload.days.map((d, i) => {
      const english = WEEK_DAYS.find((w) => w.key === d.day)?.english ?? d.day;

      return {
        id: `${payload.doctorId}-${i}`,
        day: english[0] + english.slice(1).toLowerCase(),
        startTime: d.startTime,
        endTime: d.endTime,
      };
    });

    return;
  }

  const { data } = isUpdate
    ? await instance.put('/api/availabilities', payload)
    : await instance.post('/api/availabilities', payload);

  return data;
};
