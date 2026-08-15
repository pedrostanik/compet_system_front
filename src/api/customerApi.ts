import type { Customer } from '@/types/index.ts';
import type { CustomerRequest } from '@/types/index.ts';
import type { PetRequest } from '@/types/index.ts';
import api from './axios';

export const getCustomers = () =>
  api.get<Customer[]>('/api/customers').then(r => r.data);

export const getCustomer = (id: number) =>
  api.get<Customer>(`/api/customers/${id}`).then(r => r.data);

export const createCustomer = (data: CustomerRequest) =>
  api.post<Customer>('/api/customers', data).then(r => r.data);

export const updateCustomer = (id: number, data: CustomerRequest) =>
  api.put<Customer>(`/api/customers/${id}`, data).then(r => r.data);

export const deleteCustomer = (id: number) =>
  api.delete(`/api/customers/${id}`);

export const addPet = (customerId: number, data: PetRequest) =>
  api.post<Customer>(`/api/customers/${customerId}/pets`, data).then(r => r.data);

export const updatePet = (customerId: number, petId: number, data: PetRequest) =>
  api.put<Customer>(`/api/customers/${customerId}/pets/${petId}`, data).then(r => r.data);

export const removePet = (customerId: number, petId: number) =>
  api.delete(`/api/customers/${customerId}/pets/${petId}`);

export async function searchCustomer(term: string): Promise<Customer[]> {
   const { data } = await api.get('/api/customers/search', { params: { term } });
   return data;
 }
