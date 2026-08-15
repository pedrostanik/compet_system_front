import api from './axios';

import type { SchedulingRequest, SchedulingResponse, FutureScheduleRequest } from '@/types/index.ts';
export type { SchedulingRequest, SchedulingResponse, FutureScheduleRequest };


api.interceptors.request.use(request => {
  console.log('API call:', request.method, request.url);
  return request;
});

export const getSchedulings = () =>
  api.get<SchedulingResponse[]>('/api/scheduling').then(r => r.data);

  export const getScheduling = (id: number) =>
    api.get<SchedulingResponse>(`/api/scheduling/${id}`).then(r => r.data);

export const createScheduling = (data: SchedulingRequest) =>
  api.post<SchedulingResponse>('/api/scheduling', data).then(r => r.data);

export const deleteScheduling = (id: number) =>
  api.delete(`/api/scheduling/${id}`);

export const updateSchedulingTime = (id: number, data: SchedulingRequest) =>
  api.put<SchedulingResponse>(`/api/scheduling/${id}`, data).then(r => r.data);

export const changeStatus = (id: number, status: string) =>
   api.patch<SchedulingResponse>(`/api/scheduling/${id}/${status}`).then(r => r.data);

export const createFutureFromPack = (data: FutureScheduleRequest) =>
  api.post<SchedulingResponse[]>('/api/scheduling/future-schedules', data).then(r => r.data);

  export const updateFutureFromPack = (id: number, data: FutureScheduleRequest) =>
    api.put<SchedulingResponse[]>(`/api/scheduling/${id}/future-schedules`, data).then(r => r.data);
