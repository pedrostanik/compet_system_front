import { useState, useEffect } from 'react';
import type { PackRequest } from '@/types/index.ts';
import type { Protocol } from '@/types/index.ts';
import { getCustomers } from '@/api/customerApi';
import { getProtocols } from '@/api/protocolApi';
import type { Customer } from '@/types/index.ts';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface Props {
  onSubmit: (data: PackRequest) => void;
  initial?: Partial<PackRequest>;
}

export default function PackForm({ onSubmit, initial }: Props) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState<PackRequest>({
    customerId: initial?.customerId ?? 0,
    customerName: initial?.customerName ?? '',
    petId: initial?.petId ?? 0,
    petName: initial?.petName ?? '',
    protocolIds: initial?.protocolIds ?? [],
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

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Label>Cliente</Label>
        <select
          className="w-full border rounded-md px-3 py-2 text-sm"
          onChange={handleCustomerChange}
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
            value={form.petId || ''}
          >
            <option value="" disabled>Selecione um pet</option>
            {selectedCustomer.pets.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      )}

      {protocols.length > 0 && (
        <div>
          <Label>Serviços inclusos</Label>
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

      <Button onClick={() => onSubmit(form)}>Salvar</Button>
    </div>
  );
}