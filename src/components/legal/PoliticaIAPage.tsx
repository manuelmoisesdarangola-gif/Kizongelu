/**
 * @file src/components/legal/PoliticaIAPage.tsx
 * Política de Inteligência Artificial e Transparência Algorítmica (/ia) — Fase 16.
 * Explicação do motor determinístico vs. IA generativa e supervisão humana em Angola.
 */

import React from 'react';
import { LegalLayout, LegalSection } from './LegalLayout';
import { Cpu, ShieldCheck, CheckCircle2, UserCheck, Lock, AlertTriangle, Sparkles } from 'lucide-react';

interface PoliticaIAPageProps {
  onNavigateHome?: () => void;
  onNavigate?: (path: string) => void;
}

export const PoliticaIAPage: React.FC<PoliticaIAPageProps> = ({ onNavigateHome, onNavigate }) => {
  const sections: LegalSection[] = [
    {
      id: 'seccao-1',
      title: 'Princípio Fundamental: Engenharia Determinística vs. Alucinação',
      content: (
        <>
          <p>
            Na construção civil, a segurança estrutural das vidas humanas e a viabilidade dos investimentos financeiros não podem estar sujeitas à probabilidade ou ao risco de &ldquo;alucinação&rdquo; característico de modelos de inteligência artificial generativa.
          </p>
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start space-x-3 text-emerald-950 text-xs">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Garantia de Cálculo Determinístico:</strong> Todas as quantidades físicas de materiais (número exacto de sacos de cimento de 50 kg, toneladas de varões de aço A400, metros cúbicos de areia e brita, e unidades de blocos de betão) são geradas por algoritmos matemáticos determinísticos e regras de engenharia civil com fórmulas normativas estabelecidas. Para as mesmas entradas geométricas, o sistema produz invariavelmente o mesmo resultado exacto.
            </div>
          </div>
        </>
      ),
    },
    {
      id: 'seccao-2',
      title: 'Onde e Como a Inteligência Artificial é Utilizada',
      content: (
        <>
          <p>A inteligência artificial no ecossistema Kizongelu cumpre funções estritamente auxiliares e orientadas ao utilizador:</p>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li>
              <strong>Assistência Contextual & Ajuda Rápida:</strong> Resolução de dúvidas frequentes sobre métodos construtivos e termos técnicos de engenharia em Angola.
            </li>
            <li>
              <strong>Classificação Inteligente de Obras:</strong> Sugestão de tipologias de acabamento e métodos construtivos adequados ao município e perfil do projecto com base nas tendências regionais.
            </li>
            <li>
              <strong>Deteção de Anomalias de Cotação:</strong> Alertas preventivos quando um preço inserido manualmente pelo utilizador se afasta mais de 30% da média histórica da província.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'seccao-3',
      title: 'Supervisão Humana Obrigatória (Human-in-the-Loop)',
      content: (
        <>
          <p>
            O Kizongelu segue o princípio ético da <strong>Supervisão Humana Significativa</strong>:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
            <li>Nenhum orçamento é finalizado ou certificado sem a revisão expressa e aprovação do utilizador humano.</li>
            <li>Todos os parâmetros de cálculo (margem de desperdício, BDI, traço de argamassa, custo de mão-de-obra) são integralmente editáveis pelo orçamentista antes da emissão do PDF final.</li>
            <li>A responsabilidade técnica pela aprovação dos orçamentos permanece sob o domínio e julgamento do profissional responsável.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'seccao-4',
      title: 'Privacidade de Dados e Não Treino de Modelos Públicos',
      content: (
        <>
          <p>
            Em cumprimento da <strong>Lei n.º 22/11 de Angola</strong>, o Kizongelu assegura que:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
            <li>
              Os dados proprietários dos seus projectos, cadernos de encargos, desenhos técnicos ou orçamentos <strong>NUNCA</strong> são vendidos, partilhados ou utilizados para treinar modelos públicos de linguagem ou inteligência artificial de grandes fornecedores globais.
            </li>
            <li>
              Os pedidos processados são descartados dos nós de inferência após a entrega da resposta ao utilizador, garantindo estrito sigilo comercial e profissional.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'seccao-5',
      title: 'Auditoria Algorítmica e Melhoria Contínua',
      content: (
        <>
          <p>
            O nosso conselho técnico de engenharia civil em Luanda realiza auditorias periódicas às fórmulas de rendimento e à calibração dos coeficientes paramétricos, garantindo que o software permaneça alinhado com as especificações dos materiais disponíveis no mercado angolano.
          </p>
        </>
      ),
    },
  ];

  return (
    <LegalLayout
      title="Política de Uso de Inteligência Artificial"
      subtitle="Transparência de algoritmos, rigor determinístico de engenharia e supervisão humana na orçamentação de obras em Angola."
      version="2.0"
      lastUpdated="29 de Setembro de 2026"
      documentType="Declaração de Transparência Algorítmica"
      canonicalUrl="https://kizongelu.ao/ia"
      sections={sections}
      onNavigateHome={onNavigateHome}
      onNavigate={onNavigate}
    />
  );
};

export default PoliticaIAPage;
