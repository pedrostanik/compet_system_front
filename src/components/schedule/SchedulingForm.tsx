import { useState, useEffect } from 'react';
import type { SchedulingRequest } from '@/api/schedulingApi';
import { getCustomers } from '@/api/customerApi';
import { getProtocols } from '@/api/protocolApi';
import type { Customer } from '@/types/index.ts';
import type { Protocol } from '@/types/index.ts';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface Props {
  onSubmit: (data: SchedulingRequest) => void;
  initial?: Partial<SchedulingRequest>;
}

export default function SchedulingForm({ onSubmit, initial }: Props) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
 const [form, setForm] = useState<SchedulingRequest>({
    customerId: initial?.customerId ?? 0,
    customerName: initial?.customerName ?? '',
    petId: initial?.petId ?? 0,
    petName: initial?.petName ?? '',
    schedulingObservations: initial?.schedulingObservations ?? '',
    time: initial?.time ?? '',
    isPackage: initial?.isPackage ?? false,
    protocolIds: initial?.protocolIds ?? [],
    duration: initial?.duration ?? 60,
  });

  useEffect(() => {
    getCustomers().then(setCustomers);
    getProtocols().then(setProtocols);
  }, []);

useEffect(() => {
  if (initial?.customerId && customers.length > 0) {
    const customer = customers.find(c => c.id === initial.customerId);
    if (customer) {
      setSelectedCustomer(customer);
      setForm(f => ({
        ...f,
        customerId: customer.id,
        customerName: customer.name,
        petId: initial.petId ?? 0,
        petName: initial.petName ?? '',
      }));
    }
  }
}, [initial?.customerId, customers]);

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

  function handleProtocolToggle(protocolId: number) {
    setForm(f => ({
      ...f,
      protocolIds: f.protocolIds.includes(protocolId)
        ? f.protocolIds.filter(id => id !== protocolId)
        : [...f.protocolIds, protocolId],
    }));
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
          value={form.customerId || ''}
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
            value={form.petId || ''}
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

          <div>
            <Label>Duração (minutos)</Label>
            <Input
              name="duration"
              type="number"
              min={1}
              value={form.duration}
              onChange={e => setForm(f => ({ ...f, duration: Number(e.target.value) }))}
            />
          </div>

      {protocols.length > 0 && (
        <div>
          <Label>Serviços</Label>
          <div className="flex flex-col gap-2 mt-1 border rounded-md p-3">
            {protocols.map(p => (
              <div key={p.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`protocol-${p.id}`}
                  checked={form.protocolIds.includes(p.id)}
                  onChange={() => handleProtocolToggle(p.id)}
                />
                <label htmlFor={`protocol-${p.id}`} className="text-sm cursor-pointer">
                  {p.name}
                  {p.price && (
                    <span className="text-gray-400 ml-2">
                      R$ {Number(p.price).toFixed(2)}
                    </span>
                  )}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

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