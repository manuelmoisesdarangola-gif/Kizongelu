/**
 * @file src/components/legal/PrivacidadePage.tsx
 * Política de Privacidade e Proteção de Dados (/privacidade) — Fase 16.
 * Estrutura completa em 12 secções em estrita conformidade com a Lei n.º 22/11 de Angola.
 */

import React from 'react';
import { LegalLayout, LegalSection } from './LegalLayout';
import { ShieldCheck, Lock, UserCheck, Scale, FileText } from 'lucide-react';

interface PrivacidadePageProps {
  onNavigateHome?: () => void;
  onNavigate?: (path: string) => void;
}

export const PrivacidadePage: React.FC<PrivacidadePageProps> = ({ onNavigateHome, onNavigate }) => {
  const sections: LegalSection[] = [
    {
      id: 'seccao-1',
      title: 'Enquadramento Legal e Âmbito de Aplicação (Lei 22/11 de Angola)',
      content: (
        <>
          <p>
            A presente Política de Privacidade regula o tratamento de dados pessoais realizado pela Kizongelu Tecnologia e Engenharia Lda., em estrita conformidade com a <strong>Lei n.º 22/11, de 17 de Junho — Lei da Protecção de Dados Pessoais da República de Angola (LPDP)</strong>, bem como com as demais normas aplicáveis ao comércio eletrónico e telecomunicações.
          </p>
          <p>
            O Kizongelu assume o compromisso público de salvaguardar os direitos, liberdades e garantias fundamentais dos cidadãos angolanos no que respeita ao respeito pela sua vida privada e integridade dos seus dados no meio digital.
          </p>
        </>
      ),
    },
    {
      id: 'seccao-2',
      title: 'Entidade Responsável pelo Tratamento e Contacto do DPO',
      content: (
        <>
          <p>
            A entidade responsável pelo tratamento dos dados pessoais é a <strong>Kizongelu Tecnologia e Engenharia Lda.</strong>, com sede no Condomínio Belas Business Park, Talatona, Luanda.
          </p>
          <p>
            Para assegurar o cumprimento contínuo da Lei 22/11 e a interface com os titulares de dados, foi designado um Encarregado de Proteção de Dados (Data Protection Officer - DPO), que pode ser contactado diretamente pelo correio eletrónico:
          </p>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs">
            <strong>DPO Kizongelu:</strong> dpo@kizongelu.ao &bull; Talatona, Luanda, Angola
          </div>
        </>
      ),
    },
    {
      id: 'seccao-3',
      title: 'Princípios Orientadores do Tratamento de Dados',
      content: (
        <>
          <p>Nos termos do Artigo 4.º da Lei n.º 22/11, todo o tratamento de dados pessoais no Kizongelu observa rigorosamente os seguintes princípios:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
            <li><strong>Princípio da Licitude e Boa-Fé:</strong> O tratamento é transparente e sustentado em fundamento jurídico válido.</li>
            <li><strong>Princípio da Finalidade:</strong> Os dados são recolhidos exclusivamente para finalidades determinadas, explícitas e legítimas.</li>
            <li><strong>Princípio da Proporcionalidade:</strong> Recolhemos apenas os dados adequados, pertinentes e estritamente necessários à elaboração e validação de orçamentos de obras.</li>
            <li><strong>Princípio da Exatidão:</strong> Medidas ativas para assegurar que dados incorretos ou incompletos sejam retificados ou eliminados.</li>
            <li><strong>Princípio da Segurança:</strong> Proteção técnica contra destruição acidental, perda ou acesso não autorizado.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'seccao-4',
      title: 'Categorias de Dados Pessoais Recolhidos',
      content: (
        <>
          <p>Conforme a utilização da plataforma, recolhemos e processamos as seguintes categorias de dados:</p>
          <div className="space-y-2">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <strong className="text-slate-900 block">1. Dados de Identificação & Contacto:</strong>
              <span className="text-slate-600 text-xs">Nome completo, endereço de correio eletrónico, número de telefone (Angola +244), palavra-passe cifrada por bcrypt e Número de Identificação Fiscal (NIF).</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <strong className="text-slate-900 block">2. Dados de Obra e Projectos:</strong>
              <span className="text-slate-600 text-xs">Localização do imóvel (província e município), áreas de construção (m²), especificações de materiais e fotografias ou notas de estaleiro anexadas pelo utilizador.</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <strong className="text-slate-900 block">3. Dados de Faturação & Transação:</strong>
              <span className="text-slate-600 text-xs">Histórico de pagamentos, referências de operação Multicaixa Express, faturas emitidas e comprovativos bancários. Não armazenamos números de cartões bancários.</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <strong className="text-slate-900 block">4. Dados Técnicos e Telemetria de Segurança:</strong>
              <span className="text-slate-600 text-xs">Endereço IP anonimizado, registo temporal (timestamp) de início de sessão, identificador do navegador e registo de auditoria de consentimentos.</span>
            </div>
          </div>
        </>
      ),
    },
    {
      id: 'seccao-5',
      title: 'Finalidades do Tratamento e Bases de Legitimidade',
      content: (
        <>
          <p>O tratamento de dados pessoais no Kizongelu baseia-se nas seguintes causas de legitimidade jurídica:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
            <li><strong>Execução Contratual (Art. 7.º LPDP):</strong> Para gerar orçamentos, emitir mapas de quantidades, disponibilizar o painel e processar a aquisição de pacotes de orçamentos.</li>
            <li><strong>Cumprimento de Obrigação Jurídico-Fiscal:</strong> Para emissão e arquivo de faturas de acordo com as exigências da Administração Geral Tributária (AGT).</li>
            <li><strong>Consentimento Prévio do Titular:</strong> Para envio de notificações de mercado por WhatsApp, comunicações promocionais e cookies analíticos.</li>
            <li><strong>Interesse Legítimo e Segurança:</strong> Prevenção de burlas, verificação de comprovativos e garantia da autenticidade de documentos via QR Code.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'seccao-6',
      title: 'Consentimento e Gestão Granular de Permissões',
      content: (
        <>
          <p>
            O utilizador pode rever, alterar ou retirar os seus consentimentos a qualquer momento através do menu <code>/definicoes/privacidade/consentimentos</code>.
          </p>
          <p>
            A retirada de consentimento para comunicações não compromete a prestação dos serviços principais de orçamentação nem a licitude do tratamento efetuado com base no consentimento previamente concedido.
          </p>
        </>
      ),
    },
    {
      id: 'seccao-7',
      title: 'Partilha e Comunicação de Dados a Terceiros',
      content: (
        <>
          <p>O Kizongelu não comercializa nem cede bases de dados a terceiros para fins de telemarketing. A comunicação de dados restringe-se a:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
            <li><strong>Prestadores de Serviços Técnicos de Suporte:</strong> Infraestrutura em nuvem segura, gateways de envio transacional de email e SMS operando sob acordos estritos de confidencialidade.</li>
            <li><strong>Autoridades Tributárias e Judiciais de Angola:</strong> Quando exigido por mandado judicial ou cumprimento estrito da lei fiscal angolana.</li>
            <li><strong>Terceiros de Verificação Pública (QR Code):</strong> Quando um terceiro digitaliza o código QR impresso no orçamento, tem acesso exclusivo aos quantitativos oficiais do orçamento para conferência de autenticidade.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'seccao-8',
      title: 'Transferências Internacionais de Dados',
      content: (
        <>
          <p>
            Nos termos do Capítulo V da Lei n.º 22/11, a transferência de dados para fora do território angolano apenas é permitida mediante a observância de níveis adequados de proteção de dados ou autorização expressa da autoridade competente.
          </p>
          <p>
            Os servidores de apoio à infraestrutura digital utilizam centros de dados com certificações internacionais de segurança ISO 27001 e SOC 2, garantindo salvaguardas contratuais equivalentes às exigidas pela legislação de Angola.
          </p>
        </>
      ),
    },
    {
      id: 'seccao-9',
      title: 'Prazos de Conservação e Retenção de Dados',
      content: (
        <>
          <p>Os dados pessoais são conservados apenas durante o período necessário para as finalidades para as quais foram recolhidos:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
            <li><strong>Dados de Conta Ativa:</strong> Mantidos enquanto a conta de utilizador estiver em atividade.</li>
            <li><strong>Documentos Fiscais e Faturas:</strong> Conservados obrigatoriamente por <strong>5 a 10 anos</strong>, em cumprimento dos prazos legais do Código Geral Tributário de Angola.</li>
            <li><strong>Dados de Contas Eliminadas:</strong> Removidos permanentemente dos registos operacionais após o período de 30 a 90 dias de encerramento definitivo.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'seccao-10',
      title: 'Direitos dos Titulares dos Dados (Lei 22/11)',
      content: (
        <>
          <p>A Lei n.º 22/11 confere aos titulares de dados pessoais em Angola um conjunto de direitos inalienáveis:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <strong>Direito de Informação e Acesso (Art. 10.º):</strong> Saber que dados são tratados e solicitar cópia integral em <code>/definicoes/privacidade/exportar</code>.
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <strong>Direito de Retificação (Art. 11.º):</strong> Atualizar dados incorretos ou desatualizados diretamente no painel.
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <strong>Direito de Eliminação (Art. 12.º):</strong> Exigir o apagamento de dados pessoais em <code>/definicoes/privacidade/apagar</code>.
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <strong>Direito de Oposição (Art. 13.º):</strong> Opor-se a comunicações de marketing e decisões automatizadas.
            </div>
          </div>
        </>
      ),
    },
    {
      id: 'seccao-11',
      title: 'Medidas de Segurança Técnica e Organizacional',
      content: (
        <>
          <p>
            Para garantir a confidencialidade e integridade dos dados, o Kizongelu aplica medidas de última geração, incluindo encriptação TLS 1.3 em trânsito, cifragem AES-256 de base de dados em repouso, hashing irreversível de senhas com algoritmo bcrypt e políticas de isolamento de redes (Zero Trust).
          </p>
        </>
      ),
    },
    {
      id: 'seccao-12',
      title: 'Autoridade de Controlo e Direito de Reclamação (APD)',
      content: (
        <>
          <p>
            Sem prejuízo de qualquer outro recurso administrativo ou judicial, o titular dos dados tem o direito de apresentar reclamação junto da <strong>Agência de Protecção de Dados (APD)</strong> da República de Angola caso considere que o tratamento dos seus dados viola a Lei n.º 22/11.
          </p>
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
            <strong>Contacto da Autoridade Reguladora em Angola:</strong>
            <p className="text-slate-600">Agência de Protecção de Dados (APD) &bull; Luanda, Angola &bull; Website oficial: apd.ao</p>
          </div>
        </>
      ),
    },
  ];

  return (
    <LegalLayout
      title="Política de Privacidade & Proteção de Dados"
      subtitle="Tratamento lícito, transparente e seguro de dados pessoais em estrita conformidade com a Lei n.º 22/11 de Angola."
      version="2.4"
      lastUpdated="29 de Setembro de 2026"
      documentType="Política de Privacidade"
      canonicalUrl="https://kizongelu.ao/privacidade"
      sections={sections}
      onNavigateHome={onNavigateHome}
      onNavigate={onNavigate}
    />
  );
};
