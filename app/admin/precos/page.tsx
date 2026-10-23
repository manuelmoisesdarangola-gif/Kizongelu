/**
 * @file app/admin/precos/page.tsx
 * Página Administrativa de Gestão da Base de Preços e Materiais para Angola .
 * Acesso protegido a utilizadores com role ADMIN.
 * Inclui:
 * - KPIs superiores: total materiais, preços ativos, desactualizados (>90 dias), actualizações na semana
 * - Filtros: província (Luanda, Benguela, Huíla, etc.), categoria de material, estado e busca textual
 * - Tabela paginada (25 por defeito) com ações: Editar, Duplicar Províncias, Ver Histórico, Desativar
 * - Modais integrados de Edição, Novo Preço, Duplicação em Massa, Histórico com Timeline e Importação CSV
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MaterialCategory } from '@prisma/client';
import {
  listPrices,
  getPriceById,
  deactivatePrice,
  PriceRecordWithMaterial,
  ListPricesResult,
} from '@/lib/actions/prices';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { PriceEditModal } from '@/components/admin/prices/PriceEditModal';
import { PriceHistoryDrawer } from '@/components/admin/prices/PriceHistoryDrawer';
import { PriceDuplicateModal } from '@/components/admin/prices/PriceDuplicateModal';
import { PriceNewModal } from '@/components/admin/prices/PriceNewModal';
import { PriceCsvImportModal } from '@/components/admin/prices/PriceCsvImportModal';
import {
  Database,
  Plus,
  FileSpreadsheet,
  Search,
  Filter,
  RefreshCw,
  Edit2,
  Copy,
  History,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingUp,
  Boxes,
  ShieldCheck,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Info,
} from 'lucide-react';

const PROVINCE_OPTIONS = [
  { label: 'Todas as Províncias', value: 'ALL' },
  { label: 'Luanda (Referência)', value: 'Luanda' },
  { label: 'Benguela (+5%)', value: 'Benguela' },
  { label: 'Huíla (+8%)', value: 'Huíla' },
  { label: 'Huambo (+10%)', value: 'Huambo' },
  { label: 'Malanje (+12%)', value: 'Malanje' },
  { label: 'Cabinda (+18%)', value: 'Cabinda' },
  { label: 'Lunda Norte (+22%)', value: 'Lunda Norte' },
  { label: 'Lunda Sul (+25%)', value: 'Lunda Sul' },
];

const CATEGORY_OPTIONS = [
  { label: 'Todas as Categorias', value: 'ALL' },
  { label: 'Cimento', value: MaterialCategory.CIMENTO },
  { label: 'Areia', value: MaterialCategory.AREIA },
  { label: 'Brita', value: MaterialCategory.BRITA },
  { label: 'Blocos', value: MaterialCategory.BLOCOS },
  { label: 'Aço', value: MaterialCategory.ACO },
  { label: 'Madeira', value: MaterialCategory.MADEIRA },
  { label: 'Cobertura', value: MaterialCategory.COBERTURA },
  { label: 'Cerâmica', value: MaterialCategory.CERAMICA },
  { label: 'Tinta', value: MaterialCategory.TINTA },
  { label: 'Tubos', value: MaterialCategory.TUBOS },
  { label: 'Cabos', value: MaterialCategory.CABOS },
  { label: 'Equipamentos', value: MaterialCategory.EQUIPAMENTOS },
  { label: 'Mão de Obra', value: MaterialCategory.MAO_OBRA },
  { label: 'Transporte', value: MaterialCategory.TRANSPORTE },
];

const STATUS_OPTIONS = [
  { label: 'Todos os Estados', value: 'ALL' },
  { label: 'Ativos', value: 'ACTIVE' },
  { label: 'Inativos', value: 'INACTIVE' },
  { label: 'Desactualizados (> 90 dias)', value: 'OUTDATED' },
];

export default function AdminPricesPage() {
  const [data, setData] = useState<ListPricesResult | null>(null);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [province, setProvince] = useState<string>('ALL');
  const [category, setCategory] = useState<string>('ALL');
  const [status, setStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE' | 'OUTDATED'>('ALL');
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const pageSize = 25;

  // Modais e gavetas
  const [selectedForEdit, setSelectedForEdit] = useState<PriceRecordWithMaterial | null>(null);
  const [selectedForHistory, setSelectedForHistory] = useState<PriceRecordWithMaterial | null>(null);
  const [selectedForDuplicate, setSelectedForDuplicate] = useState<PriceRecordWithMaterial | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchPrices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listPrices({
        province,
        category: category as MaterialCategory | 'ALL',
        status,
        search,
        page,
        pageSize,
      });
      setData(res);
    } catch (err: unknown) {
      console.error('Erro ao carregar preços:', err);
    } finally {
      setLoading(false);
    }
  }, [province, category, status, search, page]);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  // Ações
  const handleOpenHistory = async (item: PriceRecordWithMaterial) => {
    const full = await getPriceById(item.id);
    setSelectedForHistory(full || item);
  };

  const handleDeactivate = async (item: PriceRecordWithMaterial) => {
    if (confirm(`Tem a certeza que deseja desativar o preço de "${item.materialName}" (${item.province})?`)) {
      const res = await deactivatePrice(item.id, 'admin_ui');
      if (res.success) {
        setNotification({ type: 'success', message: `Preço de ${item.materialCode} desativado com sucesso.` });
        fetchPrices();
      } else {
        setNotification({ type: 'error', message: res.error || 'Erro ao desativar preço.' });
      }
    }
  };

  const clearNotification = () => {
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho com Título e Ações Principais */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded-md bg-[#0F3D5C]/10 text-[#0F3D5C] text-xs font-bold uppercase tracking-wider">
              Área Reservada (Role: ADMIN)
            </span>
            <span className="text-xs text-slate-400">· Amostragem Angola 2025</span>
          </div>
          <h1 className="text-2xl font-black text-[#0F3D5C] mt-1 tracking-tight">
            Base de Preços e Catálogo de Materiais
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestão provincial, coeficientes logísticos, cotações por município e histórico de auditoria.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsImportModalOpen(true)}
            className="text-xs font-bold border-slate-300 hover:bg-slate-50"
          >
            <FileSpreadsheet className="w-4 h-4 mr-1.5 text-emerald-600" />
            Importar CSV
          </Button>

          <Button
            variant="cta"
            size="sm"
            onClick={() => setIsNewModalOpen(true)}
            className="text-xs font-bold text-slate-900 shadow-xs"
          >
            <Plus className="w-4 h-4 mr-1" />
            Novo Preço
          </Button>
        </div>
      </div>

      {/* Notificação Temporária */}
      {notification && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between animate-in fade-in duration-200 ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center space-x-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span className="font-semibold">{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-600">
            &times;
          </button>
        </div>
      )}

      {/* B.0 — Banner de referência (NOVO) */}
      <div className="rounded-xl bg-sky-500/10 border border-sky-500/30 p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
        <div className="text-sm text-sky-900">
          <strong className="text-sky-950">Base de referência.</strong>
          <span className="ml-1">
            Esta tabela mostra actividades compostas (Base de Preços 
            Unitários). A edição dos preços unitários faz-se na secção 
            "Materiais". A BPU é recalculada automaticamente pelo motor.
          </span>
          <a
            href="/admin/materiais"
            className="ml-2 underline text-sky-700 hover:text-sky-950 font-semibold"
          >
            Ir para Materiais →
          </a>
        </div>
      </div>

      {/* 4 KPIs no Topo (Tarefa 4) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Materiais */}
        <Card className="border-slate-200 bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Total de Materiais
              </span>
              <span className="text-2xl font-black text-[#0F3D5C] tracking-tight">
                {data?.kpis.totalMaterials ?? '--'}
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Catálogo base 14 categorias
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0F3D5C]">
              <Boxes className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* KPI 2: Preços Ativos */}
        <Card className="border-slate-200 bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Preços Ativos
              </span>
              <span className="text-2xl font-black text-emerald-600 tracking-tight">
                {data?.kpis.activePrices ?? '--'}
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                8 províncias mapeadas
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* KPI 3: Desactualizados (>90 dias) */}
        <Card className="border-slate-200 bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Desactualizados (&gt;90d)
              </span>
              <span className="text-2xl font-black text-amber-600 tracking-tight">
                {data?.kpis.outdatedPrices ?? '--'}
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Requerem revisão de campo
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* KPI 4: Atualizações esta semana */}
        <Card className="border-slate-200 bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Actualizados Esta Semana
              </span>
              <span className="text-2xl font-black text-[#0F3D5C] tracking-tight">
                {data?.kpis.updatedThisWeek ?? '--'}
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Com registo PriceHistory
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[#0F3D5C]">
              <TrendingUp className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de Filtros e Pesquisa */}
      <Card className="border-slate-200 bg-white">
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Pesquisa Textual */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Pesquisar código, material, fornecedor..."
                className="pl-9 text-xs"
              />
            </div>

            {/* Filtro por Província */}
            <Select
              value={province}
              onChange={(val) => {
                setProvince(val);
                setPage(1);
              }}
              options={PROVINCE_OPTIONS}
              className="text-xs"
            />

            {/* Filtro por Categoria */}
            <Select
              value={category}
              onChange={(val) => {
                setCategory(val);
                setPage(1);
              }}
              options={CATEGORY_OPTIONS}
              className="text-xs"
            />

            {/* Filtro por Estado */}
            <Select
              value={status}
              onChange={(val) => {
                setStatus(val as any);
                setPage(1);
              }}
              options={STATUS_OPTIONS}
              className="text-xs"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
            <span className="font-medium">
              A mostrar <strong className="text-slate-800">{data?.items.length || 0}</strong> de{' '}
              <strong className="text-slate-800">{data?.total || 0}</strong> preços registados
            </span>

            <button
              onClick={() => {
                setProvince('ALL');
                setCategory('ALL');
                setStatus('ALL');
                setSearch('');
                setPage(1);
              }}
              className="text-slate-500 hover:text-[#0F3D5C] hover:underline cursor-pointer flex items-center space-x-1"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              <span>Limpar filtros</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Preços (Tarefa 4) */}
      <Card className="border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Código</th>
                <th className="py-3 px-4">Material</th>
                <th className="py-3 px-3">Categoria</th>
                <th className="py-3 px-3">Unidade</th>
                <th className="py-3 px-3">Província</th>
                <th className="py-3 px-4 text-right">Preço (Kz)</th>
                <th className="py-3 px-3">Fonte</th>
                <th className="py-3 px-3">Actualizado Em</th>
                <th className="py-3 px-3">Estado</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#0F3D5C]" />
                    <span>A carregar base de preços...</span>
                  </td>
                </tr>
              ) : data?.items.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-slate-400">
                    Nenhum registo de preço encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                data?.items.map((item) => {
                  const isOutdated =
                    item.active &&
                    new Date().getTime() - new Date(item.updatedAt).getTime() > 90 * 24 * 60 * 60 * 1000;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Código */}
                      <td className="py-3 px-4 font-mono font-bold text-[#0F3D5C]">
                        {item.materialCode}
                      </td>

                      {/* Material */}
                      <td className="py-3 px-4 font-medium text-slate-900 max-w-xs truncate" title={item.materialName}>
                        {item.materialName}
                      </td>

                      {/* Categoria */}
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                          {item.category}
                        </span>
                      </td>

                      {/* Unidade */}
                      <td className="py-3 px-3 font-mono text-slate-600">
                        {item.unit}
                      </td>

                      {/* Província */}
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center space-x-1 font-semibold text-slate-800">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{item.province}</span>
                        </span>
                      </td>

                      {/* Preço (Kz) */}
                      <td className="py-3 px-4 text-right font-extrabold text-[#0F3D5C] whitespace-nowrap text-sm">
                        {item.price.toLocaleString('pt-AO')} Kz
                      </td>

                      {/* Fonte */}
                      <td className="py-3 px-3 text-slate-500 text-[11px] max-w-[140px] truncate" title={item.source}>
                        {item.source}
                      </td>

                      {/* Atualizado Em */}
                      <td className="py-3 px-3 text-slate-500 text-[11px] whitespace-nowrap">
                        {new Date(item.updatedAt).toLocaleDateString('pt-PT', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Estado */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {!item.active ? (
                          <Badge variant="outline" className="text-slate-400 bg-slate-50">
                            Inativo
                          </Badge>
                        ) : isOutdated ? (
                          <Badge variant="warning" className="text-[10px]">
                            &gt; 90 dias
                          </Badge>
                        ) : (
                          <Badge variant="whatsapp" className="text-[10px]">
                            Ativo
                          </Badge>
                        )}
                      </td>

                      {/* Ações por Linha */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1">
                          {/* Editar Preço */}
                          <button
                            onClick={() => setSelectedForEdit(item)}
                            title="Editar Preço (Modal)"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#0F3D5C] hover:bg-slate-100 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Duplicar para Províncias */}
                          <button
                            onClick={() => setSelectedForDuplicate(item)}
                            title="Duplicar para Outras Províncias"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {/* Ver Histórico */}
                          <button
                            onClick={() => handleOpenHistory(item)}
                            title="Ver Histórico (Timeline & Gráfico)"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>

                          {/* Desativar (Soft Delete) */}
                          {item.active && (
                            <button
                              onClick={() => handleDeactivate(item)}
                              title="Desativar Preço"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação (25 itens por defeito) */}
        {data && data.totalPages > 1 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">
              Página <strong className="text-slate-800">{data.page}</strong> de{' '}
              <strong className="text-slate-800">{data.totalPages}</strong> ({data.total} preços no total)
            </span>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={data.page <= 1}
                className="text-xs h-8 px-2.5"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={data.page >= data.totalPages}
                className="text-xs h-8 px-2.5"
              >
                Seguinte
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Modais da Página */}
      {selectedForEdit && (
        <PriceEditModal
          priceRecord={selectedForEdit}
          isOpen={!!selectedForEdit}
          onClose={() => setSelectedForEdit(null)}
          onSuccess={(updated) => {
            setNotification({
              type: 'success',
              message: `Preço de ${updated.materialCode} actualizado para ${updated.price.toLocaleString('pt-AO')} Kz com registo no histórico!`,
            });
            clearNotification();
            fetchPrices();
          }}
        />
      )}

      {selectedForHistory && (
        <PriceHistoryDrawer
          priceRecord={selectedForHistory}
          isOpen={!!selectedForHistory}
          onClose={() => setSelectedForHistory(null)}
        />
      )}

      {selectedForDuplicate && (
        <PriceDuplicateModal
          priceRecord={selectedForDuplicate}
          isOpen={!!selectedForDuplicate}
          onClose={() => setSelectedForDuplicate(null)}
          onSuccess={(created, updated) => {
            setNotification({
              type: 'success',
              message: `Duplicação concluída: ${created} novos preços criados e ${updated} actualizados com ajuste provincial!`,
            });
            clearNotification();
            fetchPrices();
          }}
        />
      )}

      <PriceNewModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSuccess={(newP) => {
          setNotification({
            type: 'success',
            message: `Novo preço para ${newP.materialCode} (${newP.province}) registado com sucesso!`,
          });
          clearNotification();
          fetchPrices();
        }}
      />

      <PriceCsvImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={(report) => {
          setNotification({
            type: 'success',
            message: `Importação concluída: ${report.validRows} preços integrados com sucesso.`,
          });
          clearNotification();
          fetchPrices();
        }}
      />
    </div>
  );
}
