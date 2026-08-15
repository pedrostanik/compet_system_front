import { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { useParams } from 'react-router-dom';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { toast } from 'sonner';
import {
  getSchedulings,
  createScheduling,
  createFutureFromPack,
  updateFutureFromPack,
  deleteScheduling,
  updateSchedulingTime,
  changeStatus,
  type SchedulingResponse,
  type SchedulingRequest,
} from '@/api/schedulingApi';
import { getPack } from '@/api/packApi'
import type { SchedulingProtocol, ScheduleStatus } from '@/types/index.ts';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import SchedulingForm from '@/components/schedule/SchedulingForm';
import { getCustomer } from '@/api/customerApi';
import type { Customer, Pet } from '@/types/index.ts';

const STATUS_MAP = {
  SCHEDULED: { label: 'Pendente', color: 'text-yellow-600' },
  CONFIRMED: { label: 'Confirmado', color: 'text-blue-600' },
  CANCELED: { label: 'Cancelado', color: 'text-red-600' },
  HAPPENED: { label: 'Realizado', color: 'text-green-600' },
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales: { 'pt-BR': ptBR },
});

interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
  resource: SchedulingResponse;
}

export default function SchedulingPage() {
    const { id } = useParams<{ id: string }>();
  const [selectedPack, setSelectedPack] = useState<any>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [eventToEdit, setEventToEdit] = useState<CalendarEvent | null>(null);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedCustomerDetail, setSelectedCustomerDetail] = useState<Customer | null>(null);
  const [selectedPetDetail, setSelectedPetDetail] = useState<Pet | null>(null);

  useEffect(() => {
    async function fetchPackData() {
      // Só busca se for agendamento de pacote e tiver o ID (ajuste conforme seu objeto)
      if (selectedEvent?.resource.packId) {
        try {
          const pack = await getPack(selectedEvent.resource.packId);
          setSelectedPack(pack);
        } catch (err) {
          console.error("Erro ao buscar detalhes do pacote", err);
        }
      } else {
        setSelectedPack(null);
      }
    }

    fetchPackData();
  }, [selectedEvent]);

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!id || events.length === 0) return;
    const target = events.find(e => e.resource.id === Number(id));
    if (target) {
      setSelectedEvent(target);
      setCurrentDate(target.start); // move o calendário pra semana/dia do agendamento
    } else {
      toast.error('Agendamento não encontrado');
    }
  }, [id, events]);

    useEffect(() => {
      async function fetchDetails() {
        if (!selectedEvent) {
          setSelectedCustomerDetail(null);
          setSelectedPetDetail(null);
          return;
        }
        try {
          const customer = await getCustomer(selectedEvent.resource.customerId);
          setSelectedCustomerDetail(customer);
          const pet = customer.pets.find(p => p.id === selectedEvent.resource.petId) ?? null;
          setSelectedPetDetail(pet);
        } catch {
          setSelectedCustomerDetail(null);
          setSelectedPetDetail(null);
        }
      }
      fetchDetails();
    }, [selectedEvent]);

  async function load() {
    try {
      const data = await getSchedulings();
      setEvents(data.map(toEvent));
    } catch {
      toast.error('Erro ao carregar agendamentos');
    }
  }

      function toEvent(s: SchedulingResponse): CalendarEvent {
        const start = new Date(s.time);
        const end = new Date(start.getTime() + (s.duration ?? 60) * 60 * 1000);
        return {
          title: `${s.customerName} — ${s.petName}`,
          start,
          end,
          resource: s,
        };
      }

  // Se o pet tem pacote vigente (activePackId vindo do SchedulingForm), cria a série
  // de agendamentos futuros via /future-schedules. Caso contrário, cria normalmente.
  async function handleCreate(data: SchedulingRequest, activePackId?: number) {
    try {
      if (activePackId) {
        await createFutureFromPack({
          scheduling: data,
          time: data.time,
          packId: activePackId,
        });
        toast.success('Agendamento e próximos do pacote criados');
      } else {
        await createScheduling(data);
        toast.success('Agendamento criado');
      }
      setOpen(false);
      load();
    } catch {
      toast.error('Erro ao criar agendamento');
    }
  }

