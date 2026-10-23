/**
 * @file app/(app)/wizard/[projectId]/etapa-2/page.tsx
 * ETAPA 2 — Localização da Obra em Angola (Província e Município)
 */

import React, { useMemo } from 'react';
import { useWizardStore } from '../../../../../lib/stores/wizard-store';
import { PROVINCES_ANGOLA, getMunicipiosByProvince } from '../../../../../lib/data/municipios';
import { MapPin, Building2, Compass, AlertCircle, CheckCircle2 } from 'lucide-react';

export const Step2Localizacao: React.FC = () => {
  const { data, updateStepData, setStepData, validationErrors } = useWizardStore();
  const step2 = data.step2 || { province: '', municipality: '', address: '' };
  const { province = '', municipality = '', address = '' } = step2;

  // Municípios dependentes da província selecionada
  const availableMunicipios = useMemo(() => {
    return province ? getMunicipiosByProvince(province) : [];
  }, [province]);

  const handleProvinceChange = (newProvince: string) => {
    console.log('[Step2] onValueChange (Província selecionada):', newProvince);
    // Utiliza updateStepData da store Zustand e limpa o município ao mudar de província
    const updater = updateStepData || setStepData;
    updater('step2', {
      province: newProvince,
      municipality: '',
    });
    console.log('[Step2] data.step2 atualizado:', useWizardStore.getState().data.step2);
  };

  const handleMunicipalityChange = (newMunicipality: string) => {
    console.log('[Step2] onValueChange (Município selecionado):', newMunicipality);
    const updater = updateStepData || setStepData;
    updater('step2', {
      municipality: newMunicipality,
    });
    console.log('[Step2] data.step2 atualizado:', useWizardStore.getState().data.step2);
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updater = updateStepData || setStepData;
    updater('step2', { address: e.target.value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Onde será executada a obra?
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          A localização geográfica afecta diretamente o custo dos materiais, taxas de transporte e mão de obra local.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
        {/* Província */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Província <span className="text-amber-600">*</span>
          </label>
          <div className="relative">
            <select
              value={province || ''}
              onChange={(e) => handleProvinceChange(e.target.value)}
              className="w-full appearance-none bg-slate-50 border border-slate-300 rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer"
            >
              <option value="">Seleccione a província...</option>
              <optgroup label="Principais Províncias (Base de Preços Direta)">
                {PROVINCES_ANGOLA.filter((p) => p.isPriority).map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Outras Províncias">
                {PROVINCES_ANGOLA.filter((p) => !p.isPriority).map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </optgroup>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
              <Compass className="w-5 h-5" />
            </div>
          </div>
          {validationErrors['step2.province'] && (
            <p className="text-xs text-rose-600 mt-1 font-semibold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {validationErrors['step2.province']}
            </p>
          )}
        </div>

        {/* Município (Dependente) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Município <span className="text-amber-600">*</span>
          </label>
          <div className="relative">
            <select
              value={municipality || ''}
              disabled={!province}
              onChange={(e) => handleMunicipalityChange(e.target.value)}
              className="w-full appearance-none bg-slate-50 border border-slate-300 rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="">
                {province ? 'Seleccione o município...' : 'Seleccione primeiro a província'}
              </option>
              {availableMunicipios.map((muni) => (
                <option key={muni} value={muni}>
                  {muni}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          {validationErrors['step2.municipality'] && (
            <p className="text-xs text-rose-600 mt-1 font-semibold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {validationErrors['step2.municipality']}
            </p>
          )}
        </div>

        {/* Bairro / Referência Opcional */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Bairro ou Ponto de Referência (Opcional)
          </label>
          <div className="relative">
            <input
              type="text"
              value={address || ''}
              onChange={handleAddressChange}
              placeholder="Ex: Benfica, Morro Bento, Talatona..."
              className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Feedback visual de estado para o utilizador */}
        {province && municipality ? (
          <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Localização confirmada ({province}, {municipality}). O botão &quot;Continuar&quot; está activo para avançar.</span>
          </div>
        ) : province && !municipality ? (
          <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-800 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Província {province} seleccionada. Por favor escolha o município para activar o botão &quot;Continuar&quot;.</span>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Step2Localizacao;
