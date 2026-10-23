/**
 * @file src/components/legal/AcessibilidadePage.tsx
 * Declaração de Acessibilidade (/acessibilidade) — Fase 16.
 * Compromisso com a norma internacional WCAG 2.1 nível AA.
 */

import React from 'react';
import { LegalLayout, LegalSection } from './LegalLayout';
import { Eye, Keyboard, Contrast, Smartphone, Mail, CheckCircle2 } from 'lucide-react';

interface AcessibilidadePageProps {
  onNavigateHome?: () => void;
  onNavigate?: (path: string) => void;
}

export const AcessibilidadePage: React.FC<AcessibilidadePageProps> = ({ onNavigateHome, onNavigate }) => {
  const sections: LegalSection[] = [
    {
      id: 'seccao-1',
      title: 'Compromisso de Acessibilidade Digital',
      content: (
        <>
          <p>
            O Kizongelu tem o firme compromisso de assegurar que a sua plataforma digital seja plenamente acessível a todos os cidadãos, incluindo profissionais da construção civil e particulares com deficiência motora, visual, auditiva ou cognitiva.
          </p>
          <p>
            Trabalhamos ativamente para cumprir as diretrizes <strong>Web Content Accessibility Guidelines (WCAG) 2.1 nível AA</strong>, estabelecidas pelo World Wide Web Consortium (W3C).
          </p>
        </>
      ),
    },
    {
      id: 'seccao-2',
      title: 'Medidas Técnicas Implementadas',
      content: (
        <>
          <p>Para atingir o padrão WCAG 2.1 AA, o Kizongelu adota as seguintes práticas de engenharia de software:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2 text-xs">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <strong className="text-slate-900 block flex items-center gap-1.5">
                <Keyboard className="w-4 h-4 text-[#0F3D5C]" />
                Navegação Total por Teclado
              </strong>
              <span className="text-slate-600">
                Todos os formulários, botões, modais e calculadoras podem ser operados exclusivamente via tecla Tab, Espaço e Enter, com anéis visuais de foco nítidos.
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <strong className="text-slate-900 block flex items-center gap-1.5">
                <Contrast className="w-4 h-4 text-amber-600" />
                Rácio de Contraste Adequado
              </strong>
              <span className="text-slate-600">
                Os contrastes de texto e elementos de interface superam o rácio mínimo de 4.5:1 para texto normal e 3:1 para texto grande ou botões de destaque.
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <strong className="text-slate-900 block flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-emerald-600" />
                Compatibilidade com Leitores de Ecrã
              </strong>
              <span className="text-slate-600">
                Uso rigoroso de etiquetas semânticas HTML5 (main, nav, article, section) e atributos ARIA para leitura fidedigna de tabelas orçamentais e gráficos.
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <strong className="text-slate-900 block flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-blue-600" />
                Responsividade e Alvos de Toque
              </strong>
              <span className="text-slate-600">
                Áreas táteis móveis calibradas para pelo menos 44x44 píxeis, prevenindo toques errados em estaleiro ou no telemóvel.
              </span>
            </div>
          </div>
        </>
      ),
    },
    {
      id: 'seccao-3',
      title: 'Desempenho em Redes Móveis e Conexões Lentas em Angola',
      content: (
        <>
          <p>
            Considerando a realidade das redes de telecomunicações no território angolano (incluindo províncias do interior com ligações 3G ou 4G instáveis):
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
            <li>O código JavaScript e folhas de estilo são comprimidos e carregados de forma otimizada.</li>
            <li>A interface armazena dados em rascunho localmente no navegador, evitando a perda de preenchimento em caso de quebra temporária de rede.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'seccao-4',
      title: 'Canal de Reporte e Melhoria Contínua',
      content: (
        <>
          <p>
            Se encontrar qualquer barreira de acessibilidade ao navegar no Kizongelu, solicitamos que nos informe para que possamos efetuar a correção técnica com a maior celeridade:
          </p>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1">
            <strong className="text-slate-900 block">Gabinete de Acessibilidade & Experiência:</strong>
            <p className="text-slate-600">Email: acessibilidade@kizongelu.ao &bull; Talatona, Luanda, Angola</p>
            <p className="text-slate-500 text-[11px]">Comprometemo-nos a analisar e responder ao seu reporte no prazo de 48 horas.</p>
          </div>
        </>
      ),
    },
  ];

  return (
    <LegalLayout
      title="Declaração de Acessibilidade Digital"
      subtitle="Compromisso de inclusão digital e observância das normas internacionais WCAG 2.1 AA na República de Angola."
      version="2.0"
      lastUpdated="29 de Setembro de 2026"
      documentType="Declaração de Acessibilidade"
      canonicalUrl="https://kizongelu.ao/acessibilidade"
      sections={sections}
      onNavigateHome={onNavigateHome}
      onNavigate={onNavigate}
    />
  );
};

export default AcessibilidadePage;
