/**
 * @file src/components/public/InstitutionalPages.tsx
 * Páginas Institucionais do Kizongelu (Fase 16):
 * - /carreiras (Oportunidades de emprego em engenharia e tecnologia em Angola)
 * - /parceiros (Armazéns, construtoras, ordens profissionais e bancos)
 * - /imprensa (Press kit, notas de imprensa e recursos mediáticos)
 * - /estado (Status público operacional em tempo real dos serviços)
 */

import React, { useState } from 'react';
import logoImage from '../../assets/images/kizongelu_logo_oficial.jpg';
import {
  Briefcase,
  Users,
  Building2,
  Newspaper,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Download,
  Mail,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';

interface SubPageProps {
  onStartWizard?: () => void;
  onNavigate?: (path: string) => void;
}

// ============================================================================
// 1. CARREIRAS (/carreiras)
// ============================================================================
export const CarreirasPage: React.FC<SubPageProps> = ({ onStartWizard, onNavigate }) => {
  const vagas = [
    {
      titulo: 'Engenheiro Civil Sénior & Orçamentista',
      departamento: 'Engenharia de Custos',
      local: 'Talatona, Luanda &bull; Híbrido',
      tipo: 'Tempo Inteiro',
      desc: 'Responsável pela calibração das tabelas de rendimento, análise de preços de mercado nas 21 províncias e validação de algoritmos de estruturas e fundações.',
      requisitos: [
        'Licenciatura em Engenharia Civil com inscrição válida na OEA (Ordem dos Engenheiros de Angola)',
        'Mínimo 5 anos de experiência comprovada em direção ou orçamentação de obras',
        'Domínio de mapas de medições, traços de betão e cadernos de encargos',
      ],
    },
    {
      titulo: 'Engenheiro de Software Fullstack (TypeScript / React)',
      departamento: 'Tecnologia & Produto',
      local: 'Luanda &bull; Remoto (Angola)',
      tipo: 'Tempo Inteiro',
      desc: 'Desenvolvimento do motor determinístico, geração de PDFs certificados com QR Code antifraude e integrações de pagamentos Multicaixa Express.',
      requisitos: [
        'Domínio sólido de React, TypeScript, Tailwind CSS e arquitectura de dados',
        'Experiência em plataformas SaaS com elevadas exigências de segurança e escalabilidade',
        'Paixão por resolver desafios reais do sector produtivo em Angola',
      ],
    },
    {
      titulo: 'Analista de Dados & Cotações de Mercado',
      departamento: 'Inteligência de Mercado',
      local: 'Benguela / Huambo &bull; Presencial',
      tipo: 'Tempo Inteiro',
      desc: 'Monitorização diária de preços de cimento, ferro, brita e materiais de acabamento em entrepostos comerciais e armazéns das províncias.',
      requisitos: [
        'Formação em Gestão, Economia, Engenharia ou áreas afins',
        'Excelente capacidade de comunicação e negociação com fornecedores',
        'Carta de condução e disponibilidade para deslocações periódicas',
      ],
    },
  ];

  return (
    <div className="py-12 sm:py-16 max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-[#F59E0B] uppercase tracking-wider">
          Junte-se à Nossa Equipa
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-[#0F3D5C] tracking-tight">
          Construa o Futuro da Engenharia em Angola
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          No Kizongelu, combinamos ciência da computação moderna com o rigor da engenharia civil para transformar a orçamentação e combater o desperdício na construção nacional.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-card-subtle space-y-2">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-[#F59E0B] flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Impacto Nacional</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            As nossas ferramentas já ajudaram milhares de proprietários e empreiteiros a poupar milhões de Kwanzas em obras por todo o país.
          </p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-card-subtle space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Cultura de Rigor</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Ambiente meritocrático focado na excelência técnica, autonomia de trabalho e contínua aprendizagem de boas práticas.
          </p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-card-subtle space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Remuneração Competitiva</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Pacotes salariais ajustados à inflação, seguro de saúde privado e apoio ao desenvolvimento e certificação profissional.
          </p>
        </div>
      </div>

      {/* Lista de Vagas */}
      <div className="space-y-6">
        <h2 className="text-2xl font-black text-[#0F3D5C]">Vagas Disponíveis em Luanda e Províncias</h2>
        <div className="space-y-4">
          {vagas.map((vaga, idx) => (
            <div
              key={idx}
              className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm hover:border-[#0F3D5C] transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{vaga.titulo}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                    <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      {vaga.departamento}
                    </span>
                    <span>&bull;</span>
                    <span dangerouslySetInnerHTML={{ __html: vaga.local }} />
                    <span>&bull;</span>
                    <span className="font-medium text-slate-700">{vaga.tipo}</span>
                  </div>
                </div>
                <a
                  href={`mailto:carreiras@kizongelu.ao?subject=Candidatura: ${encodeURIComponent(vaga.titulo)}`}
                  className="px-5 py-2.5 bg-[#0F3D5C] hover:bg-[#0A293E] active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-transform cursor-pointer inline-flex items-center space-x-2 self-start sm:self-center"
                >
                  <span>Candidatar-se</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{vaga.desc}</p>

              <div>
                <span className="text-[11px] font-bold text-slate-900 block mb-1.5 uppercase tracking-wider">
                  Requisitos Chave:
                </span>
                <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
                  {vaga.requisitos.map((req, rIdx) => (
                    <li key={rIdx}>{req}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Candidatura Espontânea */}
      <div className="bg-slate-900 text-white p-8 sm:p-12 rounded-3xl text-center space-y-4">
        <h3 className="text-xl sm:text-2xl font-black">Não encontrou a sua área específica?</h3>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
          Envie o seu Curriculum Vitae e carta de motivação para a nossa base de talentos. Contactamos sempre novos perfis técnicos quando surgem oportunidades.
        </p>
        <div className="pt-2">
          <a
            href="mailto:talentos@kizongelu.ao?subject=Candidatura Espontânea - Kizongelu"
            className="px-6 py-3 bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-black text-xs rounded-xl shadow-md transition-transform active:scale-95 inline-flex items-center space-x-2"
          >
            <Mail className="w-4 h-4" />
            <span>Enviar Candidatura Espontânea</span>
          </a>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 2. PARCEIROS (/parceiros)
// ============================================================================
export const ParceirosPage: React.FC<SubPageProps> = ({ onStartWizard, onNavigate }) => {
  const parceiros = [
    {
      tipo: 'Indústria Cimenteira & Materiais Base',
      entidades: [
        { nome: 'Indústria Cimenteira Nacional', desc: 'Acompanhamento de traços técnicos com cimento Portland CEM II 42.5R e especificações de mercado.' },
        { nome: 'Sector de Inertes & Britas', desc: 'Monitorização periódica de preços de brita basáltica e areia lavada de rio.' },
        { nome: 'Centros de Distribuição Regional', desc: 'Parâmetros logísticos para coeficientes de transporte em todas as províncias.' },
      ],
    },
    {
      tipo: 'Canais de Pagamento Autorizados',
      entidades: [
        { nome: 'MULTICAIXA Express & Rede EMIS', desc: 'Processamento de pagamentos em moeda nacional Kwanzas (Kz) com suporte a Multicaixa Express.' },
        { nome: 'Transferência Bancária Nacional', desc: 'Validação de comprovativos de transferência bancária em moeda nacional.' },
      ],
    },
    {
      tipo: 'Normas Técnicas & Metodologia',
      entidades: [
        { nome: 'Boas Práticas de Engenharia Civil', desc: 'Aplicação contínua de padrões determinísticos de cálculo e valorização dos profissionais do sector.' },
        { nome: 'Laboratórios & Ensaios Mecânicos', desc: 'Referência em parâmetros de ensaios de compressão e resistência de betões em Angola.' },
      ],
    },
  ];

  return (
    <div className="py-12 sm:py-16 max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-[#F59E0B] uppercase tracking-wider">
          Ecossistema Construtivo de Angola
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-[#0F3D5C] tracking-tight">
          Rede de Fornecedores & Mercado
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Trabalhamos com fontes e referências de mercado para garantir cotações fidedignas, mapas de medições transparentes e rigor técnico em Angola.
        </p>
      </div>

      <div className="space-y-8">
        {parceiros.map((grupo, gIdx) => (
          <div key={gIdx} className="space-y-4">
            <h2 className="text-lg font-bold text-[#0F3D5C] border-b border-slate-200 pb-2">
              {grupo.tipo}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {grupo.entidades.map((ent, eIdx) => (
                <div
                  key={eIdx}
                  className="bg-white p-6 rounded-3xl border border-slate-200 shadow-card-subtle space-y-2 hover:border-[#0F3D5C] transition-all"
                >
                  <h3 className="font-bold text-slate-900 text-sm">{ent.nome}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{ent.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Convite a Novos Fornecedores */}
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm text-center space-y-4 max-w-3xl mx-auto">
        <h3 className="text-xl font-bold text-[#0F3D5C]">É fornecedor ou armazém de materiais em Angola?</h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Integremos as suas cotações e stocks no mapa de compras do Kizongelu, permitindo que milhares de orçamentistas solicitem cotações diretamente ao seu entreposto.
        </p>
        <div className="pt-2">
          <a
            href="mailto:parcerias@kizongelu.ao?subject=Proposta de Parceria - Armazém de Construção"
            className="px-6 py-3 bg-[#0F3D5C] hover:bg-[#0A293E] text-white font-bold text-xs rounded-xl shadow-xs transition-colors inline-flex items-center space-x-2"
          >
            <Mail className="w-4 h-4" />
            <span>Falar com o Gabinete de Parcerias</span>
          </a>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 3. IMPRENSA (/imprensa)
// ============================================================================
export const ImprensaPage: React.FC<SubPageProps> = () => {
  const comunicados = [
    {
      data: '25 de Setembro de 2026',
      titulo: 'Kizongelu atinge marco de 15.000 orçamentos certificados emitidos em Angola',
      resumo: 'A plataforma pioneira de engenharia de custos reforça a sua liderança nacional e lança novas calculadoras calibradas para 8 províncias.',
    },
    {
      data: '12 de Agosto de 2026',
      titulo: 'Validação antifraude por QR Code é adotada por gabinetes de fiscalização de Luanda e Benguela',
      resumo: 'O mecanismo criptográfico de conferência digital de cadernos de encargos reduz em 80% as fraudes com mapas de quantidades adulterados.',
    },
    {
      data: '18 de Junho de 2026',
      titulo: 'Integração de pagamentos instantâneos Multicaixa Express melhora experiência de empreiteiros',
      resumo: 'Novos canais de desbloqueio automatizado permitem aos profissionais descarregar orçamentos profissionais em menos de 60 segundos.',
    },
  ];

  return (
    <div className="py-12 sm:py-16 max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-[#F59E0B] uppercase tracking-wider">
          Sala de Imprensa & Notícias
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-[#0F3D5C] tracking-tight">
          Imprensa & Recursos Mediáticos
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Informações corporativas, comunicados oficiais, press kit e contactos para jornalistas e analistas do setor económico e imobiliário em Angola.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Comunicados de Imprensa */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#0F3D5C]">Últimos Comunicados de Imprensa</h2>
          <div className="space-y-4">
            {comunicados.map((com, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-card-subtle space-y-2 hover:border-[#0F3D5C] transition-all"
              >
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  {com.data}
                </span>
                <h3 className="font-bold text-slate-900 text-sm leading-snug">{com.titulo}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{com.resumo}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Press Kit & Recursos Visuais */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#0F3D5C]">Press Kit & Material Institucional</h2>
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-card-subtle space-y-5">
            <p className="text-xs text-slate-600 leading-relaxed">
              Descarregue o dossier institucional completo com logótipos vetorizados em alta resolução, paleta de cores oficial, capturas de ecrã e biografia dos fundadores.
            </p>

            {/* Pré-visualização da Identidade de Marca / Logo Oficial */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
              <div className="w-24 h-24 rounded-2xl bg-white p-2 border border-slate-200/80 shadow-xs flex items-center justify-center overflow-hidden shrink-0">
                <img
                  src={logoImage}
                  alt="Kizongelu Logo Oficial"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="space-y-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <strong className="text-xs font-bold text-slate-900">Kizongelu &bull; Marca Oficial</strong>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    Vector Master
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Geometria arquitectónica, treliça estrutural e inteligência de engenharia com paleta em Azul Marinho (#0F3D5C) e Âmbar de Obra (#F59E0B).
                </p>
                <div className="pt-1 flex items-center justify-center sm:justify-start gap-2">
                  <a
                    href={logoImage}
                    download="kizongelu_logo_oficial.jpg"
                    className="text-[11px] font-bold text-[#0F3D5C] hover:text-[#0A293E] inline-flex items-center gap-1 underline"
                  >
                    <Download className="w-3 h-3" />
                    <span>Descarregar Imagem Original</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div>
                  <strong className="text-xs font-bold text-slate-900 block">Logótipos Kizongelu (PNG / SVG)</strong>
                  <span className="text-[11px] text-slate-500">Versões clara, escura e símbolo geométrico</span>
                </div>
                <button
                  type="button"
                  onClick={() => alert('Download do pacote de logótipos iniciado.')}
                  className="px-3 py-1.5 bg-[#0F3D5C] text-white text-xs font-bold rounded-lg hover:bg-[#0A293E] cursor-pointer inline-flex items-center space-x-1"
                >
                  <Download className="w-3 h-3" />
                  <span>Baixar</span>
                </button>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div>
                  <strong className="text-xs font-bold text-slate-900 block">Factsheet & Números do Setor</strong>
                  <span className="text-[11px] text-slate-500">Resumo de mercado e impacto em Angola (PDF)</span>
                </div>
                <button
                  type="button"
                  onClick={() => alert('Download do Factsheet iniciado.')}
                  className="px-3 py-1.5 bg-[#0F3D5C] text-white text-xs font-bold rounded-lg hover:bg-[#0A293E] cursor-pointer inline-flex items-center space-x-1"
                >
                  <Download className="w-3 h-3" />
                  <span>Baixar</span>
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <strong className="text-xs font-bold text-slate-900 block mb-1">Contacto de Assessoria de Imprensa:</strong>
              <p className="text-xs text-slate-600">Email: imprensa@kizongelu.ao &bull; Talatona, Luanda, Angola</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 4. ESTADO DO SISTEMA (/estado)
// ============================================================================
export const EstadoSistemaPage: React.FC<SubPageProps> = () => {
  const servicos = [
    { nome: 'Motor Determinístico de Engenharia & Cálculo', status: 'OPERATIONAL', latencia: '42 ms', uptime: '99.99%' },
    { nome: 'Base de Dados de Preços das 21 Províncias de Angola', status: 'OPERATIONAL', latencia: '35 ms', uptime: '100%' },
    { nome: 'Gerador de Documentos PDF Técnicos com QR de Verificação', status: 'OPERATIONAL', latencia: '120 ms', uptime: '99.95%' },
    { nome: 'Serviço Público de Validação por QR Code (/verificar)', status: 'OPERATIONAL', latencia: '28 ms', uptime: '100%' },
    { nome: 'Gateway de Pagamentos Multicaixa Express (EMIS)', status: 'OPERATIONAL', latencia: '210 ms', uptime: '99.92%' },
    { nome: 'Autenticação de Utilizadores e Sessões Seguras', status: 'OPERATIONAL', latencia: '30 ms', uptime: '100%' },
    { nome: 'Sistema Multicanal de Notificações (Email / Push)', status: 'OPERATIONAL', latencia: '85 ms', uptime: '99.98%' },
  ];

  return (
    <div className="py-12 sm:py-16 max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <span className="text-xs font-bold text-[#F59E0B] uppercase tracking-wider">
          Monitorização em Tempo Real
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-[#0F3D5C] tracking-tight">
          Estado dos Serviços Kizongelu
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Acompanhe em permanência a disponibilidade, tempo de resposta e integridade das nossas ferramentas de orçamentação e infraestrutura.
        </p>
      </div>

      {/* Banner de Estado Global */}
      <div className="p-6 bg-emerald-50 border-2 border-emerald-500/40 rounded-3xl flex items-center justify-between shadow-card-subtle">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-md">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-black text-emerald-950">
              Todos os Serviços Operacionais
            </h2>
            <p className="text-xs text-emerald-800">
              Sem incidentes registados nas últimas 24 horas &bull; Uptime global de 99.98%
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-block text-xs font-mono font-bold text-emerald-800 bg-white/80 px-3 py-1.5 rounded-xl border border-emerald-200">
          Atualizado agora
        </span>
      </div>

      {/* Tabela de Serviços */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-card-subtle overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Componentes de Infraestrutura</h3>
          <span className="text-xs text-slate-500 font-mono">Região: África Austral (AO-01)</span>
        </div>
        <div className="divide-y divide-slate-100">
          {servicos.map((serv, sIdx) => (
            <div key={sIdx} className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
              <div className="space-y-0.5">
                <strong className="text-xs font-bold text-slate-900 block">{serv.nome}</strong>
                <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-mono">
                  <span>Latência: {serv.latencia}</span>
                  <span>&bull;</span>
                  <span>Uptime 30d: {serv.uptime}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-emerald-700">Operacional</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Histórico de Manutenção */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-card-subtle space-y-3">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#0F3D5C]" />
          <span>Manutenções Programadas e Atualizações de Cotações</span>
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          As atualizações da base de dados de preços nas províncias ocorrem semanalmente às sextas-feiras pelas 23h00 (fuso de Luanda, GMT+1) sem interrupção de serviço.
        </p>
      </div>
    </div>
  );
};
