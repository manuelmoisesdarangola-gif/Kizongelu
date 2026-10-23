/**
 * @file src/components/payment/PaymentProofUpload.tsx
 * Componente de Upload de Comprovativo com Drag-and-Drop, validação (JPG, PNG, PDF até 10MB),
 * visualização de pré-visualização (preview) e campo de nota para o administrador.
 */

import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, X, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { submitPaymentProof, PaymentMethod } from '../../../lib/actions/payment';

interface PaymentProofUploadProps {
  projectId: string;
  paymentMethod: PaymentMethod;
  onSuccess: (paymentId: string) => void;
}

export const PaymentProofUpload: React.FC<PaymentProofUploadProps> = ({
  projectId,
  paymentMethod,
  onSuccess,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validação de formato (JPG, PNG, PDF)
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    const extension = file.name.split('.').pop()?.toLowerCase();
    const isValidExt = extension === 'jpg' || extension === 'jpeg' || extension === 'png' || extension === 'pdf';

    if (!validTypes.includes(file.type) && !isValidExt) {
      setErrorMessage('Formato inválido. Por favor seleccione um ficheiro JPG, PNG ou PDF.');
      return;
    }

    // Validação de tamanho (máximo 10 MB)
    const maxSizeBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setErrorMessage('O ficheiro é demasiado grande. O tamanho máximo permitido é 10 MB.');
      return;
    }

    setSelectedFile(file);

    // Gera preview para imagens
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage('Por favor seleccione ou arraste o seu comprovativo bancário.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // Simula upload do ficheiro ou converte em dataUrl para persistência no protótipo
      let fileUrl = filePreview;
      if (!fileUrl) {
        fileUrl = `https://storage.kizongelu.ao/comprovativos/${projectId}_${selectedFile.name}`;
      }

      const res = await submitPaymentProof({
        projectId,
        fileUrl,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: selectedFile.type || 'application/pdf',
        notes,
        method: paymentMethod,
      });

      if (!res.success || !res.payment) {
        setErrorMessage(res.error || 'Ocorreu um erro ao submeter o comprovativo.');
        setIsSubmitting(false);
        return;
      }

      setSuccessMessage('Comprovativo submetido com sucesso! A redirecionar para o estado...');
      setTimeout(() => {
        onSuccess(res.payment!.id);
      }, 900);
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha na comunicação ao enviar comprovativo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Área de Drag and Drop */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !selectedFile && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer ${
          dragActive
            ? 'border-amber-500 bg-amber-50/50'
            : selectedFile
            ? 'border-emerald-300 bg-emerald-50/20'
            : 'border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          onChange={handleChange}
          className="hidden"
        />

        {!selectedFile ? (
          <div className="flex flex-col items-center justify-center py-4 space-y-2">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Arraste o comprovativo aqui ou <span className="text-amber-600 underline">clique para escolher</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Formatos aceites: JPG, PNG ou PDF (tamanho máximo: 10 MB)
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
            <div className="flex items-center space-x-3 overflow-hidden">
              {filePreview ? (
                <img
                  src={filePreview}
                  alt="Pré-visualização do comprovativo"
                  className="w-12 h-12 object-cover rounded-md border border-slate-200"
                />
              ) : (
                <div className="w-12 h-12 rounded-md bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                  <FileText className="w-6 h-6" />
                </div>
              )}
              <div className="text-left truncate">
                <p className="text-xs font-semibold text-slate-800 truncate max-w-[200px] sm:max-w-xs">
                  {selectedFile.name}
                </p>
                <p className="text-[11px] text-slate-500">
                  {(selectedFile.size / 1024).toFixed(1)} KB • Pronto para submissão
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveFile();
              }}
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
              title="Remover ficheiro"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Campo Opcional: Nota para o Administrador */}
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">
          Nota para o administrador <span className="text-slate-400 font-normal">(opcional)</span>
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ex: Transferência feita a partir da conta bancária em nome de João Manuel. Ref: KZ-..."
          rows={2}
          className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-slate-800 placeholder-slate-400 bg-white"
        />
      </div>

      {/* Alertas de Erro e Sucesso */}
      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start space-x-2 text-rose-700 text-xs animate-shake">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center space-x-2 text-emerald-700 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Botão Submeter comprovativo (laranja) — 56px em mobile */}
      <button
        type="submit"
        disabled={isSubmitting || !selectedFile}
        className={`w-full h-14 min-h-[56px] py-3 px-4 rounded-xl font-bold text-sm text-slate-900 transition-all flex items-center justify-center space-x-2 shadow-md ${
          isSubmitting || !selectedFile
            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
            : 'bg-amber-500 hover:bg-amber-400 active:scale-[0.98] cursor-pointer'
        }`}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin text-slate-900" />
            <span>A submeter comprovativo...</span>
          </>
        ) : (
          <>
            <UploadCloud className="w-5 h-5" />
            <span>Submeter comprovativo</span>
          </>
        )}
      </button>
    </form>
  );
};
