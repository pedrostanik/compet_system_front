import CustomerForm from '@/components/customer/CustomerForm';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getCustomers, createCustomer, deleteCustomer, updateCustomer } from '@/api/customerApi';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { Customer, CustomerRequest } from '@/types/index.ts';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
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

  async function handleCreate(data: CustomerRequest) {
    try {
      await createCustomer(data);
      toast.success('Cliente criado');
      setOpen(false);
      load();
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo cliente</DialogTitle>
            </DialogHeader>
            <CustomerForm onSubmit={handleCreate} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
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
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(c.id)}
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
          <CustomerForm
            onSubmit={handleEdit}
            initial={customerToEdit ? {
              name: customerToEdit.name,
              email: customerToEdit.email,
              phone: customerToEdit.phone,
              cpf: customerToEdit.cpf,
            } : undefined}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}