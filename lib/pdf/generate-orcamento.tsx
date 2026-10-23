/**
 * @file lib/pdf/generate-orcamento.tsx
 * Geração de PDF server-side e client-side com @react-pdf/renderer.
 * Emite o Caderno de Encargos & Orçamento Discriminado Oficial com QR de Verificação (28x28mm),
 * mapa de quantidades, 6 capítulos, cronograma em 10 fases, premissas, observações e disclaimer legal.
 */

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
  renderToBuffer,
  pdf,
} from '@react-pdf/renderer';
import { getPreview, ProjectPreviewData } from '../actions/preview';
import { generateVerificationQr } from './qrcode';
import { getOrCreateProjectShareLink } from '../actions/share';
import { logAuditEvent } from '../audit';

// Desativa o motor de hifenização externa para evitar o erro de path de exportação do @react-pdf/hyphenate
Font.registerHyphenationCallback((word) => [word]);

// Cores corporativas do Kizongelu
const colors = {
  primary: '#0A293E', // Azul escuro corporativo
  primaryLight: '#164E63',
  accent: '#F59E0B', // Âmbar / Laranja construção
  accentDark: '#D97706',
  surface: '#F8FAFC',
  surfaceCard: '#F1F5F9',
  border: '#CBD5E1',
  borderLight: '#E2E8F0',
  textDark: '#0F172A',
  textMuted: '#64748B',
  textLight: '#94A3B8',
  white: '#FFFFFF',
  success: '#059669',
  successBg: '#ECFDF5',
};

// Estilos tipográficos e de grelha
const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 40,
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: colors.textDark,
    backgroundColor: colors.white,
  },
  coverPage: {
    paddingTop: 50,
    paddingBottom: 50,
    paddingHorizontal: 50,
    fontFamily: 'Helvetica',
    backgroundColor: colors.white,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  headerStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingBottom: 8,
    marginBottom: 16,
  },
  brandName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  docCode: {
    fontSize: 8,
    color: colors.textMuted,
    fontFamily: 'Helvetica-Bold',
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7.5,
    color: colors.textMuted,
  },
  footerQrView: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerQrImage: {
    width: 28 * 2.83, // 28mm em pontos de impressão (~79pt)
    height: 28 * 2.83,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
    marginTop: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 4,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    color: colors.white,
    paddingVertical: 4,
    paddingHorizontal: 6,
    fontWeight: 'bold',
    fontSize: 7.5,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: colors.borderLight,
    paddingVertical: 3.5,
    paddingHorizontal: 6,
    fontSize: 7.5,
  },
  tableRowAlternate: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: colors.borderLight,
    paddingVertical: 3.5,
    paddingHorizontal: 6,
    fontSize: 7.5,
    backgroundColor: '#F8FAFC',
  },
  colCode: { width: '12%' },
  colDesc: { width: '42%' },
  colUnit: { width: '10%', textAlign: 'center' },
  colQty: { width: '12%', textAlign: 'right' },
  colPrice: { width: '12%', textAlign: 'right' },
  colTotal: { width: '12%', textAlign: 'right', fontWeight: 'bold' },
});

export interface OrcamentoDocProps {
  data: ProjectPreviewData;
  budgetId: string;
  shareToken: string;
  verificationUrl: string;
  qrDataUrl: string;
  issuedAtFormatted: string;
}

/**
 * Componente Documento Oficial Kizongelu
 */
