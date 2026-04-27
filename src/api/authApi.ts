import api from './axios';


export const login = (username: string, password: string) =>
  api.post<{ token: string }>('/api/auth/login', { username, password })
    .then(r => r.data.token);