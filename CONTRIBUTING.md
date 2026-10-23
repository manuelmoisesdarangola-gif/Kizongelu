# Guia de Contribuição — Kizongelu

Agradecemos o seu interesse em contribuir para o **Kizongelu**, a plataforma SaaS de referência para engenharia e construção civil na República de Angola.

---

## 1. Princípios e Normas do Projeto

1. **Determinismo em Engenharia**: Fórmulas de cálculo não utilizam números mágicos. Todos os coeficientes de consumo de betão, aço e cofragem devem referenciar as normas oficiais (LNEC, REBAP ou regulamentos vigentes em Angola).
2. **Contexto Angolano**: Todos os preços e termos devem refletir a prática local de Luanda, Benguela, Huambo e restantes províncias (ex.: Multicaixa Express, Kwanzas `Kz`, cimento Portland 42.5R, blocos de betão 15 e 20).
3. **Mobile-First Real**: Mais de 70% dos acessos de encarregados e mestres de obra em Angola ocorrem via smartphones (Unitel, Africell). Áreas de toque mínimas de 48px, inputs de 48px e navegação simplificada são obrigatórias.
4. **Acessibilidade WCAG 2.1 AA**: Todos os elementos interativos requerem foco visível, contraste adequado e navegação fluida por teclado.

---

## 2. Fluxo de Trabalho Git

1. Faça fork do repositório ou crie uma branch semântica:
   * `feat/nome-da-funcionalidade`
   * `fix/correcao-de-bug`
   * `perf/otimizacao-de-performance`
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Execute o ambiente de desenvolvimento local:
   ```bash
   npm run dev
   ```
4. Verifique a conformidade de TypeScript e Linting:
   ```bash
   npm run lint
   ```
5. Execute os testes unitários e E2E:
   ```bash
   npx playwright test
   ```

---

## 3. Padrões de Código

* **TypeScript Estrito**: Sem uso desnecessário de `any`.
* **Componentes Funcionais com React 19**: Hooks modernos e composição limpa.
* **Tailwind CSS**: Estilos utilitários consistentes com o Design System Kizongelu.
* **Internacionalização**: Novos textos estáticos devem ser adicionados a `lib/i18n/pt.ts`.

---

## 4. Submissão de Pull Request

* Descreva claramente o objetivo da alteração e o impacto nos utilizadores.
* Anexe capturas de ecrã ou gravação em caso de alterações visuais.
* Garanta que todos os testes automatizados foram executados com sucesso.
