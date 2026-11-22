import { instance } from '../../shared/api/axiosInstance';
import { toPageIndex } from '../../shared/helpers/pagination';

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

// GET /api/doctors?pageSize=&pageIndex=&name=
// Respuesta (PaginatedResponse): { pageSize, pageIndex, total, data: [...] }
// Cada doctor: { id, name, licenseNumber, specialty: { specialtyId, name } }
// "page" empieza en 1 (como TablePagination); toPageIndex lo convierte al
// pageIndex que espera el back.
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
      (item) => item.specialtyId === specialtyId
    );

    mockDoctors = [
      {
        id: crypto.randomUUID(),
        name,
        licenseNumber,
        specialty,
      },
      ...mockDoctors,
    ];

    return;
  }

  const { data } = await instance.post('/api/doctors', {
    name,
    licenseNumber,
    specialtyId,
  });

  return data;
}
