import type { Pack, PackRequest } from '@/types/index.ts';
import api from './axios';

api.interceptors.request.use(request => {
  console.log('API call:', request.method, request.url);
  return request;
});

export const getPacks = () =>
  api.get<Pack[]>('/api/pack').then(r => r.data);

export const getPack = (id: number) =>
  api.get<Pack>(`/api/pack/${id}`).then(r => r.data);

export const createPack = (data: PackRequest) =>
  api.post<Pack>('/api/pack', data).then(r => r.data);

export const deletePack = (id: number) =>
  api.delete(`/api/pack/${id}`);

export const updatePack = (id: number, data: PackRequest) =>
  api.put<Pack>(`/api/pack/${id}`, data).then(r => r.data);