/**
 * @file src/components/onboarding/FeedbackModal.tsx
 * Modal de Feedback após conclusão do primeiro orçamento (Fase 14):
 * - Pergunta: "Como foi a sua experiência com o Kizongelu?"
 * - Emoji buttons com pontuação de 1 a 5.
 * - Campo opcional de texto livre com melhorias sugeridas.
 * - Guarda o feedback e emite toast de agradecimento.
 */

import React, { useState } from 'react';
import { Sparkles, X, Send, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/src/context/ToastContext';

interface FeedbackModalProps {
  projectId?: string;
  projectName?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  projectId,
  projectName = 'Orçamento de Construção',
  isOpen,
  onClose,
}) => {
  const { success } = useToast();
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const emojis = [
    { score: 1, emoji: '😡', label: 'Muito Mau' },
    { score: 2, emoji: '😕', label: 'Razoável' },
    { score: 3, emoji: '😐', label: 'Satisfatório' },
    { score: 4, emoji: '😊', label: 'Muito Bom' },
    { score: 5, emoji: '🤩', label: 'Excelente' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) return;

    if (typeof window !== 'undefined') {
      const existingRaw = localStorage.getItem('kizongelu_user_feedbacks');
      const list = existingRaw ? JSON.parse(existingRaw) : [];
      list.push({
        id: `fb_${Date.now()}`,
        projectId,
        rating,
        comment,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem('kizongelu_user_feedbacks', JSON.stringify(list));
    }

    setIsSubmitted(true);
    success('Obrigado pelo seu contributo!', 'O seu feedback ajuda a calibrar os nossos algoritmos de obra.');
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-6 text-center">
        {/* Topo */}
        <div className="flex justify-between items-start">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center text-xl font-bold shadow-xs">
            <Sparkles className="w-6 h-6 text-amber-600" />
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="py-6 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <h3 className="text-lg font-black text-slate-900">
              Obrigado pela sua avaliação!
            </h3>
            <p className="text-xs text-slate-500">
              Estamos a construir a engenharia do futuro em Angola consigo.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                Como foi a sua experiência?
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Acabou de gerar o cálculo para "{projectName}". Diga-nos se os passos e quantidades corresponderam às suas expectativas.
              </p>
            </div>

            {/* Emoji Buttons */}
            <div className="flex justify-center items-center gap-2 sm:gap-3 py-2">
              {emojis.map((item) => (
                <button
                  type="button"
                  key={item.score}
                  onClick={() => setRating(item.score)}
                  className={`p-2.5 sm:p-3 rounded-2xl text-2xl transition-all cursor-pointer transform active:scale-90 flex flex-col items-center gap-1 ${
                    rating === item.score
                      ? 'bg-amber-100 scale-110 ring-2 ring-amber-500 shadow-md'
                      : 'bg-slate-50 hover:bg-slate-100'
                  }`}
                  title={item.label}
                >
                  <span>{item.emoji}</span>
                  <span className="text-[9px] font-bold text-slate-600 hidden sm:block">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Campo Opcional de Comentário */}
            <div className="text-left">
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Comentário ou sugestão (opcional):
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Ex.: Gostaria de ver mais opções de cobertura de fibrocimento..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F3D5C] resize-none h-20"
              />
            </div>

            <button
              type="submit"
              disabled={!rating}
              className={`w-full py-3 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                rating
                  ? 'bg-[#0F3D5C] hover:bg-[#0A2A3F] text-white shadow-md active:scale-95'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Enviar Avaliação</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
