`# 🏢 Employee Hub - Gestão de Contratos

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Zod](https://img.shields.io/badge/zod-%233068b7.svg?style=for-the-badge&logo=zod&logoColor=white)

Aplicação desenvolvida como resolução do desafio técnico para cadastro de profissionais e automação de alertas de vencimento de contratos.

## 📌 1. Visão Geral do Projeto

O objetivo deste projeto é fornecer uma interface corporativa, limpa e resiliente a erros para o RH gerenciar funcionários. O sistema conta com validações estritas de formulário, listagem com busca otimizada, paginação e indicadores visuais dinâmicos de status baseados nas datas de vencimento.

**Stack Tecnológico:**
* **Front-end:** React, TypeScript, Tailwind CSS, shadcn/ui.
* **Validação de Dados:** React Hook Form + Zod.
* **Automação de E-mail:** [n8n / Make] *(Documentação da automação na seção 4)*.

---

## 🧠 2. Pensamento Crítico e Decisões de Arquitetura

1. **Separação de Responsabilidades :** A lógica de manipulação de dados não foi misturada aos componentes visuais. Foi criado um Custom Hook (`useEmployees`) para gerenciar o estado da aplicação e uma camada de serviço mockada (`employeeService`) utilizando `localStorage` e `crypto.randomUUID()`.
2. **Lifting State Up :** Para garantir a reatividade imediata entre o `EmployeeForm` e a `EmployeeTable` (sem necessidade de reload), o estado foi centralizado no componente pai (`Index.tsx`), garantindo uma Fonte Única de Verdade (Single Source of Truth).
3. **Validação Cross-Field Segura:** Utilizando Zod, foi implementada uma regra estrita com `.refine()` que obriga a Data de Vencimento a ser cronologicamente posterior à Data de Início, bloqueando a submissão e prevenindo corrupção de dados no banco.
4. **Padronização de Timezone (UTC):** Todas as datas inseridas pelo usuário são convertidas para UTC na camada de utilitários (`dateUtils`) antes de serem salvas. Isso previne bugs críticos de fuso horário quando a automação (cron job) for realizar cálculos de dias restantes.
5. **Performance e UX:** * Implementação de **Debounce (300ms)** no input de busca para evitar renderizações desnecessárias.
    * **Empty States** e **Loading Skeletons** para melhorar o feedback visual do usuário.
    * Cálculos de *Badges* (Ativo, Expirando, Expirado) feitos em tempo de execução para garantir dados sempre atualizados.

---

## 🤖 3. Engenharia de Prompts (Uso de IA)

Para o desenvolvimento inicial acelerado, utilizei a ferramenta Lovable. Em vez de prompts genéricos de "crie uma tela", adotei uma metodologia de **Engenharia de Prompt Estruturada baseada em PRD (Product Requirements Document)**. 

**Estratégia Iterativa Utilizada:**
1. **Prompt 1 (Fundação e Tipagem):** 
[Identity & Tech Stack] Atue como um Arquiteto de Software Sênior construindo um sistema em React, TypeScript e Tailwind (shadcn/ui).
[Project Structure] Crie uma estrutura de pastas estritamente organizada: src/components, src/types, src/services, src/utils, src/hooks e src/pages.
[Data & Types] Em src/types/employee.ts, defina a interface Employee contendo: id (string), fullName (string), email (string), jobTitle (string), startDate (string ISO) e expirationDate (string ISO). Não adicione campo de status aqui. Defina Department explicitamente como um String Enum (ex: TI = "TI", RH = "RH", Marketing = "Marketing", Vendas = "Vendas"). Adicione os opcionais phone e notes.
[Service Layer & Utils] Em src/services/employeeService.ts, crie os métodos mockados (via LocalStorage) para createEmployee, listEmployees, updateEmployee, deleteEmployee. Use crypto.randomUUID() para gerar o ID na criação. Em src/utils/dateUtils.ts, crie utilitários de data. Regra de Ouro: Adicione uma função toUTC(date: Date) e garanta que todas as datas sejam convertidas e salvas em UTC. Crie também uma função getEmployeeStatus(expirationDate) que retorne 'Active', 'Expiring Soon' (<= 5 dias) ou 'Expired'..

2. **Prompt 2 (Camada de Estado):** 
[Identity] Atue como um Desenvolvedor React Sênior.
[Core Features] Crie um custom hook robusto em src/hooks/useEmployees.ts para abstrair toda a comunicação com o employeeService.
[State Management] O hook deve gerenciar de forma limpa os estados de employees (array de Employee), isLoading (boolean) e error (string | null).
[Actions] Exporte as funções fetchEmployees, addEmployee, editEmployee e removeEmployee. Quando addEmployee for chamada, ela deve acionar o service correspondente, lidar com os estados de loading/error e, em seguida, atualizar o estado local de employees automaticamente, mantendo a reatividade da UI sem precisar recarregar a página.

3. **Prompt 3 (Formulário Blindado):** 
[Identity] Atue como um Engenheiro Front-end focado em UX e formulários robustos.
[Core Features] Crie o componente src/components/employee-form.tsx integrando o nosso hook useEmployees. Use react-hook-form em conjunto com zod para a validação.
[Validation Logic] Valide o formato do e-mail de forma estrita. Para as datas, implemente validação cross-field obrigatória usando .refine() do Zod: a expirationDate DEVE ser estritamente posterior à startDate. Se houver erro de data, bloqueie o envio e exiba a mensagem em vermelho vivo abaixo do campo.
[UX States] Use o estado isLoading do hook para mostrar um spinner de carregamento no botão "Salvar". Após o sucesso da submissão, limpe o formulário completamente e mostre um Toast Notification (shadcn/ui) amigável de sucesso.

4. **Prompt 4 (Listagem Avançada):**
[Core Features] Crie a view src/components/employee-table.tsx consumindo os dados através do hook useEmployees. O design deve ser limpo e corporativo.
[Performance & Filtering] Adicione um input de busca por nome/e-mail com um debounce obrigatório de 300ms (use um custom hook ou utilitário para isso). Adicione também um dropdown (Select) para filtrar pelo Enum de Departamento.
[Sorting & Pagination] A tabela deve permitir ordenação (Sorting) clicando nos cabeçalhos das colunas de "Nome" e "Data de Vencimento". Implemente paginação client-side limitando a 10 registros por página.
[UX & UI States] Mostre Loading Skeletons elegantes enquanto isLoading for true. Crie um Empty State bonito (com ícone e texto de encorajamento) caso não haja dados ou a busca não encontre nada.
[Expiration Badge UI] Na coluna Status da tabela, importe a função getEmployeeStatus para calcular o status visual em tempo real. Exiba utilizando os Badges do shadcn/ui: 'Active' = Badge Verde, 'Expiring Soon' = Badge Amarelo, 'Expired' = Badge Vermelho.

5. **Prompt 5: Lógica do Workflow de E-mail:**
[Contexto] Estou criando uma automação no plano gratuito do Make para um sistema de gestão de contratos.
[Trigger & Fetch] A automação roda diariamente via Schedule. O primeiro nó será um "Parse JSON" simulando meu banco de dados com um array de objetos contendo os campos nome, emailGestor, departamento e dataVencimento (formato YYYY-MM-DD).
[Business Logic] Como o Parse JSON já itera automaticamente listas iniciadas com [ ], explique como configurar um Filtro nativo no Make conectando o JSON diretamente à ação final. A condição do filtro deve garantir que o e-mail não seja enviado repetidamente nos dias anteriores. Forneça a fórmula matemática exata do Make para comparar a dataVencimento estritamente com a data de HOJE + 5 dias.
[Action] Explique como mapear as variáveis extraídas do JSON no nó do Gmail para enviar o alerta formatado em HTML para o responsável.

**Prompt 6: Geração de Dados de Teste (Edge Cases):**
[Contexto] Preciso de um Mock Payload para colar no nó "Parse JSON" do Make e testar o filtro estrito de 5 dias.
[Ação] Gere um array JSON com 3 funcionários falsos para cobrir os seguintes cenários:

Um contrato que expira no dia de hoje (Deve ser ignorado pelo filtro).

Um contrato que vence daqui a exatamente 5 dias (Este é o único que o filtro deve aprovar).

Um contrato que vence no mês que vem (Deve ser ignorado pelo filtro).
Retorne apenas o código JSON limpo para eu colar no Make, utilizando datas relativas ao dia de hoje.

---

## ⚙️ 4. Lógica de Automação (Alertas de Vencimento)


---

## 🚀 5. Como Executar Localmente

Siga os passos abaixo para rodar a aplicação em sua máquina:

1. Clone o repositório:
   ```bash
   git clone https://github.com/tuzzooz/desafio-gestao-contratos.git`

1. Acesse a pasta do projeto:Bash
    
    `cd desafio-gestao-contratos`
    
2. Instale as dependências:Bash
    
    `npm install`
    
3. Inicie o servidor local:Bash
    
    `npm run dev`

## 📸 6. Demonstração Visual
