import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Search, AlertTriangle, Package } from 'lucide-react';
import {
  getProducts, createProduct, updateProduct,
  deactivateProduct, searchProducts,
} from '@/api/productApi';
import type { Product, ProductRequest } from '@/types';
import { CATEGORY_LABELS } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ProductForm from '@/components/products/ProductForm';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(false);


  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const data = await getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Erro ao carregar produtos');
    }
  }

  async function handleSearch(term: string) {
    setSearch(term);
    if (!term.trim()) { load(); return; }
    try {
      const data = await searchProducts(term);
      setProducts(data);
    } catch {
      toast.error('Erro ao buscar produtos');
    }
  }

  async function handleCreate(data: ProductRequest) {
    setLoading(true);
    try {
      await createProduct(data);
      toast.success('Produto cadastrado');
      setCreateOpen(false);
      load();
    } catch {
      toast.error('Erro ao cadastrar produto');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(data: ProductRequest) {
    if (!editTarget) return;
    setLoading(true);
    try {
      await updateProduct(editTarget.id, data);
      toast.success('Produto atualizado');
      setEditTarget(null);
      load();
    } catch {
      toast.error('Erro ao atualizar produto');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeactivate(id: string) {
    try {
      await deactivateProduct(id);
      toast.success('Produto desativado');
      load();
    } catch {
      toast.error('Erro ao desativar produto');
    }
  }

  const belowStock = products.filter(p => p.isBelowMinStock);

  return (
    <div className="flex flex-col gap-4">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Produtos</h2>
        <Button onClick={() => setCreateOpen(true)} disabled={loading}>
          <Plus size={16} className="mr-2" /> {loading ? 'Salvando...' : 'Novo produto'}
        </Button>
      </div>

      {/* Alerta estoque baixo */}
      {belowStock.length > 0 && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-3 text-sm">
          <AlertTriangle size={16} />
          <span>{belowStock.length} produto(s) abaixo do estoque mínimo</span>
        </div>
      )}

      {/* Busca */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-3 text-gray-400" />
        <Input
          className="pl-9"
          placeholder="Buscar por nome ou SKU..."
          value={search}
          onChange={e => handleSearch(e.target.value)}
        />
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-gray-500 text-xs uppercase">
              <th className="text-left px-4 py-3">SKU</th>
              <th className="text-left px-4 py-3">Nome</th>
              <th className="text-left px-4 py-3">Categoria</th>
              <th className="text-left px-4 py-3">Tamanho</th>
              <th className="text-left px-4 py-3">Cor</th>
              <th className="text-right px-4 py-3">Custo</th>
              <th className="text-right px-4 py-3">Venda</th>
              <th className="text-right px-4 py-3">Margem</th>
              <th className="text-right px-4 py-3">Estoque</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr>
                <td colSpan={11} className="text-center py-12 text-gray-400">
                  <Package size={32} className="mx-auto mb-2 opacity-30" />
                  Nenhum produto cadastrado
                </td>
              </tr>
            )}
            {products.map(p => {
              const marginPct = (p.margin * 100).toFixed(1);
              const marginColor =
                p.margin >= 0.4 ? 'text-green-600' :
                p.margin >= 0.2 ? 'text-yellow-600' : 'text-red-600';

              return (
                <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-indigo-600">{p.sku}</td>
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-gray-500">{CATEGORY_LABELS[p.category] ?? p.category}</td>
                  <td className="px-4 py-3 text-gray-500">{p.size ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{p.color ?? '—'}</td>
                  <td className="px-4 py-3 text-right">
                    {p.costPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {p.salePrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className={`px-4 py-3 text-right font-semibold ${marginColor}`}>{marginPct}%</td>
                  <td className={`px-4 py-3 text-right ${p.isBelowMinStock ? 'text-red-600 font-semibold' : ''}`}>
                    {p.currentStockQty}
                    {p.isBelowMinStock && <AlertTriangle size={12} className="inline ml-1" />}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      p.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {p.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="outline" onClick={() => setEditTarget(p)}>Editar</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeactivate(p.id)}>Desativar</Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Dialog criar */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo produto</DialogTitle>
          </DialogHeader>
          <ProductForm onSubmit={handleCreate} />
        </DialogContent>
      </Dialog>

      {/* Dialog editar */}
      <Dialog open={!!editTarget} onOpenChange={o => { if (!o) setEditTarget(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar produto</DialogTitle>
          </DialogHeader>
          {editTarget && (
            <ProductForm
              onSubmit={handleUpdate}
              initial={{
                name: editTarget.name,
                category: editTarget.category,
                animalTarget: editTarget.animalTarget,
                brand: editTarget.brand,
                unit: editTarget.unit,
                costPrice: editTarget.costPrice,
                salePrice: editTarget.salePrice,
                barcode: editTarget.barcode,
                minStockQty: editTarget.minStockQty,
                currentStockQty: editTarget.currentStockQty,
                shelfLocation: editTarget.shelfLocation,
                ncm: editTarget.ncm,
                loose: editTarget.loose,
                size: editTarget.size,
                color: editTarget.color,
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}