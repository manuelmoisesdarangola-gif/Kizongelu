/**
 * @file app/(app)/wizard/[projectId]/etapa-7/page.tsx
 * ETAPA 7 — Documentos e Plantas (Drag-and-Drop, Câmara Nativa e Miniaturas)
 */

import React, { useRef, useState } from 'react';
import { useWizardStore } from '../../../../../lib/stores/wizard-store';
import {
  UploadCloud,
  Camera,
  FileText,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Sparkles,
  AlertTriangle,
  Check,
  Info,
  X,
  ArrowRight,
} from 'lucide-react';
import { aiService } from '../../../../../lib/ai-service';
import { AiResult } from '../../../../../lib/ai-service/types';
import { AiBadge, AiSuggestedTag } from '../../../../../components/ui/ai-badge';

interface Step7DocumentosProps {
  onComplete?: () => void;
}

export const Step7Documentos: React.FC<Step7DocumentosProps> = ({ onComplete }) => {
  const { data, setStepData, completeWizard } = useWizardStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [isInterpreting, setIsInterpreting] = useState(false);
  const [documentAiResult, setDocumentAiResult] = useState<AiResult | null>(null);
  const [isConfirmedByCustomer, setIsConfirmedByCustomer] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const documents = data.step7.documents || [];

  const interpretUploadedFile = async (fileName: string) => {
    setIsInterpreting(true);
    setIsConfirmedByCustomer(false);
    setIsDismissed(false);

    // Simula leitura inteligente de 2 segundos conforme o BLOCO B
    setTimeout(() => {
      setIsInterpreting(false);
      setDocumentAiResult({
        text: 'Documento analisado com visão computacional. Foram identificados traçados de alvenaria e compartimentação residencial.',
        confidence: 'high',
        needsConfirmation: true,
        extractedData: {
          estimatedArea: 150,
          bedrooms: 3,
          bathrooms: 2,
          floors: 1,
        },
        suggestions: [
          'Área sugerida: 150m²',
          'Quartos: 3',
        ],
        reasoning: 'Reconhecimento visual de planta com 3 quartos (T3), 2 instalações sanitárias e implantação média de 150m².',
      });
    }, 2000);
  };

  const handleApplyAiSuggestions = () => {
    // Aplica as sugestões aos Passos 3 e 4
    setStepData('step3', {
      area: 150,
      bedrooms: 3,
      bathrooms: 2,
      floors: 1,
    });

    setIsConfirmedByCustomer(true);
  };

  const handleDismissAiSuggestions = () => {
    setIsDismissed(true);
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorMsg(null);

    const newDocs: any[] = [];
    let firstFileName = '';

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Limite de 20MB
      if (file.size > 20 * 1024 * 1024) {
        setErrorMsg(`O ficheiro "${file.name}" ultrapassa o limite de 20MB.`);
        continue;
      }

      if (!firstFileName) firstFileName = file.name;

      // Cria URL temporário para preview
      const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;

      newDocs.push({
        id: `doc_${Date.now()}_${i}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: previewUrl,
      });
    }

    if (newDocs.length > 0) {
      setStepData('step7', {
        documents: [...documents, ...newDocs],
        skipDocuments: false,
      });

      // Executa interpretDocument com IA
      if (firstFileName) {
        interpretUploadedFile(firstFileName);
      }
    }
  };

  const handleRemoveDoc = (id: string) => {
    setStepData('step7', {
      documents: documents.filter((d: any) => d.id !== id),
    });
  };

  const handleSkip = () => {
    setStepData('step7', {
      skipDocuments: true,
    });
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Plantas e Documentos do Projecto
        </h2>
        <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
          Opcional: Anexe a planta ou fotos para que a nossa IA possa sugerir medidas e áreas.{' '}
          <strong className="font-bold text-slate-900">
            A estimativa é sempre calculada com base nas suas respostas, não na imagem.
          </strong>
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Zona de Drop Drag-and-Drop & Câmara */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all bg-slate-50/50 ${
          isDragging
            ? 'border-amber-500 bg-amber-50/40 ring-4 ring-amber-400/20'
            : 'border-slate-300 hover:border-slate-400'
        }`}
      >
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3">
          <UploadCloud className="w-6 h-6" />
        </div>

        <h3 className="font-extrabold text-sm text-slate-900">
          Arraste as plantas ou documentos para aqui
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Ficheiros suportados: PDF, JPG, PNG (Máx. 20MB por ficheiro)
        </p>

        {/* Inputs escondidos */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />

        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center space-x-2"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Selecionar Ficheiros</span>
          </button>

          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center space-x-2 shadow-xs"
          >
            <Camera className="w-4 h-4" />
            <span>Tirar Foto (Câmara)</span>
          </button>
        </div>
      </div>

      {/* Caixa de Esclarecimento sobre IA e Cálculo Determinístico */}
      <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl flex items-start gap-3.5 text-sky-950">
        <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Info className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-bold text-sky-900">
            Como funciona a análise de documentos?
          </p>
          <p className="text-xs text-sky-800 leading-relaxed">
            A Inteligência Artificial lê a sua planta para sugerir a área e o número de quartos. Pode aceitar ou ignorar as sugestões. O motor de cálculo determinístico só fará as contas com os dados que você confirmar nos passos anteriores.
          </p>
        </div>
      </div>

      {/* Lista de Documentos Anexados com Miniaturas */}
      {documents.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            Ficheiros Anexados ({documents.length})
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {documents.map((doc: any) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/60"
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  {doc.url ? (
                    <img
                      src={doc.url}
                      alt={doc.name}
                      className="w-10 h-10 object-cover rounded-lg border border-slate-200 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 flex-shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                  )}
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-900 truncate">{doc.name}</p>
                    <p className="text-[10px] text-slate-500">
                      {(doc.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveDoc(doc.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer flex-shrink-0"
                  title="Remover ficheiro"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bloco de Interpretação por IA de Plantas e Imagens */}
      {(isInterpreting || (documentAiResult && !isDismissed)) && (
        <div className="bg-gradient-to-br from-indigo-50/80 to-sky-50/50 border border-indigo-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Sugestões Detectadas pela IA (Opcional)
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                    Apoio Visual
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Leitura automática preliminar para auxiliar o preenchimento
                </p>
              </div>
            </div>

            {!isInterpreting && !isConfirmedByCustomer && (
              <button
                type="button"
                onClick={handleDismissAiSuggestions}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer flex items-center gap-1"
                title="Ignorar sugestões da IA"
              >
                <X className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ignorar</span>
              </button>
            )}
          </div>

          {isInterpreting ? (
            <div className="py-6 flex flex-col items-center justify-center space-y-2">
              <div className="w-7 h-7 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-bold text-slate-700">A analisar planta e dimensões com Inteligência Artificial...</p>
              <p className="text-[11px] text-slate-400">Leitura preliminar em curso (~2 segundos)</p>
            </div>
          ) : documentAiResult ? (
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-xl border border-indigo-100 space-y-3.5 shadow-2xs">
                {/* Visualização clara dos dados extraídos sugeridos pelo mock */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100">
                    <span className="text-[10px] uppercase font-bold text-indigo-800 block">Área sugerida</span>
                    <span className="text-base font-black text-slate-900">150m²</span>
                  </div>
                  <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100">
                    <span className="text-[10px] uppercase font-bold text-indigo-800 block">Quartos</span>
                    <span className="text-base font-black text-slate-900">3 Quartos</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Casas de Banho</span>
                    <span className="text-base font-black text-slate-900">2 WC</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Pisos</span>
                    <span className="text-base font-black text-slate-900">1 Piso</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  A IA identificou uma planta compatível com <strong>150m²</strong> e <strong>3 quartos</strong>. Pode aplicar estas medidas diretamente aos Passos 3 e 4 ou simplesmente ignorar e manter os dados que já inseriu.
                </p>

                {/* Botões de Ação: Aplicar aos Passos 3 e 4 vs Ignorar */}
                <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-100">
                  <div className="text-[11px] text-slate-500">
                    {isConfirmedByCustomer
                      ? '✓ Sugestões aplicadas aos Passos 3 e 4 com sucesso.'
                      : 'O cálculo só será alterado se você decidir aplicar.'}
                  </div>

                  {!isConfirmedByCustomer ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleDismissAiSuggestions}
                        className="flex-1 sm:flex-none px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        Ignorar
                      </button>
                      <button
                        type="button"
                        onClick={handleApplyAiSuggestions}
                        className="flex-1 sm:flex-none px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Aplicar sugestões aos Passos 3 e 4</span>
                      </button>
                    </div>
                  ) : (
                    <span className="px-3.5 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg flex items-center gap-1.5 self-start sm:self-auto">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Sugestões Aplicadas aos Passos 3 e 4</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Opção de Concluir sem Documentos */}
      <div className="text-center pt-2">
        <button
          type="button"
          onClick={handleSkip}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors inline-flex items-center gap-1.5 cursor-pointer py-2 px-3 rounded-xl hover:bg-slate-100 active:scale-95"
        >
          <span>Não tenho documentos agora. Concluir cálculo apenas com os dados inseridos →</span>
        </button>
      </div>
    </div>
  );
};

export default Step7Documentos;
