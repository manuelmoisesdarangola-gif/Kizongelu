/**
 * @file lib/notifications/templates/index.ts
 * Catálogo Unificado de Templates para todos os canais de Notificação.
 * Suporta substituição de variáveis: {{nome}}, {{id}}, {{valor}}, {{data}}, {{link}}, etc.
 */

import { NotificationEvent, NotificationPayload } from '../types';

export interface RenderedNotificationTemplate {
  title: string;
  body: string;
  emailSubject: string;
  emailHtml: string;
  pushTitle: string; // máx 60 char
  pushBody: string;  // máx 120 char
  pushIcon?: string;
  pushBadge?: string;
  pushActionUrl?: string;
  whatsappText: string;
  smsText: string;
}

function replaceVariables(template: string, payload: NotificationPayload): string {
  let result = template;
  for (const [key, value] of Object.entries(payload)) {
    const valStr = value !== undefined && value !== null ? String(value) : '';
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), valStr);
  }
  return result;
}

export function renderNotificationTemplate(
  event: NotificationEvent,
  payload: NotificationPayload
): RenderedNotificationTemplate {
  const nome = payload.nome || 'Estimado(a) Utilizador(a)';
  const link = payload.link || 'https://kizongelu.ao/painel';
  const valor = typeof payload.valor === 'number'
    ? `${payload.valor.toLocaleString('pt-PT')} Kz`
    : (payload.valor || '0 Kz');
  const id = payload.id || 'N/A';
  const data = payload.data || new Date().toLocaleDateString('pt-PT');
  const projectName = payload.projectName || 'Projeto de Construção';

  const safePayload: NotificationPayload = {
    ...payload,
    nome,
    link,
    valor,
    id,
    data,
    projectName,
  };

  switch (event) {
    // ================= ACCOUNT =================
    case 'welcome':
      return {
        title: 'Bem-vindo ao Kizongelu',
        body: `Olá ${nome}, a sua conta foi criada com sucesso. Já pode calcular o seu primeiro orçamento de construção em Kwanzas.`,
        emailSubject: 'Bem-vindo ao Kizongelu — Orçamentação e Engenharia de Custos em Angola',
        emailHtml: `
          <h2>Bem-vindo à nova era da construção civil em Angola, ${nome}!</h2>
          <p>A sua conta está pronta a ser utilizada. Pode agora criar estimativas precisas, obter mapas de quantidades com fórmulas de engenharia e exportar cadernos de encargos.</p>
          <p><a href="${link}" style="display:inline-block;padding:12px 24px;background:#0F3D5C;color:#ffffff;border-radius:8px;text-decoration:none;font-weight:bold;">Criar Primeiro Orçamento &rarr;</a></p>
        `,
        pushTitle: 'Bem-vindo ao Kizongelu',
        pushBody: 'A sua conta está ativa. Comece já a orçamentar a sua obra com precisão.',
        pushActionUrl: link,
        whatsappText: `Olá ${nome}! Bem-vindo ao Kizongelu 🏗️. A sua conta está ativa para criar orçamentos determinísticos de construção em Angola.\n\nAceda: ${link}\n\nPara cancelar o envio de mensagens WhatsApp responda PARAR.`,
        smsText: `Kizongelu: Bem-vindo ${nome}! A sua conta foi ativada. Inicie o seu primeiro orcamento em ${link}`,
      };

    case 'verify_email':
      return {
        title: 'Confirme o seu endereço de email',
        body: `Por favor confirme o seu email para assegurar o acesso à sua conta Kizongelu.`,
        emailSubject: 'Confirmação do seu endereço de email — Kizongelu',
        emailHtml: `
          <h2>Confirme o seu endereço de email</h2>
          <p>Olá ${nome}, clique no botão abaixo para verificar a sua conta com segurança:</p>
          <p><a href="${link}" style="display:inline-block;padding:12px 24px;background:#F59E0B;color:#0F172A;border-radius:8px;text-decoration:none;font-weight:bold;">Confirmar Email Agora</a></p>
          <p style="font-size:11px;color:#64748B;">Se não solicitou este registo, por favor ignore esta mensagem.</p>
        `,
        pushTitle: 'Confirme o seu email',
        pushBody: 'Verifique o seu endereço de correio para ativar todas as ferramentas.',
        pushActionUrl: link,
        whatsappText: `Kizongelu: Olá ${nome}, confirme o seu email clicando no link seguro: ${link}\n\nResponda PARAR para opt-out.`,
        smsText: `Kizongelu: Codigo de verificacao de email para ${nome}. Aceda a ${link}`,
      };

    case 'reset_password':
      return {
        title: 'Pedido de recuperação de palavra-passe',
        body: `Recebemos um pedido para repor a palavra-passe da sua conta Kizongelu.`,
        emailSubject: 'Reposição de Palavra-Passe — Kizongelu',
        emailHtml: `
          <h2>Recuperação de Palavra-Passe</h2>
          <p>Olá ${nome}, clique no link abaixo para criar uma nova senha (válido por 60 minutos):</p>
          <p><a href="${link}" style="display:inline-block;padding:12px 24px;background:#0F3D5C;color:#ffffff;border-radius:8px;text-decoration:none;font-weight:bold;">Redefinir Palavra-Passe</a></p>
        `,
        pushTitle: 'Reposição de Senha Solicitada',
        pushBody: 'Clique para redefinir a sua palavra-passe com segurança.',
        pushActionUrl: link,
        whatsappText: `Kizongelu Segurança: Olá ${nome}, recebeu um link para repor a sua senha: ${link}. Se não solicitou, contacte o suporte imediatamente.`,
        smsText: `Kizongelu: Reposicao de senha para ${nome}. Aceda ao link seguro: ${link}`,
      };

    case 'password_changed':
      return {
        title: 'Palavra-passe alterada com sucesso',
        body: `A palavra-passe da sua conta Kizongelu foi actualizada recentemente.`,
        emailSubject: 'Alerta de Segurança: Palavra-passe Actualizada — Kizongelu',
        emailHtml: `
          <h2>A sua palavra-passe foi alterada</h2>
          <p>Olá ${nome}, informamos que a palavra-passe associada à sua conta foi alterada em ${data}. Se foi você, ignore este aviso.</p>
        `,
        pushTitle: 'Senha Actualizada',
        pushBody: 'A palavra-passe da sua conta foi alterada com sucesso.',
        whatsappText: `Kizongelu Alerta: A palavra-passe da sua conta foi alterada em ${data}. Se não foi você, contacte o suporte.`,
        smsText: `Kizongelu: A sua palavra-passe foi alterada em ${data}.`,
      };

    case 'new_device_login':
      return {
        title: 'Novo início de sessão detetado',
        body: `Detetámos um novo acesso à sua conta a partir de ${payload.dispositivo || 'novo dispositivo'}.`,
        emailSubject: 'Segurança: Novo Início de Sessão — Kizongelu',
        emailHtml: `
          <h2>Novo Início de Sessão Detetado</h2>
          <p>Olá ${nome}, a sua conta foi acedida a partir de um novo dispositivo (${payload.dispositivo || 'Navegador Web'}), IP: ${payload.ip || 'Luanda'}.</p>
        `,
        pushTitle: 'Novo Início de Sessão',
        pushBody: `Acesso registado a partir de ${payload.dispositivo || 'novo dispositivo'}.`,
        whatsappText: `Kizongelu Segurança: Novo início de sessão detetado para ${nome} a partir de ${payload.dispositivo || 'dispositivo'}.`,
        smsText: `Kizongelu: Novo login na sua conta em ${data}.`,
      };

    // ================= PAYMENT =================
    case 'proof_received':
      return {
        title: 'Comprovativo de pagamento recebido',
        body: `O comprovativo de ${valor} para a obra "${projectName}" foi submetido e está em validação.`,
        emailSubject: `Comprovativo Recebido: ${projectName} — Kizongelu`,
        emailHtml: `
          <h2>Comprovativo em Análise</h2>
          <p>Olá ${nome}, recebemos o seu comprovativo de ${valor}. A nossa equipa financeira irá validar a transferência no prazo máximo de 15 a 30 minutos.</p>
        `,
        pushTitle: 'Comprovativo Recebido',
        pushBody: `O seu pagamento de ${valor} está em verificação pela tesouraria.`,
        whatsappText: `Kizongelu Pagamentos: Olá ${nome}, recebemos o seu comprovativo de ${valor} para a obra "${projectName}". Estamos a validar a operação. Obrigado!`,
        smsText: `Kizongelu: Comprovativo de ${valor} recebido para "${projectName}". Em analise.`,
      };

    case 'approved':
      return {
        title: 'Pagamento Aprovado e Projecto Concluído! 🎉',
        body: `O pagamento de ${valor} foi confirmado com sucesso. O mapa de quantidades completo e PDFs de "${projectName}" já estão disponíveis.`,
        emailSubject: `Pagamento Aprovado! Obra "${projectName}" Concluída — Kizongelu`,
        emailHtml: `
          <h2>Pagamento Confirmado com Sucesso!</h2>
          <p>Olá ${nome}, o pagamento de <strong>${valor}</strong> referente à obra <strong>${projectName}</strong> foi validado.</p>
          <p>Já pode exportar o caderno técnico completo, mapa de medições em Excel e o documento com QR Code autenticado.</p>
          <p><a href="${link}" style="display:inline-block;padding:12px 24px;background:#10B981;color:#ffffff;border-radius:8px;text-decoration:none;font-weight:bold;">Aceder ao Projecto Concluído &rarr;</a></p>
        `,
        pushTitle: 'Projecto Concluído! 🎉',
        pushBody: `Pagamento de ${valor} aprovado. Aceda ao mapa de quantidades completo.`,
        pushActionUrl: link,
        whatsappText: `Kizongelu ✅: Parabéns ${nome}! O seu pagamento de ${valor} foi aprovado pela equipa financeira. O projecto "${projectName}" está agora totalmente concluído!\n\nAceda: ${link}\n\nPara cancelar responda PARAR.`,
        smsText: `Kizongelu: Pagamento de ${valor} aprovado! "${projectName}" concluído em ${link}`,
      };

    case 'rejected':
      return {
        title: 'Comprovativo não validado',
        body: `O comprovativo para "${projectName}" necessita de revisão. Motivo: ${payload.motivo || 'Transação não identificada'}.`,
        emailSubject: `Aviso sobre o Comprovativo: ${projectName} — Kizongelu`,
        emailHtml: `
          <h2>Comprovativo Não Validado</h2>
          <p>Olá ${nome}, não foi possível confirmar a sua transferência no valor de ${valor}.</p>
          <p><strong>Motivo:</strong> ${payload.motivo || 'Comprovativo ilegível ou referência não localizada'}.</p>
          <p>Por favor reenvie o ficheiro ou contacte o nosso suporte via WhatsApp.</p>
        `,
        pushTitle: 'Comprovativo Não Validado',
        pushBody: `Necessário rever comprovativo de "${projectName}". Toque para verificar.`,
        pushActionUrl: link,
        whatsappText: `Kizongelu ⚠️: Olá ${nome}, o seu comprovativo para "${projectName}" não pôde ser validado. Motivo: ${payload.motivo || 'Dados incompletos'}. Por favor submeta novo comprovativo ou responda a esta mensagem para apoio direto.`,
        smsText: `Kizongelu: Comprovativo nao validado para "${projectName}". Contacte suporte ou aceda a ${link}`,
      };

    // ================= PROJECT =================
    case 'calculation_ready':
      return {
        title: 'Cálculo Orçamental Concluído',
        body: `O cálculo da obra "${projectName}" está concluído com valor total de ${valor}.`,
        emailSubject: `Orçamento Pronto: ${projectName} — Kizongelu`,
        emailHtml: `
          <h2>O seu orçamento está pronto</h2>
          <p>Olá ${nome}, calculámos com sucesso o projecto <strong>${projectName}</strong> no total de <strong>${valor}</strong> com base nos coeficientes da sua província.</p>
          <p><a href="${link}" style="display:inline-block;padding:12px 24px;background:#0F3D5C;color:#ffffff;border-radius:8px;text-decoration:none;font-weight:bold;">Ver Resumo do Cálculo</a></p>
        `,
        pushTitle: 'Orçamento Pronto!',
        pushBody: `Cálculo de "${projectName}" concluído (${valor}). Toque para ver.`,
        pushActionUrl: link,
        whatsappText: `Kizongelu 📐: Olá ${nome}, o orçamento para "${projectName}" foi calculado com sucesso: total previsto de ${valor}.\n\nConsulte o mapa: ${link}`,
        smsText: `Kizongelu: Orcamento de "${projectName}" pronto (${valor}). Veja em ${link}`,
      };

    case 'unlocked':
      return {
        title: 'Orçamento Concluído com Sucesso',
        body: `Acesso total concedido para a obra "${projectName}".`,
        emailSubject: `Acesso Total Concedido: ${projectName} — Kizongelu`,
        emailHtml: `<h2>Acesso Total Concedido</h2><p>Olá ${nome}, o projecto ${projectName} foi concluído com sucesso.</p>`,
        pushTitle: 'Projecto Concluído',
        pushBody: `Acesso integral concedido a "${projectName}".`,
        pushActionUrl: link,
        whatsappText: `Kizongelu: Acesso integral concedido para "${projectName}". Aceda: ${link}`,
        smsText: `Kizongelu: "${projectName}" concluído com sucesso.`,
      };

    case 'version_updated':
      return {
        title: 'Nova Versão de Orçamento Gerada',
        body: `Foi guardada uma nova versão da estimativa de "${projectName}".`,
        emailSubject: `Nova Versão: ${projectName} — Kizongelu`,
        emailHtml: `<h2>Nova Versão de Cálculo</h2><p>Olá ${nome}, o orçamento de ${projectName} foi recalculado e actualizado.</p>`,
        pushTitle: 'Versão Actualizada',
        pushBody: `Nova versão gerada para "${projectName}".`,
        whatsappText: `Kizongelu: Foi actualizada a versão de cálculo para "${projectName}".`,
        smsText: `Kizongelu: Nova versao calculada para "${projectName}".`,
      };

    case 'expiring_soon':
      return {
        title: 'Validade do Orçamento a Expirar',
        body: `Os preços unitários do projecto "${projectName}" expiram em ${payload.diasRestantes || 5} dias.`,
        emailSubject: `Aviso de Validade: ${projectName} — Kizongelu`,
        emailHtml: `<h2>Validade de Preços Unitários</h2><p>Os preços de referência para ${projectName} estão perto do termo de validade de 30 dias devido à inflação de materiais.</p>`,
        pushTitle: 'Orçamento a Expirar',
        pushBody: `Preços de "${projectName}" expiram em breve. Actualize o cálculo.`,
        whatsappText: `Kizongelu ⏳: Olá ${nome}, a cotação de materiais para "${projectName}" expira em ${payload.diasRestantes || 5} dias. Recomendamos validação antes da adjudicação.`,
        smsText: `Kizongelu: Precos de "${projectName}" expiram em ${payload.diasRestantes || 5} dias.`,
      };

    // ================= SHARE =================
    case 'document_shared':
      return {
        title: 'Documento Técnico Partilhado',
        body: `Foi criado um link público de partilha para o projecto "${projectName}".`,
        emailSubject: `Documento Partilhado: ${projectName} — Kizongelu`,
        emailHtml: `<h2>Documento Partilhado</h2><p>Olá ${nome}, o link de verificação foi gerado: <a href="${link}">${link}</a></p>`,
        pushTitle: 'Documento Partilhado',
        pushBody: `Link público ativo para "${projectName}".`,
        whatsappText: `Kizongelu: Link de verificação partilhado para "${projectName}": ${link}`,
        smsText: `Kizongelu: Documento partilhado para "${projectName}": ${link}`,
      };

    case 'document_opened':
      return {
        title: 'Orçamento Visualizado por Terceiro',
        body: `O seu orçamento partilhado de "${projectName}" foi aberto por um consultor ou dono de obra.`,
        emailSubject: `Documento Aberto: ${projectName} — Kizongelu`,
        emailHtml: `<h2>Orçamento Visualizado</h2><p>Olá ${nome}, o link do projecto ${projectName} foi visualizado através da página de verificação pública.</p>`,
        pushTitle: 'Orçamento Visualizado',
        pushBody: `O link de "${projectName}" foi aberto por um terceiro.`,
        whatsappText: `Kizongelu: O seu orçamento de "${projectName}" acabou de ser consultado através do link de verificação.`,
        smsText: `Kizongelu: O seu orcamento "${projectName}" foi consultado online.`,
      };

    case 'document_downloaded':
      return {
        title: 'Download de Caderno de Encargos Efetuado',
        body: `Foi efetuado o download do PDF de "${projectName}".`,
        emailSubject: `Download Efetuado: ${projectName} — Kizongelu`,
        emailHtml: `<h2>Download de Caderno de Encargos</h2><p>Olá ${nome}, o documento PDF de ${projectName} foi descarregado com sucesso.</p>`,
        pushTitle: 'Download Concluído',
        pushBody: `Caderno técnico de "${projectName}" descarregado.`,
        whatsappText: `Kizongelu: O PDF de "${projectName}" foi descarregado.`,
        smsText: `Kizongelu: PDF de "${projectName}" descarregado com sucesso.`,
      };

    // ================= ONBOARDING =================
    case 'day_1':
      return {
        title: 'Como calibrar os preços da sua província',
        body: `Olá ${nome}, sabia que o Kizongelu calibra automaticamente cimento, aço e mão-de-obra para todas as 21 províncias?`,
        emailSubject: 'Dica do Dia: Custos Regionais em Angola — Kizongelu',
        emailHtml: `<h2>Calibração Regional de Custos</h2><p>Olá ${nome}, utilize o selector de província para obter cotações rigorosas com frete rodoviário e portuário ajustados.</p>`,
        pushTitle: 'Dica de Engenharia 💡',
        pushBody: 'Aprenda a calibrar os custos de materiais para a sua província.',
        whatsappText: `Kizongelu Dicas: Olá ${nome}! Sabia que os nossos cálculos têm em conta fretes para o interior e transporte marítimo para Cabinda? Explore no seu painel: ${link}`,
        smsText: `Kizongelu: Descubra como ajustar precos para a sua provincia em ${link}`,
      };

    case 'day_3':
      return {
        title: 'Descubra a Composição de Preços Unitários (CPU)',
        body: `Veja cada quantidade de cimento e horas de mão de obra em fichas analíticas detalhadas.`,
        emailSubject: 'Composições Analíticas (CPU) — Kizongelu',
        emailHtml: `<h2>Transparência Total com CPU</h2><p>Olá ${nome}, cada artigo do seu orçamento pode ser expandido para ver materiais, mão de obra e equipamento.</p>`,
        pushTitle: 'Fichas de CPU Disponíveis',
        pushBody: 'Consulte os custos analíticos de cada artigo de obra.',
        whatsappText: `Kizongelu: Olá ${nome}, aceda ao detalhe de betões, armaduras e alvenarias em fichas analíticas completas: ${link}`,
        smsText: `Kizongelu: Consulte as fichas analiticas de CPU das suas obras em ${link}`,
      };

    case 'day_7':
      return {
        title: 'Como preparar orçamentos profissionais',
        body: `Dicas para estruturar propostas comerciais claras e mapas de quantidades detalhados.`,
        emailSubject: 'Dossiê Técnico e Comercial — Kizongelu',
        emailHtml: `<h2>Orçamentos Estruturados para Obra</h2><p>Olá ${nome}, utilize a exportação de medições para apresentar tranches de desembolso e estimativas fiscais claras.</p>`,
        pushTitle: 'Propostas Profissionais',
        pushBody: 'Apresente orçamentos estruturados aos seus clientes e parceiros.',
        whatsappText: `Kizongelu: Olá ${nome}, sabia que o nosso sistema gera o dossiê com tranches e cronograma financeiro pronto para os seus clientes? Saiba mais: ${link}`,
        smsText: `Kizongelu: Exporte o dossie detalhado das suas obras em ${link}`,
      };

    // ================= REENGAGEMENT =================
    case 'draft_24h':
      return {
        title: 'Deixou um rascunho de obra por terminar',
        body: `O seu projecto "${projectName}" está guardado. Retome o cálculo em poucos segundos.`,
        emailSubject: `Termine o seu orçamento: ${projectName} — Kizongelu`,
        emailHtml: `<h2>Tem um rascunho pendente</h2><p>Olá ${nome}, guardámos as suas seleções para ${projectName}. Conclua os passos restantes para obter o mapa de quantidades.</p><p><a href="${link}">Continuar Cálculo &rarr;</a></p>`,
        pushTitle: 'Rascunho Pendente',
        pushBody: `O projecto "${projectName}" está à sua espera. Termine o cálculo.`,
        pushActionUrl: link,
        whatsappText: `Kizongelu: Olá ${nome}, reparámos que deixou o cálculo de "${projectName}" a meio. Deseja retomar agora? Aceda: ${link}`,
        smsText: `Kizongelu: Retome o calculo de "${projectName}" em ${link}`,
      };

    case 'draft_7d':
      return {
        title: 'Rascunho prestes a expirar',
        body: `O rascunho de "${projectName}" expira em breve. Finalize a estimativa.`,
        emailSubject: `Rascunho prestes a expirar: ${projectName} — Kizongelu`,
        emailHtml: `<h2>Rascunho Prestes a Expirar</h2><p>Olá ${nome}, para manter os preços actualizados, conclua a orçamentação de ${projectName}.</p>`,
        pushTitle: 'Rascunho a Expirar',
        pushBody: `Conclua "${projectName}" antes que as cotações sofram alterações.`,
        whatsappText: `Kizongelu: Olá ${nome}, finalize o rascunho de "${projectName}" para salvaguardar os preços apurados: ${link}`,
        smsText: `Kizongelu: Finalize o orcamento de "${projectName}" em ${link}`,
      };

    case 'preview_24h':
      return {
        title: 'O seu mapa de quantidades está à sua espera',
        body: `O orçamento de "${projectName}" já foi calculado. Desbloqueie para aceder a todos os capítulos.`,
        emailSubject: `Desbloqueie o mapa completo de: ${projectName} — Kizongelu`,
        emailHtml: `<h2>Desbloqueie o Mapa Completo</h2><p>Olá ${nome}, a estimativa de ${projectName} tem os 3 primeiros capítulos prontos. Desbloqueie o mapa integral por ${valor}.</p>`,
        pushTitle: 'Mapa Disponível',
        pushBody: `Desbloqueie o mapa integral de "${projectName}" (${valor}).`,
        whatsappText: `Kizongelu: Olá ${nome}, o orçamento de "${projectName}" tem cobertura e acabamentos prontos para desbloqueio: ${link}`,
        smsText: `Kizongelu: Desbloqueie o mapa completo de "${projectName}" em ${link}`,
      };

    case 'weekly_summary':
      return {
        title: 'Resumo Semanal das Suas Obras',
        body: `Consulte o ponto de situação e avanço físico das suas obras ativas.`,
        emailSubject: 'Resumo Semanal da Atividade — Kizongelu',
        emailHtml: `<h2>O Seu Resumo Semanal</h2><p>Olá ${nome}, consulte no painel o controlo financeiro e autos de medição registados esta semana.</p>`,
        pushTitle: 'Resumo Semanal',
        pushBody: 'Veja as novidades e medições da sua carteira de obras.',
        whatsappText: `Kizongelu: Olá ${nome}, o seu resumo semanal de obras e medições está pronto no painel: ${link}`,
        smsText: `Kizongelu: Veja o seu resumo semanal de obras em ${link}`,
      };

    case 'package_nearly_exhausted':
      return {
        title: 'Resta apenas 1 orçamento disponível',
        body: 'O seu pacote está quase a esgotar. Considere adquirir um novo pacote para continuar sem interrupções.',
        emailSubject: 'Aviso: Resta 1 orçamento no seu pacote — Kizongelu',
        emailHtml: `<h2>Resta 1 Orçamento</h2><p>Olá ${nome}, tem apenas 1 crédito de orçamento restante no seu pacote. Adquira um novo pacote para continuar a emitir mapas oficiais.</p>`,
        pushTitle: 'Resta 1 Orçamento',
        pushBody: 'O seu pacote tem apenas 1 orçamento restante.',
        whatsappText: `Kizongelu: Olá ${nome}, resta apenas 1 orçamento no seu pacote. Pode recarregar a qualquer momento em ${link}`,
        smsText: `Kizongelu: Resta 1 orcamento no seu pacote. Aceda a ${link}`,
      };

    case 'package_exhausted':
      return {
        title: 'Pacote de orçamentos esgotado',
        body: 'Utilizou todos os créditos disponíveis do seu pacote. Adquira um novo pacote para continuar.',
        emailSubject: 'O seu pacote de orçamentos esgotou — Kizongelu',
        emailHtml: `<h2>Pacote Esgotado</h2><p>Olá ${nome}, todos os créditos do seu pacote foram utilizados. Adquira um novo pacote para emitir novos orçamentos.</p>`,
        pushTitle: 'Pacote Esgotado',
        pushBody: 'Todos os seus orçamentos foram utilizados. Adquira um novo pacote.',
        whatsappText: `Kizongelu: Olá ${nome}, o seu pacote de orçamentos esgotou. Adquira um novo pacote em ${link}`,
        smsText: `Kizongelu: O seu pacote esgotou. Adquira novos creditos em ${link}`,
      };

    case 'package_purchased':
      return {
        title: 'Novo pacote de orçamentos activo',
        body: `O seu pacote foi adquirido com sucesso. Os seus orçamentos não expiram e já estão disponíveis.`,
        emailSubject: 'Confirmação de Pacote de Orçamentos — Kizongelu',
        emailHtml: `<h2>Pacote Activo com Sucesso</h2><p>Olá ${nome}, o seu novo pacote foi activado com sucesso. Os seus orçamentos não têm expiração!</p>`,
        pushTitle: 'Pacote Activo',
        pushBody: 'Os seus créditos de orçamento já estão disponíveis.',
        whatsappText: `Kizongelu: Olá ${nome}, o seu pacote foi activado com sucesso. Aceda ao painel: ${link}`,
        smsText: `Kizongelu: Novo pacote activo com sucesso. Aceda em ${link}`,
      };

    default:
      return {
        title: 'Notificação Kizongelu',
        body: `Olá ${nome}, tem uma nova notificação sobre ${projectName}.`,
        emailSubject: `Notificação: ${projectName} — Kizongelu`,
        emailHtml: `<h2>Notificação Kizongelu</h2><p>${payload.motivo || 'Tem uma nova atualização na sua conta.'}</p>`,
        pushTitle: 'Kizongelu',
        pushBody: 'Tem uma nova atualização disponível.',
        whatsappText: `Kizongelu: Olá ${nome}, tem uma nova atualização na sua conta: ${link}`,
        smsText: `Kizongelu: Nova notificacao na sua conta em ${link}`,
      };
  }
}
