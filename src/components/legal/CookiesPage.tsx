/**
 * @file src/components/legal/CookiesPage.tsx
 * Política de Cookies e Tabela Detalhada (/cookies) — Fase 16.
 */

import React, { useState } from 'react';
import { LegalLayout, LegalSection } from './LegalLayout';
import { CookiePreferencesModal } from './CookiePreferencesModal';
import { Sliders, CheckCircle2, Shield, Info } from 'lucide-react';
import { getUserConsents } from '@/lib/actions/consent';

interface CookiesPageProps {
  onNavigateHome?: () => void;
  onNavigate?: (path: string) => void;
}

export const CookiesPage: React.FC<CookiesPageProps> = ({ onNavigateHome, onNavigate }) => {
  const [modalOpen, setModalOpen] = useState(false);

  const cookieList = [
    {
      nome: 'kizongelu_auth_token',
      fornecedor: 'kizongelu.ao (Primeira Parte)',
      finalidade: 'Autenticação e manutenção da sessão segura do utilizador autenticado.',
      categoria: 'Estritamente Necessário',
      duracao: '30 dias',
    },
    {
      nome: 'kizongelu_csrf_token',
      fornecedor: 'kizongelu.ao (Primeira Parte)',
      finalidade: 'Proteção contra ataques de falsificação de solicitações entre sites (CSRF).',
      categoria: 'Estritamente Necessário',
      duracao: 'Sessão',
    },
    {
      nome: 'kizongelu_user_consents',
      fornecedor: 'kizongelu.ao (Primeira Parte)',
      finalidade: 'Registo do estado dos consentimentos de privacidade concedidos pelo titular.',
      categoria: 'Estritamente Necessário',
      duracao: '12 meses',
    },
    {
      nome: '_ga, _ga_KZGL2026AO',
      fornecedor: 'Google LLC (Google Analytics 4)',
      finalidade: 'Métricas agregadas anónimas de navegação e desempenho com IP anonimizado.',
      categoria: 'Analítico',
      duracao: '14 meses',
    },
    {
      nome: 'kizongelu_provincia_default',
      fornecedor: 'kizongelu.ao (Primeira Parte)',
      finalidade: 'Armazena a província de preferência do utilizador (ex: Luanda, Benguela, Huíla).',
      categoria: 'Funcional',
      duracao: '12 meses',
    },
    {
      nome: 'kizongelu_theme_mode',
      fornecedor: 'kizongelu.ao (Primeira Parte)',
      finalidade: 'Preferência visual de modo claro ou escuro.',
      categoria: 'Funcional',
      duracao: 'Permanente',
    },
    {
      nome: 'kizongelu_mkt_pref',
      fornecedor: 'kizongelu.ao (Primeira Parte)',
      finalidade: 'Registo de autorização para receção de resumos de preços de mercado por email/WhatsApp.',
      categoria: 'Marketing',
      duracao: '6 meses',
    },
  ];

  const sections: LegalSection[] = [
    {
      id: 'seccao-1',
      title: 'O que são Cookies e Tecnologias de Armazenamento Local',
      content: (
        <>
          <p>
            Os cookies são pequenos ficheiros de texto transferidos para o computador ou dispositivo móvel do utilizador quando visita sítios web. Permitem que a plataforma reconheça o dispositivo, mantenha a sessão ativa, memorize preferências regionais em Angola e meça o desempenho técnico das páginas.
          </p>
          <p>
            Para além de cookies de sessão, o Kizongelu utiliza mecanismos de <strong>Armazenamento Local (localStorage e sessionStorage)</strong> que operam com segurança no navegador do utilizador para guardar rascunhos de orçamentos e evitar perda de dados por falhas de conectividade móvel.
          </p>
        </>
      ),
    },
    {
      id: 'seccao-2',
      title: 'Categorias de Cookies Utilizadas',
      content: (
        <>
          <div className="space-y-3">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <strong className="text-slate-900 block text-xs">1. Cookies Estritamente Necessários:</strong>
              <p className="text-slate-600 text-xs mt-1">Imprescindíveis para o funcionamento do portal, segurança e pagamentos. Não podem ser desativados sem comprometer os serviços.</p>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <strong className="text-slate-900 block text-xs">2. Cookies Analíticos (Google Analytics 4):</strong>
              <p className="text-slate-600 text-xs mt-1">Apenas carregados após consentimento explícito no banner. Permitem compreender que províncias e calculadoras são mais utilizadas com IP anonimizado.</p>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <strong className="text-slate-900 block text-xs">3. Cookies de Preferências e Funcionais:</strong>
              <p className="text-slate-600 text-xs mt-1">Memorizam escolhas de municípios, coeficientes e personalização da interface.</p>
            </div>
          </div>
        </>
      ),
    },
    {
      id: 'seccao-3',
      title: 'Tabela Detalhada de Cookies da Plataforma',
      content: (
        <>
          <p className="text-xs text-slate-600 mb-3">
            Abaixo apresenta-se a lista exaustiva dos cookies e elementos de armazenamento ativo em <code>kizongelu.ao</code>:
          </p>
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0F3D5C] text-white font-bold">
                  <tr>
                    <th className="p-3">Nome do Cookie</th>
                    <th className="p-3">Fornecedor</th>
                    <th className="p-3">Finalidade Técnica</th>
                    <th className="p-3">Categoria</th>
                    <th className="p-3">Validade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {cookieList.map((c, i) => (
                    <tr key={i} className="hover:bg-slate-50/80">
                      <td className="p-3 font-mono font-bold text-slate-900 text-[11px]">{c.nome}</td>
                      <td className="p-3 text-slate-600">{c.fornecedor}</td>
                      <td className="p-3 text-slate-600">{c.finalidade}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.categoria === 'Estritamente Necessário'
                            ? 'bg-emerald-100 text-emerald-800'
                            : c.categoria === 'Analítico'
                            ? 'bg-sky-100 text-sky-800'
                            : c.categoria === 'Funcional'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {c.categoria}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500 text-[11px] font-medium">{c.duracao}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ),
    },
    {
      id: 'seccao-4',
      title: 'Gestão e Alteração de Preferências',
      content: (
        <>
          <p>
            O utilizador pode alterar as suas escolhas de cookies a qualquer momento, sem necessidade de limpar o histórico do navegador:
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="px-5 py-2.5 bg-[#0F3D5C] hover:bg-[#0A293E] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2"
            >
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>Abrir Centro de Preferências de Cookies</span>
            </button>
          </div>
        </>
      ),
    },
    {
      id: 'seccao-5',
      title: 'Como Desativar Cookies Diretamente no Navegador',
      content: (
        <>
          <p>
            Em alternativa, o utilizador pode configurar o seu navegador de Internet (Google Chrome, Apple Safari, Mozilla Firefox, Microsoft Edge ou Opera) para recusar ou apagar ficheiros de cookies através das opções de definições de privacidade e limpeza de dados de navegação.
          </p>
        </>
      ),
    },
  ];

  return (
    <>
      <LegalLayout
        title="Política de Cookies & Tecnologias de Rastreio"
        subtitle="Informação transparente sobre cookies, finalidades técnicas e tabela detalhada de armazenamento em Angola."
        version="2.4"
        lastUpdated="29 de Setembro de 2026"
        documentType="Política de Cookies"
        canonicalUrl="https://kizongelu.ao/cookies"
        sections={sections}
        onNavigateHome={onNavigateHome}
        onNavigate={onNavigate}
      />

      <CookiePreferencesModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={() => {}}
      />
    </>
  );
};
