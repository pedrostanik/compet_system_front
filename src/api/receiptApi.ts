import api from './axios';
import type { ReceiptRequest, ReceiptResponse } from '@/types';

export async function getReceipts(): Promise<ReceiptResponse[]> {
  const { data } = await api.get('/api/receipts');
  return data;
}

export async function getReceipt(id: number): Promise<ReceiptResponse> {
  const { data } = await api.get(`/api/receipts/${id}`);
  return data;
}

export async function createReceipt(req: ReceiptRequest): Promise<ReceiptResponse> {
  const { data } = await api.post('/api/receipts', req);
  return data;
}

export async function markAsPaid(id: number): Promise<ReceiptResponse> {
  const { data } = await api.patch(`/api/receipts/${id}/pay`);
  return data;
}

export async function cancelReceipt(id: number): Promise<ReceiptResponse> {
  const { data } = await api.patch(`/api/receipts/${id}/cancel`);
  return data;
}

export async function downloadPdf(id: number, number: string): Promise<void> {
  const response = await api.get(`/api/receipts/${id}/pdf`, { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `recibo-${number}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function shareWhatsApp(receipt: ReceiptResponse): Promise<void> {
  const text = encodeURIComponent(
    `Olá ${receipt.customerName}! Segue o recibo *${receipt.number}* ` +
    `no valor de R$ ${receipt.total.toFixed(2).replace('.', ',')}. ` +
    `Obrigado pela preferência! 🐾`
  );
  window.open(`https://wa.me/?text=${text}`, '_blank');
}