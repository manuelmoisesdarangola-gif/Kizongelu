/**
 * @file app/api/admin/prices/[id]/route.ts
 * Endpoints REST administrativos para um preço individual.
 * GET /api/admin/prices/[id] — consulta detalhada com histórico
 * PATCH /api/admin/prices/[id] — atualização de preço (com validação de motivo >20%)
 * DELETE /api/admin/prices/[id] — desativação lógica (soft delete)
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getPriceById, updatePrice, deactivatePrice } from '@/lib/actions/prices';

interface RouteContext {
  params: { id: string };
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const item = await getPriceById(params.id);
    if (!item) {
      return NextResponse.json({ error: 'Preço não encontrado.' }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao obter preço.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const body = await request.json();
    const { price, source, reason } = body;

    if (price === undefined) {
      return NextResponse.json({ error: 'O novo preço é obrigatório.' }, { status: 400 });
    }

    const result = await updatePrice(params.id, {
      price: Number(price),
      source,
      reason,
      userId: 'admin_api_user',
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao atualizar preço.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const result = await deactivatePrice(params.id, 'admin_api_user');
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, message: 'Preço desativado com sucesso.' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao desativar preço.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
