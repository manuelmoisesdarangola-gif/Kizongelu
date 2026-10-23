import React from 'react';
import { FaqPage } from '@/src/components/public/FaqPage';

export default function PublicFaqPage() {
  return (
    <FaqPage
      onNavigate={(path: string) => {
        if (typeof window !== 'undefined') {
          window.location.href = path;
        }
      }}
      onStartWizard={() => {
        if (typeof window !== 'undefined') {
          window.location.href = '/?action=new-budget';
        }
      }}
    />
  );
}
