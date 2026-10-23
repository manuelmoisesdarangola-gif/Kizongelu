/**
 * @file components/admin/prices/PriceDuplicateModal.tsx
 * Modal para duplicação em massa de um preço para outras províncias com fator de ajuste.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { PriceRecordWithMaterial, duplicatePriceToProvinces } from '@/lib/actions/prices';
import { Copy, AlertCircle, CheckCircle2, Globe2 } from 'lucide-react';

interface PriceDuplicateModalProps {
  priceRecord: PriceRecordWithMaterial | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (created: number, updated: number) => void;
}

const ALL_PROVINCES = [
  'Luanda',
  'Benguela',
  'Huíla',
  'Huambo',
  'Malanje',
  'Cabinda',
  'Lunda Norte',
  'Lunda Sul',
];

export const PriceDuplicateModal: React.FC<PriceDuplicateModalProps> = ({
  priceRecord,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedProvinces, setSelectedProvinces] = useState<string[]>([]);
  const [adjustPercent, setAdjustPercent] = useState<number>(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (priceRecord) {
      // Pre-seleciona outras províncias exceto a de origem
      setSelectedProvinces(ALL_PROVINCES.filter((p) => p !== priceRecord.province));
      setAdjustPercent(10);
      setError(null);
    }
  }, [priceRecord]);

  if (!priceRecord) return null;

  const toggleProvince = (prov: string) => {
    if (selectedProvinces.includes(prov)) {
      setSelectedProvinces(selectedProvinces.filter((p) => p !== prov));
    } else {
      setSelectedProvinces([...selectedProvinces, prov]);
    }
  };

  const handleSelectAll = () => {
    const others = ALL_PROVINCES.filter((p) => p !== priceRecord.province);
    if (selectedProvinces.length === others.length) {
      setSelectedProvinces([]);
    } else {
      setSelectedProvinces(others);
    }
  };

  const factor = 1 + adjustPercent / 100;
  const estimatedPrice = Math.round(priceRecord.price * factor);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProvinces.length === 0) {
      setError('Por favor selecione pelo menos uma província de destino.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await duplicatePriceToProvinces(
        priceRecord.id,
        selectedProvinces,
        factor,
        'admin_dashboard'
      );

      if (!res.success) {
        setError(res.error || 'Falha ao duplicar preços.');
        return;
      }

      onSuccess(res.createdCount, res.updatedCount);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro na duplicação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Duplicar Preço para Outras Províncias"
      description={`${priceRecord.materialCode} - ${priceRecord.materialName} (Origem: ${priceRecord.province})`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-500 block">Preço de Referência:</span>
            <span className="font-bold text-[#0F3D5C] text-sm">
              {priceRecord.price.toLocaleString('pt-AO')} Kz
            </span>
          </div>

          <div>
            <span className="text-slate-500 block">Preço Calculado c/ Ajuste:</span>
            <span className="font-bold text-amber-600 text-sm">
              {estimatedPrice.toLocaleString('pt-AO')} Kz
            </span>
          </div>
        </div>

        {/* Ajuste Percentual */}
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Fator de Ajuste Percentual (%)
          </label>
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              step={1}
              value={adjustPercent}
              onChange={(e) => setAdjustPercent(Number(e.target.value))}
              placeholder="Ex.: 10"
              className="w-28 text-xs font-bold"
            />
            <span className="text-xs text-slate-500">
              {adjustPercent >= 0 ? `+${adjustPercent}%` : `${adjustPercent}%`} sobre o preço base de {priceRecord.province}
            </span>
          </div>
        </div>

        {/* Seleção de Províncias */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-700">
              Províncias de Destino ({selectedProvinces.length} selecionadas)
            </label>
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-xs text-[#0F3D5C] hover:underline font-medium cursor-pointer"
            >
              Selecionar todas
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
            {ALL_PROVINCES.filter((p) => p !== priceRecord.province).map((prov) => {
              const isChecked = selectedProvinces.includes(prov);
              return (
                <div
                  key={prov}
                  onClick={() => toggleProvince(prov)}
                  className={`p-2 rounded-lg border text-xs cursor-pointer flex items-center space-x-2 transition-all ${
                    isChecked
                      ? 'bg-blue-50 border-[#0F3D5C] text-[#0F3D5C] font-semibold'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <Checkbox checked={isChecked} onChange={() => {}} />
                  <span>{prov}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-2 flex items-center justify-end space-x-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="cta" className="font-bold text-slate-900" disabled={loading}>
            {loading ? 'A Duplicar...' : `Duplicar para ${selectedProvinces.length} Províncias`}
            <Copy className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </form>
    </Modal>
  );
};
