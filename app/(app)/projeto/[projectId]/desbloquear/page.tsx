/**
 * @file app/(app)/projeto/[projectId]/desbloquear/page.tsx
 * Rota oficial para desbloqueio manual e envio de comprovativo .
 */

import React from 'react';
import { PaymentUnlockPage } from '../../../../../src/components/payment/PaymentUnlockPage';

interface PageProps {
  params: {
    projectId: string;
  };
}

export default function DesbloquearPage({ params }: PageProps) {
  const projectId = params?.projectId || 'proj_sample_01';

  return (
    <PaymentUnlockPage
      projectId={projectId}
      onNavigateToStatus={() => {
        if (typeof window !== 'undefined') {
          window.location.href = `/projeto/${projectId}/desbloquear/estado`;
        }
      }}
      onBack={() => {
        if (typeof window !== 'undefined') {
          window.location.href = `/projeto/${projectId}/preview`;
        }
      }}
    />
  );
}
