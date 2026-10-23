/**
 * @file components/admin/prices/PriceHistoryDrawer.tsx
 * Drawer com linha do tempo de alterações históricas de preço (PriceHistory)
 * e gráfico de evolução temporal de 12 meses.
 */

'use client';

import React from 'react';
import { Drawer } from '@/components/ui/drawer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PriceRecordWithMaterial, PriceHistoryItem } from '@/lib/actions/prices';
import { History, TrendingUp, TrendingDown, Clock, User, FileText, Calendar, ArrowRight } from 'lucide-react';

interface PriceHistoryDrawerProps {
  priceRecord: PriceRecordWithMaterial | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PriceHistoryDrawer: React.FC<PriceHistoryDrawerProps> = ({
  priceRecord,
  isOpen,
  onClose,
}) => {
  if (!priceRecord) return null;

  const history = priceRecord.history || [];

  // Gera dados simulados de 12 meses terminando no preço atual
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const currentPrice = priceRecord.price;
  const chartData = months.map((m, idx) => {
    // Oscilação suave histórica baseada no índice do mês
    const factor = 0.85 + (idx / 11) * 0.15 + ((idx % 3) - 1) * 0.02;
    const val = Math.round(currentPrice * factor);
    return { month: m, value: idx === 11 ? currentPrice : val };
  });

  const maxVal = Math.max(...chartData.map((d) => d.value));
  const minVal = Math.min(...chartData.map((d) => d.value));
  const range = maxVal - minVal || 1;

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={`Histórico de Preços: ${priceRecord.materialCode} - ${priceRecord.materialName}`}
      className="max-w-4xl mx-auto"
    >
      <div className="space-y-6">
        {/* Resumo do Preço Atual */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Província / Mercado
            </span>
            <span className="text-sm font-bold text-slate-900">{priceRecord.province}</span>
            <span className="text-xs text-slate-500 ml-1">({priceRecord.source})</span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Preço Atual em Vigor
            </span>
            <span className="text-xl font-extrabold text-[#0F3D5C]">
              {priceRecord.price.toLocaleString('pt-AO')} Kz
            </span>
            <span className="text-xs text-slate-500 ml-1">/ {priceRecord.unit}</span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Total de Alterações
            </span>
            <Badge variant="default" className="text-xs font-bold">
              {history.length} registos
            </Badge>
          </div>
        </div>

        {/* Gráfico de Evolução dos Últimos 12 Meses */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold text-[#0F3D5C] uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#F59E0B]" />
              Evolução Temporal Estimada (12 Meses em Kz)
            </h4>
            <span className="text-[11px] text-slate-400">Escala de Preço Provincial</span>
          </div>

          <div className="h-40 flex items-end justify-between gap-2 pt-4 px-2 border-b border-slate-200">
            {chartData.map((pt, i) => {
              const heightPct = Math.max(15, Math.round(((pt.value - minVal) / range) * 80 + 15));
              const isCurrent = i === chartData.length - 1;

              return (
                <div key={pt.month} className="flex-1 flex flex-col items-center group relative">
                  {/* Tooltip no Hover */}
                  <div className="absolute -top-7 hidden group-hover:block bg-slate-800 text-white text-[10px] py-0.5 px-1.5 rounded-md whitespace-nowrap z-10 font-mono shadow-xs">
                    {pt.value.toLocaleString('pt-AO')} Kz
                  </div>

                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full rounded-t-md transition-all ${
                      isCurrent
                        ? 'bg-[#F59E0B] shadow-xs'
                        : 'bg-[#0F3D5C]/60 group-hover:bg-[#0F3D5C]'
                    }`}
                  />
                  <span className="text-[10px] font-semibold text-slate-500 mt-2">{pt.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Linha do Tempo (Timeline de Histórico) */}
        <div>
          <h4 className="text-xs font-bold text-[#0F3D5C] uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <History className="w-4 h-4 text-slate-600" />
            Linha Temporal de Eventos Registados (`PriceHistory`)
          </h4>

          {history.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400">
              Nenhuma alteração subsequente registada para este preço.
            </div>
          ) : (
            <div className="relative pl-6 space-y-4 border-l-2 border-slate-200 ml-3">
              {history.map((hist, idx) => (
                <div key={hist.id || idx} className="relative group">
                  {/* Ponto da timeline */}
                  <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white bg-[#0F3D5C] shadow-xs" />

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center space-x-2 text-xs">
                        <span className="font-bold text-slate-400 line-through">
                          {hist.oldPrice > 0 ? `${hist.oldPrice.toLocaleString('pt-AO')} Kz` : '0 Kz'}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-extrabold text-[#0F3D5C]">
                          {hist.newPrice.toLocaleString('pt-AO')} Kz
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {hist.variationPercent > 0 ? (
                          <Badge variant="destructive">+{hist.variationPercent}%</Badge>
                        ) : hist.variationPercent < 0 ? (
                          <Badge variant="whatsapp">{hist.variationPercent}%</Badge>
                        ) : (
                          <Badge variant="outline">0%</Badge>
                        )}
                        <span className="text-[11px] font-mono text-slate-400">
                          {new Date(hist.changedAt).toLocaleDateString('pt-PT', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    {hist.reason && (
                      <div className="text-xs text-slate-700 bg-white p-2 rounded-lg border border-slate-150">
                        <span className="font-semibold text-slate-500 block text-[10px] uppercase">
                          Motivo Justificativo:
                        </span>
                        <span>{hist.reason}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span className="flex items-center space-x-1">
                        <User className="w-3 h-3" />
                        <span>Responsável: {hist.changedBy}</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-2 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Fechar Histórico
          </Button>
        </div>
      </div>
    </Drawer>
  );
};
