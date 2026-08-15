
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CalendarDays, History, Wallet, TrendingUp } from 'lucide-react';
import {
  startOfWeek,
  endOfWeek,
  subWeeks,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
} from 'date-fns';
import { getSchedulings } from '@/api/schedulingApi';
import { getReceipts } from '@/api/receiptApi';
import type { SchedulingResponse, ReceiptResponse } from '@/types';

/* Mesma convenção do calendário (SchedulingPage): semana começa no domingo. */
const WEEK_OPTS = { weekStartsOn: 0 } as const;

type Range = { start: Date; end: Date };

const brl = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function inRange(iso: string | undefined, range: Range) {
  if (!iso) return false;
  const date = new Date(iso);
  return !Number.isNaN(date.getTime()) && isWithinInterval(date, range);
}

export default function HomePage() {
  const [schedulings, setSchedulings] = useState<SchedulingResponse[]>([]);
  const [receipts, setReceipts] = useState<ReceiptResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const [schedulingData, receiptData] = await Promise.all([
          getSchedulings(),
          getReceipts(),
        ]);
        if (!active) return;
        setSchedulings(schedulingData);
        setReceipts(receiptData);
      } catch {
        if (active) toast.error('Erro ao carregar os dados do painel');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const now = new Date();
  const previous = subWeeks(now, 1);

  const thisWeek: Range = {
    start: startOfWeek(now, WEEK_OPTS),
    end: endOfWeek(now, WEEK_OPTS),
  };
  const lastWeek: Range = {
    start: startOfWeek(previous, WEEK_OPTS),
    end: endOfWeek(previous, WEEK_OPTS),
  };
  const thisMonth: Range = { start: startOfMonth(now), end: endOfMonth(now) };

  /* Agendamentos cancelados não contam como movimento da semana. */
  const confirmed = schedulings.filter(s => s.scheduleStatus !== 'CANCELED');
  const weekSchedules = confirmed.filter(s => inRange(s.time, thisWeek)).length;
  const lastWeekSchedules = confirmed.filter(s => inRange(s.time, lastWeek)).length;

  /* Faturamento = recibos efetivamente pagos. */
  const paid = receipts.filter(r => r.status === 'PAID');
  const sumTotal = (rows: ReceiptResponse[]) =>
    rows.reduce((total, r) => total + Number(r.total ?? 0), 0);
  const weekRevenue = sumTotal(paid.filter(r => inRange(r.createdAt, thisWeek)));
  const monthRevenue = sumTotal(paid.filter(r => inRange(r.createdAt, thisMonth)));

  const delta = weekSchedules - lastWeekSchedules;

  /* Cores da paleta do projeto. A cor do texto de cada card é escolhida pela
     luminância do fundo, para que todos fiquem acima de 4.5:1 de contraste. */
  const tiles = [
    {
      key: 'week-schedules',
      label: 'Agendamentos desta semana',
      value: String(weekSchedules),
      hint:
        lastWeekSchedules > 0 || weekSchedules > 0
          ? `${delta > 0 ? '+' : ''}${delta} em relação à semana passada`
          : undefined,
      icon: <CalendarDays size={20} />,
      fill: 'var(--brand-orange)',
      ink: '#1C1C1C',
    },
    {
      key: 'last-week-schedules',
      label: 'Agendamentos da semana passada',
      value: String(lastWeekSchedules),
      icon: <History size={20} />,
      fill: 'var(--brand-yellow)',
      ink: '#1C1C1C',
    },
    {
      key: 'week-revenue',
      label: 'Faturamento da semana',
      value: brl(weekRevenue),
      icon: <Wallet size={20} />,
      fill: 'var(--brand-green-mid)',
      ink: '#FFFFFF',
    },
    {
      key: 'month-revenue',
      label: 'Faturamento do mês',
      value: brl(monthRevenue),
      icon: <TrendingUp size={20} />,
      fill: 'var(--brand-green)',
      ink: '#FFFFFF',
    },
  ];

  return (
    <div className="flex flex-col gap-6 h-full">
      <div>
        <h2 className="text-xl font-semibold">Home</h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Resumo dos agendamentos e do faturamento
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="grid w-full max-w-3xl grid-cols-1 sm:grid-cols-2 gap-5">
          {tiles.map(tile => (
            <div
              key={tile.key}
              className="rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-4 min-h-[150px]"
              style={{ background: tile.fill, color: tile.ink }}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="text-sm font-bold leading-snug">{tile.label}</span>
                <span aria-hidden="true" className="shrink-0">
                  {tile.icon}
                </span>
              </div>

              <div>
                <p
                  className="text-4xl font-extrabold leading-none"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  {loading ? '—' : tile.value}
                </p>
                {!loading && tile.hint && (
                  <p className="text-xs font-semibold mt-2">{tile.hint}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
