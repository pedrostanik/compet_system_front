import { useState, useEffect } from 'react';
import type { PetRequest } from '@/types/index.ts';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { getSpecies, getCoatTypes, getDogBreeds, getCatBreeds, type EnumOption } from '@/api/enumApi';

interface Props {
  onSubmit: (data: PetRequest) => void;
  initial?: Partial<PetRequest>;
}

export default function PetForm({ onSubmit, initial }: Props) {
  const [species, setSpecies] = useState<EnumOption[]>([]);
  const [coatTypes, setCoatTypes] = useState<EnumOption[]>([]);
  const [breeds, setBreeds] = useState<EnumOption[]>([]);

  const [form, setForm] = useState<PetRequest>({
    name: initial?.name ?? '',
    age: initial?.age ?? 0,
    species: initial?.species ?? '',
    race: initial?.race ?? '',
    rabieVaccination: initial?.rabieVaccination ?? false,
    rabieVaccinationDate: initial?.rabieVaccinationDate ?? '',
    v10Vaccination: initial?.v10Vaccination ?? false,
    v10VaccinationDate: initial?.v10VaccinationDate ?? '',
    dewormed: initial?.dewormed ?? false,
    dewormedDate: initial?.dewormedDate ?? '',
    allergy: initial?.allergy ?? '',
    healthIssues: initial?.healthIssues ?? '',
    weight: initial?.weight ?? undefined,
    coatType: initial?.coatType ?? '',
    observations: initial?.observations ?? '',
  });

    useEffect(() => {
      if (initial) {
        setForm(f => ({ ...f, ...initial }));
      }
    }, [initial]);

  useEffect(() => {
    getSpecies().then(setSpecies);
    getCoatTypes().then(setCoatTypes);
  }, []);

     // 3. Carrega raças dinamicamente
       useEffect(() => {
         if (form.species) {
           loadBreeds(form.species);
         }
       }, [form.species]);

    async function loadBreeds(specieName: string) {
        // Como agora usamos @JsonValue, comparamos com o label amigável
        const s = specieName.toLowerCase();
        if (s.includes('canin') || s.includes('cachorro')) {
          const data = await getDogBreeds();
          setBreeds(data);
        } else if (s.includes('felin') || s.includes('gato')) {
          const data = await getCatBreeds();
          setBreeds(data);
        } else {
          setBreeds([]);
        }
      }

  function handle(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target as HTMLInputElement;
     console.log('field:', name, 'value:', value); // temporário
    if (type === 'checkbox') {
      setForm(f => ({ ...f, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      // ao mudar espécie, limpa a raça
      if (name === 'species') {
        setForm(f => ({ ...f, species: value, race: '' }));
      } else {
        setForm(f => ({ ...f, [name]: value }));
      }
    }
  }

  return (
    <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-1">

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Nome</Label>
          <Input name="name" value={form.name} onChange={handle} />
        </div>
        <div>
          <Label>Idade (anos)</Label>
          <Input name="age" type="number" value={form.age} onChange={handle} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Espécie</Label>
          <select
            name="species"
            value={form.species}
            onChange={handle}
            className="w-full border rounded-md px-3 py-2 text-sm"
          >
            <option value="" disabled>Selecione</option>
            {species.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <div>
          <Label>Raça</Label>
          {breeds.length > 0 ? (
            <select
              name="race"
              value={form.race}
              onChange={handle}
              className="w-full border rounded-md px-3 py-2 text-sm"
            >
              <option value="" disabled>Selecione a raça</option>
              {breeds.map(b => (
                <option key={b.value} value={b.value}>{b.label}</option>
              ))}
            </select>
          ) : (
            <Input
              name="race"
              value={form.race}
              onChange={handle}
              placeholder={form.species ? 'Digite a raça' : 'Selecione a espécie primeiro'}
              disabled={!form.species}
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Peso (kg)</Label>
          <Input name="weight" type="number" step="0.1" value={form.weight ?? ''} onChange={handle} />
        </div>
        <div>
          <Label>Tipo de pelo</Label>
          <select
            name="coatType"
            value={form.coatType}
            onChange={handle}
            className="w-full border rounded-md px-3 py-2 text-sm"
          >
            <option value="" disabled>Selecione</option>
            {coatTypes.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      <p className="text-sm font-medium text-gray-600 mt-1">Vacinas e saúde</p>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <input type="checkbox" name="rabieVaccination" id="rabieVaccination"
              checked={form.rabieVaccination ?? false} onChange={handle} />
            <Label htmlFor="rabieVaccination">Vacina antirrábica</Label>
          </div>
          {form.rabieVaccination && (
            <Input name="rabieVaccinationDate" type="date"
              value={form.rabieVaccinationDate ?? ''} onChange={handle} />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <input type="checkbox" name="v10Vaccination" id="v10Vaccination"
              checked={form.v10Vaccination ?? false} onChange={handle} />
            <Label htmlFor="v10Vaccination">Vacina V10</Label>
          </div>
          {form.v10Vaccination && (
            <Input name="v10VaccinationDate" type="date"
              value={form.v10VaccinationDate ?? ''} onChange={handle} />
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" name="dewormed" id="dewormed"
          checked={form.dewormed ?? false} onChange={handle} />
        <Label htmlFor="dewormed">Vermifugado</Label>
        {form.dewormed && (
          <Input name="dewormedDate" type="date"
            value={form.dewormedDate ?? ''} onChange={handle} className="ml-2" />
        )}
      </div>

      <div>
        <Label>Alergias</Label>
        <Input name="allergy" value={form.allergy ?? ''} onChange={handle} />
      </div>

      <div>
        <Label>Problemas de saúde</Label>
        <Input name="healthIssues" value={form.healthIssues ?? ''} onChange={handle} />
      </div>

      <div>
        <Label>Observações</Label>
        <Input name="observations" value={form.observations ?? ''} onChange={handle} />
      </div>

      <Button onClick={() => onSubmit(form)}>Salvar</Button>
    </div>
  );
}