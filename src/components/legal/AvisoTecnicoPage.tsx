/**
 * @file src/components/legal/AvisoTecnicoPage.tsx
 * Aviso Técnico & Limitações de Responsabilidade (/aviso-tecnico) — Fase 16.
 * Enquadramento de engenharia de custos para a República de Angola.
 */

import React from 'react';
import { LegalLayout, LegalSection } from './LegalLayout';
import { AlertTriangle, HardHat, ShieldAlert, Award, FileSpreadsheet, Scale } from 'lucide-react';

interface AvisoTecnicoPageProps {
  onNavigateHome?: () => void;
  onNavigate?: (path: string) => void;
}

export const AvisoTecnicoPage: React.FC<AvisoTecnicoPageProps> = ({ onNavigateHome, onNavigate }) => {
  const sections: LegalSection[] = [
    {
      id: 'seccao-1',
      title: 'Natureza das Estimativas e Motor de Custos',
      content: (
        <>
          <p>
            O Kizongelu é uma plataforma digital especializada em engenharia de custos e orçamentação determinística paramétrica. Todos os mapas de quantidades, resumos de materiais (cimento, aço, inertes, blocos) e estimativas orçamentais fornecidos pela plataforma constituem <strong>peças técnicas de estudo prévio e previsão económica</strong>.
          </p>
          <p>
            Os algoritmos utilizam consumos específicos estandardizados (boas práticas de engenharia civil e métodos construtivos consolidados em Angola). No entanto, variações nas condições reais do estaleiro, especificidades do terreno e métodos executivos do empreiteiro podem introduzir desvios percentuais aceitáveis em relação às previsões teóricas.
          </p>
        </>
      ),
    },
    {
      id: 'seccao-2',
      title: 'Distinção entre Orçamento e Projecto de Execução',
      content: (
        <>
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start space-x-3 text-amber-950 text-xs">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Aviso Técnico Obrigatório:</strong> O orçamento, caderno de encargos e mapa de medições gerados pelo Kizongelu <strong>não substituem nem constituem</strong> um Projecto de Execução de Arquitectura, Estabilidade e Estruturas, Instalações Hidráulicas ou Instalações Eléctricas.
            </div>
          </div>
          <p className="mt-3">
            Nenhuma obra deve ser iniciada sem os devidos projectos de especialidade devidamente subscritos por técnicos habilitados e licenciados pelas administrações municipais competentes em Angola.
          </p>
        </>
      ),
    },
    {
      id: 'seccao-3',
      title: 'Responsabilidade Técnica perante a OEA e a OA',
      content: (
        <>
          <p>
            Nos termos da legislação em vigor na República de Angola e dos estatutos da <strong>Ordem dos Engenheiros de Angola (OEA)</strong> e da <strong>Ordem dos Arquitectos de Angola (OA)</strong>:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li>
              A direção técnica de obras e a responsabilidade civil pelo dimensionamento estrutural competem exclusivamente a engenheiros civis com cédula profissional válida emitida pela OEA.
            </li>
            <li>
              A coordenação do projecto arquitectónico e enquadramento urbanístico compete a arquitectos inscritos na Ordem dos Arquitectos de Angola.
            </li>
            <li>
              O Kizongelu funciona como ferramenta de apoio ao cálculo e gestão, declinando qualquer responsabilidade por falhas estruturais, patologias da construção ou acidentes decorrentes de execução inadequada.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'seccao-4',
      title: 'Sondagens Geotécnicas e Condições do Solo',
      content: (
        <>
          <p>
            As pré-dimensionações de sapatas, estacas e vigas de fundação apresentadas nas ferramentas estimativas do Kizongelu assumem solos de fundação com tensão admissível média padrão (tensão de referência &ge; 150 kPa a 200 kPa).
          </p>
          <p>
            Em zonas com solos expansivos, solos argilosos de baixa consistência, terrenos de aterro ou zonas de elevado nível freático (frequentes em áreas litorais de Luanda, Lobito e Namibe), é <strong>estritamente obrigatória</strong> a realização de ensaios de prospeção geotécnica e relatório de fundações elaborado por especialista.
          </p>
        </>
      ),
    },
    {
      id: 'seccao-5',
      title: 'Qualidade dos Materiais e Cimento em Angola',
      content: (
        <>
          <p>
            Os cálculos pressupõem a utilização de materiais que cumpram as especificações técnicas oficiais:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
            <li><strong>Cimento:</strong> Cimento Portland tipo CEM II 42.5R ou 32.5N de especificação normalizada para o mercado nacional.</li>
            <li><strong>Aço para Betão Armado:</strong> Varões nervurados A400 NR ou A500 NR isentos de corrosão lamelar severa.</li>
            <li><strong>Inertes (Areia e Brita):</strong> Areia de rio lavada isenta de matéria orgânica e brita basáltica ou calcária de granulometria controlada (Brita 1 e 2).</li>
            <li><strong>Água de Amassadura:</strong> Água potável isenta de cloretos ou sulfatos prejudiciais à pega do ligante.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'seccao-6',
      title: 'Flutuações de Cotações em Kwanzas (Kz) e Fretes',
      content: (
        <>
          <p>
            A base de dados de preços unitários do Kizongelu é actualizada periodicamente através de pesquisas em armazéns e fornecedores locais em Luanda, Benguela, Huíla e demais províncias.
          </p>
          <p>
            Contudo, o mercado de materiais de construção em Angola está sujeito a variações repentinas causadas por:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
            <li>Oscilações na taxa de câmbio Kwanza / Dólar / Euro.</li>
            <li>Custos logísticos e transporte rodoviário interestadual (frete por camião basculante).</li>
            <li>Rupturas sazonais de stock nos entrepostos alfandegários e fábricas de clínquer.</li>
          </ul>
          <p className="mt-2 text-xs text-slate-500">
            Recomenda-se vivamente que o orçamentista confirme a cotação final com o fornecedor local antes de formalizar contratos ou ordens de pagamento.
          </p>
        </>
      ),
    },
    {
      id: 'seccao-7',
      title: 'Margens de Segurança e Desperdício no Estaleiro',
      content: (
        <>
          <p>
            Os mapas de materiais do Kizongelu incluem coeficientes técnicos de perda e quebra (tipicamente entre 5% e 10% para blocos de cimento e 3% a 7% para varões de aço).
          </p>
          <p>
            Desperdícios reais superiores decorrentes de armazenamento inadequado, furto no estaleiro, quebras no descarregamento manual ou fabrico deficiente de betão são da inteira responsabilidade da equipa executora da obra.
          </p>
        </>
      ),
    },
    {
      id: 'seccao-8',
      title: 'Ensaios e Controlo de Qualidade em Laboratório',
      content: (
        <>
          <p>
            Para obras de média e grande escala, o Kizongelu recomenda a realização sistemática de ensaios de compressão de provetes cúbicos de betão aos 7 e 28 dias junto do <strong>Laboratório de Engenharia de Angola (LEA)</strong> ou laboratórios universitários e industriais credenciados.
          </p>
        </>
      ),
    },
  ];

  return (
    <LegalLayout
      title="Aviso Técnico & Isenção de Responsabilidade"
      subtitle="Definições regulamentares sobre a natureza das estimativas orçamentais e competências profissionais de engenharia civil em Angola."
      version="2.1"
      lastUpdated="29 de Setembro de 2026"
      documentType="Aviso Regulamentar de Engenharia"
      canonicalUrl="https://kizongelu.ao/aviso-tecnico"
      sections={sections}
      onNavigateHome={onNavigateHome}
      onNavigate={onNavigate}
    />
  );
};

export default AvisoTecnicoPage;
