import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { apiErrorMessage } from '@/api/errors';
import {
  getFuturePacks,
  updateSchedulingTime,
  type SchedulingResponse,
  type SchedulingRequest,
} from '@/api/schedulingApi';
import { getPack } from '@/api/packApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Pack } from '@/types/index.ts';

interface Props {
  packId: number;
  schedulingId: number;
  referenceTime: string;
  initialItems?: SchedulingResponse[];
  onClose?: () => void;
  onUpdated?: () => void; //

}

// mesma regra de divisor usada no SchedulingForm/SchedulingPage
function totalSessions(frequencia?: string) {
  if (frequencia === 'Semanal') return 4;
  if (frequencia === 'Quinzenal') return 2;
  return 1;
}

export default function FuturePackSchedulingsPanel({
  packId,
  schedulingId,
  referenceTime,
  initialItems,
  onClose,
  onUpdated,   // ← essa linha precisa estar aqui
}: Props) {
  const [items, setItems] = useState<SchedulingResponse[]>([]);
  const [pack, setPack] = useState<Pack | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedTimes, setEditedTimes] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, [packId, schedulingId, referenceTime]);

async function load() {
  setLoading(true);
  try {
    if (initialItems) {
      // já veio pronto do SchedulingPage, buscado antes da data ser
      // alterada — evita chamar getFuturePacks de novo já com a data nova
      const packData = await getPack(packId);
      setPack(packData);
      setItems(initialItems);
      return;
    }

    // fallback: painel usado sem initialItems (ex: reaberto isoladamente)
    const [futureItems, packData] = await Promise.all([
      getFuturePacks(schedulingId, packId),
      getPack(packId),
    ]);
    const reference = new Date(referenceTime).getTime();
    const filtered = futureItems.filter(
      item => item.id !== schedulingId && new Date(item.time).getTime() > reference
    );
    setItems(filtered);
    setPack(packData);
  } catch (err) {
    toast.error(apiErrorMessage(err, 'Erro ao carregar agendamentos futuros do pacote'));
  } finally {
    setLoading(false);
  }
}

  function toLocalInputValue(time: string) {
    return format(new Date(time), "yyyy-MM-dd'T'HH:mm");
  }

  function startEdit(item: SchedulingResponse) {
    setEditingId(item.id);
    setEditedTimes(prev => ({ ...prev, [item.id]: prev[item.id] ?? toLocalInputValue(item.time) }));
  }

  function handleTimeChange(id: number, value: string) {
    setEditedTimes(prev => ({ ...prev, [id]: value }));
  }


async function handleConfirmAll() {
  const changed = items.filter(item => {
    const edited = editedTimes[item.id];
    return edited !== undefined && edited !== toLocalInputValue(item.time);
  });

  if (changed.length === 0) {
    toast.info('Nenhuma alteração para aplicar');
    return;
  }

  setSaving(true);
  const succeeded: number[] = [];
  try {
    for (const item of changed) {
      const request: SchedulingRequest = {
        customerId: item.customerId,
        customerName: item.customerName,
        petId: item.petId,
        petName: item.petName,
        schedulingObservations: item.schedulingObservations,
        time: editedTimes[item.id],
        isPackage: item.isPackage,
        protocolIds: item.protocols?.map(p => p.protocolId) ?? [],
        duration: item.duration ?? 60,
        price: item.price,
        packId: item.packId,
      };
      await updateSchedulingTime(item.id, request);
      succeeded.push(item.id); // ← só marca como sucesso depois do await passar
    }

    toast.success(`${changed.length} agendamento(s) atualizados`);
    setEditedTimes({});
    setEditingId(null);
    onClose?.();
  } catch (err) {
    toast.error(apiErrorMessage(err, 'Erro ao atualizar um ou mais agendamentos — confira a lista e tente novamente'));
  } finally {
    if (succeeded.length > 0) {
      setItems(prev =>
        prev.map(item =>
          succeeded.includes(item.id) ? { ...item, time: editedTimes[item.id] } : item
        )
      );
      onUpdated?.(); // ← avisa o SchedulingPage pra recarregar os eventos do calendário
    }
    setSaving(false);
  }
}

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="text-sm font-medium">Agendamentos futuros do pacote</h3>
        {pack && (
          <p className="text-xs text-muted-foreground">
            {pack.name} · {pack.frequencia}
          </p>
        )}
      </div>

      {loading && <p className="text-sm text-muted-foreground">Carregando...</p>}

      {!loading && items.length === 0 && (
        <p className="text-sm text-muted-foreground">Nenhum outro agendamento futuro encontrado neste pacote.</p>
      )}

      <div className="flex flex-col gap-2 max-h-[50vh] overflow-y-auto pr-1">
        {items.map(item => {
          const isEditing = editingId === item.id;
          const currentValue = editedTimes[item.id];
          const hasChange = currentValue !== undefined && currentValue !== toLocalInputValue(item.time);

          return (
            <div
              key={item.id}
              className={`flex items-center justify-between border rounded-md px-3 py-2 ${hasChange ? 'border-blue-300 bg-blue-50' : ''}`}
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {format(new Date(currentValue ? new Date(currentValue) : new Date(item.time)), 'dd/MM/yyyy HH:mm')}
                </span>
                <span className="text-xs text-muted-foreground">
                  Ciclo: {item.packCycle}/{totalSessions(pack?.frequencia)}
                </span>
              </div>

              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="datetime-local"
                    value={currentValue}
                    onChange={e => handleTimeChange(item.id, e.target.value)}
                    className="w-auto"
                  />
                  <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                    Fechar
                  </Button>
                </div>
              ) : (
                <Button size="sm" variant="outline" onClick={() => startEdit(item)} disabled={saving}>
                  Alterar horário
                </Button>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end gap-2 mt-2">
        {onClose && (
          <Button variant="ghost" onClick={onClose}>
            Fechar
          </Button>
        )}
        <Button onClick={handleConfirmAll} disabled={loading || saving || items.length === 0}>
          {saving ? 'Salvando...' : 'Confirmar alterações'}
        </Button>
      </div>
    </div>
  );
}
