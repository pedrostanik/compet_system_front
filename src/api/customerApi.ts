import axios from 'axios';
import type { Customer } from '@/types/index.ts';
import type { CustomerRequest } from '@/types/index.ts';
import type { PetRequest } from '@/types/index.ts';

const api = axios.create({
  baseURL: 'http://localhost:8080',
});

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

export const removePet = (customerId: number, petId: number) =>
  api.delete(`/api/customers/${customerId}/pets/${petId}`);