async function handleEdit(data: SchedulingRequest, activePackId?: number) {
  if (!eventToEdit) return;
  try {
    if (activePackId) {
      await updateFutureFromPack(eventToEdit.resource.id, {
        scheduling: data,
        time: data.time,
        packId: activePackId,
      });
      toast.success('Agendamento e próximos do pacote atualizados');
    } else {
      await updateSchedulingTime(eventToEdit.resource.id, data);
      toast.success('Agendamento atualizado');
    }
    setEditOpen(false);
    setEventToEdit(null);
    load();
  } catch {
    toast.error('Erro ao atualizar agendamento');
  }
}

  async function handleDelete(id: number) {
    try {
      await deleteScheduling(id);
      toast.success('Agendamento deletado');
      setSelectedEvent(null);
      load();
    } catch {
      toast.error('Erro ao deletar agendamento');
    }
  }

  async function handleMarkStatus(id: number, status: string) {
    try {
      await changeStatus(id, status);
      toast.success('Agendamento atualizado');
      load();
      const typedStatus = status as ScheduleStatus;
      setSelectedEvent(prev =>
        prev ? { ...prev, resource: { ...prev.resource, scheduleStatus: typedStatus } } : null
      );
    } catch {
      toast.error('Erro ao atualizar agendamento');
    }
  }

  function handleSelectSlot(slot: { start: Date }) {
    const formatted = format(slot.start, "yyyy-MM-dd'T'HH:mm");
    setSelectedTime(formatted);
    setOpen(true);
  }

  function handleSelectEvent(event: CalendarEvent) {
    setSelectedEvent(event);
  }

  function eventStyleGetter(event: CalendarEvent) {

      console.log('scheduleStatus:', event.resource.scheduleStatus);
    const { scheduleStatus } = event.resource;

    let backgroundColor = '#EAB308'; // verde — padrão
    if (scheduleStatus == 'CANCELED') backgroundColor = '#DC2626'; // vermelho — cancelado
    if (scheduleStatus == 'CONFIRMED') backgroundColor = '#2563EB'; // azul — realizado
    if (scheduleStatus == 'HAPPENED') backgroundColor = '#1D9E75'; // verde — realizado
    //if (scheduleStatus == 'SCHEDULED') backgroundColor = '#EAB308'; // amarelo — realizado

    //if (intercepted) backgroundColor = '#DC2626'; // vermelho — interceptado

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        border: 'none',
        color: 'white',
        fontSize: '12px',
      },
    };
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Calendário</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Novo agendamento</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo agendamento</DialogTitle>
            </DialogHeader>
            <SchedulingForm
              onSubmit={handleCreate}
              initial={{ time: selectedTime }}
            />
          </DialogContent>
        </Dialog>
      </div>

