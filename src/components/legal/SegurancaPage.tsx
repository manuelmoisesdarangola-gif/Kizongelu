/**
 * @file src/components/legal/SegurancaPage.tsx
 * Medidas de Segurança da Informação e Infraestrutura (/seguranca) — Fase 16.
 * Padrões de cibersegurança, criptografia e proteção de orçamentos em Angola.
 */

import React from 'react';
import { LegalLayout, LegalSection } from './LegalLayout';
import { ShieldCheck, Lock, Server, Key, RefreshCw, QrCode, UserCheck, AlertCircle } from 'lucide-react';

interface SegurancaPageProps {
  onNavigateHome?: () => void;
  onNavigate?: (path: string) => void;
}

export const SegurancaPage: React.FC<SegurancaPageProps> = ({ onNavigateHome, onNavigate }) => {
  const sections: LegalSection[] = [
    {
      id: 'seccao-1',
      title: 'Visão Geral e Postura de Segurança (Zero Trust)',
      content: (
        <>
          <p>
            A segurança da informação e a proteção da propriedade intelectual dos orçamentos de construção dos nossos clientes constituem prioridades estratégicas da Kizongelu Tecnologia e Engenharia Lda.
          </p>
          <p>
            Adoptamos a arquitectura de segurança <strong>Zero Trust</strong> (Nunca Confiar, Sempre Verificar), assegurando que todo o tráfego, credencial e requisição sejam autenticados, autorizados e encriptados antes do processamento.
          </p>
        </>
      ),
    },
    {
      id: 'seccao-2',
      title: 'Criptografia em Trânsito (TLS 1.3) e em Repouso (AES-256)',
      content: (
        <>
          <p>Todos os dados confidenciais são protegidos por mecanismos criptográficos de padrão militar:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2 text-xs">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <strong className="text-slate-900 block flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-emerald-600" />
                Dados em Trânsito (TLS 1.3)
              </strong>
              <span className="text-slate-600">
                Toda a comunicação entre o navegador do utilizador e os servidores Kizongelu é protegida por certificados SSL/TLS com conjuntos de cifras modernos e força mínima de 256 bits.
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <strong className="text-slate-900 block flex items-center gap-1.5">
                <Server className="w-4 h-4 text-[#0F3D5C]" />
                Dados em Repouso (AES-256)
              </strong>
              <span className="text-slate-600">
                Bases de dados, faturas e mapas de quantidades armazenados nos servidores são cifrados com o algoritmo AES-256 com gestão segregada de chaves criptográficas.
              </span>
            </div>
          </div>
        </>
      ),
    },
    {
      id: 'seccao-3',
      title: 'Proteção de Credenciais e Autenticação de Dois Fatores',
      content: (
        <>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
            <li>
              <strong>Hashing Irreversível de Palavras-passe:</strong> As senhas dos utilizadores são protegidas com algoritmos de hashing <em>bcrypt</em> com sal (salt) exclusivo, tornando impossível a sua recuperação em texto simples.
            </li>
            <li>
              <strong>Tokens de Sessão Seguros:</strong> Sessões protegidas por cookies <code>HttpOnly</code>, <code>Secure</code> e atributos <code>SameSite=Lax</code> para neutralizar ataques de XSS e CSRF.
            </li>
            <li>
              <strong>Bloqueio Automático contra Ataques de Força Bruta:</strong> Mecanismos de limitação de taxa (rate limiting) que bloqueiam tentativas sucessivas de adivinhação de senhas.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'seccao-4',
      title: 'Cópia de Segurança (Backups) e Recuperação de Desastres',
      content: (
        <>
          <p>
            Para garantir a continuidade dos negócios dos empreiteiros e promotores em Angola:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
            <li>Realizamos cópias de segurança incrementais a cada hora e cópias integrais diárias automáticas.</li>
            <li>Os backups são armazenados com isolamento geográfico em regiões secundárias de alta disponibilidade com certificação ISO 27001 e SOC 2 Type II.</li>
            <li>Testes periódicos de restauração de desastres garantem um tempo de recuperação objetivo (RTO) inferior a 2 horas.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'seccao-5',
      title: 'Auditoria de Códigos QR e Integridade de Documentos',
      content: (
        <>
          <p>
            Cada orçamento emitido recebe um código identificador alfanumérico único gerado pelo sistema no momento da emissão.
          </p>
          <p>
            Ao apontar a câmara do telemóvel para o código QR, qualquer interessado acede ao validador público em <code>kizongelu.ao/verificar/[token]</code>, garantindo que o documento físico entregue a clientes ou parceiros corresponde com rigor aos quantitativos originais.
          </p>
        </>
      ),
    },
    {
      id: 'seccao-6',
      title: 'Divulgação Responsável de Vulnerabilidades',
      content: (
        <>
          <p>
            Encorajamos a comunidade técnica de segurança a reportar com responsabilidade eventuais falhas identificadas. Comprometemo-nos a não acionar procedimentos legais contra investigadores que atuem de boa-fé:
          </p>
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-800">
            <strong>Canal de Segurança:</strong> seguranca@kizongelu.ao &bull; Chave PGP disponível mediante solicitação
          </div>
        </>
      ),
    },
  ];

  return (
    <LegalLayout
      title="Segurança da Informação & Infraestrutura"
      subtitle="Medidas de cibersegurança, salvaguarda de dados e proteção antifraude documental em Angola."
      version="2.0"
      lastUpdated="29 de Setembro de 2026"
      documentType="Relatório de Segurança da Informação"
      canonicalUrl="https://kizongelu.ao/seguranca"
      sections={sections}
      onNavigateHome={onNavigateHome}
      onNavigate={onNavigate}
    />
  );
};

export default SegurancaPage;
