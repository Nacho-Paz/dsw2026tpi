import { instance } from '../../../shared/services/axiosInstance';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const mockSpecialties = [
  { id: 'a', name: 'Cardiología Clínica' },
  { id: 'b', name: 'Pediatría Avanzada' },
  { id: 'c', name: 'Neurocirugía' },
  { id: 'd', name: 'Ginecología' },
];

// Devuelve un formato único para el selector aunque el backend use specialtyId.
export async function getSpecialties() {
  if (USE_MOCK) return mockSpecialties;

  const { data } = await instance.get('/api/specialties', {
    params: { pageIndex: 0, pageSize: 100 },
  });

  return (data.data ?? []).map((specialty) => ({
    ...specialty,
    id: specialty.id ?? specialty.specialtyId,
  }));
}

export async function createSpecialty({ name, description }) {
  const { data } = await instance.post('/api/specialties', {
    name,
    description,
  });

  return data;
}

export async function updateSpecialty(id, { name, description }) {
  const { data } = await instance.put(`/api/specialties/${id}`, {
    name,
    description,
  });

  return data;
}

export async function deleteSpecialty(id) {
  await instance.delete(`/api/specialties/${id}`);
}