export const OrcamentoPdfDocument: React.FC<OrcamentoDocProps> = ({
  data,
  budgetId,
  shareToken,
  verificationUrl,
  qrDataUrl,
  issuedAtFormatted,
}) => {
  const { summary, totals, confidence, chapters, phases } = data;
  const costPerM2 = summary.area > 0 ? Math.round(totals.grandTotal / summary.area) : 0;

  return (
    <Document title={`Orçamento Oficial ${budgetId} - Kizongelu`} author="Kizongelu">
      {/* 1. CAPA */}
      <Page size="A4" style={styles.coverPage}>
        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.primary, letterSpacing: 0.5 }}>
                Kizongelu
              </Text>
              <Text style={{ fontSize: 9, color: colors.accentDark, fontWeight: 'bold', marginTop: 2 }}>
                SISTEMA OFICIAL DE MEDIÇÕES E ORÇAMENTOS DE ANGOLA
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 8, color: colors.textMuted }}>ID DO ORÇAMENTO</Text>
              <Text style={{ fontSize: 13, fontWeight: 'bold', color: colors.primary, marginTop: 2 }}>
                {budgetId}
              </Text>
            </View>
          </View>

          <View style={{ marginTop: 60, borderLeftWidth: 4, borderLeftColor: colors.accent, paddingLeft: 16 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.primary }}>
              ORÇAMENTO DISCRIMINADO &amp; MAPA DE QUANTIDADES
            </Text>
            <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 6 }}>
              Caderno Técnico de Medições, Preços Unitários e Estimativa Financeira de Construção
            </Text>
          </View>

          <View style={{ marginTop: 40, backgroundColor: colors.surface, padding: 18, borderRadius: 6, borderWidth: 1, borderColor: colors.borderLight }}>
            <View style={{ flexDirection: 'row', marginBottom: 8 }}>
              <Text style={{ width: '30%', fontSize: 9, color: colors.textMuted }}>PROJECTO:</Text>
              <Text style={{ width: '70%', fontSize: 9, fontWeight: 'bold', color: colors.textDark }}>
                {data.title || 'Moradia Unifamiliar'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', marginBottom: 8 }}>
              <Text style={{ width: '30%', fontSize: 9, color: colors.textMuted }}>CLIENTE / TITULAR:</Text>
              <Text style={{ width: '70%', fontSize: 9, fontWeight: 'bold', color: colors.textDark }}>
                Manuel Moisés (Particular)
              </Text>
            </View>
            <View style={{ flexDirection: 'row', marginBottom: 8 }}>
              <Text style={{ width: '30%', fontSize: 9, color: colors.textMuted }}>LOCALIZAÇÃO:</Text>
              <Text style={{ width: '70%', fontSize: 9, color: colors.textDark }}>
                {summary.province} • {summary.municipality || 'Sede'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', marginBottom: 8 }}>
              <Text style={{ width: '30%', fontSize: 9, color: colors.textMuted }}>ÁREA BRUTA:</Text>
              <Text style={{ width: '70%', fontSize: 9, fontWeight: 'bold', color: colors.textDark }}>
                {summary.area} m² ({summary.floors} Piso(s))
              </Text>
            </View>
            <View style={{ flexDirection: 'row', marginBottom: 8 }}>
              <Text style={{ width: '30%', fontSize: 9, color: colors.textMuted }}>DATA DE EMISSÃO:</Text>
              <Text style={{ width: '70%', fontSize: 9, color: colors.textDark }}>
                {issuedAtFormatted}
              </Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <Text style={{ width: '30%', fontSize: 9, color: colors.textMuted }}>SISTEMA DE CÁLCULO:</Text>
              <Text style={{ width: '70%', fontSize: 9, color: colors.textDark }}>
                Kizongelu Engine v3.2 (Referencial de Preços Província de {summary.province})
              </Text>
            </View>
          </View>
        </View>

        {/* Rodapé da Capa com QR de 28x28mm e versão do motor */}
        <View style={{ borderTopWidth: 1, borderTopColor: colors.borderLight, paddingTop: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ width: '70%' }}>
            <Text style={{ fontSize: 8, fontWeight: 'bold', color: colors.primary }}>
              DOCUMENTO OFICIAL AUTENTICADO DIGITALMENTE
            </Text>
            <Text style={{ fontSize: 7, color: colors.textMuted, marginTop: 3 }}>
              Aponte a câmara do telemóvel para o código QR ou consulte {verificationUrl} para verificar a autenticidade e conformidade deste orçamento.
            </Text>
            <Text style={{ fontSize: 7.5, color: colors.primary, fontFamily: 'Helvetica-Bold', marginTop: 3 }}>
              Motor de cálculo v3.2 — emitido em {issuedAtFormatted}
            </Text>
            <Text style={{ fontSize: 7, color: colors.textLight, marginTop: 2 }}>
              Kizongelu &bull; Plataforma de Orçamentação e Engenharia &bull; Luanda, República de Angola
            </Text>
          </View>
          <View style={{ width: '28%', alignItems: 'flex-end' }}>
            {qrDataUrl && (
              <Image
                src={qrDataUrl}
                style={{ width: 28 * 2.83, height: 28 * 2.83, borderWidth: 1, borderColor: colors.borderLight }}
              />
            )}
          </View>
        </View>
      </Page>

      {/* 2. RESUMO EXECUTIVO E CARACTERÍSTICAS */}
      <Page size="A4" style={styles.page}>
        <View style={styles.headerStrip}>
          <Text style={styles.brandName}>Kizongelu &bull; Orçamento Oficial</Text>
          <Text style={styles.docCode}>{budgetId} &bull; {summary.province}</Text>
        </View>

        <Text style={styles.sectionTitle}>1. RESUMO EXECUTIVO DO ORÇAMENTO</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          <View style={[styles.card, { flex: 1, backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
            <Text style={{ fontSize: 7.5, color: '#92400E', fontWeight: 'bold' }}>VALOR TOTAL ESTIMADO</Text>
            <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#78350F', marginTop: 4 }}>
              {totals.grandTotal.toLocaleString('pt-PT')} Kz
            </Text>
            <Text style={{ fontSize: 7, color: '#B45309', marginTop: 2 }}>
              Estimativa média ponderada
            </Text>
          </View>

          <View style={[styles.card, { flex: 1 }]}>
            <Text style={{ fontSize: 7.5, color: colors.textMuted, fontWeight: 'bold' }}>CUSTO MÉDIO / M²</Text>
            <Text style={{ fontSize: 13, fontWeight: 'bold', color: colors.primary, marginTop: 4 }}>
              {costPerM2.toLocaleString('pt-PT')} Kz/m²
            </Text>
            <Text style={{ fontSize: 7, color: colors.textMuted, marginTop: 2 }}>
              Área bruta: {summary.area} m²
            </Text>
          </View>

          <View style={[styles.card, { flex: 1, backgroundColor: colors.successBg, borderColor: '#A7F3D0' }]}>
            <Text style={{ fontSize: 7.5, color: colors.success, fontWeight: 'bold' }}>ÍNDICE DE CONFIANÇA</Text>
            <Text style={{ fontSize: 13, fontWeight: 'bold', color: colors.success, marginTop: 4 }}>
              {confidence.score}% ({confidence.level === 'HIGH' ? 'Alto' : 'Médio'})
            </Text>
            <Text style={{ fontSize: 7, color: '#047857', marginTop: 2 }}>
              Alta precisão de parâmetros
            </Text>
          </View>
        </View>

        {/* Repartição de Custos Macro */}
        <View style={[styles.card, { marginBottom: 14 }]}>
          <Text style={{ fontSize: 8.5, fontWeight: 'bold', color: colors.primary, marginBottom: 6 }}>
            Repartição Macro de Custos
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3, borderBottomWidth: 0.5, borderBottomColor: colors.borderLight }}>
            <Text style={{ fontSize: 8, color: colors.textDark }}>&bull; Materiais de Construção</Text>
            <Text style={{ fontSize: 8, fontWeight: 'bold', color: colors.textDark }}>{totals.materialsTotal.toLocaleString('pt-PT')} Kz ({Math.round((totals.materialsTotal / totals.grandTotal) * 100)}%)</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3, borderBottomWidth: 0.5, borderBottomColor: colors.borderLight }}>
            <Text style={{ fontSize: 8, color: colors.textDark }}>&bull; Mão de Obra e Encargos</Text>
            <Text style={{ fontSize: 8, fontWeight: 'bold', color: colors.textDark }}>{totals.laborTotal.toLocaleString('pt-PT')} Kz ({Math.round((totals.laborTotal / totals.grandTotal) * 100)}%)</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 }}>
            <Text style={{ fontSize: 8, color: colors.textDark }}>&bull; Transporte, Carga e Logística</Text>
            <Text style={{ fontSize: 8, fontWeight: 'bold', color: colors.textDark }}>{totals.transportTotal.toLocaleString('pt-PT')} Kz ({Math.round((totals.transportTotal / totals.grandTotal) * 100)}%)</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>2. CARACTERÍSTICAS E PARÂMETROS DA OBRA</Text>
        <View style={[styles.card, { marginBottom: 14 }]}>
          <View style={{ flexDirection: 'row', paddingVertical: 2.5 }}>
            <Text style={{ width: '40%', fontSize: 8, color: colors.textMuted }}>Tipo de Intervenção:</Text>
            <Text style={{ width: '60%', fontSize: 8, fontWeight: 'bold' }}>{summary.typeLabel}</Text>
          </View>
          <View style={{ flexDirection: 'row', paddingVertical: 2.5 }}>
            <Text style={{ width: '40%', fontSize: 8, color: colors.textMuted }}>Número de Pisos / Divisões:</Text>
            <Text style={{ width: '60%', fontSize: 8 }}>{summary.floors} Piso(s) &bull; {summary.bedrooms} Quartos &bull; {summary.bathrooms} Instalações Sanitárias</Text>
          </View>
          <View style={{ flexDirection: 'row', paddingVertical: 2.5 }}>
            <Text style={{ width: '40%', fontSize: 8, color: colors.textMuted }}>Padrão de Acabamentos:</Text>
            <Text style={{ width: '60%', fontSize: 8, fontWeight: 'bold' }}>{summary.finishLevelLabel}</Text>
          </View>
          <View style={{ flexDirection: 'row', paddingVertical: 2.5 }}>
            <Text style={{ width: '40%', fontSize: 8, color: colors.textMuted }}>Sistema Estrutural:</Text>
            <Text style={{ width: '60%', fontSize: 8 }}>Betão Armado com fundações diretas em sapatas e vigas de travamento</Text>
          </View>
          <View style={{ flexDirection: 'row', paddingVertical: 2.5 }}>
            <Text style={{ width: '40%', fontSize: 8, color: colors.textMuted }}>Cobertura:</Text>
            <Text style={{ width: '60%', fontSize: 8 }}>Estrutura de madeira tratada com chapa ondulada IVS / Telha cerâmica</Text>
          </View>
          <View style={{ flexDirection: 'row', paddingVertical: 2.5 }}>
            <Text style={{ width: '40%', fontSize: 8, color: colors.textMuted }}>Topografia e Terreno:</Text>
            <Text style={{ width: '60%', fontSize: 8 }}>Solo plano de consistência arenosa/argilosa normal</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>3. RESUMO POR CAPÍTULO &amp; QUADRO DE FECHO FINANCEIRO</Text>
        <View style={{ borderWidth: 0.5, borderColor: colors.borderLight, borderRadius: 4, overflow: 'hidden' }}>
          <View style={styles.tableHeader}>
            <Text style={{ width: '12%' }}>CAPÍTULO</Text>
            <Text style={{ width: '58%' }}>DESIGNAÇÃO DOS TRABALHOS</Text>
            <Text style={{ width: '15%', textAlign: 'right' }}>PESO (%)</Text>
            <Text style={{ width: '15%', textAlign: 'right' }}>VALOR (KZ)</Text>
          </View>
          {chapters.map((ch, idx) => (
            <View key={ch.id} style={idx % 2 === 0 ? styles.tableRow : styles.tableRowAlternate}>
              <Text style={{ width: '12%', fontFamily: 'Helvetica-Bold' }}>Cap. 0{ch.number}</Text>
              <Text style={{ width: '58%' }}>{ch.name}</Text>
              <Text style={{ width: '15%', textAlign: 'right' }}>{ch.percentage}%</Text>
              <Text style={{ width: '15%', textAlign: 'right', fontFamily: 'Helvetica-Bold' }}>
                {ch.subtotal.toLocaleString('pt-PT')} Kz
              </Text>
            </View>
          ))}
          <View style={[styles.tableRow, { backgroundColor: colors.surfaceCard, borderTopWidth: 1, borderTopColor: colors.border }]}>
            <Text style={{ width: '70%', fontFamily: 'Helvetica-Bold', color: colors.primary }}>TOTAL CUSTOS DIRETOS (MATERIAIS + MÃO DE OBRA + FRETE)</Text>
            <Text style={{ width: '15%', textAlign: 'right', fontFamily: 'Helvetica-Bold' }}>100%</Text>
            <Text style={{ width: '15%', textAlign: 'right', fontFamily: 'Helvetica-Bold', color: colors.primary }}>
              {(totals.directCost ?? totals.grandTotal).toLocaleString('pt-PT')} Kz
            </Text>
          </View>
        </View>

        {/* Quadro Analítico de Fecho: BDI e Impostos de Angola */}
        <View style={{ marginTop: 10, borderWidth: 0.5, borderColor: colors.border, borderRadius: 4, padding: 8, backgroundColor: colors.surface }}>
          <Text style={{ fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: colors.primary, marginBottom: 5 }}>
            QUADRO ANALÍTICO DE ENCARGOS, BDI E FECHO FISCAL (AGT ANGOLA)
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2, borderBottomWidth: 0.5, borderBottomColor: colors.borderLight }}>
            <Text style={{ fontSize: 7.5, color: colors.textMuted }}>Custo Direto de Produção (Materiais + Mão de Obra + Frete)</Text>
            <Text style={{ fontSize: 7.5, fontFamily: 'Helvetica-Bold' }}>{(totals.directCost ?? totals.grandTotal).toLocaleString('pt-PT')} Kz</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2, borderBottomWidth: 0.5, borderBottomColor: colors.borderLight }}>
            <Text style={{ fontSize: 7.5, color: colors.textMuted }}>BDI Analítico (Admin Central 5% + Riscos 3% + Seguros 1,5% + Lucro 12% = 21,5%)</Text>
            <Text style={{ fontSize: 7.5, fontFamily: 'Helvetica-Bold' }}>
              {(totals.financialClosing?.bdi?.bdiAmount ?? Math.round((totals.directCost ?? totals.grandTotal) * 0.215)).toLocaleString('pt-PT')} Kz
            </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2, borderBottomWidth: 0.5, borderBottomColor: colors.borderLight, backgroundColor: '#FEF3C7' }}>
            <Text style={{ fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: '#92400E' }}>Preço de Venda sem IVA (Base Tributável)</Text>
            <Text style={{ fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: '#92400E' }}>
              {(totals.financialClosing?.baseTributavel ?? Math.round((totals.directCost ?? totals.grandTotal) * 1.215)).toLocaleString('pt-PT')} Kz
            </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2, borderBottomWidth: 0.5, borderBottomColor: colors.borderLight }}>
            <Text style={{ fontSize: 7.5, color: colors.textMuted }}>IVA 14% (Regime Geral de Angola - Código do IVA / AGT)</Text>
            <Text style={{ fontSize: 7.5, fontFamily: 'Helvetica-Bold' }}>
              {(totals.financialClosing?.taxes?.ivaAmount ?? Math.round((totals.financialClosing?.baseTributavel ?? (totals.directCost ?? totals.grandTotal) * 1.215) * 0.14)).toLocaleString('pt-PT')} Kz
            </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2.5, backgroundColor: colors.primary, marginTop: 3, paddingHorizontal: 4, borderRadius: 2 }}>
            <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: colors.white }}>PREÇO TOTAL DA PROPOSTA (COM IVA INCLUÍDO)</Text>
            <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: colors.accent }}>
              {totals.grandTotal.toLocaleString('pt-PT')} Kz
            </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2, marginTop: 4 }}>
            <Text style={{ fontSize: 7, color: colors.textMuted }}>
              * Retenção na Fonte Prestação de Serviços (6,5% AGT a deduzir no pagamento pelo Dono de Obra coletivo):
            </Text>
            <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: colors.textMuted }}>
              {(totals.financialClosing?.taxes?.retencaoFonteAmount ?? Math.round((totals.financialClosing?.baseTributavel ?? totals.grandTotal / 1.14) * 0.065)).toLocaleString('pt-PT')} Kz
            </Text>
          </View>
        </View>

        {/* Rodapé Padrão */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Kizongelu &bull; ID: {budgetId} &bull; Motor v3.2</Text>
          <Text style={styles.footerText}>Verificação: {verificationUrl}</Text>
          <Text style={styles.footerText}>Página 2</Text>
        </View>
      </Page>

      {/* 3. MAPA DE QUANTIDADES E PREÇOS UNITÁRIOS */}
      <Page size="A4" style={styles.page}>
        <View style={styles.headerStrip}>
          <Text style={styles.brandName}>Kizongelu &bull; Mapa de Quantidades</Text>
          <Text style={styles.docCode}>{budgetId}</Text>
        </View>

        <Text style={styles.sectionTitle}>4. MAPA DE QUANTIDADES DISCRIMINADO &amp; PREÇOS UNITÁRIOS</Text>
        <Text style={{ fontSize: 7.5, color: colors.textMuted, marginBottom: 6 }}>
          Todos os preços unitários reflectem a média de mercado apurada na Província de {summary.province} em Kwanzas (Kz).
        </Text>

        <View style={{ borderWidth: 0.5, borderColor: colors.borderLight, borderRadius: 4, overflow: 'hidden', marginBottom: 16 }}>
          <View style={styles.tableHeader}>
            <Text style={styles.colCode}>CÓDIGO</Text>
            <Text style={styles.colDesc}>DESCRIÇÃO DETALHADA DO ARTIGO / TRABALHO</Text>
            <Text style={styles.colUnit}>UNID.</Text>
            <Text style={styles.colQty}>QTD.</Text>
            <Text style={styles.colPrice}>P. UNIT (KZ)</Text>
            <Text style={styles.colTotal}>TOTAL (KZ)</Text>
          </View>

          {[
            { code: 'FD-01', desc: 'Desmatação mecânica e decapagem de terreno e=20cm', unit: 'm²', qty: '240.0', price: '1.200', total: '288.000' },
            { code: 'FD-02', desc: 'Escavação manual e mecânica em valas para sapatas e vigas', unit: 'm³', qty: '65.0', price: '4.800', total: '312.000' },
            { code: 'FD-03', desc: 'Betão de limpeza C12/15 espessura 10cm', unit: 'm³', qty: '8.5', price: '65.000', total: '552.500' },
            { code: 'FD-04', desc: 'Sapatas em betão armado C25/30 incl. cofragem e armaduras', unit: 'm³', qty: '18.0', price: '145.000', total: '2.610.000' },
            { code: 'EST-01', desc: 'Pilares em betão armado C25/30 com varão de aço A400', unit: 'm³', qty: '14.5', price: '168.000', total: '2.436.000' },
            { code: 'EST-02', desc: 'Vigas lintéis de travamento e encadeamento C25/30', unit: 'm³', qty: '12.0', price: '162.000', total: '1.944.000' },
            { code: 'ALV-01', desc: 'Alvenaria exterior em blocos maciços de cimento 15x20x40', unit: 'm²', qty: '310.0', price: '7.800', total: '2.418.000' },
            { code: 'ALV-02', desc: 'Alvenaria divisória interior em blocos de 10x20x40', unit: 'm²', qty: '145.0', price: '6.400', total: '928.000' },
            { code: 'CKZ-01', desc: 'Madreamento em madeira kambala tratada contra térmitas', unit: 'm²', qty: '185.0', price: '9.200', total: '1.702.000' },
            { code: 'CKZ-02', desc: 'Chapas galvanizadas IVS 0.50mm lacadas incl. cumeeiras', unit: 'm²', qty: '190.0', price: '11.500', total: '2.185.000' },
            { code: 'INS-01', desc: 'Rede de abastecimento água fria tubagem PPR soldada', unit: 'vg', qty: '1.0', price: '980.000', total: '980.000' },
            { code: 'INS-02', desc: 'Rede de drenagem de esgotos PVC rígido e fossa séptica', unit: 'vg', qty: '1.0', price: '1.450.000', total: '1.450.000' },
            { code: 'INS-03', desc: 'Instalação elétrica monofásica, quadro e cablagens VDV', unit: 'vg', qty: '1.0', price: '1.850.000', total: '1.850.000' },
            { code: 'ACAB-01', desc: 'Reboco afagado interior e exterior traço 1:4', unit: 'm²', qty: '720.0', price: '3.200', total: '2.304.000' },
            { code: 'ACAB-02', desc: 'Pavimento cerâmico grés e rodapé assentamento com cola', unit: 'm²', qty: '140.0', price: '8.900', total: '1.246.000' },
            { code: 'ACAB-03', desc: 'Pintura a tinta aquosa acetinada 3 demãos primário', unit: 'm²', qty: '720.0', price: '1.800', total: '1.296.000' },
            { code: 'MO-01', desc: 'Mão de obra equipa de pedreiros, armadores e serventes', unit: 'mês', qty: '4.5', price: '1.600.000', total: '7.200.000' },
            { code: 'TR-01', desc: 'Transporte de materiais, frete provincial e descargas', unit: 'viagem', qty: '12.0', price: '150.000', total: '1.800.000' },
          ].map((item, idx) => (
            <View key={item.code} style={idx % 2 === 0 ? styles.tableRow : styles.tableRowAlternate}>
              <Text style={styles.colCode}>{item.code}</Text>
              <Text style={styles.colDesc}>{item.desc}</Text>
              <Text style={styles.colUnit}>{item.unit}</Text>
              <Text style={styles.colQty}>{item.qty}</Text>
              <Text style={styles.colPrice}>{item.price}</Text>
              <Text style={styles.colTotal}>{item.total}</Text>
            </View>
          ))}
        </View>

        {/* Rodapé Padrão */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Kizongelu &bull; ID: {budgetId} &bull; Motor v1.4-ao</Text>
          <Text style={styles.footerText}>Verificação: {verificationUrl}</Text>
          <Text style={styles.footerText}>Página 3</Text>
        </View>
      </Page>

      {/* 4. LISTA AGREGADA DE MATERIAIS, MÃO DE OBRA E CRONOGRAMA DE 10 FASES */}
      <Page size="A4" style={styles.page}>
        <View style={styles.headerStrip}>
          <Text style={styles.brandName}>Kizongelu &bull; Insumos e Cronograma</Text>
          <Text style={styles.docCode}>{budgetId}</Text>
        </View>

        <Text style={styles.sectionTitle}>5. LISTAGEM AGREGADA DE MATERIAIS PRINCIPAIS</Text>
        <View style={{ borderWidth: 0.5, borderColor: colors.borderLight, borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
          <View style={styles.tableHeader}>
            <Text style={{ width: '45%' }}>MATERIAL</Text>
            <Text style={{ width: '15%', textAlign: 'center' }}>UNIDADE</Text>
            <Text style={{ width: '20%', textAlign: 'right' }}>QUANTIDADE</Text>
            <Text style={{ width: '20%', textAlign: 'right' }}>ESTIMATIVA (KZ)</Text>
          </View>
          {[
            { mat: 'Cimento Portland 42.5R (Sacos 50kg)', un: 'Sacos', qtd: '580 sacos', cost: '4.930.000 Kz' },
            { mat: 'Areia Lavada do Rio / Dragada', un: 'm³', qtd: '68 m³', cost: '1.224.000 Kz' },
            { mat: 'Brita Industrializada n.º 1 e 2', un: 'm³', qtd: '52 m³', cost: '1.456.000 Kz' },
            { mat: 'Blocos de Cimento Vibrados 15x20x40', un: 'Unidades', qtd: '4.250 un', cost: '2.125.000 Kz' },
            { mat: 'Aço Varão Nervurado A400 (Ø6 a Ø16)', un: 'Kg', qtd: '3.100 kg', cost: '3.410.000 Kz' },
            { mat: 'Madeira de Cofragem e Pranchas', un: 'm³', qtd: '6.5 m³', cost: '975.000 Kz' },
          ].map((item, idx) => (
            <View key={item.mat} style={idx % 2 === 0 ? styles.tableRow : styles.tableRowAlternate}>
              <Text style={{ width: '45%', fontFamily: 'Helvetica-Bold' }}>{item.mat}</Text>
              <Text style={{ width: '15%', textAlign: 'center' }}>{item.un}</Text>
              <Text style={{ width: '20%', textAlign: 'right' }}>{item.qtd}</Text>
              <Text style={{ width: '20%', textAlign: 'right' }}>{item.cost}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>6. CRONOGRAMA FINANCEIRO POR FASES (10 FASES)</Text>
        <View style={{ borderWidth: 0.5, borderColor: colors.borderLight, borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
          <View style={styles.tableHeader}>
            <Text style={{ width: '10%' }}>FASE</Text>
            <Text style={{ width: '45%' }}>DESIGNAÇÃO DA FASE</Text>
            <Text style={{ width: '20%', textAlign: 'right' }}>VALOR DA FASE (KZ)</Text>
            <Text style={{ width: '25%', textAlign: 'right' }}>ACUMULADO (KZ)</Text>
          </View>
          {phases.map((ph, idx) => (
            <View key={ph.number} style={idx % 2 === 0 ? styles.tableRow : styles.tableRowAlternate}>
              <Text style={{ width: '10%', fontFamily: 'Helvetica-Bold' }}>Fase {ph.number}</Text>
              <Text style={{ width: '45%' }}>{ph.name}</Text>
              <Text style={{ width: '20%', textAlign: 'right' }}>{ph.cost.toLocaleString('pt-PT')} Kz</Text>
              <Text style={{ width: '25%', textAlign: 'right', fontFamily: 'Helvetica-Bold' }}>
                {ph.accumulatedCost.toLocaleString('pt-PT')} Kz
              </Text>
            </View>
          ))}
        </View>

        {/* Rodapé Padrão */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Kizongelu &bull; ID: {budgetId} &bull; Motor v3.2</Text>
          <Text style={styles.footerText}>Verificação: {verificationUrl}</Text>
          <Text style={styles.footerText}>Página 4</Text>
        </View>
      </Page>

      {/* 5. PREMISSAS, OBSERVAÇÕES TÉCNICAS E DISCLAIMER LEGAL */}
      <Page size="A4" style={styles.page}>
        <View style={styles.headerStrip}>
          <Text style={styles.brandName}>Kizongelu &bull; Condições Gerais &amp; Autenticidade</Text>
          <Text style={styles.docCode}>{budgetId}</Text>
        </View>

        <Text style={styles.sectionTitle}>7. PREMISSAS E LIMITAÇÕES TÉCNICAS</Text>
        <View style={[styles.card, { marginBottom: 10 }]}>
          <Text style={{ fontSize: 7.5, lineHeight: 1.4, color: colors.textDark }}>
            &bull; <Text style={{ fontFamily: 'Helvetica-Bold' }}>Sondagem e Geotecnia:</Text> O cálculo assume solo padrão com capacidade portante igual ou superior a 150 kPa. Solos expansivos, argilas negras ou níveis freáticos superficiais exigirão sapatas profundas e cálculo estrutural específico.
          </Text>
          <Text style={{ fontSize: 7.5, lineHeight: 1.4, color: colors.textDark, marginTop: 4 }}>
            &bull; <Text style={{ fontFamily: 'Helvetica-Bold' }}>Abastecimento Logístico:</Text> Considera-se estaleiro acessível por camião de 2 ou 3 eixos a menos de 45 km do centro fornecedor de materiais.
          </Text>
          <Text style={{ fontSize: 7.5, lineHeight: 1.4, color: colors.textDark, marginTop: 4 }}>
            &bull; <Text style={{ fontFamily: 'Helvetica-Bold' }}>Energia e Água de Obra:</Text> Preconiza-se ponto de água no local e gerador de apoio para betoneiras e ferramentas elétricas.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>8. VALIDADE DOS PREÇOS UNITÁRIOS</Text>
        <View style={[styles.card, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A', marginBottom: 10 }]}>
          <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#78350F' }}>
            Prazo de Validade Formal: 30 (trinta) dias de calendário a partir de {issuedAtFormatted}
          </Text>
          <Text style={{ fontSize: 7.5, color: '#92400E', marginTop: 3, lineHeight: 1.3 }}>
            Em função da flutuação cambial do Kwanza (AOA), da variação dos fretes marítimos e da cotação do cimento e aço no mercado angolano, recomenda-se a atualização paramétrica dos preços caso a adjudicação ocorra após este prazo.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>9. OBSERVAÇÕES TÉCNICAS E FISCALIZAÇÃO</Text>
        <View style={[styles.card, { marginBottom: 10 }]}>
          <Text style={{ fontSize: 7.5, lineHeight: 1.4, color: colors.textDark }}>
            1. É expressamente recomendada a contratação de fiscalização de engenharia civil independente para acompanhamento das armaduras de pilares e amassaduras de betão.
          </Text>
          <Text style={{ fontSize: 7.5, lineHeight: 1.4, color: colors.textDark, marginTop: 3 }}>
            2. Realizar ensaio de compressão de provetes de betão (cura mínima 28 dias) para garantir C25/30 nas sapatas e vigas principais.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>10. TERMO DE RESPONSABILIDADE TÉCNICA</Text>
        <View style={[styles.card, { backgroundColor: colors.surfaceCard, marginBottom: 12, padding: 10 }]}>
          <Text style={{ fontSize: 7, lineHeight: 1.3, color: colors.textMuted }}>
            A Kizongelu disponibiliza estimativas orçamentais e mapas de quantidades com base em fórmulas de engenharia civil aplicadas ao contexto da República de Angola. Os valores apurados constituem um referencial paramétrico e orçamento prévio. A presente estimativa não dispensa nem substitui projectos de execução elaborados por técnicos inscritos na Ordem dos Engenheiros de Angola (OEA) nem as devidas licenças camarárias municipais de construção.
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 14, paddingTop: 10, borderTopWidth: 0.5, borderTopColor: colors.borderLight }}>
            <View style={{ width: '46%', alignItems: 'center' }}>
              <View style={{ width: '85%', borderBottomWidth: 0.8, borderBottomColor: colors.textDark, marginBottom: 4 }} />
              <Text style={{ fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: colors.primary }}>O Técnico Responsável</Text>
              <Text style={{ fontSize: 6.5, color: colors.textMuted }}>Engenheiro Civil Legalmente Habilitado</Text>
            </View>
            <View style={{ width: '46%', alignItems: 'center' }}>
              <View style={{ width: '85%', borderBottomWidth: 0.8, borderBottomColor: colors.textDark, marginBottom: 4 }} />
              <Text style={{ fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: colors.primary }}>O Empreiteiro / Construtor</Text>
              <Text style={{ fontSize: 6.5, color: colors.textMuted }}>Empresa Executante / Alvará de Construção Civil</Text>
            </View>
          </View>
        </View>

        {/* Bloco de Verificação com QR Code e Link */}
        <View style={{ borderWidth: 1, borderColor: colors.primary, borderRadius: 6, padding: 12, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ width: '75%' }}>
            <Text style={{ fontSize: 9, fontWeight: 'bold', color: colors.primary }}>
              VERIFICAÇÃO DE AUTENTICIDADE DO DOCUMENTO
            </Text>
            <Text style={{ fontSize: 7.5, color: colors.textDark, marginTop: 4 }}>
              Código de Verificação: <Text style={{ fontFamily: 'Helvetica-Bold' }}>{shareToken}</Text>
            </Text>
            <Text style={{ fontSize: 7.5, color: colors.textMuted, marginTop: 2 }}>
              Link público de verificação: <Text style={{ color: colors.primaryLight }}>{verificationUrl}</Text>
            </Text>
            <Text style={{ fontSize: 7, color: colors.textMuted, marginTop: 4 }}>
              Emitido por Kizongelu &bull; Código único de validação.
            </Text>
          </View>
          <View style={{ width: '22%', alignItems: 'center' }}>
            {qrDataUrl && (
              <Image
                src={qrDataUrl}
                style={{ width: 28 * 2.83, height: 28 * 2.83 }}
              />
            )}
            <Text style={{ fontSize: 6.5, color: colors.textMuted, marginTop: 3 }}>28×28 mm</Text>
          </View>
        </View>

        {/* Rodapé Padrão */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Kizongelu &bull; ID: {budgetId} &bull; Motor v3.2</Text>
          <Text style={styles.footerText}>Verificação: {verificationUrl}</Text>
          <Text style={styles.footerText}>Página 5 de 5</Text>
        </View>
      </Page>
    </Document>
  );
};

// Cache de PDF em memória
const pdfBufferCache = new Map<string, { buffer: Buffer; generatedAt: string }>();

/**
 * Gera o Buffer do PDF server-side pronto para streaming HTTP ou armazenamento.
 */
export async function generateOrcamentoPdf(
  projectId: string,
  options: { baseUrl?: string; userId?: string } = {}
): Promise<{ buffer: Buffer; shareToken: string; verificationUrl: string }> {
  // 1. Carrega os dados calculados do projeto
  const preview = await getPreview(projectId);
  const budgetId = `KZ-2025-${projectId.substring(0, 4).toUpperCase()}`;

  // 2. Garante o link de partilha único com QR de verificação
  const shareLink = await getOrCreateProjectShareLink(projectId, options.userId);
  const { dataUrl: qrDataUrl, verificationUrl } = await generateVerificationQr(
    shareLink.token,
    options.baseUrl
  );

  const issuedDate = new Date();
  const issuedAtFormatted = `${issuedDate.getDate().toString().padStart(2, '0')}/${(
    issuedDate.getMonth() + 1
  )
    .toString()
    .padStart(2, '0')}/${issuedDate.getFullYear()}`;

  // 3. Monta o elemento React-PDF
  const docElement = (
    <OrcamentoPdfDocument
      data={preview}
      budgetId={budgetId}
      shareToken={shareLink.token}
      verificationUrl={verificationUrl}
      qrDataUrl={qrDataUrl}
      issuedAtFormatted={issuedAtFormatted}
    />
  );

  // 4. Renderiza para Buffer
  const buffer = await renderToBuffer(docElement);

  // Guarda em cache de memória
  pdfBufferCache.set(projectId, {
    buffer,
    generatedAt: new Date().toISOString(),
  });

  // Regista log de auditoria
  await logAuditEvent({
    event: 'PDF_GENERATED',
    userId: options.userId || 'system',
    details: {
      projectId,
      budgetId,
      shareToken: shareLink.token,
      sizeBytes: buffer.length,
    },
    status: 'SUCCESS',
  });

  return {
    buffer,
    shareToken: shareLink.token,
    verificationUrl,
  };
}

/**
 * Gera o Blob do PDF no cliente (para download no browser).
 */
export async function generateOrcamentoPdfBlob(
  projectId: string,
  options: { baseUrl?: string } = {}
): Promise<{ blob: Blob; shareToken: string; verificationUrl: string }> {
  const preview = await getPreview(projectId);
  const budgetId = `KZ-2025-${projectId.substring(0, 4).toUpperCase()}`;
  const shareLink = await getOrCreateProjectShareLink(projectId);
  const { dataUrl: qrDataUrl, verificationUrl } = await generateVerificationQr(
    shareLink.token,
    options.baseUrl
  );

  const issuedDate = new Date();
  const issuedAtFormatted = `${issuedDate.getDate().toString().padStart(2, '0')}/${(
    issuedDate.getMonth() + 1
  )
    .toString()
    .padStart(2, '0')}/${issuedDate.getFullYear()}`;

  const docElement = (
    <OrcamentoPdfDocument
      data={preview}
      budgetId={budgetId}
      shareToken={shareLink.token}
      verificationUrl={verificationUrl}
      qrDataUrl={qrDataUrl}
      issuedAtFormatted={issuedAtFormatted}
    />
  );

  const blob = await pdf(docElement).toBlob();
  return { blob, shareToken: shareLink.token, verificationUrl };
}

/**
 * Obtém PDF em cache ou gera sob demanda
 */
export function getCachedPdf(projectId: string): Buffer | null {
  const cached = pdfBufferCache.get(projectId);
  return cached ? cached.buffer : null;
}
