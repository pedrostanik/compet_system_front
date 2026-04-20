import { useState } from 'react';
import type { CustomerRequest } from '@/types/index.ts';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface Props {
  onSubmit: (data: CustomerRequest) => void;
  initial?: CustomerRequest;
}

export default function CustomerForm({ onSubmit, initial }: Props) {
  const [form, setForm] = useState<CustomerRequest>(
    initial ?? { name: '', email: '', phone: '', cpf: '' }
  );

  function handle(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Label>Name</Label>
        <Input name="name" value={form.name} onChange={handle} />
      </div>
      <div>
        <Label>Email</Label>
        <Input name="email" value={form.email} onChange={handle} />
      </div>
      <div>
        <Label>Phone</Label>
        <Input name="phone" value={form.phone} onChange={handle} />
      </div>
      <div>
        <Label>CPF</Label>
        <Input name="cpf" value={form.cpf} onChange={handle} />
      </div>
      <Button onClick={() => onSubmit(form)}>Save</Button>
    </div>
  );
}
