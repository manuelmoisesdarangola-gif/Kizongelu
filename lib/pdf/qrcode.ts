/**
 * @file lib/pdf/qrcode.ts
 * Geração de QR Code server-side e client-side para verificação pública de orçamentos Kizongelu.
 * Emite DataURL em formato PNG para inclusão no PDF oficial (dimensão canónica 28x28mm).
 */

import QRCode from 'qrcode';

export const VERIFICATION_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://kizongelu.ao';

export interface QrGenerationResult {
  dataUrl: string;
  verificationUrl: string;
  shareToken: string;
}

/**
 * Gera um QR code em base64 PNG com correção de erro média e margem controlada.
 */
export async function generateQrDataUrl(text: string): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 200,
      color: {
        dark: '#0A293E', // Azul escuro corporativo Kizongelu
        light: '#FFFFFF',
      },
    });
    return dataUrl;
  } catch (error) {
    console.error('[QRCode] Erro ao gerar QR code:', error);
    throw error;
  }
}

/**
 * Gera o QR code e o URL canónico de verificação para um shareToken de orçamento.
 */
export async function generateVerificationQr(
  shareToken: string,
  baseUrl: string = VERIFICATION_BASE_URL
): Promise<QrGenerationResult> {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const verificationUrl = `${cleanBase}/verificar/${encodeURIComponent(shareToken)}`;
  const dataUrl = await generateQrDataUrl(verificationUrl);

  return {
    dataUrl,
    verificationUrl,
    shareToken,
  };
}
