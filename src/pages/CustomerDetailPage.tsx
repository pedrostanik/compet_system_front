import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getCustomer, addPet, removePet } from '@/api/customerApi';
import type { Customer, PetRequest } from '@/types/index.ts';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import PetForm from '@/components/customer/PetForm';

export default function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    try {
      const data = await getCustomer(Number(id));
      setCustomer(data);
    } catch {
      toast.error('Customer not found');
      navigate('/customers');
    }
  }

  async function handleAddPet(data: PetRequest) {
    try {
      await addPet(Number(id), data);
      toast.success('Pet added');
      setOpen(false);
      load();
    } catch {
      toast.error('Failed to add pet');
    }
  }

  async function handleRemovePet(petId: number) {
    try {
      await removePet(Number(id), petId);
      toast.success('Pet removed');
      load();
    } catch {
      toast.error('Failed to remove pet');
    }
  }

  if (!customer) return <p>Loading...</p>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/customers')}>← Back</Button>
        <h2 className="text-xl font-semibold">{customer.name}</h2>
      </div>

      <div className="bg-white rounded-lg border p-4 flex flex-col gap-1 text-sm">
        <p><span className="text-gray-500">Email:</span> {customer.email}</p>
        <p><span className="text-gray-500">Phone:</span> {customer.phone}</p>
        <p><span className="text-gray-500">CPF:</span> {customer.cpf}</p>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Pets</h3>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">Add pet</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add pet</DialogTitle>
              </DialogHeader>
              <PetForm onSubmit={handleAddPet} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-white rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Species</TableHead>
                <TableHead>Race</TableHead>
                <TableHead>Age</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customer.pets.map(p => (
                <TableRow key={p.id}>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.species}</TableCell>
                  <TableCell>{p.race}</TableCell>
                  <TableCell>{p.age}</TableCell>
                  <TableCell>
                    <Button variant="destructive" size="sm" onClick={() => handleRemovePet(p.id)}>
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
