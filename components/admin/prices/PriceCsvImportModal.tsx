/**
 * @file components/admin/prices/PriceCsvImportModal.tsx
 * Modal para importação em lote de ficheiros CSV com pré-visualização,
 * validação linha por linha e relatório final (X válidas, Y com erro).
 */

'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { importPricesFromCsv, CsvImportResult } from '@/lib/actions/prices';
import {
  Upload,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  Download,
  Play,
  FileCheck,
} from 'lucide-react';

interface PriceCsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (result: CsvImportResult) => void;
}

const SAMPLE_5_ROWS_CSV = `codigo,provincia,preco,fonte
CIM-001,Luanda,6700,Amostragem Cimentangola 2025
ARE-001,Benguela,19200,Areias do Catumbela
BLO-001,Huíla,345,Fábrica de Blocos Lubango
ACO-003,Huambo,1490,Distribuidor Central Aço
MAD-001,Cabinda,5600,Serração de Buco Zau`;

export const PriceCsvImportModal: React.FC<PriceCsvImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [csvText, setCsvText] = useState<string>(SAMPLE_5_ROWS_CSV);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<CsvImportResult | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text || '');
      setReport(null);
    };
    reader.readAsText(file);
  };

  const handleRunImport = async () => {
    if (!csvText.trim()) return;

    setLoading(true);
    try {
      const res = await importPricesFromCsv(csvText, 'admin_csv_import');
      setReport(res);
      if (res.validRows > 0) {
        onSuccess(res);
      }
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const load5RowsExample = () => {
    setCsvText(SAMPLE_5_ROWS_CSV);
    setReport(null);
  };

  const loadExampleWithError = () => {
    const errorCsv = `codigo,provincia,preco,fonte
CIM-001,Luanda,6700,Amostragem Cimentangola 2025
CODIGO_INEXISTENTE,Malanje,9999,Fornecedor Desconhecido
BLO-001,Cabinda,-500,Preço Negativo Inválido
ACO-002,Huambo,1540,Siderurgia Huambo
TUB-001,,2300,Sem Província`;
    setCsvText(errorCsv);
    setReport(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Importação de Preços via Ficheiro CSV"
      description="Carregue ou cole uma tabela de cotações para validação e atualização em lote."
      size="lg"
    >
      <div className="space-y-4">
        {/* Barra de Ações Rápidas de Modelo */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-[#0F3D5C]" />
            <span className="text-xs font-semibold text-slate-700">
              Formato: <code className="font-mono bg-white px-1.5 py-0.5 rounded border">codigo,provincia,preco,fonte</code>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={load5RowsExample}
              className="text-xs text-[#0F3D5C] hover:underline font-semibold bg-white px-2 py-1 rounded border border-slate-200 hover:bg-slate-50 cursor-pointer"
            >
              Carregar Exemplo 5 Linhas
            </button>
            <button
              type="button"
              onClick={loadExampleWithError}
              className="text-xs text-amber-700 hover:underline font-medium bg-amber-50 px-2 py-1 rounded border border-amber-200 hover:bg-amber-100 cursor-pointer"
            >
              Exemplo com Erros (Teste)
            </button>
          </div>
        </div>

        {/* Upload de ficheiro ou Textarea */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Conteúdo CSV (ou selecione um ficheiro local)
            </label>
            <label className="text-xs font-semibold text-[#0F3D5C] hover:text-[#0F3D5C]/80 cursor-pointer flex items-center space-x-1">
              <Upload className="w-3.5 h-3.5" />
              <span>Procurar .csv</span>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <textarea
            rows={7}
            value={csvText}
            onChange={(e) => {
              setCsvText(e.target.value);
              setReport(null);
            }}
            placeholder="codigo,provincia,preco,fonte..."
            className="w-full font-mono text-xs p-3 rounded-xl border border-slate-200 bg-slate-900 text-emerald-400 focus:ring-2 focus:ring-[#0F3D5C]"
          />
        </div>

        {/* Relatório Final pós-validação */}
        {report && (
          <div className="space-y-3 p-4 rounded-xl border bg-slate-50 border-slate-200 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-[#0F3D5C]" />
                Relatório de Processamento
              </span>
              <div className="flex items-center space-x-2">
                <Badge variant="whatsapp" className="text-xs">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  {report.validRows} Válidas
                </Badge>
                {report.errorRows > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {report.errorRows} com Erro
                  </Badge>
                )}
              </div>
            </div>

            {report.errorRows > 0 && (
              <div className="space-y-1.5 max-h-32 overflow-y-auto bg-red-50 p-2.5 rounded-lg border border-red-200 text-[11px] text-red-800">
                <span className="font-bold block">Inconsistências encontradas:</span>
                {report.errors.map((err, i) => (
                  <div key={i} className="flex items-start space-x-1">
                    <span className="font-mono text-red-600 font-bold">Linha {err.line}:</span>
                    <span>{err.error}</span>
                  </div>
                ))}
              </div>
            )}

            {report.validRows > 0 && (
              <div className="text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                Foram gravados e integrados com sucesso {report.validRows} registos na base de preços!
              </div>
            )}
          </div>
        )}

        <div className="pt-2 flex items-center justify-end space-x-3 border-t border-slate-100">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Fechar
          </Button>
          <Button
            variant="cta"
            onClick={handleRunImport}
            disabled={loading || !csvText.trim()}
            className="font-bold text-slate-900"
          >
            {loading ? 'A Validar e Importar...' : 'Processar e Validar CSV'}
            <Play className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </div>
    </Modal>
  );
};
