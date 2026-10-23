/**
 * @file src/components/admin/AdminSettings.tsx
 * Configurações Globais do Sistema e Coordenadas Bancárias (Fase 10 - Tarefa 10).
 * 
 * - Dados bancários para pagamento manual (IBANs, titular, NIF, EMIS)
 * - Número WhatsApp de suporte (+244 923 000 111)
 * - Emails de contacto (suporte@kizongelu.ao, financeiro@kizongelu.ao)
 * - Toggle "Publicar preços publicamente"
 * - Coeficientes padrão do motor (BDI %, IVA %, Moeda Kz)
 * - Registo em AuditLog com before/after
 */

import React, { useState } from 'react';
import {
  AdminDataService,
  AdminSettingsConfig,
} from '../../lib/services/admin-data';
import { useAuth } from '../../auth/auth-context';
import { useToast } from '../../context/ToastContext';
import {
  Settings,
  Building2,
  Phone,
  Mail,
  CreditCard,
  Globe,
  Save,
  CheckCircle2,
  Percent,
  Coins,
  ShieldCheck,
} from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { currentUser } = useAuth();
  const { success, error: toastError } = useToast();

  const [settings, setSettings] = useState<AdminSettingsConfig>(() =>
    AdminDataService.getSettings()
  );

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    try {
      AdminDataService.saveSettings(settings, currentUser.nome, currentUser.email);
      success('Definições Guardadas', 'As coordenadas bancárias e parâmetros do sistema foram actualizados e registados no AuditLog.');
    } catch {
      toastError('Erro ao Guardar', 'Não foi possível persistir as configurações.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Topo com Título */}
      <div className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700/80 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-black text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-amber-400" />
              Definições Globais do Sistema
            </h1>
            <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/30">
              Produção Angola
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Contas bancárias para transferências, canais de apoio WhatsApp e visibilidade pública da base de preços.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center space-x-2 transition-all cursor-pointer shadow-md"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'A Gravar...' : 'Guardar Alterações'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bloco 1: Coordenadas Bancárias para Pagamento Manual */}
        <div className="bg-slate-800/90 rounded-2xl p-6 border border-slate-700/80 space-y-4 shadow-md">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-700 text-white font-bold text-sm">
            <CreditCard className="w-5 h-5 text-amber-400" />
            <span>Dados Bancários para Transferência Bancária Manual</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Banco Principal</label>
              <input
                type="text"
                value={settings.bancoPrincipal}
                onChange={(e) => setSettings({ ...settings, bancoPrincipal: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">IBAN Principal (AO06...)</label>
              <input
                type="text"
                value={settings.ibanPrincipal}
                onChange={(e) => setSettings({ ...settings, ibanPrincipal: e.target.value })}
                className="w-full p-2.5 font-mono rounded-xl border border-slate-700 bg-slate-900 text-amber-300 font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Titular da Conta</label>
              <input
                type="text"
                value={settings.titularConta}
                onChange={(e) => setSettings({ ...settings, titularConta: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">NIF da Empresa</label>
              <input
                type="text"
                value={settings.nifEmpresa}
                onChange={(e) => setSettings({ ...settings, nifEmpresa: e.target.value })}
                className="w-full p-2.5 font-mono rounded-xl border border-slate-700 bg-slate-900 text-white font-medium"
              />
            </div>

            <div className="pt-2 border-t border-slate-700/60">
              <label className="block text-slate-300 font-semibold mb-1">Banco Secundário (Opcional)</label>
              <input
                type="text"
                value={settings.bancoSecundario}
                onChange={(e) => setSettings({ ...settings, bancoSecundario: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">IBAN Secundário</label>
              <input
                type="text"
                value={settings.ibanSecundario}
                onChange={(e) => setSettings({ ...settings, ibanSecundario: e.target.value })}
                className="w-full p-2.5 font-mono rounded-xl border border-slate-700 bg-slate-900 text-slate-300 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Bloco 2: Contactos e Suporte ao Cliente */}
        <div className="space-y-6">
          <div className="bg-slate-800/90 rounded-2xl p-6 border border-slate-700/80 space-y-4 shadow-md">
            <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-700 text-white font-bold text-sm">
              <Phone className="w-5 h-5 text-emerald-400" />
              <span>Contactos e Suporte Oficial Angola</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Número WhatsApp de Suporte (+244...)
                </label>
                <input
                  type="text"
                  value={settings.whatsappSuporte}
                  onChange={(e) => setSettings({ ...settings, whatsappSuporte: e.target.value })}
                  className="w-full p-2.5 font-mono rounded-xl border border-slate-700 bg-slate-900 text-emerald-400 font-bold"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Exibido em todas as páginas públicas e no ecrã de desbloqueio por comprovativo.
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email de Apoio ao Cliente</label>
                <input
                  type="email"
                  value={settings.emailSuporte}
                  onChange={(e) => setSettings({ ...settings, emailSuporte: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email do Departamento Financeiro</label>
                <input
                  type="email"
                  value={settings.emailFinanceiro}
                  onChange={(e) => setSettings({ ...settings, emailFinanceiro: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white font-medium"
                />
              </div>
            </div>
          </div>

          {/* Bloco 3: Publicação e Parâmetros da Plataforma */}
          <div className="bg-slate-800/90 rounded-2xl p-6 border border-slate-700/80 space-y-4 shadow-md">
            <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-700 text-white font-bold text-sm">
              <Globe className="w-5 h-5 text-sky-400" />
              <span>Visibilidade e Parâmetros do Motor</span>
            </div>

            <div className="space-y-4 text-xs">
              {/* Toggle Publicar Preços Publicamente */}
              <div className="flex items-center justify-between p-3.5 bg-slate-900 rounded-xl border border-slate-700/80">
                <div>
                  <strong className="block text-white">Publicar preços publicamente</strong>
                  <span className="text-slate-400 text-[11px]">
                    Permite que visitantes vejam o catálogo de preços na rota /precos sem fazer login.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.publicarPrecosPublicamente}
                    onChange={(e) =>
                      setSettings({ ...settings, publicarPrecosPublicamente: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

              {/* BDI e IVA */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">BDI Padrão do Motor (%)</label>
                  <input
                    type="number"
                    value={settings.bdiPadrao}
                    onChange={(e) => setSettings({ ...settings, bdiPadrao: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Taxa de IVA Padrão (%)</label>
                  <input
                    type="number"
                    value={settings.taxaIvaPadrao}
                    onChange={(e) => setSettings({ ...settings, taxaIvaPadrao: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white font-mono font-bold"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
