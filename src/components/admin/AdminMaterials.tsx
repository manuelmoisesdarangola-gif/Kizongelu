/**
 * @file src/components/admin/AdminMaterials.tsx
 * Catálogo de Materiais e Insumos do Motor de Cálculo (Angola).
 * Secção dedicada a materiais isolados consumidos por lib/calculation-engine/prices-provider.ts.
 * 
 * - Gestão de catálogo: Preços de materiais com factores provinciais de logística
 * - Estado Activo / Inactivo com toggle rápido e registo no AuditLog
 * - Adição de novos materiais com modal dedicado (+ Novo Material)
 * - Rastreio de datas de actualização em formato PT (DD/MM/AAAA)
 */

import React, { useState, useMemo, useEffect } from 'react';
import { SEED_MATERIALS, PROVINCE_FACTORS } from '../../../prisma/seed-prices';
import { formatCurrencyKz } from '../../../lib/format/currency';
import { useAuth } from '../../auth/auth-context';
import { useToast } from '../../context/ToastContext';
import { AdminDataService } from '../../lib/services/admin-data';
import {
  Boxes,
  Search,
  Database,
  Info,
  CheckCircle2,
  Plus,
  X,
  Calendar,
  Layers,
  Sparkles,
  Tag,
} from 'lucide-react';

interface AdminMaterialsProps {
  onNavigateToSection?: (section: any) => void;
  onBackToPrecos?: () => void;
}

export interface AdminMaterialItem {
  code: string;
  name: string;
  category: string;
  unit: string;
  basePriceLuanda: number;
  ativo?: boolean;
  updatedAt?: string;
  origem?: string;
  fonte?: string;
  validade?: string;
}

// D.1 & B.2: Mapeamento de categorias em sentence case
const CATEGORY_NAMES: Record<string, string> = {
  CIMENTO: 'Cimento',
  AREIA: 'Areia',
  BRITA: 'Brita',
  BLOCOS: 'Blocos',
  ACO: 'Aço',
  MADEIRA: 'Madeira',
  COBERTURA: 'Cobertura',
  CERAMICA: 'Cerâmica',
  TINTA: 'Tinta',
  TUBOS: 'Tubos',
  CABOS: 'Cabos',
  EQUIPAMENTOS: 'Equipamentos',
  MAO_OBRA: 'Mão de Obra',
  TRANSPORTE: 'Transporte',
};

const CATEGORY_PREFIXES: Record<string, string> = {
  CIMENTO: 'CIM',
  AREIA: 'ARE',
  BRITA: 'BRI',
  BLOCOS: 'BLO',
  ACO: 'ACO',
  MADEIRA: 'MAD',
  COBERTURA: 'COB',
  CERAMICA: 'CER',
  TINTA: 'TIN',
  TUBOS: 'TUB',
  CABOS: 'CAB',
  EQUIPAMENTOS: 'EQU',
  MAO_OBRA: 'MOD',
  TRANSPORTE: 'TRA',
};

const getCategoryLabel = (category: string): string => {
  return CATEGORY_NAMES[category] || category;
};

// E.6: Cores semânticas por categoria
const CATEGORY_COLORS: Record<string, string> = {
  CIMENTO: 'bg-stone-500/20 text-stone-300 border border-stone-500/30',
  AREIA: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
  BRITA: 'bg-zinc-500/20 text-zinc-300 border border-zinc-500/30',
  BLOCOS: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
  ACO: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  MADEIRA: 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
  COBERTURA: 'bg-teal-500/20 text-teal-300 border border-teal-500/30',
  CERAMICA: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
  TINTA: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
  TUBOS: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
  CABOS: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
  EQUIPAMENTOS: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  MAO_OBRA: 'bg-lime-500/20 text-lime-300 border border-lime-500/30',
  TRANSPORTE: 'bg-sky-500/20 text-sky-300 border border-sky-500/30',
};

const getCategoryBadgeClass = (category: string): string => {
  return CATEGORY_COLORS[category] || 'bg-slate-700/80 text-slate-300 border border-slate-600/50';
};

const STORAGE_KEY_MATERIALS = 'kizongelu_admin_materials_v3';

