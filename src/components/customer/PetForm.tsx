import { useState } from 'react';
import type { PetRequest } from '@/types/index.ts';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface Props {
  onSubmit: (data: PetRequest) => void;
}

export default function PetForm({ onSubmit }: Props) {
  const [form, setForm] = useState<PetRequest>({
    name: '', age: 0, species: '', race: '', observations: ''
  });

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
        <Label>Species</Label>
        <Input name="species" value={form.species} onChange={handle} />
      </div>
      <div>
        <Label>Race</Label>
        <Input name="race" value={form.race} onChange={handle} />
      </div>
      <div>
        <Label>Age (years)</Label>
        <Input name="age" type="number" value={form.age} onChange={handle} />
      </div>
      <div>
        <Label>Observations</Label>
        <Input name="observations" value={form.observations} onChange={handle} />
      </div>
      <Button onClick={() => onSubmit(form)}>Save</Button>
    </div>
  );
}
