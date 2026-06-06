import type { Product, ProductRequest } from '@/types';
import api from './axios';

export async function getProducts(): Promise<Product[]> {
  const { data } = await api.get('/api/products');
  console.log('products response:', data);
  return data;
}

export async function getProduct(id: string): Promise<Product> {
  const { data } = await api.get(`/api/products/${id}`);
  return data;
}

export async function createProduct(req: ProductRequest): Promise<Product> {
  const { data } = await api.post(`/api/products`, req);
  return data;
}

export async function updateProduct(id: string, req: ProductRequest): Promise<Product> {
  const { data } = await api.put(`/api/products/${id}`, req);
  return data;
}

export async function deactivateProduct(id: string): Promise<void> {
  await api.delete(`/api/products/${id}`);
}

export async function updateStock(id: string, qty: number): Promise<void> {
  await api.patch(`/api/products/${id}/stock`, null, { params: { qty } });
}

export async function searchProducts(term: string): Promise<Product[]> {
  const { data } = await api.get('/api/products/search', { params: { term } });
  return data;
}

export async function getBelowMinStock(): Promise<Product[]> {
  const { data } = await api.get('/api/products/below-min-stock');
  return data;
}