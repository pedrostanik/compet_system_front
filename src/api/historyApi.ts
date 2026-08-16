import api from './axios';

import type { PetHistory, FrequencyPoint } from '@/types/index.ts';
export type { PetHistory, FrequencyPoint };

export const getPetHistory = (petId: number) =>
  api.get<PetHistory[]>(`/api/history/${petId}`).then(r => r.data);

  export const getPetFrequency = (petId: number) =>
    api.get<[string, number][]>(`/api/history/frequency/${petId}`)
      .then(r => r.data.map(([date, count]) => ({ date, count })));