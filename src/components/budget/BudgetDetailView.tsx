/**
 * @file src/components/budget/BudgetDetailView.tsx
 * Visualização e Exportação do Mapa de Quantidades e Custos discriminado por capítulos.
 * Inclui partilha direta via WhatsApp (#25D366) e impressão do relatório oficial de obra.
 */

import React, { useState } from 'react';
import { BudgetRecord, BudgetStatus } from '../../types/domain';
import { PROVINCIAS_ANGOLA } from '../../db/provinces-database';
import { CalculationEngine } from '../../engine/calculation-engine';
import { BudgetRepository } from '../../db/budget-repository';
import { useAuth } from '../../auth/auth-context';
import {
  ArrowLeft,
  Printer,
  Share2,
  Building,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  HardHat,
  Phone,
  FileSpreadsheet,
  Cpu,
} from 'lucide-react';
import { TransparencyDrawer } from './TransparencyDrawer';
import { CURRENT_ENGINE_VERSION } from '@/lib/calculation-engine/explain';
import { CalculationItem } from '@/lib/calculation-engine/types';

interface BudgetDetailViewProps {
  budget: BudgetRecord;
  onBack: () => void;
  onUpdate: (updated: BudgetRecord) => void;
}

export const BudgetDetailView: React.FC<BudgetDetailViewProps> = ({ budget, onBack, onUpdate }) => {
  const { currentUser } = useAuth();
  const [currentStatus, setCurrentStatus] = useState<BudgetStatus>(budget.status);
  const [selectedItemForDrawer, setSelectedItemForDrawer] = useState<CalculationItem | null>(null);
  const provinciaData = PROVINCIAS_ANGOLA[budget.provincia];

  // Recalcula deterministicamente garantindo integridade dos dados
  const calculo =
    budget.calculo ||
    CalculationEngine.calculate({
      provincia: budget.provincia,
      itens: budget.itens,
    });

  const handleStatusChange = (newStatus: BudgetStatus) => {
    try {
      const updated = BudgetRepository.updateStatus(
        budget.id,
        newStatus,
        currentUser.id,
        currentUser.role
      );
      setCurrentStatus(newStatus);
      onUpdate(updated);
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Preparação de link direto para partilha no WhatsApp (#25D366)
  const getWhatsAppShareUrl = () => {
    const totalKz = CalculationEngine.formatKz(calculo.precoTotalFinalKz);
    const texto = `*Kizongelu - Orçamento & Mapa de Quantidades*%0A%0A` +
      `*Obra:* ${encodeURIComponent(budget.titulo)}%0A` +
      `*Cliente:* ${encodeURIComponent(budget.clienteNome)}%0A` +
      `*Local:* ${encodeURIComponent(provinciaData?.nome || budget.provincia)} (${encodeURIComponent(budget.localizacaoExata)})%0A` +
      `*Área:* ${budget.areaEstimadaM2} m²%0A` +
      `*Total Previsto:* ${encodeURIComponent(totalKz)}%0A` +
      `*Prazo Estimado:* ${calculo.diasEstimadosObra} dias úteis%0A%0A` +
      `_Calculado deterministicamente pela plataforma Kizongelu (Angola)._`;

    const telefoneLimpo = budget.clienteTelefone.replace(/\D/g, '');
    return `https://wa.me/${telefoneLimpo || '244923000000'}?text=${texto}`;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Barra de Ações Superior (Não impressa) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 print:hidden">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar à Lista</span>
        </button>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          {/* Seletor de Estado */}
          <select
            value={currentStatus}
            onChange={(e) => handleStatusChange(e.target.value as BudgetStatus)}
            className="h-12 min-h-[48px] sm:h-10 sm:min-h-[40px] text-xs py-2 px-3 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#0F3D5C]"
          >
            <option value="rascunho">Rascunho</option>
            <option value="calculado">Calculado</option>
            <option value="aprovado">Aprovado</option>
            <option value="em_execucao">Em Execução</option>
            <option value="concluido">Concluído</option>
          </select>

          {/* Botão de Partilha WhatsApp (#25D366) */}
          <a
            href={getWhatsAppShareUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="h-12 min-h-[48px] sm:h-10 sm:min-h-[40px] bg-[#25D366] hover:bg-[#1EBE5D] active:scale-95 text-white px-4 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center space-x-1.5 transition-all shadow-2xs"
            title="Enviar proposta e resumo pelo WhatsApp"
          >
            <Share2 className="w-4 h-4" />
            <span>Enviar WhatsApp</span>
          </a>

          {/* Botão Imprimir / PDF */}
          <button
            onClick={handlePrint}
            className="h-12 min-h-[48px] sm:h-10 sm:min-h-[40px] bg-[#0F3D5C] hover:bg-[#0A293E] active:scale-95 text-white px-4 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center space-x-1.5 transition-all shadow-2xs cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / PDF</span>
          </button>
        </div>
      </div>

      {/* Relatório / Mapa de Quantidades e Custos (Área Impressa) */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card-subtle p-6 sm:p-8 space-y-6 print:border-none print:shadow-none print:p-0">
        {/* Cabeçalho Oficial do Documento */}
        <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-[#0F3D5C] flex items-center justify-center text-amber-400 font-black text-sm">
                OC
              </div>
              <span className="font-extrabold text-xl text-[#0F3D5C]">Kizongelu</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#0F3D5C] text-amber-300 border border-amber-400/40 flex items-center gap-1">
                <Cpu className="w-3 h-3 text-amber-400" />
                Motor {CURRENT_ENGINE_VERSION}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Plataforma Especializada de Orçamentação e Medições de Obras em Angola
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs font-mono uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
              Ref: {budget.id.toUpperCase()}
            </span>
            <div className="text-xs text-slate-500 mt-1">
              Data de Emissão: {new Date(budget.dataAtualizacao).toLocaleDateString('pt-PT')}
            </div>
          </div>
        </div>

        {/* Informações da Obra e do Cliente */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div className="space-y-1.5">
            <h4 className="font-bold text-[#0F3D5C] uppercase tracking-wider text-[11px]">Dados da Obra</h4>
            <p className="text-slate-900 font-semibold text-sm">{budget.titulo}</p>
            <div className="flex items-center space-x-1 text-slate-600">
              <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>
                {provinciaData?.nome || budget.provincia} ({provinciaData?.capital}) &bull; {budget.localizacaoExata}
              </span>
            </div>
            <div className="flex items-center space-x-1 text-slate-600">
              <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Área: {budget.areaEstimadaM2} m² &bull; Tipologia: {budget.tipoConstrucao}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-bold text-[#0F3D5C] uppercase tracking-wider text-[11px]">Cliente / Promotor</h4>
            <p className="text-slate-900 font-semibold text-sm">{budget.clienteNome}</p>
            <div className="flex items-center space-x-1 text-slate-600">
              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{budget.clienteTelefone}</span>
            </div>
            <div className="text-slate-500">
              Responsável Técnico: <strong className="text-slate-700">{currentUser.nome}</strong>
            </div>
          </div>
        </div>

        {/* Tabela de Mapas de Quantidades por Capítulos */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#0F3D5C] flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-[#0F3D5C]" />
              Mapa Discriminado de Quantidades e Preços Unitários (Kz)
            </h3>
            <span className="text-xs text-slate-500">
              Coeficiente Logístico Regional: <strong>{provinciaData?.coeficienteLogistica.toFixed(2)}x</strong>
            </span>
          </div>

          {calculo.capitulos.map((capitulo, capIndex) => (
            <div
              key={capitulo.categoria}
              className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs"
            >
              {/* Título do Capítulo */}
              <div className="bg-[#0F3D5C]/5 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                <span className="font-bold text-xs text-[#0F3D5C] uppercase tracking-wider">
                  {capitulo.nomeCategoria}
                </span>
                <span className="text-xs font-bold text-slate-900">
                  Subtotal: {CalculationEngine.formatKz(capitulo.subtotalGeralKz)}
                </span>
              </div>

              {/* Tabela do Capítulo: Cards no Mobile, Tabela no Desktop/Impressão */}
              <div>
                {/* Mobile Cards (< md) */}
                <div className="md:hidden divide-y divide-slate-100 print:hidden">
                  {capitulo.itens.map((item) => (
                    <div key={item.artigoId} className="p-3.5 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center flex-wrap gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedItemForDrawer({
                                code: item.codigo,
                                description: item.descricao,
                                unit: item.unidade,
                                quantity: item.quantidade,
                                unitPrice: item.precoUnitarioKz,
                                total: item.subtotalKz,
                                chapter: capitulo.nomeCategoria,
                                formula: 'QtdBase × (1 + TaxaDesperdicio)',
                                readableFormula: `${item.quantidade} ${item.unidade} calibrado para ${budget.provincia}`,
                                inputsUsed: {},
                                sources: { price: `Armazém Regional (${budget.provincia})` },
                              })
                            }
                            className="w-6 h-6 rounded bg-amber-500/15 text-[#0F3D5C] font-black text-xs border border-amber-500/30 flex items-center justify-center cursor-pointer"
                            title="Abrir transparência da fórmula (ƒx)"
                          >
                            ƒx
                          </button>
                          <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                            {item.codigo}
                          </span>
                          <span className="font-semibold text-slate-900 text-xs">{item.descricao}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs pt-1 border-t border-slate-50">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Qtd</span>
                          <span className="font-bold text-slate-800">{item.quantidade} {item.unidade}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">P. Unitário</span>
                          <span className="font-medium text-slate-700">{CalculationEngine.formatKz(item.precoUnitarioKz)}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block">Subtotal</span>
                          <span className="font-extrabold text-[#0F3D5C]">{CalculationEngine.formatKz(item.subtotalKz)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop / Print Table (>= md ou print) */}
                <div className="hidden md:block print:block overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-2 font-semibold text-center w-10">ƒx</th>
                        <th className="py-2 px-3 font-semibold w-16">Artigo</th>
                        <th className="py-2 px-3 font-semibold">Descrição do Trabalho / Material</th>
                        <th className="py-2 px-3 font-semibold text-center w-16">Unid.</th>
                        <th className="py-2 px-3 font-semibold text-right w-20">Qtd.</th>
                        <th className="py-2 px-3 font-semibold text-right w-28">P. Unit. (Kz)</th>
                        <th className="py-2 px-3 font-semibold text-right w-32">Total (Kz)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {capitulo.itens.map((item) => (
                        <tr key={item.artigoId} className="hover:bg-slate-50/70">
                          <td className="py-2 px-2 text-center">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedItemForDrawer({
                                  code: item.codigo,
                                  description: item.descricao,
                                  unit: item.unidade,
                                  quantity: item.quantidade,
                                  unitPrice: item.precoUnitarioKz,
                                  total: item.subtotalKz,
                                  chapter: capitulo.nomeCategoria,
                                  formula: 'QtdBase × (1 + TaxaDesperdicio)',
                                  readableFormula: `${item.quantidade} ${item.unidade} calibrado para ${budget.provincia}`,
                                  inputsUsed: {},
                                  sources: { price: `Armazém Regional (${budget.provincia})` },
                                })
                              }
                              className="w-6 h-6 rounded-md bg-amber-500/15 hover:bg-[#0F3D5C] hover:text-amber-400 text-[#0F3D5C] font-black text-xs transition-colors cursor-pointer border border-amber-500/30 flex items-center justify-center mx-auto"
                              title="Abrir transparência da fórmula (ƒx)"
                            >
                              ƒx
                            </button>
                          </td>
                          <td className="py-2 px-3 font-mono text-[11px] text-slate-500">{item.codigo}</td>
                          <td className="py-2 px-3 font-medium text-slate-900">{item.descricao}</td>
                          <td className="py-2 px-3 text-center text-slate-500">{item.unidade}</td>
                          <td className="py-2 px-3 text-right font-semibold">{item.quantidade}</td>
                          <td className="py-2 px-3 text-right">
                            {CalculationEngine.formatKz(item.precoUnitarioKz)}
                          </td>
                          <td className="py-2 px-3 text-right font-bold text-slate-900">
                            {CalculationEngine.formatKz(item.subtotalKz)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Memória de Cálculo Final e Quadro Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <h4 className="font-bold text-[#0F3D5C] uppercase tracking-wider text-[11px]">
              Observações e Notas Técnicas
            </h4>
            <p className="text-slate-600 leading-relaxed">
              {budget.observacoes ||
                'Os preços apresentados incluem fornecimento de materiais em obra com frete até à província de implantação, mão de obra qualificada e equipamentos adequados.'}
            </p>
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
              <span>Prazo Estimado de Execução:</span>
              <strong className="text-slate-800">{calculo.diasEstimadosObra} dias úteis</strong>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Total de Horas-Homem Estimadas:</span>
              <strong className="text-slate-800">{calculo.totalHorasTrabalhoEstimadas} horas</strong>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2 text-xs">
            <h4 className="font-bold text-[#0F3D5C] uppercase tracking-wider text-[11px] mb-1">
              Quadro Resumo de Custos (Angola)
            </h4>

            <div className="flex justify-between text-slate-600">
              <span>Custo Direto de Materiais:</span>
              <span className="font-semibold text-slate-900">
                {CalculationEngine.formatKz(calculo.custoDiretoMateriaisKz)}
              </span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Custo Direto de Mão de Obra:</span>
              <span className="font-semibold text-slate-900">
                {CalculationEngine.formatKz(calculo.custoDiretoMaoDeObraKz)}
              </span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Equipamentos e Ferramentas:</span>
              <span className="font-semibold text-slate-900">
                {CalculationEngine.formatKz(calculo.custoDiretoEquipamentosKz)}
              </span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Encargos Sociais ({(calculo.taxaEncargosSociais * 100).toFixed(0)}%):</span>
              <span className="font-semibold text-slate-900">
                {CalculationEngine.formatKz(calculo.valorEncargosSociaisKz)}
              </span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>BDI - Benefícios e Despesas Indiretas ({(calculo.taxaBDI * 100).toFixed(0)}%):</span>
              <span className="font-semibold text-slate-900">
                {CalculationEngine.formatKz(calculo.valorBDIKz)}
              </span>
            </div>

            <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-200">
              <span>IVA Angola AGT ({(calculo.taxaIVA * 100).toFixed(0)}%):</span>
              <span className="font-semibold text-slate-900">
                {CalculationEngine.formatKz(calculo.valorIVAKz)}
              </span>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-300 text-sm">
              <span className="font-bold text-[#0F3D5C] uppercase tracking-wider">Total Geral da Obra:</span>
              <span className="font-black text-lg text-[#0F3D5C]">
                {CalculationEngine.formatKz(calculo.precoTotalFinalKz)}
              </span>
            </div>
          </div>
        </div>

        {/* Rodapé do Relatório */}
        <div className="pt-6 border-t border-slate-200 text-[11px] text-slate-400 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>Kizongelu &bull; Sistema de Orçamentação e Engenharia de Custos</span>
          <span>Valores expressos na moeda legal da República de Angola: Kwanza (Kz)</span>
        </div>
      </div>

      {/* Drawer de Transparência do Motor de Cálculo (Fase 17) */}
      <TransparencyDrawer
        isOpen={Boolean(selectedItemForDrawer)}
        onClose={() => setSelectedItemForDrawer(null)}
        item={selectedItemForDrawer}
        projectContext={{
          province: budget.provincia,
          areaM2: budget.areaEstimadaM2,
        }}
      />
    </div>
  );
};
