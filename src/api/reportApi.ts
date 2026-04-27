import api from './axios';

export const getReport = () =>
  api.get<string>('/api/report').then(r => r.data);