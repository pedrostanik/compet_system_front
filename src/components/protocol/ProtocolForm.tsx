import { useState } from 'react';
import type { ProtocolRequest } from '@/types/index.ts';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface Props {
  onSubmit: (data: ProtocolRequest) => void;
  initial?: ProtocolRequest;
}

export default function ProtocolForm({ onSubmit, initial }: Props) {
  const [form, setForm] = useState<ProtocolRequest>(
    initial ?? { name: '', description: '' }
  );

  function handle(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Label>Nome</Label>
        <Input name="name" value={form.name} onChange={handle} />
      </div>
      <div>
        <Label>Descrição</Label>
        <Input name="description" value={form.description} onChange={handle} />
      </div>

      <Button onClick={() => onSubmit(form)}>Save</Button>
    </div>
  );
}
