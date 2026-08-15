import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { getReport, getAbsentCustomers } from '@/api/reportApi';
import { Button } from '@/components/ui/button';
import type { AbsentCustomer } from '@/types';

export default function ReportPage() {
  const [report, setReport] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const [absentCustomers, setAbsentCustomers] = useState<AbsentCustomer[]>([]);
  const [loadingAbsent, setLoadingAbsent] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    try {
      const data = await getReport();
      setReport(data);
    } catch {
      toast.error('Erro ao gerar relatório');
    } finally {
      setLoading(false);
    }
  }

  async function loadAbsentCustomers() {
    setLoadingAbsent(true);
    try {
      const data = await getAbsentCustomers();
      setAbsentCustomers(data);
    } catch {
      toast.error('Erro ao buscar clientes ausentes');
    } finally {
      setLoadingAbsent(false);
    }
  }

  useEffect(() => {
    loadAbsentCustomers();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Relatório Inteligente</h2>
        <Button onClick={handleGenerate} disabled={loading}>
          {loading ? 'Gerando...' : '✨ Gerar relatório'}
        </Button>
      </div>

      {report && (
        <div className="bg-white rounded-lg border p-6 text-sm whitespace-pre-wrap leading-relaxed">
          {report}
        </div>
      )}

      {!report && !loading && (
        <div className="bg-white rounded-lg border p-12 text-center text-gray-400">
          <p className="text-4xl mb-4">📊</p>
          <p>Clique em "Gerar relatório" para analisar os dados do petshop</p>
        </div>
      )}

      {loading && (
        <div className="bg-white rounded-lg border p-12 text-center text-gray-400">
          <p className="text-4xl mb-4 animate-pulse">🤖</p>
          <p>Analisando dados...</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Clientes ausentes há mais de 15 dias</h3>

        {loadingAbsent && (
          <p className="text-gray-400 text-sm">Carregando...</p>
        )}

        {!loadingAbsent && absentCustomers.length === 0 && (
          <p className="text-gray-400 text-sm">Nenhum cliente ausente encontrado.</p>
        )}

        {!loadingAbsent && absentCustomers.length > 0 && (
          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="p-3">Cliente</th>
                  <th className="p-3">Dias sem agendamento realizado</th>
                  <th className="p-3">Último Agendamento</th>
                </tr>
              </thead>
              <tbody>
                {absentCustomers.map((item) => (
                  <tr key={item.schedulingId} className="border-t">
                    <td className="p-3">
                      <Link
                        to={`/customers/${item.customerId}`}
                        className="text-blue-600 hover:underline"
                      >
                        {item.customerName}
                      </Link>
                    </td>
                    <td className="p-3">{item.days} dias</td>
                    <td className="p-3">
                      <Link
                        to={`/scheduling/${item.schedulingId}`}
                        className="text-blue-600 hover:underline"
                      >
                        Ver agendamento
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}