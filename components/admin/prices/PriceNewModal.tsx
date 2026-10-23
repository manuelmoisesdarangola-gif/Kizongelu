/**
 * @file components/admin/prices/PriceNewModal.tsx
 * Modal para registo de um novo preço na base de dados provincial.
 */

'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { SEED_MATERIALS } from '../../../prisma/seed-prices';
import { createPrice, PriceRecordWithMaterial } from '@/lib/actions/prices';
import { PlusCircle, AlertCircle, Check } from 'lucide-react';

interface PriceNewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newPrice: PriceRecordWithMaterial) => void;
}

const PROVINCES = [
  'Luanda',
  'Benguela',
  'Huíla',
  'Huambo',
  'Malanje',
  'Cabinda',
  'Lunda Norte',
  'Lunda Sul',
];

export const PriceNewModal: React.FC<PriceNewModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedCode, setSelectedCode] = useState<string>(SEED_MATERIALS[0].code);
  const [province, setProvince] = useState<string>('Luanda');
  const [price, setPrice] = useState<number>(SEED_MATERIALS[0].basePriceLuanda);
  const [source, setSource] = useState<string>('Amostragem Mercado 2025');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedMaterial = SEED_MATERIALS.find((m) => m.code === selectedCode);

  const handleMaterialChange = (code: string) => {
    setSelectedCode(code);
    const m = SEED_MATERIALS.find((mat) => mat.code === code);
    if (m) {
      setPrice(m.basePriceLuanda);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!price || price <= 0) {
      setError('O preço deve ser superior a 0 Kz.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await createPrice({
        materialCode: selectedCode,
        province,
        price,
        source,
        userId: 'admin_dashboard',
      });

      if (!res.success || !res.data) {
        setError(res.error || 'Erro ao criar preço.');
        return;
      }

      onSuccess(res.data);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Falha na submissão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registar Novo Preço de Material"
      description="Adicione uma cotação de mercado geolocalizada para Angola"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Seleção do Material */}
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Material do Catálogo
          </label>
          <Select
            value={selectedCode}
            onChange={(val) => handleMaterialChange(val)}
            options={SEED_MATERIALS.map((m) => ({
              label: `[${m.code}] ${m.name} (${m.unit})`,
              value: m.code,
            }))}
            className="text-xs"
          />
          {selectedMaterial && (
            <span className="text-[11px] text-slate-500 block mt-1">
              Categoria: <strong className="text-[#0F3D5C]">{selectedMaterial.category}</strong> · Unidade: {selectedMaterial.unit}
            </span>
          )}
        </div>

        {/* Província */}
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Província
          </label>
          <Select
            value={province}
            onChange={(val) => setProvince(val)}
            options={PROVINCES.map((p) => ({ label: p, value: p }))}
            className="text-xs"
          />
        </div>

        {/* Preço */}
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Preço Unitário (Kz)
          </label>
          <div className="relative">
            <Input
              type="number"
              required
              min={1}
              step={10}
              value={price || ''}
              onChange={(e) => setPrice(Number(e.target.value))}
              placeholder="Ex.: 6500"
              className="text-sm font-bold text-[#0F3D5C]"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-xs font-semibold text-slate-400">
              Kz
            </div>
          </div>
        </div>

        {/* Fonte */}
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Fonte / Referência de Cotação
          </label>
          <Input
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="Ex.: Armazém Viana / Pesquisa de Campo"
            className="text-xs"
          />
        </div>

        <div className="pt-2 flex items-center justify-end space-x-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="cta" className="font-bold text-slate-900" disabled={loading}>
            {loading ? 'A Criar...' : 'Criar Preço'}
            <PlusCircle className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </form>
    </Modal>
  );
};
