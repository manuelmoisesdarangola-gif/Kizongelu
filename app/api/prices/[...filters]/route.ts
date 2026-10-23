/**
 * @file app/api/prices/[...filters]/route.ts
 * API Pública de Preços de Materiais de Construção em Angola (Sem Autenticação).
 * Retorna exclusivamente métricas públicas agregadas (preço médio, mínimo, máximo, amostragem).
 * Protege dados sensíveis internos, IDs de auditoria e utilizadores.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getPublicAggregatedPrices } from '@/lib/actions/prices';

interface RouteContext {
  params: { filters: string[] };
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const filterSegments = params.filters || [];
    const { searchParams } = new URL(request.url);

    // Permite filtros tanto por path segment (/api/prices/luanda/cimento) quanto por query string
    let province = searchParams.get('province') || undefined;
    let category = searchParams.get('category') || undefined;

    if (filterSegments.length >= 1 && !province) {
      province = filterSegments[0];
    }
    if (filterSegments.length >= 2 && !category) {
      category = filterSegments[1]?.toUpperCase();
    }

    const aggregated = await getPublicAggregatedPrices({
      province,
      category,
    });

    return NextResponse.json(
      {
        status: 'success',
        disclaimer: 'Dados médios estatísticos baseados na Amostragem Kizongelu 2025 para obras em Angola.',
        filtersApplied: {
          province: province || 'Todas',
          category: category || 'Todas',
        },
        totalItems: aggregated.length,
        items: aggregated,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao consultar preços agregados.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
