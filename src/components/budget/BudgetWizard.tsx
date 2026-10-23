/**
 * @file src/components/budget/BudgetWizard.tsx
 * Criação guiada de orçamento com validação Zod e motor determinístico em tempo real.
 * 
 * Regra Crítica: Motor de Cálculo é 100% determinístico e separado. A IA nunca escreve valores.
 * Preços e coeficientes vêm da base de dados de preços.
 */

import React, { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { budgetCreationSchema, BudgetCreationInput } from '../../schemas/budget-schema';
import { useAuth } from '../../auth/auth-context';
import { BudgetRepository } from '../../db/budget-repository';
import { PriceDatabaseRepository } from '../../db/price-database';
import { PROVINCIAS_ANGOLA, getAllProvinces } from '../../db/provinces-database';
import { CalculationEngine, CATEGORY_NAMES_PT } from '../../engine/calculation-engine';
import { AngolaProvince, BudgetItemInput, WorkCategory, BudgetRecord } from '../../types/domain';
import { getUserCredits, consumeCredit } from '../../../lib/actions/packages';
import { formatNumberPt } from '../../../lib/utils/formatters';
import {
  Calculator,
  ArrowLeft,
  Plus,
  Trash2,
  AlertCircle,
  Building2,
  MapPin,
  FileCheck2,
  DollarSign,
  Search,
  Check,
  Sparkles,
} from 'lucide-react';

interface BudgetWizardProps {
  onCancel: () => void;
  onBudgetCreated: (newBudget: BudgetRecord) => void;
}

export const BudgetWizard: React.FC<BudgetWizardProps> = ({ onCancel, onBudgetCreated }) => {
  const { currentUser, consumirOrcamento } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<WorkCategory>('fundacoes_estruturas');
  const [articleSearch, setArticleSearch] = useState('');
  const [creditError, setCreditError] = useState<string | null>(null);
  const allPriceItems = PriceDatabaseRepository.getAll();

  const provinces = getAllProvinces();

  // Configuração do formulário com validação estrita Zod
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BudgetCreationInput>({
    resolver: zodResolver(budgetCreationSchema),
    defaultValues: {
      titulo: 'Construção de Moradia Unifamiliar',
      clienteNome: '',
      clienteTelefone: '+244 ',
      provincia: 'luanda',
      localizacaoExata: 'Luanda',
      areaEstimadaM2: 120,
      tipoConstrucao: 'habitacional_unifamiliar',
      itens: [
        { artigoId: 'art-001', quantidade: 200, notas: 'Limpeza inicial de terreno' },
        { artigoId: 'art-003', quantidade: 35, notas: 'Escavação manual' },
        { artigoId: 'art-004', quantidade: 5, notas: 'Betão de limpeza' },
        { artigoId: 'art-005', quantidade: 22, notas: 'Sapatas e vigas' },
        { artigoId: 'art-006', quantidade: 2400, notas: 'Aço nervurado' },
        { artigoId: 'art-008', quantidade: 160, notas: 'Paredes exteriores' },
      ],
      taxaBDI: 0.22,
      taxaEncargosSociais: 0.25,
      taxaIVA: 0.14,
      observacoes: 'Orçamento elaborado com base nos custos unitários de referência para Angola.',
    },
  });

  const watchedProvincia = watch('provincia');
  const watchedItens = watch('itens') || [];
  const watchedBDI = watch('taxaBDI') ?? 0.22;
  const watchedEncargos = watch('taxaEncargosSociais') ?? 0.25;
  const watchedIVA = watch('taxaIVA') ?? 0.14;

  // Pré-selecção vinda dos cartões da Landing Page
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const presetType = sessionStorage.getItem('kizongelu_preset_type');
      const presetSubtype = sessionStorage.getItem('kizongelu_preset_subtype');
      if (presetType) {
        if (presetType === 'muro') {
          setValue('tipoConstrucao', 'habitacional_unifamiliar');
          setValue('titulo', 'Construção de Muro de Vedação');
        } else if (presetType === 'anexo') {
          setValue('tipoConstrucao', 'habitacional_unifamiliar');
          setValue('titulo', 'Construção de Anexo Habitacional');
        } else if (presetType === 'remodelacao') {
          setValue('tipoConstrucao', 'reabilitacao');
          setValue('titulo', 'Obras de Remodelação & Ampliação');
        } else if (presetSubtype === 'comercial') {
          setValue('tipoConstrucao', 'comercial');
          setValue('titulo', 'Nave Industrial / Armazém');
        } else if (presetSubtype === 'multifamiliar') {
          setValue('tipoConstrucao', 'habitacional_multifamiliar');
          setValue('titulo', 'Prédio & Edifício Multifamiliar');
        } else if (presetType === 'nova') {
          setValue('tipoConstrucao', 'habitacional_unifamiliar');
          setValue('titulo', 'Construção de Moradia Unifamiliar');
        }
        sessionStorage.removeItem('kizongelu_preset_type');
        sessionStorage.removeItem('kizongelu_preset_subtype');
      }
    }
  }, [setValue]);

  const currentProvinceData = PROVINCIAS_ANGOLA[watchedProvincia] || PROVINCIAS_ANGOLA.luanda;

  // Cálculo determinístico em tempo real sempre que os itens ou província mudam
  const calculationPreview = useMemo(() => {
    return CalculationEngine.calculate({
      provincia: watchedProvincia,
      itens: watchedItens,
      taxaBDI: watchedBDI,
      taxaEncargosSociais: watchedEncargos,
      taxaIVA: watchedIVA,
    });
  }, [watchedProvincia, watchedItens, watchedBDI, watchedEncargos, watchedIVA]);

  // Gestão de itens do orçamento
  const handleAddItem = (artigoId: string) => {
    const existingIndex = watchedItens.findIndex((i) => i.artigoId === artigoId);
    if (existingIndex >= 0) {
      const updated = [...watchedItens];
      updated[existingIndex].quantidade += 1;
      setValue('itens', updated, { shouldValidate: true });
    } else {
      const updated: BudgetItemInput[] = [...watchedItens, { artigoId, quantidade: 1 }];
      setValue('itens', updated, { shouldValidate: true });
    }
  };

  const handleUpdateQuantity = (index: number, novaQtd: number) => {
    if (isNaN(novaQtd) || novaQtd < 0) return;
    const updated = [...watchedItens];
    updated[index].quantidade = Math.max(0, novaQtd);
    setValue('itens', updated, { shouldValidate: true });
  };

  const handleRemoveItem = (index: number) => {
    const updated = watchedItens.filter((_, i) => i !== index);
    setValue('itens', updated, { shouldValidate: true });
  };

  const onSubmit = async (data: BudgetCreationInput) => {
    try {
      setCreditError(null);
      // 1. Validar créditos de pacotes do utilizador (Bloco 4)
      if (currentUser.role !== 'admin') {
        const credits = await getUserCredits(currentUser.id);
        if (credits <= 0) {
          setCreditError('Não tem créditos disponíveis no seu pacote de orçamentos. Adquira um novo pacote para continuar.');
          return;
        }

        const projectId = `budget_${Date.now()}`;
        try {
          await consumeCredit(currentUser.id, projectId);
        } catch (error: any) {
          if (error.message === 'NO_CREDITS_AVAILABLE') {
            setCreditError('Não tem créditos disponíveis no seu pacote de orçamentos.');
            return;
          }
          if (error.message === 'CREDIT_ALREADY_CONSUMED_FOR_PROJECT') {
            console.warn('Crédito já consumido para este projecto');
          } else {
            throw error;
          }
        }
      }

      // 2. Criação determinística e registo isolado por userId
      const created = BudgetRepository.create(data, currentUser.id);

      // 3. Consome quota no contexto de autenticação
      consumirOrcamento();

      onBudgetCreated(created);
    } catch (err: unknown) {
      console.error(err);
      setCreditError('Erro ao guardar orçamento: Verifique todos os campos obrigatórios.');
    }
  };

  /**
   * Função para navegação e avanço seguro no construtor de orçamentos.
   * Valida os campos obrigatórios sem bloquear campos opcionais vazios.
   */
  const handleNextStep = () => {
    handleSubmit(onSubmit)();
  };

  const filteredArticles = allPriceItems.filter((item) => {
    const matchesCategory = item.categoria === selectedCategory;
    const matchesSearch =
      item.descricao.toLowerCase().includes(articleSearch.toLowerCase()) ||
      item.codigo.toLowerCase().includes(articleSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Barra de Navegação do Wizard */}
      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          className="inline-flex items-center space-x-2 text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar aos Orçamentos</span>
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {creditError && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span className="font-semibold">{creditError}</span>
            </div>
            <a
              href="/plano"
              className="px-3 py-1.5 bg-rose-600 text-white font-bold rounded-lg text-[11px] hover:bg-rose-700 transition-colors whitespace-nowrap"
            >
              Comprar Pacote
            </a>
          </div>
        )}

        {/* Painel 1: Dados Gerais da Obra e Localização em Angola */}
        <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-card-subtle space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-[#0F3D5C] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#0F3D5C]" />
              1. Identificação da Obra e Localização Geográfica em Angola
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Os custos de transporte, frete e mão de obra são ajustados automaticamente com base na província selecionada.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Título do Projecto / Obra *</label>
              <input
                type="text"
                {...register('titulo')}
                className="w-full text-base sm:text-sm p-3 h-12 min-h-[48px] rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] focus:border-[#0F3D5C] focus:bg-white focus:outline-none"
                placeholder="Ex: Moradia T3 no Kilamba"
              />
              {errors.titulo && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.titulo.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nome do Cliente *</label>
              <input
                type="text"
                {...register('clienteNome')}
                className="w-full text-base sm:text-sm p-3 h-12 min-h-[48px] rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] focus:border-[#0F3D5C] focus:bg-white focus:outline-none"
                placeholder="Ex: Manuel António"
              />
              {errors.clienteNome && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.clienteNome.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Telefone (Angola) *</label>
              <input
                type="text"
                {...register('clienteTelefone')}
                className="w-full text-base sm:text-sm p-3 h-12 min-h-[48px] rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] focus:border-[#0F3D5C] focus:bg-white focus:outline-none"
                placeholder="+244 923 000 000"
              />
              {errors.clienteTelefone && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.clienteTelefone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Província de Implantação *
              </label>
              <select
                {...register('provincia')}
                className="w-full text-base sm:text-sm p-3 h-12 min-h-[48px] rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] focus:border-[#0F3D5C] focus:bg-white focus:outline-none font-medium text-slate-800"
              >
                {provinces.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome} (Coef. Logístico: {p.coeficienteLogistica.toFixed(2)}x)
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Capital: <strong className="text-slate-700">{currentProvinceData.capital}</strong> &bull; Coef. Mão de Obra:{' '}
                <strong className="text-slate-700">{currentProvinceData.coeficienteMaoDeObra.toFixed(2)}x</strong>
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Município / Bairro / Rua *</label>
              <input
                type="text"
                {...register('localizacaoExata')}
                className="w-full text-base sm:text-sm p-3 h-12 min-h-[48px] rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] focus:border-[#0F3D5C] focus:bg-white focus:outline-none"
                placeholder="Ex: Talatona, Bairro Benfica"
              />
              {errors.localizacaoExata && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.localizacaoExata.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Área Bruta (m²) *</label>
                <input
                  type="number"
                  step="any"
                  {...register('areaEstimadaM2', { valueAsNumber: true })}
                  className="w-full text-base sm:text-sm p-3 h-12 min-h-[48px] rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] focus:border-[#0F3D5C] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tipologia</label>
                <select
                  {...register('tipoConstrucao')}
                  className="w-full text-base sm:text-sm p-3 h-12 min-h-[48px] rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] focus:border-[#0F3D5C] focus:bg-white focus:outline-none text-slate-800"
                >
                  <option value="habitacional_unifamiliar">Moradia T1 a T5</option>
                  <option value="habitacional_multifamiliar">Edifício Multifamiliar</option>
                  <option value="comercial">Armazém / Comercial</option>
                  <option value="reabilitacao">Reabilitação Geral</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Painel 2: Seleção e Quantificação de Artigos da Base de Dados */}
        <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-card-subtle space-y-4">
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-[#0F3D5C] flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-[#0F3D5C]" />
                2. Composição do Mapa de Quantidades e Preços de Angola
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Escolha os artigos da base de preços regulada para adicionar ao orçamento com os coeficientes de {currentProvinceData.nome}.
              </p>
            </div>
            <span className="text-xs font-medium text-slate-500">
              {watchedItens.length} {watchedItens.length === 1 ? 'artigo adicionado' : 'artigos adicionados'}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Lado Esquerdo: Catálogo da Base de Dados */}
            <div className="lg:col-span-6 space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as WorkCategory)}
                  className="text-base sm:text-xs p-2.5 h-12 min-h-[48px] sm:h-10 sm:min-h-[40px] rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] font-medium text-slate-800 w-full sm:w-1/2 focus:border-[#0F3D5C] focus:outline-none"
                >
                  {Object.entries(CATEGORY_NAMES_PT).map(([key, name]) => (
                    <option key={key} value={key}>
                      {name}
                    </option>
                  ))}
                </select>

                <div className="relative w-full sm:w-1/2">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Filtrar artigo..."
                    value={articleSearch}
                    onChange={(e) => setArticleSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-base sm:text-xs h-12 min-h-[48px] sm:h-10 sm:min-h-[40px] rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] focus:border-[#0F3D5C] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Lista de Artigos da Categoria */}
              <div className="border border-slate-200 rounded-xl max-h-72 overflow-y-auto divide-y divide-slate-100 bg-slate-50/50">
                {filteredArticles.map((artigo) => {
                  const isAlreadyAdded = watchedItens.some((i) => i.artigoId === artigo.id);

                  // Preço unitário ajustado para a província
                  const precoAjustadoKz =
                    Math.round(artigo.custoMaterialKz * currentProvinceData.coeficienteLogistica) +
                    Math.round(artigo.custoMaoDeObraKz * currentProvinceData.coeficienteMaoDeObra) +
                    Math.round(artigo.custoEquipamentoKz * (1 + (currentProvinceData.coeficienteLogistica - 1) * 0.4));

                  return (
                    <div
                      key={artigo.id}
                      className="p-3 hover:bg-white transition-colors flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                            {artigo.codigo}
                          </span>
                          <span className="text-[11px] text-slate-500">Unidade: {artigo.unidade}</span>
                        </div>
                        <p className="font-semibold text-slate-800 mt-1 leading-snug">{artigo.descricao}</p>
                        <div className="text-[11px] text-[#0F3D5C] font-bold mt-1">
                          {CalculationEngine.formatKz(precoAjustadoKz)} / {artigo.unidade}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddItem(artigo.id)}
                        className={`h-11 min-h-[44px] min-w-[44px] px-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer ${
                          isAlreadyAdded
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-[#0F3D5C] text-white hover:bg-[#1A547C]'
                        }`}
                        title="Adicionar ao Mapa"
                      >
                        <Plus className="w-4 h-4" />
                        <span className="inline">{isAlreadyAdded ? '+1' : 'Adicionar'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Lado Direito: Itens Adicionados e Quantificação */}
            <div className="lg:col-span-6 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Itens Quantificados no Orçamento
              </h3>

              {watchedItens.length === 0 ? (
                <div className="p-8 border border-dashed border-slate-300 rounded-xl text-center text-slate-400 text-xs">
                  Seleccione artigos no catálogo ao lado para compor este orçamento.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl max-h-72 overflow-y-auto divide-y divide-slate-100 bg-white">
                  {watchedItens.map((itemInput, index) => {
                    const artigo = PriceDatabaseRepository.getById(itemInput.artigoId);
                    if (!artigo) return null;

                    const precoAjustado =
                      Math.round(artigo.custoMaterialKz * currentProvinceData.coeficienteLogistica) +
                      Math.round(artigo.custoMaoDeObraKz * currentProvinceData.coeficienteMaoDeObra) +
                      Math.round(artigo.custoEquipamentoKz * (1 + (currentProvinceData.coeficienteLogistica - 1) * 0.4));

                    const subtotal = precoAjustado * itemInput.quantidade;

                    return (
                      <div key={itemInput.artigoId + index} className="p-3 text-xs space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded mr-1.5">
                              {artigo.codigo}
                            </span>
                            <span className="font-semibold text-slate-900">{artigo.descricao}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="text-slate-400 hover:text-rose-600 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer active:scale-95"
                            title="Remover artigo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-slate-600 font-medium">Qtd ({artigo.unidade}):</span>
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={itemInput.quantidade}
                              onKeyDown={(e) => {
                                if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                                  e.preventDefault();
                                }
                              }}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                handleUpdateQuantity(index, isNaN(val) ? 0 : Math.max(0, val));
                              }}
                              className="w-24 h-11 min-h-[44px] p-2 text-center text-base sm:text-xs font-bold rounded-xl border border-slate-300 text-slate-900 bg-slate-50 focus:bg-white focus:border-[#0F3D5C] focus:outline-none"
                            />
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block">Subtotal</span>
                            <span className="font-bold text-[#0F3D5C]">
                              {CalculationEngine.formatKz(subtotal)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Painel 3: Resumo Determinístico em Tempo Real (Memória de Cálculo) */}
        <div className="bg-[#0F3D5C] text-white rounded-xl p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <span className="text-amber-400 text-xs font-semibold uppercase tracking-wider block">
                Memória de Cálculo e Custos de Angola
              </span>
              <h3 className="text-lg font-bold text-white">
                Resumo Orçamental & Coeficientes Legais
              </h3>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-300 block">Prazo Estimado de Execução</span>
              <span className="text-sm font-bold text-amber-300">
                {calculationPreview.diasEstimadosObra} dias úteis ({formatNumberPt(calculationPreview.totalHorasTrabalhoEstimadas)}h de trabalho)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="bg-white/5 p-3 rounded-xl border border-white/10">
              <span className="text-slate-300 block text-[11px]">Materiais (c/ Frete {currentProvinceData.nome})</span>
              <span className="text-sm font-bold text-white block mt-1">
                {CalculationEngine.formatKz(calculationPreview.custoDiretoMateriaisKz)}
              </span>
            </div>

            <div className="bg-white/5 p-3 rounded-xl border border-white/10">
              <span className="text-slate-300 block text-[11px]">Mão de Obra Direta</span>
              <span className="text-sm font-bold text-white block mt-1">
                {CalculationEngine.formatKz(calculationPreview.custoDiretoMaoDeObraKz)}
              </span>
            </div>

            <div className="bg-white/5 p-3 rounded-xl border border-white/10">
              <span className="text-slate-300 block text-[11px]">Encargos Sociais ({watchedEncargos * 100}%)</span>
              <span className="text-sm font-bold text-white block mt-1">
                {CalculationEngine.formatKz(calculationPreview.valorEncargosSociaisKz)}
              </span>
            </div>

            <div className="bg-white/5 p-3 rounded-xl border border-white/10">
              <span className="text-slate-300 block text-[11px]">BDI / Lucro ({watchedBDI * 100}%)</span>
              <span className="text-sm font-bold text-white block mt-1">
                {CalculationEngine.formatKz(calculationPreview.valorBDIKz)}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-300">
              IVA Angola AGT ({(watchedIVA * 100).toFixed(0)}%):{' '}
              <strong className="text-white">{CalculationEngine.formatKz(calculationPreview.valorIVAKz)}</strong>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-xs text-slate-300 uppercase tracking-wider">Preço Total da Obra:</span>
              <span className="text-2xl font-black text-amber-400">
                {CalculationEngine.formatKz(calculationPreview.precoTotalFinalKz)}
              </span>
            </div>
          </div>
        </div>

        {/* Ações Finais — Mobile-first: Primário 56px, Secundário 48px */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 pb-8 sm:pb-2">
          <button
            type="button"
            onClick={onCancel}
            className="h-12 min-h-[48px] px-5 py-2.5 rounded-xl border border-[#E2E8F0] text-sm font-medium text-slate-700 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={isSubmitting || watchedItens.length === 0}
            className="h-14 min-h-[56px] bg-[#F59E0B] hover:bg-[#D97706] active:scale-95 text-slate-950 font-bold text-sm px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            <Check className="w-5 h-5 stroke-[3]" />
            <span>Gravar e Gerar Mapa de Quantidades</span>
          </button>
        </div>
      </form>
    </div>
  );
};