{selectedEvent && (
  <div className="bg-white border rounded-lg p-4 text-sm">
    <div className="flex justify-between items-start">
      <div className="flex flex-col gap-1">

         {selectedEvent.resource.packCycle && selectedPack && (
           <>
             <p className="text-gray-500">
               Banho: {selectedEvent.resource.packCycle}
               {/* Verifica a frequência para definir o denominador */}
               {selectedPack.frequencia === 'Semanal' ? '/4' : '/2'}
             </p>

             {Number(selectedEvent.resource.packCycle) === (selectedPack.frequencia === 'Semanal' ? 4 : 2) && (
               <p className="text-red-600 font-medium flex items-center gap-1">
                 ⚠️ Pagamento Necessário
               </p>
             )}
           </>
         )}
        <p><span className="text-gray-500">Cliente:</span> {selectedEvent.resource.customerName}</p>

        {/* Observação do cliente */}
        {selectedCustomerDetail?.obs && (
          <div className="border border-yellow-200 bg-yellow-50 rounded-md px-3 py-2 mt-1">
            <p className="text-xs font-medium text-yellow-800 mb-0.5">Obs. do cliente</p>
            <p className="text-sm text-yellow-700">{selectedCustomerDetail.obs}</p>
          </div>
        )}

        <p><span className="text-gray-500">Pet:</span> {selectedEvent.resource.petName}</p>

        {/* Observação do pet */}
        {selectedPetDetail?.observations && (
          <div className="border border-blue-200 bg-blue-50 rounded-md px-3 py-2 mt-1">
            <p className="text-xs font-medium text-blue-800 mb-0.5">Obs. do pet</p>
            <p className="text-sm text-blue-700">{selectedPetDetail.observations}</p>
          </div>
        )}

        <p><span className="text-gray-500">Horário:</span> {format(selectedEvent.start, "dd/MM/yyyy HH:mm")}</p>
        <p><span className="text-gray-500">Duração:</span> {selectedEvent.resource.duration} min</p>
        <p><span className="text-gray-500">Preço: R$</span> {selectedEvent.resource.price}</p>
        {selectedEvent.resource.schedulingObservations && (
          <p><span className="text-gray-500">Obs:</span> {selectedEvent.resource.schedulingObservations}</p>
        )}
        <p>
          <span className="text-gray-500">Status:</span>{' '}
          <span className={`${STATUS_MAP[selectedEvent.resource.scheduleStatus]?.color || 'text-gray-600'} font-medium`}>
            {STATUS_MAP[selectedEvent.resource.scheduleStatus]?.label || 'Pendente'}
          </span>
        </p>

        {selectedEvent.resource.intercepted && (
          <p className="flex items-center gap-1 text-red-600 font-medium">
            ⚠️ Conflito de horário detectado
          </p>
        )}

        {selectedEvent.resource.protocols && selectedEvent.resource.protocols.length > 0 && (
          <div className="mt-2">
            <p className="text-gray-500 mb-1">Serviços:</p>
            <div className="flex flex-col gap-1">
              {selectedEvent.resource.protocols.map((p: SchedulingProtocol) => (
                <div key={p.protocolId} className="flex justify-between text-xs bg-gray-50 rounded px-2 py-1">
                  <span>{p.protocolName}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {selectedEvent.resource.scheduleStatus != 'HAPPENED' && (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEventToEdit(selectedEvent); // Salva o evento para o formulário carregar os dados
                setEditOpen(true);            // Abre o dialog
              }}
            >
              Editar
            </Button>
            <Button size="sm" onClick={() => handleMarkStatus(selectedEvent.resource.id, 'CONFIRMED')}>
              Confirmado
            </Button>
            <Button size="sm" onClick={() => handleMarkStatus(selectedEvent.resource.id, 'CANCELED')}>
              Cancelado
            </Button>
            <Button size="sm" onClick={() => handleMarkStatus(selectedEvent.resource.id, 'HAPPENED')}>
              Realizado
            </Button>
          </>
        )}
        <Button variant="destructive" size="sm" onClick={() => handleDelete(selectedEvent.resource.id)}>
          Deletar
        </Button>
      </div>
    </div>
  </div>
)}

<Dialog open={editOpen} onOpenChange={setEditOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Editar agendamento</DialogTitle>
    </DialogHeader>
     <SchedulingForm
              onSubmit={handleEdit}
              initial={{
                time: eventToEdit
                  ? format(eventToEdit.start, "yyyy-MM-dd'T'HH:mm")
                  : '',
                customerId: eventToEdit?.resource.customerId,
                customerName: eventToEdit?.resource.customerName,
                petId: eventToEdit?.resource.petId,
                petName: eventToEdit?.resource.petName,
                schedulingObservations: eventToEdit?.resource.schedulingObservations,
                isPackage: eventToEdit?.resource.isPackage,
                packCycle: eventToEdit?.resource.packCycle,
                protocolIds: eventToEdit?.resource.protocols?.map((p: SchedulingProtocol) => p.protocolId) ?? [],
                duration: eventToEdit?.resource.duration ?? 60,
                price: eventToEdit?.resource.price,
              }}
            />
  </DialogContent>
</Dialog>

      <div className="bg-white rounded-lg border p-4" style={{ height: 600 }}>
          <Calendar
            localizer={localizer}
            events={events}
            date={currentDate}                       //  novo: calendário controlado
            onNavigate={(date) => setCurrentDate(date)} //  novo: permite navegar manualmente também
            defaultView="week"
            views={['week', 'day']}
            step={30}
            timeslots={2}
            culture="pt-BR"
            selectable
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            eventPropGetter={eventStyleGetter}
            messages={{ /* iguais */ }}
          />
      </div>
    </div>
  );
}
