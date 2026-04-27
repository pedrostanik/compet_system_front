import ProtocolForm from '@/components/protocol/ProtocolForm';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getProtocols, createProtocol, deleteProtocol, updateProtocol } from '@/api/protocolApi';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { Protocol, ProtocolRequest } from '@/types/index.ts';

export default function ProtocolPage() {
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [protocolToEdit, setprotocolToEdit] = useState<Protocol | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await getProtocols();
      setProtocols(data);
    } catch {
      toast.error('Failed to load protocol');
    }
  }

  async function handleCreate(data: ProtocolRequest) {
    try {
      await createProtocol(data);
      toast.success('Protocolo criado');
      setOpen(false);
      load();
    } catch {
      toast.error('Erro ao criar protocol');
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteProtocol(id);
      toast.success('Protocolo deletado');
      load();
    } catch {
      toast.error('Erro ao deletar protocolo');
    }
  }

  async function handleEdit(data: ProtocolRequest) {
    if (!protocolToEdit) return;
    try {
      await updateProtocol(protocolToEdit.id, data);
      toast.success('Protocolo atualizado');
      setEditOpen(false);
      setprotocolToEdit(null);
      load();
    } catch {
      toast.error('Erro ao atualizar protocolo');
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Clientes</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Novo Protocolo</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Protocolo</DialogTitle>
            </DialogHeader>
            <ProtocolForm onSubmit={handleCreate} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {protocols.map(p => (
              <TableRow key={p.id}>
                <TableCell>{p.name}</TableCell>
                <TableCell>{p.description}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setprotocolToEdit(p);
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
            <DialogTitle>Editar</DialogTitle>
          </DialogHeader>
          <ProtocolForm
            onSubmit={handleEdit}
            initial={protocolToEdit ? {
              name: protocolToEdit.name,
              description: protocolToEdit.description,
              price: protocolToEdit.price,
            } : undefined}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}