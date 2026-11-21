import {instance} from '../../shared/api/axiosInstance';

export async function getDoctors(name = '') {
  const { data } = await instance.get('/doctors', {
    params: name ? { name } : {},
  });

  return {
    data: data.data ?? data,
    total: data.total ?? data.length,
  };
}

export async function deleteDoctor(id) {
  await instance.delete(`/doctors/${id}`);
}