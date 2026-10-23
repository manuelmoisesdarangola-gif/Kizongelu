/**
 * @file src/components/legal/TermosPage.tsx
 * Termos e Condições Gerais de Utilização (/termos) — Fase 16.
 * Estrutura completa em 11 secções adaptadas ao ordenamento jurídico de Angola.
 */

import React from 'react';
import { LegalLayout, LegalSection } from './LegalLayout';
import { CheckCircle2, AlertTriangle, FileText, Scale } from 'lucide-react';

interface TermosPageProps {
  onNavigateHome?: () => void;
  onNavigate?: (path: string) => void;
}

export const TermosPage: React.FC<TermosPageProps> = ({ onNavigateHome, onNavigate }) => {
  const sections: LegalSection[] = [
    {
      id: 'seccao-1',
      title: 'Identificação da Entidade e Objeto dos Serviços',
      content: (
        <>
          <p>
            O Kizongelu é uma plataforma digital angolana de software como serviço (SaaS), desenvolvida para fornecer orçamentação determinística de obras, mapas analíticos de medições, listas de compras de materiais e cadernos de encargos com verificação pública por código QR.
          </p>
          <p>
            Os presentes Termos e Condições de Utilização regulam o acesso e a utilização dos serviços prestados pelo Kizongelu, com sede no Condomínio Belas Business Park, Talatona, Província de Luanda, República de Angola.
          </p>
          <p>
            Ao registar-se ou utilizar qualquer funcionalidade da plataforma, o Utilizador declara expressamente que leu, compreendeu e aceita integralmente as presentes disposições.
          </p>
        </>
      ),
    },
    {
      id: 'seccao-2',
      title: 'Elegibilidade e Registo de Conta',
      content: (
        <>
          <p>
            O registo na plataforma está disponível para pessoas singulares com capacidade civil plena (maiores de 18 anos) e pessoas coletivas devidamente constituídas e registadas no Registo Comercial da República de Angola.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
            <li>O utilizador obriga-se a fornecer informações verdadeiras, actualizadas e completas durante o registo.</li>
            <li>As credenciais de acesso (email e palavra-passe) são de caráter estritamente pessoal e intransmissível.</li>
            <li>Qualquer atividade realizada através da conta autenticada será imputada ao seu titular registado.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'seccao-3',
      title: 'Motor Determinístico de Engenharia e Preços Locais',
      content: (
        <>
          <p>
            O Kizongelu não utiliza inteligência artificial generativa com risco de alucinação para inventar quantidades de materiais. Todas as quantidades físicas de cimento, aço, blocos, inertes e mão-de-obra são calculadas através de algoritmos determinísticos baseados em boas práticas de engenharia civil e normas técnicas vigentes em Angola.
          </p>
          <p>
            As cotações de preços unitários em Kwanzas (Kz) refletem pesquisas periódicas de mercado nos entrepostos comerciais de Luanda (Viana, Kikolo, Palanca), Benguela, Huíla e restantes províncias. Devido às oscilações da taxa de câmbio e custos de frete rodoviário, os preços de mercado servem de referência rigorosa, cabendo ao utilizador confirmar a cotação no fornecedor final antes da emissão de ordens de compra.
          </p>
        </>
      ),
    },
    {
      id: 'seccao-4',
      title: 'Modalidades de Aquisição e Pacotes de Orçamentos',
      content: (
        <>
          <p>A plataforma disponibiliza opções flexíveis e pré-pagas de acesso aos cadernos de encargos e orçamentos detalhados:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <strong className="text-slate-900 block mb-1">1. Pagamento Avulso (Particular):</strong>
              <p className="text-slate-600 text-xs">Desbloqueio pontual de um orçamento específico em PDF profissional com mapa de medições, lista de compras e código QR vitalício.</p>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <strong className="text-slate-900 block mb-1">2. Pacotes de Orçamentos Pré-Pagos:</strong>
              <p className="text-slate-600 text-xs">Pacotes Particular, Profissional, Empresa e Empresa Plus com créditos de orçamentos pré-pagos sem data de expiração, personalização de logótipos e margens BDI.</p>
            </div>
          </div>
        </>
      ),
    },
    {
      id: 'seccao-5',
      title: 'Meios de Pagamento em Angola (Multicaixa Express & Transferência)',
      content: (
        <>
          <p>
            Em conformidade com a regulamentação do Banco Nacional de Angola (BNA), todos os pagamentos são faturados e liquidados exclusivamente em moeda nacional — Kwanzas (Kz).
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
            <li><strong>MULTICAIXA Express:</strong> Pagamento direto ou envio de comprovativo com número de operação e terminal.</li>
            <li><strong>Transferência Bancária (IBAN):</strong> Disponível para contas bancárias domiciliadas em instituições autorizadas pelo Banco Nacional de Angola (BNA).</li>
            <li>A validação de comprovativos manuais é processada pela nossa equipa de operações no prazo máximo de 15 minutos durante o horário útil.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'seccao-6',
      title: 'Emissão de Faturas e Enquadramento Fiscal AGT',
      content: (
        <>
          <p>
            Todas as transações aprovadas dão origem à emissão de fatura/recibo legal, com identificação do Número de Identificação Fiscal (NIF) do cliente, em estrita observância das normas da Administração Geral Tributária (AGT) e do Código do Imposto sobre o Valor Acrescentado (IVA).
          </p>
          <p>
            As faturas emitidas ficam arquivadas na área do utilizador em <code>/plano</code> e podem ser descarregadas em formato PDF certificado a qualquer momento.
          </p>
        </>
      ),
    },
    {
      id: 'seccao-7',
      title: 'Propriedade Intelectual e Licença de Utilização',
      content: (
        <>
          <p>
            A plataforma Kizongelu, incluindo o seu código-fonte, arquitectura de software, base de dados de coeficientes de construção, design, logótipo e marcas registadas, é propriedade exclusiva da Kizongelu Tecnologia e Engenharia Lda.
          </p>
          <p>
            É concedida ao utilizador uma licença de uso pessoal, revogável, não-exclusiva e intransmissível para calcular orçamentos e emitir relatórios de projectos próprios ou de clientes da sua atividade profissional. É estritamente proibida a engenharia reversa, raspagem automatizada (scraping) ou revenda do software.
          </p>
        </>
      ),
    },
    {
      id: 'seccao-8',
      title: 'Código QR e Autenticidade Documental',
      content: (
        <>
          <p>
            Os orçamentos emitidos e concluídos incluem um código QR e um identificador alfanumérico único. A leitura do código QR encaminha para a página pública de verificação (<code>kizongelu.ao/verificar/[token]</code>), onde qualquer terceiro (cliente, fiscal de obra ou parceiro de adjudicação) pode atestar se o documento impresso corresponde aos dados gerados no sistema.
          </p>
          <p>
            A adulteração fraudulenta de documentos emitidos pelo Kizongelu constitui crime punível nos termos da legislação angolana aplicável.
          </p>
        </>
      ),
    },
    {
      id: 'seccao-9',
      title: 'Isenções e Limitações de Responsabilidade Técnica',
      content: (
        <>
          <p>
            O Kizongelu fornece ferramentas de modelação e cálculo de custos de apoio à engenharia civil. O orçamento e o mapa de medições gerados pela plataforma <strong>não substituem nem dispensam:</strong>
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
            <li>O projecto de estabilidade, fundações e execução estrutural subscrito por engenheiro civil com inscrição válida na Ordem dos Engenheiros de Angola (OEA).</li>
            <li>A sondagem geotécnica do terreno para caracterização da tensão admissível do solo.</li>
            <li>A fiscalização presencial das armaduras e dos traços de betão no estaleiro da obra.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'seccao-10',
      title: 'Gestão de Saldo, Suspensão e Encerramento de Contas',
      content: (
        <>
          <p>
            Os créditos de orçamentos adquiridos não possuem data de caducidade e permanecem disponíveis na conta do utilizador até ao seu consumo efetivo. Não havendo cobranças periódicas automáticas, não é necessário efetuar procedimentos de cancelamento de renovação. O histórico de compras e faturas pode ser consultado a qualquer momento em <code>/plano</code>.
          </p>
          <p>
            O Kizongelu reserva-se o direito de suspender ou encerrar contas que violem as regras de utilização aceitável ou tentem contornar os mecanismos de segurança e limites de emissão da plataforma.
          </p>
        </>
      ),
    },
    {
      id: 'seccao-11',
      title: 'Legislação Aplicável e Resolução de Conflitos',
      content: (
        <>
          <p>
            Os presentes Termos de Utilização são regidos e interpretados em conformidade com as leis da República de Angola.
          </p>
          <p>
            Para a resolução de qualquer litígio emergente da interpretação, execução ou incumprimento do presente contrato, as partes elegem expressamente o foro da Comarca de Luanda, com expressa renúncia a qualquer outro.
          </p>
        </>
      ),
    },
  ];

  return (
    <LegalLayout
      title="Termos e Condições Gerais de Utilização"
      subtitle="Regras de utilização, prestação de serviços de engenharia de custos e enquadramento jurídico para a República de Angola."
      version="2.4"
      lastUpdated="29 de Setembro de 2026"
      documentType="Termos de Utilização"
      canonicalUrl="https://kizongelu.ao/termos"
      sections={sections}
      onNavigateHome={onNavigateHome}
      onNavigate={onNavigate}
    />
  );
};
