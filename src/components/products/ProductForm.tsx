import { useState } from 'react';
import type { ProductRequest, ProductCategory, AnimalTarget } from '@/types';
import { CATEGORY_LABELS } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSubmitGuard } from '@/hooks/useSubmitGuard';

interface Props {
  onSubmit: (data: ProductRequest) => void;
  initial?: Partial<ProductRequest>;
}

const EMPTY: ProductRequest = {
  name: '',
  category: '',
  animalTarget: '',
  brand: '',
  unit: 'UN',
  costPrice: '',
  salePrice: '',
  barcode: '',
  minStockQty: '',
  currentStockQty: '',
  shelfLocation: '',
  ncm: '',
  loose: false,
  size: '',
  color: '',
};

const CATEGORY_PREFIXES: Record<string, string> = {
  ROU: 'ROU', ACE: 'ACE', BRI: 'BRI',
  CAM: 'CAM', HIG: 'HIG', ALI: 'ALI', OUT: 'OUT',
};

const ANIMAL_OPTIONS: { value: AnimalTarget; label: string }[] = [
  { value: 'DOG',    label: 'Cão' },
  { value: 'CAT',    label: 'Gato' },
  { value: 'BIRD',   label: 'Pássaro' },
  { value: 'FISH',   label: 'Peixe' },
  { value: 'RODENT', label: 'Roedor' },
  { value: 'REPTILE',label: 'Réptil' },
  { value: 'ALL',    label: 'Todos' },
];

const SIZE_OPTIONS = ['PP', 'P', 'M', 'G', 'GG', 'U', 'Único'];
const UNIT_OPTIONS = ['UN', 'KG', 'LT', 'CX', 'PCT', 'ML', 'G'];

export default function ProductForm({ onSubmit, initial }: Props) {
  const [form, setForm] = useState<ProductRequest>({ ...EMPTY, ...initial });

    const [guardedSubmit, isSubmitting] = useSubmitGuard(async (data: ProductRequest) => {
      await onSubmit(data);
    });

  const margin =
    form.costPrice !== '' && form.salePrice !== '' && Number(form.salePrice) > 0
      ? (((Number(form.salePrice) - Number(form.costPrice)) / Number(form.salePrice)) * 100).toFixed(1)
      : null;

  const skuPreview =
    form.category
      ? `${CATEGORY_PREFIXES[form.category]}-AVU-###`
      : '---';

  function set(field: keyof ProductRequest, value: unknown) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function handle(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  }

  function handleSubmit() {
    guardedSubmit(form);
  }

  return (
    <div className="flex flex-col gap-5">

      {/* SKU preview */}
      <div className="bg-gray-50 border rounded-md px-4 py-3 flex items-center justify-between">
        <span className="text-sm text-gray-500">SKU gerado automaticamente</span>
        <span className="font-mono font-semibold text-indigo-600 tracking-widest">{skuPreview}</span>
      </div>

      {/* Identificação */}
      <section>
        <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Identificação</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Label>Nome do produto *</Label>
            <Input name="name" value={form.name} onChange={handle} placeholder="Ex: Roupinha Estampada Cão" />
          </div>

          <div>
            <Label>Categoria *</Label>
            <Select value={form.category} onValueChange={v => set('category', v as ProductCategory)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Animal *</Label>
            <Select value={form.animalTarget} onValueChange={v => set('animalTarget', v as AnimalTarget)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {ANIMAL_OPTIONS.map(o => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Marca</Label>
            <Input name="brand" value={form.brand ?? ''} onChange={handle} placeholder="Ex: PetLove" />
          </div>

          <div>
            <Label>Unidade</Label>
            <Select value={form.unit} onValueChange={v => set('unit', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {UNIT_OPTIONS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-2">
            <Label>Código de barras</Label>
            <Input name="barcode" value={form.barcode ?? ''} onChange={handle} placeholder="Deixe em branco para avulsos" />
          </div>
        </div>
      </section>

      {/* Variação */}
      <section>
        <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Variação</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Tamanho</Label>
            <Select value={form.size ?? ''} onValueChange={v => set('size', v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">—</SelectItem>
                {SIZE_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Cor / Modelo</Label>
            <Input name="color" value={form.color ?? ''} onChange={handle} placeholder="Ex: Rosa, Xadrez" />
          </div>
        </div>
      </section>

      {/* Preços */}
      <section>
        <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Preço</p>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label>Custo (R$) *</Label>
            <Input
              name="costPrice"
              type="number"
              step="0.01"
              min="0"
              value={form.costPrice}
              onChange={handle}
              placeholder="0,00"
            />
          </div>

          <div>
            <Label>Preço de venda (R$) *</Label>
            <Input
              name="salePrice"
              type="number"
              step="0.01"
              min="0"
              value={form.salePrice}
              onChange={handle}
              placeholder="0,00"
            />
          </div>

          <div>
            <Label>Margem</Label>
            <div className={`flex items-center h-10 px-3 rounded-md border text-sm font-semibold ${
              margin === null ? 'text-gray-400' :
              Number(margin) >= 40 ? 'text-green-600 bg-green-50 border-green-200' :
              Number(margin) >= 20 ? 'text-yellow-600 bg-yellow-50 border-yellow-200' :
                                     'text-red-600 bg-red-50 border-red-200'
            }`}>
              {margin !== null ? `${margin}%` : '—'}
            </div>
          </div>
        </div>
      </section>

      {/* Estoque */}
      <section>
        <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Estoque</p>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label>Estoque atual</Label>
            <Input
              name="currentStockQty"
              type="number"
              step="1"
              min="0"
              value={form.currentStockQty}
              onChange={handle}
              placeholder="0"
            />
          </div>

          <div>
            <Label>Estoque mínimo</Label>
            <Input
              name="minStockQty"
              type="number"
              step="1"
              min="0"
              value={form.minStockQty}
              onChange={handle}
              placeholder="0"
            />
          </div>

          <div>
            <Label>Localização</Label>
            <Input name="shelfLocation" value={form.shelfLocation ?? ''} onChange={handle} placeholder="Ex: A3-P2" />
          </div>
        </div>
      </section>

      {/* Complementar */}
      <section>
        <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Complementar</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>NCM</Label>
            <Input name="ncm" value={form.ncm ?? ''} onChange={handle} placeholder="Ex: 2309.90.00" />
          </div>
          <div className="flex items-center gap-2 mt-5">
            <input
              id="loose"
              type="checkbox"
              name="loose"
              checked={form.loose}
              onChange={handle}
              className="w-4 h-4 accent-indigo-600"
            />
            <Label htmlFor="loose" className="cursor-pointer">Produto avulso (sem código de barras)</Label>
          </div>
        </div>
      </section>

          <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
             {isSubmitting ? 'Salvando...' : 'Salvar'}
           </Button>
    </div>
  );
}