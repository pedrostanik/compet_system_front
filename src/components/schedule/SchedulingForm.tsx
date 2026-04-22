import { useState, useEffect } from 'react';
import type { SchedulingRequest } from '@/api/schedulingApi';
import { getCustomers } from '@/api/customerApi';
import type { Customer } from '@/types/index.ts';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface Props {
  onSubmit: (data: SchedulingRequest) => void;
  initial?: Partial<SchedulingRequest>;
}

export default function SchedulingForm({ onSubmit, initial }: Props) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState<SchedulingRequest>({
    customerId: 0,
    customerName: '',
    petId: 0,
    petName: '',
    schedulingObservations: '',
    time: initial?.time ?? '',
    isPackage: false,
  });

  useEffect(() => {
    getCustomers().then(setCustomers);
  }, []);

  function handleCustomerChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const customer = customers.find(c => c.id === Number(e.target.value));
    if (customer) {
      setSelectedCustomer(customer);
      setForm(f => ({ ...f, customerId: customer.id, customerName: customer.name, petId: 0, petName: '' }));
    }
  }

  function handlePetChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const pet = selectedCustomer?.pets.find(p => p.id === Number(e.target.value));
    if (pet) {
      setForm(f => ({ ...f, petId: pet.id, petName: pet.name }));
    }
  }

  function handle(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Label>Cliente</Label>
        <select
          className="w-full border rounded-md px-3 py-2 text-sm"
          onChange={handleCustomerChange}
          defaultValue=""
        >
          <option value="" disabled>Selecione um cliente</option>
          {customers.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {selectedCustomer && (
        <div>
          <Label>Pet</Label>
          <select
            className="w-full border rounded-md px-3 py-2 text-sm"
            onChange={handlePetChange}
            defaultValue=""
          >
            <option value="" disabled>Selecione um pet</option>
            {selectedCustomer.pets.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <Label>Data e hora</Label>
        <Input
          name="time"
          type="datetime-local"
          value={form.time}
          onChange={handle}
        />
      </div>

      <div>
        <Label>Observações</Label>
        <Input
          name="schedulingObservations"
          value={form.schedulingObservations}
          onChange={handle}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isPackage"
          checked={form.isPackage}
          onChange={e => setForm(f => ({ ...f, isPackage: e.target.checked }))}
        />
        <Label htmlFor="isPackage">Pacote</Label>
      </div>

      <Button onClick={() => onSubmit(form)}>Salvar</Button>
    </div>
  );
}