export const AdminMaterials: React.FC<AdminMaterialsProps> = ({
  onNavigateToSection,
  onBackToPrecos,
}) => {
  const { currentUser } = useAuth();
  const { success, error: toastError } = useToast();

  const [materials, setMaterials] = useState<AdminMaterialItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_MATERIALS);
        if (stored) {
          const parsed = JSON.parse(stored) as AdminMaterialItem[];
          if (Array.isArray(parsed) && parsed.length >= SEED_MATERIALS.length) {
            return parsed;
          }
        }
      } catch (e) {
        // Fallback para SEED_MATERIALS
      }
    }
    // Inicialização a partir de SEED_MATERIALS com valores PT-PT
    return SEED_MATERIALS.map((m) => ({
      ...m,
      ativo: true,
      updatedAt: '15/10/2026',
      origem: 'Base Oficial Kizongelu',
    }));
  });

  const [selectedProvince, setSelectedProvince] = useState<string>('Luanda');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // D.4: Estado do Modal "+ Novo Material"
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('CIMENTO');
  const [newUnit, setNewUnit] = useState('saco');
  const [newBasePrice, setNewBasePrice] = useState('');
  const [newFonte, setNewFonte] = useState('Mercado Oficial de Luanda');
  const [newValidade, setNewValidade] = useState('31/12/2026');

  // Guardar no localStorage sempre que houver alteração
  const saveMaterials = (updated: AdminMaterialItem[]) => {
    setMaterials(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_MATERIALS, JSON.stringify(updated));
      } catch (e) {
        // Ignore storage errors
      }
    }
  };

  const provinceFactorData = PROVINCE_FACTORS[selectedProvince] || PROVINCE_FACTORS['Luanda'];
  const currentFactor = provinceFactorData.factor;
  const isLuanda = selectedProvince.toLowerCase() === 'luanda';

  const categories = useMemo(() => {
    const set = new Set<string>();
    materials.forEach((m) => set.add(m.category));
    return Array.from(set).sort();
  }, [materials]);

  const filteredMaterials = useMemo(() => {
    return materials.filter((item) => {
      const matchCat = selectedCategory === 'ALL' || item.category === selectedCategory;
      const isItemActive = item.ativo !== false;
      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && isItemActive) ||
        (statusFilter === 'INACTIVE' && !isItemActive);
      const matchSearch =
        searchTerm === '' ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchStatus && matchSearch;
    });
  }, [materials, selectedCategory, statusFilter, searchTerm]);

  // D.2: Alternar estado Activo / Inactivo com AuditLog
  const handleToggleStatus = (mat: AdminMaterialItem) => {
    const newStatus = mat.ativo === false;
    const updated = materials.map((item) =>
      item.code === mat.code ? { ...item, ativo: newStatus } : item
    );
    saveMaterials(updated);

    AdminDataService.recordAudit({
      evento: 'MATERIAL_STATUS_CHANGED',
      adminNome: currentUser.nome,
      adminEmail: currentUser.email,
      gravidade: 'INFO',
      descricao: `Estado do material ${mat.code} (${mat.name}) alterado para ${newStatus ? 'Activo' : 'Inactivo'}.`,
      ip: '105.172.45.12 (Luanda)',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Chrome 128.0 / MacOS',
      before: { code: mat.code, ativo: mat.ativo !== false },
      after: { code: mat.code, ativo: newStatus },
    });

    success(
      'Estado Actualizado',
      `O material ${mat.code} foi marcado como ${newStatus ? 'Activo' : 'Inactivo'}.`
    );
  };

  // Gerar código sugerido ao abrir modal ou trocar categoria
  const handleOpenCreateModal = () => {
    const prefix = CATEGORY_PREFIXES[newCategory] || 'MAT';
    const existingCount = materials.filter((m) => m.category === newCategory).length;
    const nextNum = String(existingCount + 1).padStart(3, '0');
    setNewCode(`${prefix}-${nextNum}`);
    setIsCreateModalOpen(true);
  };

  const handleCategoryChangeInModal = (cat: string) => {
    setNewCategory(cat);
    const prefix = CATEGORY_PREFIXES[cat] || 'MAT';
    const existingCount = materials.filter((m) => m.category === cat).length;
    const nextNum = String(existingCount + 1).padStart(3, '0');
    setNewCode(`${prefix}-${nextNum}`);
  };

  // D.4: Criação do novo material
  const handleCreateMaterial = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newCode.trim()) {
      toastError('Código Obrigatório', 'Por favor insira um código para o material.');
      return;
    }
    if (!newName.trim()) {
      toastError('Designação Obrigatória', 'Por favor insira a designação do material.');
      return;
    }
    const priceNum = Number(newBasePrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      toastError('Preço Inválido', 'Por favor insira um preço base válido superior a 0 Kz.');
      return;
    }

    // Verificar se código já existe
    if (materials.some((m) => m.code.toUpperCase() === newCode.trim().toUpperCase())) {
      toastError('Código Existente', `O código ${newCode.trim()} já existe no catálogo.`);
      return;
    }

    const newMaterial: AdminMaterialItem = {
      code: newCode.trim().toUpperCase(),
      name: newName.trim(),
      category: newCategory,
      unit: newUnit.trim(),
      basePriceLuanda: priceNum,
      ativo: true,
      updatedAt: '16/10/2026',
      origem: 'Base Oficial Kizongelu',
      fonte: newFonte.trim(),
      validade: newValidade.trim(),
    };

    const updated = [newMaterial, ...materials];
    saveMaterials(updated);

    AdminDataService.recordAudit({
      evento: 'MATERIAL_CREATED',
      adminNome: currentUser.nome,
      adminEmail: currentUser.email,
      gravidade: 'INFO',
      descricao: `Novo material adicionado: [${newMaterial.code}] ${newMaterial.name} (${formatCurrencyKz(newMaterial.basePriceLuanda)} em Luanda).`,
      ip: '105.172.45.12 (Luanda)',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Chrome 128.0 / MacOS',
      before: {},
      after: {
        code: newMaterial.code,
        name: newMaterial.name,
        category: newMaterial.category,
        unit: newMaterial.unit,
        basePriceLuanda: newMaterial.basePriceLuanda,
        fonte: newMaterial.fonte,
      },
    });

    success(
      'Material Criado',
      `O material ${newMaterial.code} foi registado com sucesso no catálogo.`
    );

    setIsCreateModalOpen(false);
    setNewName('');
    setNewBasePrice('');
  };

  const activeMaterialsCount = materials.filter((m) => m.ativo !== false).length;

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700/80 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-black text-white flex items-center gap-2">
              <Boxes className="w-5 h-5 text-amber-400" />
              Catálogo de Materiais e Insumos do Motor (Angola)
            </h1>
            <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/30">
              {materials.length} Materiais Base
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Preços unitários de materiais isolados consumidos directamente pelo motor de cálculo (<code>prices-provider.ts</code>).
          </p>
        </div>

        {/* D.4: Barra de Ações com botão "+ Novo Material" e "Ver Base BPU" */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-colors cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>+ Novo Material</span>
          </button>

          <button
            onClick={() => {
              if (onNavigateToSection) {
                onNavigateToSection('precos');
              } else if (onBackToPrecos) {
                onBackToPrecos();
              }
            }}
            className="px-3.5 py-2 bg-slate-700 hover:bg-slate-650 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer border border-slate-600"
          >
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span>Ver Base BPU (/admin/precos)</span>
          </button>
        </div>
      </div>

      {/* Banner de Ligação com o Motor */}
      <div className="rounded-xl bg-sky-500/10 border border-sky-500/30 p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
        <div className="text-sm text-sky-100">
          <strong className="text-sky-50">Fonte de Dados do Motor:</strong>
          <span className="ml-1">
            Os materiais abaixo constituem a base determinística de insumos utilizada no cálculo de orçamentos pelo motor de engenharia. Cada preço provincial reflecte o factor logístico de transporte a partir de Luanda.
          </span>
        </div>
      </div>

      {/* E.5: KPIs Rápidos Dinâmicos (5 KPIs com Última Actualização) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total de Materiais</span>
          <span className="text-2xl font-black text-white mt-1 block">{materials.length}</span>
          <span className="text-[10px] text-slate-400">Catálogo oficial activo</span>
        </div>
        <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Materiais Activos</span>
          <span className="text-2xl font-black text-emerald-400 mt-1 block">{activeMaterialsCount}</span>
          <span className="text-[10px] text-emerald-300">Em produção ({materials.length - activeMaterialsCount} inactivos)</span>
        </div>
        <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Província Activa</span>
          <span className="text-lg font-black text-sky-400 mt-1 block truncate">{selectedProvince}</span>
          <span className="text-[10px] text-sky-300">Factor: {currentFactor.toFixed(2)}x ({provinceFactorData.note})</span>
        </div>
        <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Categorias</span>
          <span className="text-2xl font-black text-amber-400 mt-1 block">{categories.length}</span>
          <span className="text-[10px] text-slate-400">Cimento, Aço, Inertes...</span>
        </div>
        <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 shadow-sm col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Última Actualização</span>
          <span className="text-lg font-black text-amber-400 mt-1 block">Setembro 2026</span>
          <span className="text-[10px] text-slate-400">Ciclo trimestral regular</span>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-slate-800/90 rounded-2xl border border-slate-700/80 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-700 bg-slate-900/40 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* E.4: Placeholder da pesquisa */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Pesquisar material ou código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-800 text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Filtro por Estado */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto text-xs py-2 px-3 rounded-xl border border-slate-700 bg-slate-800 text-white font-medium focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="ALL">Todos os estados ({materials.length})</option>
              <option value="ACTIVE">Activos ({activeMaterialsCount})</option>
              <option value="INACTIVE">Inactivos ({materials.length - activeMaterialsCount})</option>
            </select>

            {/* Filtro por Província */}
            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="w-full sm:w-auto text-xs py-2 px-3 rounded-xl border border-slate-700 bg-slate-800 text-white font-medium focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              {Object.keys(PROVINCE_FACTORS).map((prov) => (
                <option key={prov} value={prov}>
                  {prov} ({PROVINCE_FACTORS[prov].factor.toFixed(2)}x)
                </option>
              ))}
            </select>

            {/* Filtro por Categoria em sentence case */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-auto text-xs py-2 px-3 rounded-xl border border-slate-700 bg-slate-800 text-white font-medium focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="ALL">Todas as Categorias ({categories.length})</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {getCategoryLabel(cat)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Contador de resultados */}
        <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
          <span>
            A mostrar <span className="text-white font-bold">{filteredMaterials.length}</span> de{' '}
            <span className="text-white font-bold">{materials.length}</span> materiais no catálogo
          </span>
          {(searchTerm !== '' || selectedCategory !== 'ALL' || statusFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('ALL');
                setStatusFilter('ALL');
              }}
              className="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer underline text-[10px]"
            >
              Limpar filtros
            </button>
          )}
        </div>

        {/* Tabela de Materiais */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-700">
              <tr>
                <th className="py-3 px-4 font-bold w-24">Código</th>
                <th className="py-3 px-4 font-bold min-w-[240px]">Designação do Material</th>
                <th className="py-3 px-3 font-bold text-center w-28">Categoria</th>
                <th className="py-3 px-3 font-bold text-center w-20">Unidade</th>
                {/* Preços sem redundância quando província activa é Luanda */}
                {isLuanda ? (
                  <th className="py-3 px-4 font-bold text-right w-36">Preço (Luanda)</th>
                ) : (
                  <>
                    <th className="py-3 px-3 font-bold text-right w-32">Preço Base (Luanda)</th>
                    <th className="py-3 px-4 font-bold text-right w-36">
                      Preço em {selectedProvince} ({currentFactor.toFixed(2)}x)
                    </th>
                  </>
                )}
                {/* D.2: Coluna Estado com toggle */}
                <th className="py-3 px-3 font-bold text-center w-24">Estado</th>
                <th className="py-3 px-4 font-bold text-center w-36">Origem</th>
                {/* D.3: Coluna Actualizado em */}
                <th className="py-3 px-4 font-bold text-center w-28">Actualizado em</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60 text-slate-300">
              {filteredMaterials.length === 0 ? (
                <tr>
                  <td
                    colSpan={isLuanda ? 8 : 9}
                    className="py-12 text-center text-slate-400"
                  >
                    <Boxes className="w-10 h-10 mx-auto mb-3 opacity-30 text-amber-400" />
                    <p className="text-sm font-bold text-white">Nenhum material encontrado</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Não foram encontrados materiais correspondentes aos critérios de pesquisa e filtros seleccionados.
                    </p>
                    {(searchTerm !== '' || selectedCategory !== 'ALL' || statusFilter !== 'ALL') && (
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedCategory('ALL');
                          setStatusFilter('ALL');
                        }}
                        className="mt-3.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-650 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                      >
                        Limpar Filtros
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredMaterials.map((mat) => {
                  const adjustedPrice = Math.round(mat.basePriceLuanda * currentFactor);
                  const isItemActive = mat.ativo !== false;

                  return (
                    <tr key={mat.code} className="hover:bg-slate-750/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-amber-300">{mat.code}</td>
                      <td className="py-3 px-4 font-medium text-white">{mat.name}</td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${getCategoryBadgeClass(
                            mat.category
                          )}`}
                        >
                          {getCategoryLabel(mat.category)}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center text-slate-400 font-mono">{mat.unit}</td>
                      {isLuanda ? (
                        <td className="py-3 px-4 text-right font-black text-amber-400 font-mono">
                          {formatCurrencyKz(mat.basePriceLuanda)}
                        </td>
                      ) : (
                        <>
                          <td className="py-3 px-3 text-right font-mono text-slate-300">
                            {formatCurrencyKz(mat.basePriceLuanda)}
                          </td>
                          <td className="py-3 px-4 text-right font-black text-amber-400 font-mono">
                            {formatCurrencyKz(adjustedPrice)}
                          </td>
                        </>
                      )}

                      {/* D.2: Coluna Estado com toggle rápido */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(mat)}
                          title={isItemActive ? 'Clique para desactivar' : 'Clique para activar'}
                          className="cursor-pointer transition-transform active:scale-95 inline-flex items-center"
                        >
                          {isItemActive ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors">
                              Activo
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/20 text-slate-400 border border-slate-500/30 hover:bg-slate-500/30 transition-colors">
                              Inactivo
                            </span>
                          )}
                        </button>
                      </td>

                      {/* Coluna Origem com "Base Oficial Kizongelu" */}
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          {mat.origem || 'Base Oficial Kizongelu'}
                        </span>
                      </td>

                      {/* D.3: Coluna Actualizado em */}
                      <td className="py-3 px-4 text-center font-mono text-[11px] text-slate-400">
                        {mat.updatedAt || '15/10/2026'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: + NOVO MATERIAL (D.4)                                              */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-lg w-full p-6 space-y-5 text-white shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-700">
              <div className="flex items-center space-x-2">
                <Boxes className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Adicionar Novo Material ao Catálogo</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMaterial} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Categoria <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => handleCategoryChangeInModal(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white font-medium focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    {Object.keys(CATEGORY_NAMES).map((cat) => (
                      <option key={cat} value={cat}>
                        {CATEGORY_NAMES[cat]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Código do Material <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                    placeholder="Ex: CIM-005"
                    className="w-full p-2.5 font-mono uppercase rounded-xl border border-slate-700 bg-slate-900 text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Designação Completa <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: Cimento Portland Especial Alta Resistência 50kg"
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Unidade de Medida <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    placeholder="Ex: un, kg, m³, saco, barra, dia"
                    className="w-full p-2.5 font-mono rounded-xl border border-slate-700 bg-slate-900 text-white focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Preço Base Luanda (Kz) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={newBasePrice}
                    onChange={(e) => setNewBasePrice(e.target.value)}
                    placeholder="Ex: 5200"
                    className="w-full p-2.5 font-mono font-bold rounded-xl border border-slate-700 bg-slate-900 text-amber-400 focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Fonte dos Dados</label>
                  <input
                    type="text"
                    value={newFonte}
                    onChange={(e) => setNewFonte(e.target.value)}
                    placeholder="Ex: Mercado Kikolo / Fornecedor"
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Data de Validade</label>
                  <input
                    type="text"
                    value={newValidade}
                    onChange={(e) => setNewValidade(e.target.value)}
                    placeholder="31/12/2026"
                    className="w-full p-2.5 font-mono rounded-xl border border-slate-700 bg-slate-900 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700/80 text-[11px] text-slate-400 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  O material será integrado automaticamente ao motor de cálculo determinístico e reflectirá os factores de transporte das 21 províncias de Angola.
                </span>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-650 text-white font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl transition-colors cursor-pointer shadow-md"
                >
                  Guardar Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMaterials;
