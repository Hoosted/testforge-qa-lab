# TestForge AGENTS

## Visao
TestForge e um playground modular para QAs praticarem automacao de UI, API, autenticacao/autorizacao e acessibilidade em cenarios repetiveis, realistas e controlados.

Este arquivo e a fonte de verdade do projeto. `README.md`, issues, sketches e outros docs podem resumir ou expandir pontos especificos, mas nao devem contradizer o que esta definido aqui.

## Produto
### Publico-alvo
- QAs em transicao do manual para o automatizado
- pessoas montando portfolio de qualidade
- devs e QAs que precisam de um sandbox previsivel para demonstrar estrategias de teste

### Problema que resolvemos
- muitos playgrounds sao superficiais demais
- apps reais sao grandes demais para estudo guiado
- cenarios instaveis atrapalham automacao reprodutivel

### Promessa do produto
- cada lab precisa oferecer um desafio realista
- cada fluxo precisa ser deterministicamente reproduzivel
- cada estado relevante precisa ser observavel por UI, rede ou contrato

### Criterios de sucesso
- um QA consegue abrir o projeto e entender rapidamente o que treinar
- os labs podem ser automatizados sem depender de aleatoriedade
- os cenarios principais ficam claros na propria interface
- o primeiro contato visual transmite “laboratorio de pratica”, nao “dashboard genérico”

## Escopo da v1
### Incluido
- app unico com `React + TypeScript + Vite`
- linguagem inicial em PT-BR
- catalogo com 4 labs navegaveis
- `Advanced Form Lab` como primeiro lab funcional de ponta a ponta
- `Auth Lab`, `API Lab` e `Accessibility Lab` como superficies navegaveis e tipadas
- API fake com `MSW`
- seeds fixas e cenarios deterministas
- suite minima de testes de unidade/componente
- base preparada para E2E e auditoria de acessibilidade

### Fora da v1
- backend real
- banco de dados
- autenticacao externa
- Docker
- monorepo, workspaces e pacotes compartilhados
- internacionalizacao completa
- modo dark como prioridade inicial

## Stack Oficial
- `React 19`
- `TypeScript`
- `Vite`
- `React Router`
- `TanStack Query`
- `React Hook Form + Zod`
- `MSW`
- `Vitest + Testing Library`
- `Playwright + axe-core/playwright`

### Rationale curto
- stack leve para iterar rapido
- contratos tipados mesmo sem backend real
- experiencia local e em deploy funcionando do mesmo jeito
- evolucao futura para API real sem trocar a experiencia principal

## Arquitetura-Alvo
### Estrutura
- `src/app`: bootstrap, roteamento, providers e shell
- `src/data`: conteudo estatico e definicoes dos labs
- `src/features`: cada lab e cada superficie principal do produto
- `src/mocks`: handlers, browser worker e seeds
- `src/types`: contratos e tipos compartilhados
- `src/lib`: helpers reutilizaveis sem acoplamento de UI
- `src/test`: setup comum de testes

### Principios
- UI separada da simulacao de dados
- cenarios definidos em dados tipados, nao espalhados em componentes
- contratos compartilhados entre componentes, handlers e testes
- cada lab deve ser consumivel por uma pessoa e por uma suite automatizada

## Modelo dos Labs
### Interfaces obrigatorias
```ts
export interface LabDefinition {
  id: string;
  slug: string;
  title: string;
  summary: string;
  difficulty: 'fundamentos' | 'intermediario' | 'avancado';
  status: 'ready' | 'alpha';
  estimatedTime: string;
  skills: string[];
  route: string;
}

export interface ScenarioDefinition {
  id: string;
  labId: string;
  title: string;
  expectedBehavior: string;
  seedKey: string;
  tags: string[];
}

export interface MockContract<TRequest, TResponse> {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  requestExample?: TRequest;
  responseExample: TResponse;
  errorStatuses: number[];
}

export interface ChallengeGuide {
  labId: string;
  goals: string[];
  successCriteria: string[];
  notes: string[];
}
```

