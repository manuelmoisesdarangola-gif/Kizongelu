/**
 * @file components/admin/prices/PriceEditModal.tsx
 * Modal de edição de preço de material:
 * - Exibe o preço anterior riscado e campo para o novo valor
 * - Alerta de variação percentual calculada em tempo real
 * - Exigência estrita de motivo justificativo se a variação for superior a 20%
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { PriceRecordWithMaterial, updatePrice } from '@/lib/actions/prices';
import { AlertCircle, TrendingUp, TrendingDown, ShieldAlert, Check } from 'lucide-react';

interface PriceEditModalProps {
  priceRecord: PriceRecordWithMaterial | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updated: PriceRecordWithMaterial) => void;
}

export const PriceEditModal: React.FC<PriceEditModalProps> = ({
  priceRecord,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [newPrice, setNewPrice] = useState<number>(0);
  const [source, setSource] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (priceRecord) {
      setNewPrice(priceRecord.price);
      setSource(priceRecord.source);
      setReason('');
      setError(null);
    }
  }, [priceRecord]);

  if (!priceRecord) return null;

  const oldPrice = priceRecord.price;
  const variationKz = newPrice - oldPrice;
  const variationPct = oldPrice > 0 ? (variationKz / oldPrice) * 100 : 0;
  const absVariationPct = Math.abs(variationPct);
  const isHighVariation = absVariationPct > 20;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPrice <= 0) {
      setError('O novo preço deve ser superior a 0 Kz.');
      return;
    }

    if (isHighVariation && (!reason || reason.trim().length < 5)) {
      setError(`A variação de preço é de ${absVariationPct.toFixed(1)}% (>20%). É obrigatório introduzir o motivo da alteração.`);
      return;
    }

    setLoading(true);

    try {
      const res = await updatePrice(priceRecord.id, {
        price: newPrice,
        source,
        reason,
        userId: 'admin_dashboard',
      });

      if (!res.success || !res.data) {
        setError(res.error || 'Erro ao atualizar o preço.');
        return;
      }

      onSuccess(res.data);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Falha ao gravar alteração.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Atualizar Preço de Material"
      description={`${priceRecord.materialCode} - ${priceRecord.materialName} (${priceRecord.province})`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Comparador de Preço Anterior Riscado vs Novo Preço */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">
              Preço Atual Registado
            </span>
            <span className="text-base font-bold text-slate-400 line-through">
              {oldPrice.toLocaleString('pt-AO')} Kz
            </span>
            <span className="text-xs text-slate-500 ml-1">/ {priceRecord.unit}</span>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">
              Variação Prevista
            </span>
            <div className="flex items-center justify-end space-x-1">
              {variationPct > 0 ? (
                <Badge variant="destructive" className="flex items-center space-x-1">
                  <TrendingUp className="w-3 h-3 mr-0.5" />
                  <span>+{absVariationPct.toFixed(1)}%</span>
                </Badge>
              ) : variationPct < 0 ? (
                <Badge variant="whatsapp" className="flex items-center space-x-1">
                  <TrendingDown className="w-3 h-3 mr-0.5" />
                  <span>-{absVariationPct.toFixed(1)}%</span>
                </Badge>
              ) : (
                <Badge variant="outline">0.0%</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Input do Novo Preço */}
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Novo Preço (Kz por {priceRecord.unit})
          </label>
          <div className="relative">
            <Input
              type="number"
              required
              min={1}
              step={10}
              value={newPrice || ''}
              onChange={(e) => setNewPrice(Number(e.target.value))}
              placeholder="Ex.: 7200"
              className="text-base font-bold text-[#0F3D5C]"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-xs font-semibold text-slate-400">
              Kz
            </div>
          </div>
        </div>

        {/* Alerta Condicional se Variação for > 20% */}
        {isHighVariation && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Variação Superior a 20% Detetada!</span>
              <span>
                Por regra de auditoria da Kizongelu, oscilações acentuadas de preço exigem obrigatoriamente a descrição do motivo de mercado.
              </span>
            </div>
          </div>
        )}

        {/* Motivo Obrigatório se variação > 20% */}
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Motivo da Alteração {isHighVariation && <span className="text-red-500 font-bold">* (Obrigatório)</span>}
          </label>
          <Textarea
            required={isHighVariation}
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={
              isHighVariation
                ? 'Ex.: Subida do frete de transporte rodoviário e escassez do fornecedor em Benguela.'
                : 'Opcional: Atualização periódica de tabela.'
            }
            className="text-xs"
          />
          <span className="text-[11px] text-slate-400 block mt-1">
            Ficará gravado na timeline do histórico (`PriceHistory`) e no registo de auditoria.
          </span>
        </div>

        {/* Fonte do Preço */}
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Fonte / Fornecedor
          </label>
          <Input
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="Ex.: Amostragem Mercado do Kikolo / Nova Cimentangola"
            className="text-xs"
          />
        </div>

        <div className="pt-2 flex items-center justify-end space-x-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="cta" className="font-bold text-slate-900" disabled={loading}>
            {loading ? 'A Gravar...' : 'Gravar no Histórico'}
            <Check className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </form>
    </Modal>
  );
};
