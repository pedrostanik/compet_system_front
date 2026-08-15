import api from './axios';

import type { PetHistory } from '@/types/index.ts';
export type { PetHistory };

export const getPetHistory = (petId: number) =>
  api.get<PetHistory[]>(`/api/history/${petId}`).then(r => r.data);