/**
 * @file app/api/admin/prices/import/route.ts
 * Endpoint REST para importação em lote de ficheiro CSV de preços.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { importPricesFromCsv } from '@/lib/actions/prices';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    let csvText = '';
    if (contentType.includes('application/json')) {
      const body = await request.json();
      csvText = body.csv || '';
    } else {
      csvText = await request.text();
    }

    if (!csvText || !csvText.trim()) {
      return NextResponse.json({ error: 'Conteúdo CSV vazio.' }, { status: 400 });
    }

    const result = await importPricesFromCsv(csvText, 'admin_import_user');

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Falha na importação do ficheiro CSV.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
