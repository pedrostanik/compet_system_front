import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getPacks, createPack, deletePack, updatePack } from '@/api/packApi';
import type { Pack, PackRequest } from '@/types/index.ts';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import PackForm from '@/components/pack/PackForm';

export default function PackPage() {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [packToEdit, setPackToEdit] = useState<Pack | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await getPacks();
      setPacks(data);
    } catch {
      toast.error('Erro ao carregar pacotes');
    }
  }

  async function handleCreate(data: PackRequest) {
    try {
      await createPack(data);
      toast.success('Pacote criado');
      setOpen(false);
      load();
    } catch {
      toast.error('Erro ao criar pacote');
    }
  }

  async function handleEdit(data: PackRequest) {
    if (!packToEdit) return;
    try {
      await updatePack(packToEdit.id, data);
      toast.success('Pacote atualizado');
      setEditOpen(false);
      setPackToEdit(null);
      load();
    } catch {
      toast.error('Erro ao atualizar pacote');
    }
  }

  async function handleDelete(id: number) {
    try {
      await deletePack(id);
      toast.success('Pacote deletado');
      load();
    } catch {
      toast.error('Erro ao deletar pacote');
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Pacotes</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Novo pacote</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo pacote</DialogTitle>
            </DialogHeader>
            <PackForm onSubmit={handleCreate} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Pet</TableHead>
              <TableHead>Serviços</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {packs.map(p => (
              <TableRow key={p.id}>
                <TableCell>{p.customerName}</TableCell>
                <TableCell>{p.petName}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {p.protocols.map(pp => (
                      <span
                        key={pp.protocolId}
                        className="text-xs bg-gray-100 rounded px-2 py-0.5"
                      >
                        {pp.protocolName}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setPackToEdit(p);
                        setEditOpen(true);
                      }}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(p.id)}
                    >
                      Deletar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar pacote</DialogTitle>
          </DialogHeader>
          <PackForm
            onSubmit={handleEdit}
            initial={packToEdit ? {
              customerId: packToEdit.customerId,
              customerName: packToEdit.customerName,
              petId: packToEdit.petId,
              petName: packToEdit.petName,
              protocolIds: packToEdit.protocols.map(pp => pp.protocolId),
            } : undefined}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}