import api from './axios';

import type { AbsentCustomer } from '@/types';

export const getReport = () =>
  api.get<string>('/api/report').then(r => r.data);

export const getAbsentCustomers = () =>
  api.get<AbsentCustomer[]>('/api/report/absent').then(r => r.data);