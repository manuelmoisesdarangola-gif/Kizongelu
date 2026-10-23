/**
 * @file app/(app)/projeto/[projectId]/desbloquear/estado/page.tsx
 * Rota oficial de visualização de estado em tempo real do comprovativo .
 */

import React from 'react';
import { PaymentStatusPage } from '../../../../../../src/components/payment/PaymentStatusPage';

interface PageProps {
  params: {
    projectId: string;
  };
}

export default function EstadoDesbloqueioPage({ params }: PageProps) {
  const projectId = params?.projectId || 'proj_sample_01';

  return (
    <PaymentStatusPage
      projectId={projectId}
      onBackToDashboard={() => {
        if (typeof window !== 'undefined') {
          window.location.href = `/projeto/${projectId}`;
        }
      }}
      onNavigateToUnlock={() => {
        if (typeof window !== 'undefined') {
          window.location.href = `/projeto/${projectId}/desbloquear`;
        }
      }}
      onDownloadPdf={() => {
        if (typeof window !== 'undefined') {
          alert('A descarregar PDF oficial de medições e orçamento completo com QR Code...');
        }
      }}
    />
  );
}
