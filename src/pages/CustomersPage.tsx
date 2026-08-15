import CustomerForm from '@/components/customer/CustomerForm';
import { useEffect, useState } from 'react';
import { Eye, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getCustomers, createCustomer, deleteCustomer, updateCustomer, searchCustomer } from '@/api/customerApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { Customer, CustomerRequest } from '@/types/index.ts';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch {
      toast.error('Failed to load customers');
    }
  }

  async function handleSearch(term: string) {
    setSearch(term);
    if (!term.trim()) { load(); return; }
    try {
      const data = await searchCustomer(term);
      setCustomers(data);
    } catch {
      toast.error('Erro ao buscar clientes');
    }
  }

  async function handleCreate(data: CustomerRequest) {
    try {
      const created = await createCustomer(data);
      toast.success('Cliente criado');
      setOpen(false);
      navigate(`/customers/${created.id}`);
    } catch {
      toast.error('Erro ao criar cliente');
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteCustomer(id);
      toast.success('Cliente deletado');
      load();
    } catch {
      toast.error('Erro ao deletar cliente');
    }
  }

  async function handleEdit(data: CustomerRequest) {
    if (!customerToEdit) return;
    try {
      await updateCustomer(customerToEdit.id, data);
      toast.success('Cliente atualizado');
      setEditOpen(false);
      setCustomerToEdit(null);
      load();
    } catch {
      toast.error('Erro ao atualizar cliente');
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Clientes</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Novo Cliente</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo cliente</DialogTitle>
            </DialogHeader>
            <CustomerForm onSubmit={handleCreate} />
          </DialogContent>
        </Dialog>
      </div>

            {/* Busca */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-3 text-gray-400" />
              <Input
                className="pl-9"
                placeholder="Buscar por nome..."
                value={search}
                onChange={e => handleSearch(e.target.value)}
              />
            </div>

      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Endereço</TableHead>
              <TableHead></TableHead>
              <TableHead>Pets</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map(c => (
              <TableRow key={c.id} className="cursor-pointer hover:bg-gray-50">
                <TableCell onClick={() => navigate(`/customers/${c.id}`)}>{c.name}</TableCell>
                <TableCell onClick={() => navigate(`/customers/${c.id}`)}>{c.email}</TableCell>
                <TableCell onClick={() => navigate(`/customers/${c.id}`)}>{c.phone}</TableCell>
                <TableCell onClick={() => navigate(`/customers/${c.id}`)}>{c.address}</TableCell>
                <TableCell onClick={() => navigate(`/customers/${c.id}`)}>
                <Eye className="w-5 h-5 text-gray-400 pointer-events-none" />
                </TableCell>

                <TableCell onClick={() => navigate(`/customers/${c.id}`)}>{c.pets.length}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setCustomerToEdit(c);
                        setEditOpen(true);
                      }}
                    >
                      Editar
                    </Button>
                    {/* Pop-up de Confirmação para Deletar Cliente */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">Deletar</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir Cliente?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Ao excluir <strong>{c.name}</strong>, todos os pets vinculados a este cliente
                                também serão removidos.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(c.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Sim, excluir tudo
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar</DialogTitle>
          </DialogHeader>
          <CustomerForm
            onSubmit={handleEdit}
            initial={customerToEdit ? {
              name: customerToEdit.name,
              email: customerToEdit.email,
              phone: customerToEdit.phone,
              address: customerToEdit.address,
              obs: customerToEdit.obs,
              cpf: customerToEdit.cpf,
            } : undefined}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}