import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getCustomers } from '@/api/customerApi';
import type { Customer, Pet } from '@/types/index.ts';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import {
  getPetHistory,
  getPetFrequency,
  type PetHistory,
  type FrequencyPoint,
} from '@/api/historyApi';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ptBR } from 'date-fns/locale';

export default function HistoryPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] =
    useState<Customer | null>(null);

  const [petSearch, setPetSearch] = useState('');
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);

  const [history, setHistory] = useState<PetHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [frequency, setFrequency] = useState<FrequencyPoint[]>([]);

  useEffect(() => {
    getCustomers()
      .then(setCustomers)
      .catch(() => toast.error('Erro ao carregar clientes'));
  }, []);

  useEffect(() => {
    if (!selectedPet) return;

    setLoading(true);

    Promise.all([
      getPetHistory(selectedPet.id),
      getPetFrequency(selectedPet.id),
    ])
      .then(([hist, freq]) => {
        setHistory(hist);
        setFrequency(freq);
      })
      .catch(() => toast.error('Erro ao carregar histórico'))
      .finally(() => setLoading(false));
  }, [selectedPet]);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.cpf?.includes(customerSearch)
  );

  const filteredPets = (selectedCustomer?.pets ?? []).filter((p) =>
    p.name.toLowerCase().includes(petSearch.toLowerCase())
  );

  function handleSelectCustomer(customer: Customer) {
    setSelectedCustomer(customer);
    setSelectedPet(null);
    setHistory([]);
    setFrequency([]);
    setPetSearch('');
  }

  function handleSelectPet(pet: Pet) {
    setSelectedPet(pet);
    setHistory([]);
    setFrequency([]);
  }

  const totalPrice = history.reduce(
    (sum, h) => sum + (h.price ?? 0),
    0
  );

  const totalSessions = history.length;

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-semibold">Histórico</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Coluna clientes */}
        <div className="bg-white rounded-lg border flex flex-col">
          <div className="p-3 border-b">
            <Input
              placeholder="Pesquisar cliente..."
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
            />
          </div>

          <div className="overflow-y-auto max-h-64">
            {filteredCustomers.length === 0 && (
              <p className="text-sm text-gray-400 p-4 text-center">
                Nenhum cliente encontrado
              </p>
            )}

            {filteredCustomers.map((c) => (
              <button
                key={c.id}
                onClick={() => handleSelectCustomer(c)}
                className={`w-full text-left px-4 py-3 text-sm border-b last:border-0 hover:bg-gray-50 transition-colors ${
                  selectedCustomer?.id === c.id
                    ? 'bg-gray-100 font-medium'
                    : ''
                }`}
              >
                <p className="font-medium">{c.name}</p>

                <p className="text-xs text-gray-400">
                  {c.phone} · {c.pets.length} pet(s)
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Coluna pets */}
        <div className="bg-white rounded-lg border flex flex-col">
          <div className="p-3 border-b">
            <Input
              placeholder="Pesquisar pet..."
              value={petSearch}
              onChange={(e) => setPetSearch(e.target.value)}
              disabled={!selectedCustomer}
            />
          </div>

          <div className="overflow-y-auto max-h-64">
            {!selectedCustomer && (
              <p className="text-sm text-gray-400 p-4 text-center">
                Selecione um cliente
              </p>
            )}

            {selectedCustomer && filteredPets.length === 0 && (
              <p className="text-sm text-gray-400 p-4 text-center">
                Nenhum pet encontrado
              </p>
            )}

            {filteredPets.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelectPet(p)}
                className={`w-full text-left px-4 py-3 text-sm border-b last:border-0 hover:bg-gray-50 transition-colors ${
                  selectedPet?.id === p.id
                    ? 'bg-gray-100 font-medium'
                    : ''
                }`}
              >
                <p className="font-medium">{p.name}</p>

                <p className="text-xs text-gray-400">
                  {p.species} · {p.race}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Resultado */}
      {selectedPet && (
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">
              Histórico de {selectedPet.name}

              <span className="text-gray-400 font-normal text-sm ml-2">
                ({selectedCustomer?.name})
              </span>
            </h3>

            {history.length > 0 && (
              <div className="flex gap-4 text-sm text-gray-500">
                <span>{totalSessions} sessão(ões)</span>

                <span>
                  Total: R$ {totalPrice.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          {loading && (
            <p className="text-sm text-gray-400">
              Carregando...
            </p>
          )}

          {!loading && history.length === 0 && (
            <div className="bg-white rounded-lg border p-8 text-center text-gray-400 text-sm">
              Nenhum histórico encontrado para este pet
            </div>
          )}

          {!loading && history.length > 0 && (
            <div className="flex flex-col gap-3">
              {/* Tabela */}
              <div className="bg-white rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Horário</TableHead>
                      <TableHead>Duração</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Observações</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {history.map((h, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          {format(
                            new Date(h.time),
                            'dd/MM/yyyy'
                          )}
                        </TableCell>

                        <TableCell>
                          {format(
                            new Date(h.time),
                            'HH:mm'
                          )}
                        </TableCell>

                        <TableCell>
                          {h.duration} min
                        </TableCell>

                        <TableCell>
                          R$ {Number(h.price).toFixed(2)}
                        </TableCell>

                        <TableCell className="text-gray-500">
                          {h.observations || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Gráfico de frequência */}
              {frequency.length > 0 && (
                <div className="bg-white rounded-lg border p-4">
                  <h4 className="text-sm font-medium text-gray-600 mb-4">
                    Frequência nos últimos 12 meses
                  </h4>

                  <ResponsiveContainer
                    width="100%"
                    height={220}
                  >
                    <BarChart
                      data={frequency}
                      margin={{
                        top: 4,
                        right: 8,
                        left: -20,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />

                      <XAxis
                        dataKey="date"
                        tickFormatter={(d) =>
                          format(
                            new Date(d),
                            'MMM/yy',
                            { locale: ptBR }
                          )
                        }
                        tick={{ fontSize: 12 }}
                      />

                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 12 }}
                      />

                      <Tooltip
                        labelFormatter={(d) =>
                          d != null
                            ? format(new Date(String(d)), 'MMMM/yyyy', { locale: ptBR })
                            : ''
                        }
                        formatter={(value) => [
                          value ?? 0,
                          'Sessões',
                        ]}
                      />

                      <Bar
                        dataKey="count"
                        fill="#1D9E75"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}