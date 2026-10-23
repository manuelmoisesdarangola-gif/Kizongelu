/**
 * @file app/(app)/projeto/[projectId]/preview/pdf-preview-modal.tsx
 * Modal de visualização prévia de PDF profissional com marca de água "PRÉ-VISUALIZAÇÃO".
 */

import React from 'react';
import { ProjectPreviewData } from '../../../../../lib/actions/preview';
import { FileText, Download, Lock, X, Printer, Shield } from 'lucide-react';

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ProjectPreviewData;
  onOpenPaywall: () => void;
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  isOpen,
  onClose,
  data,
  onOpenPaywall,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-slate-800 w-full max-w-3xl h-[90vh] rounded-3xl shadow-2xl border border-slate-700 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="bg-slate-900 px-5 py-3.5 flex items-center justify-between border-b border-slate-700 text-white">
          <div className="flex items-center space-x-2.5">
            <FileText className="w-5 h-5 text-amber-400" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Visualizador de Documento
              </h4>
              <p className="text-sm font-extrabold text-white truncate max-w-xs sm:max-w-md">
                Mapa-de-Quantidades_{data.title.replace(/\s+/g, '_')}.pdf
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {data.isUnlocked ? (
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir / Guardar PDF</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenPaywall}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Desbloquear com Crédito</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Folha do PDF */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-slate-700/50">
          <div className="bg-white w-full max-w-2xl min-h-[800px] shadow-2xl rounded-sm p-8 sm:p-12 relative overflow-hidden text-slate-800 font-sans border border-slate-200">
            {/* Marca de Água Sobreposta em Diagonal se bloqueado */}
            {!data.isUnlocked && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center select-none z-20">
                <span className="text-5xl sm:text-7xl font-black text-rose-500/15 tracking-widest rotate-[-35deg] border-8 border-rose-500/15 p-6 rounded-3xl">
                  PRÉ-VISUALIZAÇÃO
                </span>
              </div>
            )}

            {/* Cabeçalho Profissional do Documento */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
              <div>
                <span className="text-xl font-black tracking-tight text-[#0F3D5C]">
                  Kizongelu
                </span>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">
                  Mapa de Quantidades e Orçamento Paramétrico
                </p>
              </div>
              <div className="text-right text-[11px] text-slate-500">
                <p>Data: {new Date().toLocaleDateString('pt-PT')}</p>
                <p>Ref: {data.projectId.toUpperCase()}</p>
                <p className="font-bold text-slate-700">Moeda: Kwanza (AOA/Kz)</p>
              </div>
            </div>

            {/* Ficha Resumo do Projeto */}
            <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between font-bold text-slate-900 text-sm">
                <span>{data.title}</span>
                <span className="text-amber-700">{data.summary.typeLabel}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] text-slate-600">
                <div>
                  <span className="text-slate-400 block">Localização</span>
                  <span className="font-bold text-slate-800">{data.summary.municipality}, {data.summary.province}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Área Útil</span>
                  <span className="font-bold text-slate-800">{data.summary.area} m²</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Pisos / Quartos</span>
                  <span className="font-bold text-slate-800">{data.summary.floors} piso(s) / {data.summary.bedrooms} Q</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Padrão</span>
                  <span className="font-bold text-slate-800">{data.summary.finishLevelLabel}</span>
                </div>
              </div>
            </div>

            {/* Tabela de Capítulos */}
            <div className="mt-6">
              <h5 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
                Resumo por Capítulos de Obra
              </h5>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-[10px] text-left">
                    <th className="py-1">Nº</th>
                    <th className="py-1">Capítulo</th>
                    <th className="py-1 text-center">%</th>
                    <th className="py-1 text-right">Subtotal (Kz)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.chapters.map((ch) => (
                    <tr key={ch.id} className={ch.isLocked ? 'filter blur-[1.5px] opacity-70 select-none' : ''}>
                      <td className="py-2 text-slate-400 font-mono">{ch.number}</td>
                      <td className="py-2 font-medium text-slate-900">{ch.name}</td>
                      <td className="py-2 text-center text-slate-500">{ch.percentage}%</td>
                      <td className="py-2 text-right font-mono font-bold">
                        {ch.subtotal.toLocaleString('pt-PT')} Kz
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Geral */}
            <div className="mt-6 pt-4 border-t-2 border-slate-900 flex justify-between items-center">
              <span className="text-sm font-black uppercase text-slate-900">Total Geral Estimado</span>
              <span className="text-lg font-black font-mono text-slate-900">
                {data.totals.grandTotal.toLocaleString('pt-PT')} Kz
              </span>
            </div>

            {/* Rodapé institucional */}
            <div className="mt-12 text-[10px] text-slate-400 text-center border-t border-slate-100 pt-4">
              Documento paramétrico elaborado através do sistema de engenharia de custos Kizongelu. Sujeito aos termos de uso e condições gerais da plataforma.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
