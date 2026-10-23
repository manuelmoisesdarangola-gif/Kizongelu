# Gestão de Migrações da Base de Dados — Kizongelu

Este diretório contém o histórico de migrações geradas pelo **Prisma ORM** para a base de dados relacional PostgreSQL do Kizongelu (Neon ou Supabase).

---

## 1. Comandos Essenciais

### A) Desenvolvimento Local
Quando fizer alterações ao ficheiro `prisma/schema.prisma`:
```bash
# Aplica alterações no schema, cria uma nova migração versionada e regenera o Prisma Client
npx prisma migrate dev --name <nome_da_migracao>

# Atalho via package.json:
npm run db:migrate
```

### B) Produção (Deploy / CI/CD)
Para aplicar migrações pendentes em ambientes de produção (ex.: Neon, Supabase, Vercel Build):
```bash
# Executa apenas as migrações que ainda não foram aplicadas, sem regenerar esquemas
npx prisma migrate deploy

# Atalho via package.json:
npm run db:deploy
```

### C) Reset em Ambiente de Desenvolvimento
Para limpar a base de dados, aplicar todas as migrações desde o início e executar o seed:
```bash
# ATENÇÃO: Apaga todos os dados da base de dados de desenvolvimento!
npx prisma migrate reset

# Atalho via package.json:
npm run db:reset
```

### D) Popular Dados Iniciais (Seed)
```bash
npm run db:seed
```

### E) Prisma Studio (Interface Gráfica)
```bash
npm run db:studio
```

---

## 2. Estrutura das Migrações

- `20261001000000_init/migration.sql`:
  - **10 Enums** (`UserRole`, `ProjectType`, `MaterialCategory`, `PaymentStatus`, etc.)
  - **24 Tabelas Relacionais** (`User`, `Company`, `Project`, `Material`, `Price`, `Calculation`, `Payment`, `Subscription`, etc.)
  - Índices de performance (`email`, `userId`, `projectId`, `materialId_province`, `cacheKey`, etc.)
  - Restrições de chave estrangeira (`FOREIGN KEY`) com integridade referencial em cascata (`ON DELETE CASCADE`).

---

## 3. Configuração de Ligação (`DATABASE_URL`)

Certifique-se de que a variável `DATABASE_URL` está configurada no seu ficheiro `.env.local` (nunca versionado no Git):

```env
DATABASE_URL="postgresql://user:password@ep-kizongelu-production.neon.tech/kizongelu_db?sslmode=require"
```
