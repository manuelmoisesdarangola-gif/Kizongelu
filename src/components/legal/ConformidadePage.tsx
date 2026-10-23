/**
 * @file src/components/legal/ConformidadePage.tsx
 * Enquadramento Legal e Conformidade Regulatória em Angola (/conformidade) — Fase 16.
 * Mapeamento das leis e regulamentos aplicáveis aos serviços do Kizongelu.
 */

import React from 'react';
import { LegalLayout, LegalSection } from './LegalLayout';
import { Scale, FileCheck, Building, Landmark, ShieldCheck, BookOpen } from 'lucide-react';

interface ConformidadePageProps {
  onNavigateHome?: () => void;
  onNavigate?: (path: string) => void;
}

export const ConformidadePage: React.FC<ConformidadePageProps> = ({ onNavigateHome, onNavigate }) => {
  const sections: LegalSection[] = [
    {
      id: 'seccao-1',
      title: 'Compromisso com o Estado de Direito Angolano',
      content: (
        <>
          <p>
            O Kizongelu foi concebido de raiz para operar em estrita conformidade com o ordenamento jurídico da República de Angola. Esta página consolida o mapeamento legal das normas que regem a prestação de serviços digitais, o tratamento de dados pessoais, a engenharia de custos, a fiscalidade e a contratação pública no país.
          </p>
        </>
      ),
    },
    {
      id: 'seccao-2',
      title: 'Lei n.º 22/11 — Protecção de Dados Pessoais (LPDP)',
      content: (
        <>
          <p>
            O tratamento de dados de utilizadores e empresas é conduzido sob a égide da <strong>Lei n.º 22/11, de 17 de Junho</strong>, observando os princípios de transparência, licitude, finalidade e segurança.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
            <li><strong>Agência de Protecção de Dados (APD):</strong> Autoridade de supervisão pública para quem canalizamos os mecanismos de conformidade de privacidade.</li>
            <li><strong>Direitos dos Titulares:</strong> Acesso, retificação, oposição e apagamento acessíveis diretamente nas definições da conta em <code>/definicoes/privacidade</code>.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'seccao-3',
      title: 'Lei n.º 41/20 — Lei dos Contratos Públicos (LCP)',
      content: (
        <>
          <p>
            Para obras públicas e concursos governamentais, os mapas de medições e cadernos de encargos gerados pela plataforma seguem a estrutura normativa exigida pela <strong>Lei n.º 41/20, de 23 de Dezembro (Lei dos Contratos Públicos)</strong>:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
            <li>Discriminação obrigatória de preços unitários em moeda nacional — Kwanzas (Kz).</li>
            <li>Fórmulas padronizadas de Benefício e Despesas Indiretas (BDI) ajustáveis por província.</li>
            <li>Listagem analítica de mão-de-obra, equipamentos e materiais para memória descritiva.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'seccao-4',
      title: 'Código Civil Angolano — Regime de Empreitadas e Responsabilidade',
      content: (
        <>
          <p>
            As relações contratuais de construção civil são norteadas pelos Artigos 1207.º e seguintes do <strong>Código Civil Angolano</strong>:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
            <li><strong>Responsabilidade Decenal (Art. 1225.º):</strong> A responsabilidade do construtor e engenheiro pela estabilidade e solidez do edifício durante o prazo legal de 10 anos.</li>
            <li>O Kizongelu reforça que o cálculo paramétrico disponibilizado pela ferramenta é um meio auxiliar de aferição de custos, mantendo-se intacta a responsabilidade do diretor técnico da obra.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'seccao-5',
      title: 'Enquadramento Fiscal — AGT e Código do IVA',
      content: (
        <>
          <p>
            A Kizongelu Tecnologia e Engenharia Lda. encontra-se registada na <strong>Administração Geral Tributária (AGT)</strong>, emitindo documentação fiscal idónea:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
            <li>Emissão de Fatura / Recibo com menção obrigatória do NIF do cliente.</li>
            <li>Aplicação da taxa de Imposto sobre o Valor Acrescentado (IVA) nos termos do Código do IVA angolano.</li>
            <li>Arquivo digital certificado das transações pelo período de conservação legal obrigatório (10 anos).</li>
          </ul>
        </>
      ),
    },
    {
      id: 'seccao-6',
      title: 'Regulamentação do Sistema de Pagamentos de Angola (BNA)',
      content: (
        <>
          <p>
            As transações financeiras são processadas através da <strong>EMIS (Empresa Interbancária de Serviços)</strong> com o serviço <strong>Multicaixa Express</strong> e transferências eletrónicas do Sistema de Pagamentos de Angola, obedecendo às diretrizes cambiais e financeiras do <strong>Banco Nacional de Angola (BNA)</strong>.
          </p>
        </>
      ),
    },
    {
      id: 'seccao-7',
      title: 'Regulamentação Profissional & Normas Técnicas',
      content: (
        <>
          <p>
            Os métodos de cálculo de consumo de agregados, traços de argamassa e betão respeitam as boas práticas da engenharia civil e as especificações de ensaios laboratoriais em Angola.
          </p>
        </>
      ),
    },
  ];

  return (
    <LegalLayout
      title="Conformidade Regulatória & Enquadramento Legal"
      subtitle="Quadro normativo angolano aplicável aos serviços digitais, cálculos de engenharia civil e transações do Kizongelu."
      version="2.0"
      lastUpdated="29 de Setembro de 2026"
      documentType="Relatório de Conformidade Regulatória"
      canonicalUrl="https://kizongelu.ao/conformidade"
      sections={sections}
      onNavigateHome={onNavigateHome}
      onNavigate={onNavigate}
    />
  );
};

export default ConformidadePage;
