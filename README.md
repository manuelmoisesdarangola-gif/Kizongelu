# Kizongelu — Orçamentação e Mapas de Quantidades para Obras em Angola

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.x-61dafb.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4.x-38bdf8.svg)](https://tailwindcss.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Compliant-success.svg)](https://web.dev/progressive-web-apps/)
[![WCAG](https://img.shields.io/badge/WCAG-2.1_AA-green.svg)](https://www.w3.org/WAI/standards-guidelines/wcag/)

O **Kizongelu** é a primeira plataforma SaaS de engenharia orçamental concebida de raiz para a realidade da construção civil na República de Angola. Substitui estimativas empíricas por um **motor de cálculo determinístico e auditável (v3.2)**, alinhado com as normas LNEC, REBAP e as práticas dos estaleiros de Luanda, Benguela, Huambo e restantes províncias.

---

## 🏗 Principais Funcionalidades

* **Motor Determinístico de Quantidades (v3.2)**: Decomposição matemática transparente em 5 capítulos (Fundações, Estrutura em Betão Armado, Alvenarias, Cobertura e Acabamentos).
* **Observatório Nacional de Preços**: Monitorização de preços de materiais (cimento 42.5R, varão de aço nervurado, areia, brita, blocos de betão) em 8 províncias com fornecedores reais (Nova Cimangola, Caxito, Secil Lobito, etc.).
* **PWA & Modo Offline**:
  * Funcionalidade completa como Progressive Web App instalável no Android, iOS e Desktop.
  * Estratégia de cache inteligente (Cache-first para assets, Network-first para APIs) e página dedicada `/offline.html`.
  * Banner nativo *"Instalar no telemóvel"* após 2 visitas.
* **Mobile-First Real**:
  * Altura mínima de 48px para inputs e botões secundários; 56px para botões primários.
  * Bottom nav persistente em ecrãs móveis autenticados com botão de ação flutuante (FAB) *"Novo Orçamento"*.
  * Modais em ecrã inteiro no mobile e gavetas inferiores (*Bottom Sheets*) para ações contextuais.
* **Modo Escuro & Acessibilidade (WCAG 2.1 AA)**:
  * Suporte nativo a `prefers-color-scheme` e seletor manual em Definições com tokens de alto contraste.
  * Navegação por teclado completa com link *"Saltar para o conteúdo principal"*, anéis de foco visíveis e etiquetas `aria-label`.
* **Emissão de Orçamento em PDF Auditado**:
  * Marca de água criptográfica, QR Code de validação pública e selo técnico assinado pelo engenheiro com cédula da OEA.
* **Pagamentos Nacionais**:
  * Suporte a Multicaixa Express (Entidade/Referência) e transferências bancárias com verificação de comprovativos.

---

## 📂 Arquitetura do Projeto

```
kizongelu/
├── app/                       # Páginas da Aplicação e Rotas Internas
│   └── (app)/                 # Rotas autenticadas (painel, projetos, wizard, etc.)
├── components/                # Componentes reutilizáveis
│   └── ui/                    # Design System (button, input, modal, bottom-sheet, etc.)
├── lib/
│   ├── calculation-engine/    # Motor de cálculo determinístico v3.2
│   ├── i18n/                  # Internacionalização (pt.ts ativo, en.ts preparado)
│   ├── monitoring/            # Sentry, Vercel Analytics, Logger e Uptime
│   ├── pdf/                   # Geração de PDFs técnicos com React-PDF
│   └── notifications/         # Web Push, In-App e Email
├── public/                    # Assets estáticos, manifest.json, sw.js, offline.html, ícones
├── src/                       # Layouts, Contextos e Componentes Centrais
│   ├── auth/                  # Contexto e Guards de Autenticação (RBAC)
│   ├── context/               # ThemeContext (Dark Mode), ToastContext
│   ├── hooks/                 # usePWAInstall, useVirtualKeyboard
│   └── layouts/               # PublicLayout, AppLayout, AdminLayout
├── tests/
│   ├── e2e/                   # Testes Playwright (fluxo completo, subscrição, QR)
│   └── unit/                  # Testes unitários do motor de cálculo
├── DEPLOY.md                  # Guia de implantação em produção (Vercel + Neon)
└── CONTRIBUTING.md            # Guia de contribuição
```

---

## 🚀 Como Executar Localmente

### 1. Pré-requisitos
* Node.js >= 20.x
* npm ou bun

### 2. Instalação
```bash
# Clonar o repositório
git clone https://github.com/empresa/kizongelu.git
cd kizongelu

# Instalar dependências
npm install
```

### 3. Configurar Variáveis de Ambiente
Copie o ficheiro `.env.example` para `.env` e ajuste as credenciais:
```bash
cp .env.example .env
```

### 4. Executar Servidor de Desenvolvimento
```bash
npm run dev
```
Aceda a `http://localhost:3000` no seu navegador.

---

## 🧪 Testes Automatizados

### Testes de Sintaxe e TypeScript
```bash
npm run lint
```

### Testes End-to-End (Playwright)
```bash
# Executar todos os testes E2E
npx playwright test

# Executar em modo interactivo com UI
npx playwright test --ui
```

---

## 🚢 Deploy em Produção

Consulte o documento detalhado [DEPLOY.md](./DEPLOY.md) para instruções completas de configuração no **Vercel** e **Neon PostgreSQL**, incluindo políticas de backup e certificados SSL para `kizongelu.ao`.

---

## 📄 Licença e Propriedade

Desenvolvido para o mercado de construção civil de Angola. Todos os direitos reservados © 2026 Kizongelu.
