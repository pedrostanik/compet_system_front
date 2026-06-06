import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, FileText, Download, MessageCircle, CheckCircle, XCircle } from 'lucide-react';
import {
  getReceipts, createReceipt, markAsPaid,
  cancelReceipt, downloadPdf, shareWhatsApp,
} from '@/api/receiptApi';
import { getProducts } from '@/api/productApi';
import type { ReceiptResponse, ReceiptRequest, ReceiptType, Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ReceiptForm from '@/components/receipts/ReceiptForm';

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendente', PAID: 'Pago', CANCELLED: 'Cancelado',
};

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PAID: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
};

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<ReceiptResponse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [createType, setCreateType] = useState<ReceiptType | null>(null);
  const [selected, setSelected] = useState<ReceiptResponse | null>(null);

  useEffect(() => {
    load();
    getProducts().then(setProducts).catch(() => {});
  }, []);

  async function load() {
    try {
      const data = await getReceipts();
      setReceipts(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Erro ao carregar recibos');
    }
  }

  async function handleCreate(data: ReceiptRequest) {
    try {
      await createReceipt(data);
      toast.success('Recibo criado');
      setCreateType(null);
      load();
    } catch {
      toast.error('Erro ao criar recibo');
    }
  }

  async function handlePay(id: number) {
    try {
      await markAsPaid(id);
      toast.success('Recibo marcado como pago');
      setSelected(null);
      load();
    } catch {
      toast.error('Erro ao atualizar recibo');
    }
  }

  async function handleCancel(id: number) {
    try {
      await cancelReceipt(id);
      toast.success('Recibo cancelado');
      setSelected(null);
      load();
    } catch {
      toast.error('Erro ao cancelar recibo');
    }
  }

  async function handleDownload(receipt: ReceiptResponse) {
    try {
      await downloadPdf(receipt.id, receipt.number);
    } catch {
      toast.error('Erro ao gerar PDF');
    }
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Recibos</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCreateType('SERVICE')}>
            <Plus size={16} className="mr-2" /> Recibo de Serviço
          </Button>
          <Button onClick={() => setCreateType('PRODUCT')}>
            <Plus size={16} className="mr-2" /> Recibo de Produto
          </Button>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-gray-500 text-xs uppercase">
              <th className="text-left px-4 py-3">Nº</th>
              <th className="text-left px-4 py-3">Tipo</th>
              <th className="text-left px-4 py-3">Cliente</th>
              <th className="text-left px-4 py-3">Pet</th>
              <th className="text-right px-4 py-3">Total</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Data</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {receipts.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-12 text-gray-400">
                  <FileText size={32} className="mx-auto mb-2 opacity-30" />
                  Nenhum recibo emitido
                </td>
              </tr>
            )}
            {receipts.map(r => (
              <tr key={r.id} className="border-b last:border-0 hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelected(r)}>
                <td className="px-4 py-3 font-mono text-xs text-indigo-600">{r.number}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    r.type === 'PRODUCT' ? 'bg-indigo-100 text-indigo-700' : 'bg-teal-100 text-teal-700'
                  }`}>
                    {r.type === 'PRODUCT' ? 'Produto' : 'Serviço'}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium">{r.customerName}</td>
                <td className="px-4 py-3 text-gray-500">{r.petName ?? '—'}</td>
                <td className="px-4 py-3 text-right font-semibold text-green-700">
                  R$ {r.total.toFixed(2).replace('.', ',')}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[r.status]}`}>
                    {STATUS_LABEL[r.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {new Date(r.createdAt).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 justify-end" onClick={e => e.stopPropagation()}>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0"
                      title="Baixar PDF" onClick={() => handleDownload(r)}>
                      <Download size={14} />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-green-600"
                      title="Enviar WhatsApp" onClick={() => shareWhatsApp(r)}>
                      <MessageCircle size={14} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dialog detalhe */}
      <Dialog open={!!selected} onOpenChange={o => { if (!o) setSelected(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Recibo {selected?.number}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="flex flex-col gap-4 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-gray-500">Cliente:</span> {selected.customerName}</div>
                <div><span className="text-gray-500">Pet:</span> {selected.petName ?? '—'}</div>
                <div><span className="text-gray-500">Status:</span>
                  <span className={`ml-1 text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[selected.status]}`}>
                    {STATUS_LABEL[selected.status]}
                  </span>
                </div>
                <div><span className="text-gray-500">Data:</span> {new Date(selected.createdAt).toLocaleDateString('pt-BR')}</div>
              </div>

              <table className="w-full text-xs border rounded-md overflow-hidden">
                <thead>
                  <tr className="bg-gray-50 text-gray-500">
                    <th className="text-left px-3 py-2">Descrição</th>
                    <th className="text-center px-3 py-2">Qtd</th>
                    <th className="text-right px-3 py-2">Unit.</th>
                    <th className="text-right px-3 py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.items.map(i => (
                    <tr key={i.id} className="border-t">
                      <td className="px-3 py-2">{i.description}</td>
                      <td className="px-3 py-2 text-center">{i.quantity}</td>
                      <td className="px-3 py-2 text-right">R$ {i.unitPrice.toFixed(2).replace('.', ',')}</td>
                      <td className="px-3 py-2 text-right font-medium">R$ {i.total.toFixed(2).replace('.', ',')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex flex-col items-end gap-1 text-sm">
                <div className="flex gap-4">
                  <span className="text-gray-500">Subtotal</span>
                  <span>R$ {selected.subtotal.toFixed(2).replace('.', ',')}</span>
                </div>
                {selected.discount > 0 && (
                  <div className="flex gap-4">
                    <span className="text-gray-500">Desconto</span>
                    <span className="text-red-500">- R$ {selected.discount.toFixed(2).replace('.', ',')}</span>
                  </div>
                )}
                <div className="flex gap-4 font-bold text-green-700 border-t pt-1">
                  <span>Total</span>
                  <span>R$ {selected.total.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>

              {selected.observations && (
                <p className="text-xs text-gray-500 italic">{selected.observations}</p>
              )}

              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => handleDownload(selected)}>
                  <Download size={14} className="mr-2" /> PDF
                </Button>
                <Button variant="outline" className="flex-1 text-green-600" onClick={() => shareWhatsApp(selected)}>
                  <MessageCircle size={14} className="mr-2" /> WhatsApp
                </Button>
                {selected.status === 'PENDING' && (
                  <>
                    <Button className="flex-1" onClick={() => handlePay(selected.id)}>
                      <CheckCircle size={14} className="mr-2" /> Pago
                    </Button>
                    <Button variant="destructive" className="flex-1" onClick={() => handleCancel(selected.id)}>
                      <XCircle size={14} className="mr-2" /> Cancelar
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog criar */}
      <Dialog open={!!createType} onOpenChange={o => { if (!o) setCreateType(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {createType === 'PRODUCT' ? 'Novo Recibo de Produto' : 'Novo Recibo de Serviço'}
            </DialogTitle>
          </DialogHeader>
          {createType && (
            <ReceiptForm
              type={createType}
              onSubmit={handleCreate}
              products={createType === 'PRODUCT' ? products : []}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}