import { useState } from 'react';
import type { CustomerRequest } from '@/types/index.ts';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useSubmitGuard } from '@/hooks/useSubmitGuard';

interface Props {
  onSubmit: (data: CustomerRequest) => void;
  initial?: CustomerRequest;
}

export default function CustomerForm({ onSubmit, initial }: Props) {
  const [form, setForm] = useState<CustomerRequest>({
    name: initial?.name ?? '',
    email: initial?.email ?? '',
    phone: initial?.phone ?? '',
    cpf: initial?.cpf ?? '',
    address: initial?.address ?? '',
    obs: initial?.obs ?? '',
  });

  const [guardedSubmit, isSubmitting] = useSubmitGuard(async (data: CustomerRequest) => {
    await onSubmit(data);
  });

  function handle(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    guardedSubmit(form);
  }

  return (
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label>Nome.</Label>
            <Input name="name" value={form.name} onChange={handle} required />
          </div>
          <div>
            <Label>Email</Label>
            <Input name="email" value={form.email} onChange={handle} required />
          </div>
          <div>
            <Label>Telefone</Label>
            <Input name="phone" value={form.phone} onChange={handle} required />
          </div>
          <div>
            <Label>CPF</Label>
            <Input name="cpf" value={form.cpf} onChange={handle} required />
          </div>
          <div>
            <Label>Endereço</Label>
            <Input name="address" value={form.address ?? ''} onChange={handle} required />
          </div>
          <div>
             <Label>Observações</Label>
             <Input name="obs" value={form.obs ?? ''} onChange={handle} />
          </div>
                 <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Salvando...' : 'Salvar'}
                 </Button>
      </form>
  );
}