/**
 * @file app/api/admin/prices/route.ts
 * Endpoints REST administrativos para consulta e registo de preços de materiais.
 * GET /api/admin/prices — listagem com filtros (província, categoria, pesquisa, paginação)
 * POST /api/admin/prices — criação de novo preço
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { listPrices, createPrice } from '@/lib/actions/prices';
import { MaterialCategory } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const province = searchParams.get('province') || undefined;
    const category = (searchParams.get('category') as MaterialCategory) || undefined;
    const search = searchParams.get('search') || undefined;
    const status = (searchParams.get('status') as 'ALL' | 'ACTIVE' | 'INACTIVE' | 'OUTDATED') || 'ALL';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '25', 10);

    const result = await listPrices({
      province,
      category,
      search,
      status,
      page,
      pageSize,
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao listar preços.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { materialCode, province, municipality, price, source } = body;

    if (!materialCode || !province || price === undefined) {
      return NextResponse.json(
        { error: 'Campos obrigatórios em falta: materialCode, province, price.' },
        { status: 400 }
      );
    }

    const result = await createPrice({
      materialCode,
      province,
      municipality,
      price: Number(price),
      source: source || 'Amostragem Admin API',
      userId: 'admin_api_user',
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao processar criação de preço.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
