import { useState, useEffect } from 'react';
import { getProtocols } from '@/api/protocolApi';
import type { Protocol, PackRequest } from '@/types/index.ts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2, Plus } from 'lucide-react';
import { useSubmitGuard } from '@/hooks/useSubmitGuard';

interface PackProtocolEntry {
  protocolId: number;
  quantity: number;
}

interface Props {
  onSubmit: (data: PackRequest) => void;
  initial?: Partial<PackRequest>;
}

// Converte "2026-06-25T14:30:00" (do backend) <-> "2026-06-25T14:30" (do <input type="datetime-local">)
//function toInputValue(isoDateTime?: string): string {
//  if (!isoDateTime) return '';
//  return isoDateTime.slice(0, 16);
//}

export default function PackForm({ onSubmit, initial }: Props) {
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [name, setName] = useState(initial?.name ?? '');
  const [frequencia, setFrequencia] = useState(initial?.frequencia ?? '');
  const [entries, setEntries] = useState<PackProtocolEntry[]>(
    initial?.protocols ?? []
  );

  const [guardedSubmit, isSubmitting] = useSubmitGuard(async (data: PackRequest) => {
    await onSubmit(data);
  });

  useEffect(() => {
    getProtocols().then(setProtocols).catch(() => {});
  }, []);

  function addEntry() {
    setEntries(prev => [...prev, { protocolId: 0, quantity: 1 }]);
  }

  function removeEntry(index: number) {
    setEntries(prev => prev.filter((_, i) => i !== index));
  }

  function updateEntry(index: number, field: keyof PackProtocolEntry, value: number) {
    setEntries(prev =>
      prev.map((e, i) => (i === index ? { ...e, [field]: value } : e))
    );
  }

  function handleSubmit() {
    if (!name.trim()) return;
    if (!frequencia) return;
    if (entries.some(e => e.protocolId === 0 || e.quantity < 1)) return;

    guardedSubmit({
      name,
      frequencia,
      protocols: entries,
    });
  }

  // IDs já selecionados para evitar duplicata no mesmo select
  const selectedIds = entries.map(e => e.protocolId);

  return (
    <div className="space-y-5">

      {/* Nome */}
      <div className="space-y-1.5">
        <Label>Nome do pacote</Label>
        <Input
          placeholder="Ex: Pacote Mensal Premium"
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </div>

      {/* Frequência */}
      <div className="space-y-1.5">
        <Label>Frequência</Label>
        <Select value={frequencia} onValueChange={setFrequencia}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a frequência" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Semanal">Semanal</SelectItem>
            <SelectItem value="Quinzenal">Quinzenal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Serviços */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Serviços</Label>
          <Button type="button" variant="outline" size="sm" onClick={addEntry}>
            <Plus className="w-4 h-4 mr-1" />
            Adicionar serviço
          </Button>
        </div>

        {entries.length === 0 && (
          <p className="text-sm text-muted-foreground py-2">
            Nenhum serviço adicionado ainda.
          </p>
        )}

        <div className="space-y-2">
          {entries.map((entry, index) => (
            <div key={index} className="flex items-center gap-2">

              {/* Seletor de protocolo */}
              <div className="flex-1">
                <Select
                  value={entry.protocolId ? String(entry.protocolId) : ''}
                  onValueChange={val => updateEntry(index, 'protocolId', Number(val))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    {protocols.map(p => (
                      <SelectItem
                        key={p.id}
                        value={String(p.id)}
                        disabled={
                          selectedIds.includes(p.id) && p.id !== entry.protocolId
                        }
                      >
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quantidade */}
              <div className="w-24">
                <Input
                  type="number"
                  min={1}
                  placeholder="Qtd"
                  value={entry.quantity}
                  onChange={e =>
                    updateEntry(index, 'quantity', Math.max(1, Number(e.target.value)))
                  }
                />
              </div>

              {/* Remover */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeEntry(index)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Submit */}
        <Button
        type="button"
        className="w-full"
        onClick={handleSubmit}
        disabled={
          isSubmitting ||
          !name.trim() ||
          !frequencia ||
          entries.length === 0 ||
          entries.some(e => e.protocolId === 0 || e.quantity < 1)
        }
      >
        {isSubmitting ? 'Salvando...' : 'Salvar pacote'}
      </Button>
    </div>
  );
}
