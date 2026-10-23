/**
 * @file app/(app)/notificacoes/page.tsx
 * Centro de Notificações Técnicas e Alertas (/notificacoes).
 */

import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  CreditCard,
  FileText,
  Filter,
  Trash2,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/src/auth/auth-context';
import { useToast } from '@/src/context/ToastContext';
import { InAppChannel, InAppNotificationRecord } from '@/lib/notifications';

export const NotificacoesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { success } = useToast();
  const [filter, setFilter] = useState<'todos' | 'PAYMENT' | 'PROJECT' | 'ACCOUNT' | 'SHARE'>('todos');
  const [notifications, setNotifications] = useState<InAppNotificationRecord[]>([]);

  const loadNotifications = () => {
    const list = InAppChannel.getNotifications(currentUser.id);
    setNotifications(list);
  };

  useEffect(() => {
    loadNotifications();

    const handleUpdate = () => loadNotifications();
    window.addEventListener('kizongelu:notification:received', handleUpdate);
    window.addEventListener('kizongelu:notification:updated', handleUpdate);

    return () => {
      window.removeEventListener('kizongelu:notification:received', handleUpdate);
      window.removeEventListener('kizongelu:notification:updated', handleUpdate);
    };
  }, [currentUser.id]);

  const handleMarkAllAsRead = () => {
    InAppChannel.markAllAsRead(currentUser.id);
    loadNotifications();
    success('Notificações atualizadas', 'Todas as notificações foram marcadas como lidas.');
  };

  const handleMarkSingleAsRead = (id: string) => {
    InAppChannel.markAsRead(currentUser.id, id);
    loadNotifications();
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'todos') return true;
    return n.category === filter;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Centro de Notificações</h2>
          <p className="text-xs text-slate-500 mt-1">
            Acompanhe o estado de pagamentos, validações de comprovativos e atualizações de preços.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleMarkAllAsRead}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Marcar todas como lidas
          </button>
        </div>
      </div>

      {/* Filtros por Categoria */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setFilter('todos')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
            filter === 'todos'
              ? 'bg-[#0F3D5C] text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Todas ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('PAYMENT')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
            filter === 'PAYMENT'
              ? 'bg-[#0F3D5C] text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Pagamentos
        </button>
        <button
          onClick={() => setFilter('PROJECT')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
            filter === 'PROJECT'
              ? 'bg-[#0F3D5C] text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Projectos & Obras
        </button>
        <button
          onClick={() => setFilter('ACCOUNT')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
            filter === 'ACCOUNT'
              ? 'bg-[#0F3D5C] text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Segurança da Conta
        </button>
        <button
          onClick={() => setFilter('SHARE')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
            filter === 'SHARE'
              ? 'bg-[#0F3D5C] text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Partilhas & Auditoria
        </button>
      </div>

      {/* Lista de Notificações */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Bell className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-xs">Não existem notificações nesta categoria.</p>
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              onClick={() => handleMarkSingleAsRead(n.id)}
              className={`p-4 sm:p-5 flex items-start space-x-4 transition-colors cursor-pointer ${
                !n.read ? 'bg-blue-50/40 hover:bg-blue-50/70' : 'hover:bg-slate-50'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  n.category === 'PAYMENT'
                    ? 'bg-emerald-100 text-emerald-700'
                    : n.category === 'PROJECT'
                    ? 'bg-blue-100 text-blue-700'
                    : n.category === 'ACCOUNT'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-purple-100 text-purple-700'
                }`}
              >
                {n.category === 'PAYMENT' && <CreditCard className="w-5 h-5" />}
                {n.category === 'PROJECT' && <FileText className="w-5 h-5" />}
                {n.category === 'ACCOUNT' && <ShieldCheck className="w-5 h-5" />}
                {n.category === 'SHARE' && <ExternalLink className="w-5 h-5" />}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">{n.title}</h4>
                  <span className="text-[11px] text-slate-400">
                    {new Date(n.createdAt).toLocaleDateString('pt-PT', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{n.body}</p>
                {n.link && (
                  <div className="pt-1">
                    <span className="text-[11px] font-bold text-[#0F3D5C] hover:underline flex items-center gap-1">
                      <span>Ver detalhe</span>
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                )}
              </div>

              {!n.read && (
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] shrink-0 mt-2" title="Não lida" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
export default NotificacoesPage;