### Regras para labs
- cada lab tem uma pagina propria
- cada lab declara cenarios em dados, nao em strings avulsas
- cada lab precisa ter estado `ready` ou `alpha`
- cada lab precisa explicar o que praticar e como validar sucesso

## UX e UI
### Direcao
Editorial tecnica com atmosfera de laboratorio moderno.

### Tipografia
- headlines: `Sora`
- corpo, navegacao, formularios e tabelas: `Inter`
- monospace: apenas para seeds, contratos, trechos de codigo e estados tecnicos

### Escala tipografica
- display: 64/56/48 responsivo
- h1: 48
- h2: 32
- h3: 24
- h4: 18
- body: 16
- small/meta: 14

### Cor
- base clara quente: `sand / off-white`
- texto: `ink / navy charcoal`
- acento principal: `teal`
- estados de erro e aviso devem manter contraste AA

### Tokens iniciais
- `--bg`: fundo principal claro e quente
- `--surface`: blocos solidos claros
- `--surface-strong`: areas de interacao destacadas
- `--ink`: texto principal
- `--muted`: texto de apoio
- `--teal`: acao primaria
- `--teal-soft`: apoio visual e focus ring
- `--line`: divisores e bordas discretas
- `--danger`: mensagens de falha

### Principios visuais
- evitar cara de dashboard SaaS
- usar blocos solidos e divisores antes de “cards por todo lado”
- primeira dobra com composicao forte e hierarquia nitida
- cada secao deve ter uma funcao clara
- contraste e foco visivel sao obrigatorios

### Spacing
- ritmo base em multiplos de 4
- espacamentos mais comuns: 8, 12, 16, 24, 32, 48, 72
- secoes principais com respiro generoso

### Interacao e motion
- motion curta e funcional
- uma animacao de entrada por secao basta
- estados de loading, success e error precisam ser nitidos
- respeitar `prefers-reduced-motion`

### Acessibilidade
- foco sempre visivel
- landmarks claros
- labels e erros associados aos campos
- componentes acionaveis via teclado
- texto e superficie com contraste AA ou melhor

## Dados e Mocking
### Estrategia
- `MSW` e a fonte de verdade da API na v1
- seeds fixas devem produzir respostas previsiveis
- nenhum fluxo critico deve depender de aleatoriedade

### Regras
- handlers devem consumir e devolver tipos compartilhados
- cenarios de falha precisam ser acionaveis de forma explicita
- erros suportados pela v1: `400`, `401`, `403`, `404`, `409`, `500`
- testes e UI devem apontar para as mesmas chaves de cenario

## Labs da v1
### Advanced Form Lab
- primeiro lab completo
- precisa cobrir wizard, validacao sincronica, validacao assincrona, campos condicionais, repetiveis, estados HTTP e guardas por perfil

### Auth Lab
- login, logout, sessao expirada e diferenca entre `ADMIN` e `OPERATOR`

### API Lab
- visualizar contratos mockados e disparar requests previsiveis

### Accessibility Lab
- orientar pratica de foco, landmarks, erros de formulario, teclado e feedback dinamico

## Testes
### Minimo obrigatorio
- schemas validados por teste unitario
- pelo menos um teste de componente para o primeiro lab
- base preparada para E2E

### Criterios
- testes devem usar linguagem de comportamento
- preferir queries acessiveis antes de `data-testid`
- `data-testid` so quando o elemento nao tiver seletor semantico estavel

## Contribuicao
- novas decisoes devem atualizar este arquivo primeiro
- novos labs precisam nascer com `LabDefinition`, cenarios e guia
- evite aumentar stack sem necessidade clara
- se um novo recurso conflitar com esta fonte de verdade, ajuste o `AGENTS.md` na mesma entrega

## Evolucao futura
- uma API real pode substituir `MSW`, desde que preserve contratos
- um backend futuro nao deve forcar retorno a monorepo sem motivo forte
- documentacao satelite pode crescer, mas este arquivo continua como referencia principal
