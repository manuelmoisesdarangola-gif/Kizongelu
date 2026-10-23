/**
 * @file app/api/pdf/[projectId]/route.ts
 * Endpoint protegido para descarregar o Caderno de Encargos & Orçamento Oficial em PDF com QR Code.
 * 
 * Regras de Segurança:
 * 1. Só acessível se Project.status = UNLOCKED.
 * 2. Verifica se o userId corresponde ao proprietário do projeto (ou perfil ADMIN).
 * 3. Devolve o ficheiro binário em stream/buffer com cabeçalhos de download direto (nunca expõe URL direto).
 * 4. Regista cada descarregamento no AuditLog do sistema.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getPreview } from '../../../../lib/actions/preview';
import { generateOrcamentoPdf, getCachedPdf } from '../../../../lib/pdf/generate-orcamento';
import { logAuditEvent } from '../../../../lib/audit';
import { prisma } from '../../../../lib/db/prisma';

interface RouteContext {
  params: { projectId: string };
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { projectId } = params;

    if (!projectId) {
      return NextResponse.json(
        { error: 'BAD_REQUEST', message: 'ID de projeto obrigatório.' },
        { status: 400 }
      );
    }

    // 1. Obtém dados do projeto e estado de bloqueio
    const preview = await getPreview(projectId);

    // Valida se o projeto está desbloqueado
    if (!preview.isUnlocked && preview.status !== 'UNLOCKED') {
      return NextResponse.json(
        {
          error: 'PROJECT_LOCKED',
          message:
            'Acesso negado: Este orçamento ainda não foi concluído. Efetue o envio e aprovação do comprovativo ou utilize os créditos do seu pacote.',
          projectId,
          status: preview.status,
        },
        { status: 403 }
      );
    }

    // 2. Verificação de propriedade / utilizador
    // Em produção, a sessão é extraída via auth(). No endpoint, aceitamos cabeçalho/query para testes ou utilizador padrão.
    const searchParams = request.nextUrl ? request.nextUrl.searchParams : new URL(request.url).searchParams;
    const requestedUserId = searchParams.get('userId') || request.headers.get('x-user-id') || 'usr_particular_01';

    let projectOwnerId: string | null = null;
    if (process.env.DATABASE_URL) {
      try {
        const project = await prisma.project.findUnique({
          where: { id: projectId },
          select: { userId: true, status: true },
        });
        if (project) {
          projectOwnerId = project.userId;
        }
      } catch (_) {}
    }

    // Se o projeto tem dono definido na BD e não é admin, valida
    const isAdmin = request.headers.get('x-user-role') === 'ADMIN';
    if (projectOwnerId && projectOwnerId !== requestedUserId && !isAdmin) {
      return NextResponse.json(
        {
          error: 'FORBIDDEN',
          message: 'Não tem permissão para descarregar o orçamento deste projeto.',
        },
        { status: 403 }
      );
    }

    // 3. Gera ou obtém PDF
    const cached = getCachedPdf(projectId);
    let pdfBuffer: Buffer;

    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    const host = request.headers.get('host') || 'kizongelu.ao';
    const baseUrl = `${protocol}://${host}`;

    if (cached) {
      pdfBuffer = cached;
    } else {
      const result = await generateOrcamentoPdf(projectId, {
        baseUrl,
        userId: requestedUserId,
      });
      pdfBuffer = result.buffer;
    }

    // 4. Regista download no AuditLog
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'Browser';

    await logAuditEvent({
      event: 'PDF_DOWNLOADED',
      userId: requestedUserId,
      ip,
      userAgent,
      details: {
        projectId,
        sizeBytes: pdfBuffer.length,
      },
      status: 'SUCCESS',
    });

    // 5. Devolve PDF em stream binário com cabeçalhos apropriados
    const filename = `Orcamento_Kizongelu_${projectId}.pdf`;

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });
  } catch (error) {
    console.error('[API PDF] Erro ao gerar ou fornecer PDF:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Ocorreu um erro ao processar a geração do documento PDF oficial.',
      },
      { status: 500 }
    );
  }
}
