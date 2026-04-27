import type { SchedulingProtocol } from '@/types/index.ts';
import api from './axios';


api.interceptors.request.use(request => {
  console.log('API call:', request.method, request.url);
  return request;
});

export interface SchedulingRequest {
  customerId: number;
  customerName: string;
  petId: number;
  petName: string;
  schedulingObservations?: string;
  time: string;
  isPackage: boolean;
  protocolIds: number[];
}

export interface SchedulingResponse {
  id: number;
  customerId: number;
  customerName: string;
  petId: number;
  petName: string;
  schedulingObservations?: string;
  time: string;
  scheduleHappened: boolean;
  isPackage: boolean;
  protocols: SchedulingProtocol[];
}

export const getSchedulings = () =>
  api.get<SchedulingResponse[]>('/api/scheduling').then(r => r.data);

export const createScheduling = (data: SchedulingRequest) =>
  api.post<SchedulingResponse>('/api/scheduling', data).then(r => r.data);

export const deleteScheduling = (id: number) =>
  api.delete(`/api/scheduling/${id}`);

export const updateSchedulingTime = (id: number, data: SchedulingRequest) =>
  api.put<SchedulingResponse>(`/api/scheduling/${id}`, data).then(r => r.data);

export const markAsHappened = (id: number) =>
   api.patch<SchedulingResponse>(`/api/scheduling/${id}`).then(r => r.data);