import type { Protocol } from '@/types/index.ts';
import type { ProtocolRequest } from '@/types/index.ts';
import api from './axios';

export const getProtocols = () =>
  api.get<Protocol[]>('/api/protocol').then(r => r.data);

export const getProtocol = (id: number) =>
  api.get<Protocol>(`/api/protocol/${id}`).then(r => r.data);

export const createProtocol = (data: ProtocolRequest) =>
  api.post<Protocol>('/api/protocol', data).then(r => r.data);

export const updateProtocol = (id: number, data: ProtocolRequest) =>
  api.put<Protocol>(`/api/protocol/${id}`, data).then(r => r.data);

export const deleteProtocol = (id: number) =>
  api.delete(`/api/protocol/${id}`);
