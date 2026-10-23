# Guia de Deploy em Produção — Kizongelu

Este documento descreve o procedimento passo-a-passo para colocar a plataforma **Kizongelu** em produção com alta disponibilidade, segurança e conformidade para o mercado de Angola.

---

## 1. Arquitetura de Produção

* **Frontend & Edge Hosting**: Vercel (Edge Network global com POPs em África e Europa).
* **Base de Dados Relacional**: Neon Serverless PostgreSQL com connection pooling (PgBouncer) ou Supabase Postgres.
* **Storage de Ficheiros**: Supabase Storage / AWS S3 para comprovativos Multicaixa e relatórios PDF.
* **DNS & SSL**: Cloudflare ou Vercel DNS com certificado TLS 1.3 automático para o domínio `kizongelu.ao`.
* **Monitorização de Erros**: Sentry com alertas automáticos para Slack/Email.
* **Métricas Web Vitals**: Vercel Analytics (LCP < 2.5s, FID < 100ms, CLS < 0.1).

---

## 2. Preparação da Base de Dados (Neon / Supabase)

1. Crie um projeto no **Neon** (`https://neon.tech`) ou **Supabase** (`https://supabase.com`).
2. Obtenha as duas connection strings:
   * **DATABASE_URL**: String com `pgbouncer=true` (Porta 6543 no Supabase ou endpoint pooled no Neon).
   * **DIRECT_URL**: String de conexão direta (Porta 5432) necessária para as migrações Prisma.
3. Execute as migrações em modo de produção:
   ```bash
   npx prisma migrate deploy
   ```
4. Execute o seed inicial de províncias, planos, artigos e utilizador administrador:
   ```bash
   npx tsx prisma/seed.ts
   ```

---

## 3. Configuração de Variáveis de Ambiente no Vercel

Aceda ao dashboard do Vercel (`Project Settings > Environment Variables`) e adicione as seguintes variáveis (conforme `.env.example`):

| Variável | Descrição | Exemplo |
| :--- | :--- | :--- |
| `DATABASE_URL` | String de conexão pooled | `postgresql://user:pass@ep-xyz.neon.tech/db?sslmode=require` |
| `DIRECT_URL` | String de conexão direta para migrações | `postgresql://user:pass@ep-xyz.neon.tech/db?sslmode=require` |
| `APP_URL` | Domínio público oficial | `https://kizongelu.ao` |
| `NEXTAUTH_SECRET` | Chave criptográfica (32 bytes base64) | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | URL de callback de autenticação | `https://kizongelu.ao` |
| `GEMINI_API_KEY` | Chave de IA da Google AI Studio | `AIzaSy...` |
| `MULTICAIXA_ENTIDADE` | Código de entidade Multicaixa | `00123` |
| `MULTICAIXA_SUBENTIDADE` | Subentidade atribuída pela EMIS | `99` |
| `BAI_IBAN` | IBAN bancário oficial para transferências | `AO06.0040.0000.1234.5678.9012.3` |
| `VITE_SENTRY_DSN` | DSN de monitorização de erros Sentry | `https://...@sentry.io/...` |
| `VERCEL_ANALYTICS_ID` | Identificador de métricas de performance | `kizongelu_va_prod` |

---

## 4. Configuração do Domínio Personalizado & SSL

1. No Vercel, aceda a **Settings > Domains**.
2. Adicione os domínios:
   * `kizongelu.ao` (Domínio principal)
   * `www.kizongelu.ao` (Redirecionamento automático 308 permanente para o ápice)
3. Na entidade gestora de DNS do `.ao` (ex.: INFOSI / Registrar Angolano):
   * Registo **A**: `@` apontando para `76.76.21.21` (Vercel Anycast IP)
   * Registo **CNAME**: `www` apontando para `cname.vercel-dns.com`
4. A emissão do certificado Let's Encrypt / Vercel SSL é concluída em menos de 15 minutos.

---

## 5. Estratégia de Backups Diários

* **Neon / Supabase**: Snapshots diários automatizados com Point-in-Time Recovery (PITR) com retenção de 30 dias.
* **Exportação Fria (pg_dump)**: Cron job configurado às 02:00 (Hora de Luanda, GMT+1) com exportação encriptada para bucket S3 com bloqueio de escrita (Object Lock).

---

## 6. Checklist de Verificação Pré-Lançamento

* [x] Textos 100% em Português de Angola (sem termos estrangeiros descontextualizados).
* [x] Todos os preços apresentados em Kwanzas (`Kz`) com formatação `150.000 Kz`.
* [x] Rotas autenticadas protegidas com guards de sessão e RBAC (`admin`, `empresa`, `profissional`, `particular`).
* [x] PWA manifest válido com ícones 192x192, 512x512 e maskable.
* [x] Service Worker ativo com cache offline e página `/offline.html`.
* [x] Métricas de Acessibilidade WCAG 2.1 AA validadas.
* [x] Alertas de monitorização e logging estruturado ativos.
