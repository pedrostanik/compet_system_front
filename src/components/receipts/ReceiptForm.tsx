import { useState } from 'react';
import type { ReceiptRequest, ReceiptItemRequest, ReceiptType, Product } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus } from 'lucide-react';
import { useSubmitGuard } from '@/hooks/useSubmitGuard';

interface Props {
  type: ReceiptType;
  onSubmit: (data: ReceiptRequest) => void;
  products?: Product[];
  initialSchedulingId?: number;
  initialCustomerName?: string;
  initialPetName?: string;
}

const EMPTY_ITEM: ReceiptItemRequest = {
  description: '',
  quantity: 1,
  unitPrice: 0,
};

export default function ReceiptForm({
  type, onSubmit, products = [],
  initialSchedulingId, initialCustomerName, initialPetName,
}: Props) {
  const [form, setForm] = useState<ReceiptRequest>({
    type,
    customerName: initialCustomerName ?? '',
    petName: initialPetName ?? '',
    schedulingId: initialSchedulingId,
    observations: '',
    discount: 0,
    items: [{ ...EMPTY_ITEM }],
  });

    const [guardedSubmit, isSubmitting] = useSubmitGuard(async (data: ReceiptRequest) => {
      await onSubmit(data);
    });

  const subtotal = form.items.reduce((acc, i) => acc + i.quantity * i.unitPrice, 0);
  const total = subtotal - (form.discount ?? 0);

  function setField(field: keyof ReceiptRequest, value: unknown) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function setItem(index: number, field: keyof ReceiptItemRequest, value: unknown) {
    setForm(f => {
      const items = [...f.items];
      items[index] = { ...items[index], [field]: value };
      return { ...f, items };
    });
  }

  function addItem() {
    setForm(f => ({ ...f, items: [...f.items, { ...EMPTY_ITEM }] }));
  }

  function removeItem(index: number) {
    setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== index) }));
  }

  function handleProductSelect(index: number, productId: string) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    setForm(f => {
      const items = [...f.items];
      items[index] = {
        ...items[index],
        description: product.name,
        unitPrice: product.salePrice,
        productId: Number(product.id),
        productSku: product.sku,
      };
      return { ...f, items };
    });
  }

  return (
    <div className="flex flex-col gap-5">

      {/* Cliente */}
      <section>
        <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Cliente</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Nome do cliente *</Label>
            <Input
              value={form.customerName}
              onChange={e => setField('customerName', e.target.value)}
              placeholder="Ex: João Silva"
            />
          </div>
          <div>
            <Label>Nome do pet</Label>
            <Input
              value={form.petName ?? ''}
              onChange={e => setField('petName', e.target.value)}
              placeholder="Ex: Rex"
            />
          </div>
          {initialSchedulingId && (
            <div>
              <Label>Agendamento vinculado</Label>
              <Input value={`#${initialSchedulingId}`} disabled className="bg-gray-50" />
            </div>
          )}
        </div>
      </section>

      {/* Itens */}
      <section>
        <div className="flex justify-between items-center mb-3">
          <p className="text-xs font-semibold text-gray-400 uppercase">Itens</p>
          <Button size="sm" variant="outline" onClick={addItem}>
            <Plus size={14} className="mr-1" /> Adicionar item
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          {form.items.map((item, index) => (
            <div key={index} className="border rounded-md p-3 bg-gray-50">
              {/* Seletor de produto (só para recibo de produto) */}
              {type === 'PRODUCT' && products.length > 0 && (
                <div className="mb-2">
                  <Label className="text-xs">Selecionar produto do catálogo</Label>
                  <Select onValueChange={v => handleProductSelect(index, v)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Escolha um produto..." />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map(p => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.sku} — {p.name} (R$ {p.salePrice.toFixed(2).replace('.', ',')})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-5">
                  <Label className="text-xs">Descrição *</Label>
                  <Input
                    className="h-8 text-xs"
                    value={item.description}
                    onChange={e => setItem(index, 'description', e.target.value)}
                    placeholder="Ex: Banho e tosa"
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Qtd</Label>
                  <Input
                    className="h-8 text-xs"
                    type="number"
                    min="0.001"
                    step="0.001"
                    value={item.quantity}
                    onChange={e => setItem(index, 'quantity', Number(e.target.value))}
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Preço unit.</Label>
                  <Input
                    className="h-8 text-xs"
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={e => setItem(index, 'unitPrice', Number(e.target.value))}
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Total</Label>
                  <div className="h-8 flex items-center px-2 text-xs bg-white border rounded-md font-medium text-green-700">
                    R$ {(item.quantity * item.unitPrice).toFixed(2).replace('.', ',')}
                  </div>
                </div>
                <div className="col-span-1 flex justify-end">
                  {form.items.length > 1 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-red-400 hover:text-red-600"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Desconto e totais */}
      <section>
        <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Valores</p>
        <div className="flex flex-col gap-2 items-end">
          <div className="flex items-center gap-3">
            <Label className="text-sm text-gray-500 w-24 text-right">Subtotal</Label>
            <div className="w-32 text-right font-medium text-sm">
              R$ {subtotal.toFixed(2).replace('.', ',')}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Label className="text-sm text-gray-500 w-24 text-right">Desconto (R$)</Label>
            <Input
              className="w-32 h-8 text-sm text-right"
              type="number"
              min="0"
              step="0.01"
              value={form.discount ?? 0}
              onChange={e => setField('discount', Number(e.target.value))}
            />
          </div>
          <div className="flex items-center gap-3 border-t pt-2">
            <Label className="text-sm font-bold w-24 text-right">Total</Label>
            <div className="w-32 text-right font-bold text-green-700">
              R$ {total.toFixed(2).replace('.', ',')}
            </div>
          </div>
        </div>
      </section>

      {/* Observações */}
      <section>
        <Label>Observações</Label>
        <Input
          value={form.observations ?? ''}
          onChange={e => setField('observations', e.target.value)}
          placeholder="Ex: Pagamento via Pix"
        />
      </section>

       <Button
              onClick={() => guardedSubmit(form)}
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'Gerando...' : 'Gerar recibo'}
            </Button>
    </div>
  );
}