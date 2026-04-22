import { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { toast } from 'sonner';
import {
  getSchedulings,
  createScheduling,
  deleteScheduling,
  updateSchedulingTime,
  markAsHappened,
  type SchedulingResponse,
  type SchedulingRequest,
} from '@/api/schedulingApi';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import SchedulingForm from '@/components/schedule/SchedulingForm';

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
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [eventToEdit, setEventToEdit] = useState<CalendarEvent | null>(null);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');

  useEffect(() => {
    load();
  }, []);

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
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    return {
      title: `${s.customerName} — ${s.petName}`,
      start,
      end,
      resource: s,
    };
  }

  async function handleCreate(data: SchedulingRequest) {
    try {
      await createScheduling(data);
      toast.success('Agendamento criado');
      setOpen(false);
      load();
    } catch {
      toast.error('Erro ao criar agendamento');
    }
  }

async function handleEdit(data: SchedulingRequest) {
  if (!eventToEdit) return;
  try {
    await updateSchedulingTime(eventToEdit.resource.id, data);
    toast.success('Agendamento atualizado');
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

  async function handleMarkAsHappened(id: number) {
    try {
      await markAsHappened(id);
      toast.success('Agendamento marcado como realizado');
      load();
      setSelectedEvent(prev =>
        prev ? { ...prev, resource: { ...prev.resource, scheduleHappened: true } } : null
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
    const happened = event.resource.scheduleHappened;
    return {
      style: {
        backgroundColor: happened ? '#6b7280' : '#1D9E75',
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
              <p><span className="text-gray-500">Cliente:</span> {selectedEvent.resource.customerName}</p>
              <p><span className="text-gray-500">Pet:</span> {selectedEvent.resource.petName}</p>
              <p><span className="text-gray-500">Horário:</span> {format(selectedEvent.start, "dd/MM/yyyy HH:mm")}</p>
              {selectedEvent.resource.schedulingObservations && (
                <p><span className="text-gray-500">Obs:</span> {selectedEvent.resource.schedulingObservations}</p>
              )}
              <p>
                <span className="text-gray-500">Status:</span>{' '}
                {selectedEvent.resource.scheduleHappened ? (
                  <span className="text-green-600 font-medium">Realizado</span>
                ) : (
                  <span className="text-yellow-600 font-medium">Pendente</span>
                )}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              {!selectedEvent.resource.scheduleHappened && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEventToEdit(selectedEvent);
                      setEditOpen(true);
                    }}
                  >
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleMarkAsHappened(selectedEvent.resource.id)}
                  >
                    Marcar realizado
                  </Button>
                </>
              )}
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(selectedEvent.resource.id)}
              >
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
      }}
    />
  </DialogContent>
</Dialog>

      <div className="bg-white rounded-lg border p-4" style={{ height: 600 }}>
        <Calendar
          localizer={localizer}
          events={events}
          defaultView="week"
          views={['week', 'day']}
          step={30}
          timeslots={2}
          culture="pt-BR"
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          messages={{
            next: 'Próximo',
            previous: 'Anterior',
            today: 'Hoje',
            week: 'Semana',
            day: 'Dia',
          }}
        />
      </div>
    </div>
  );
}