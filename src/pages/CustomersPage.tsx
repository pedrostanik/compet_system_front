import CustomerForm from '@/components/customer/CustomerForm';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getCustomers, createCustomer, deleteCustomer } from '@/api/customerApi';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { Customer, CustomerRequest } from '@/types/index.ts';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [open, setOpen] = useState(false);
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
      toast.success('Customer created');
      setOpen(false);
      load();
    } catch {
      toast.error('Failed to create customer');
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteCustomer(id);
      toast.success('Customer deleted');
      load();
    } catch {
      toast.error('Failed to delete customer');
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
              <DialogTitle>New customer</DialogTitle>
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
              <TableHead>Phone</TableHead>
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
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(c.id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
