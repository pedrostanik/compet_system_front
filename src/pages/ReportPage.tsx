import { useState } from 'react';
import { toast } from 'sonner';
import { getReport } from '@/api/reportApi';
import { Button } from '@/components/ui/button';

export default function ReportPage() {
  const [report, setReport] = useState<string>('');
  const [loading, setLoading] = useState(false);

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
    </div>
  );
}