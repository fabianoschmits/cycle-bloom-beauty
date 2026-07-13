# Luna — Ciclo & Bem-estar

**Luna** é um aplicativo web progressivo (PWA) para acompanhamento do ciclo menstrual, desenvolvido em português brasileiro com foco em privacidade, bem-estar e uma experiência visual cuidadosa. O app ajuda a entender as fases do ciclo, registrar o dia a dia e visualizar padrões ao longo do tempo — tudo diretamente no dispositivo, sem conta, sem servidor e sem envio de dados pessoais.

> *Acompanhe seu ciclo menstrual com elegância, privacidade e insights diários.*

---

## Sobre o projeto

O Luna nasce como um espaço tranquilo para quem menstrua e deseja acompanhar seu corpo com mais consciência. Em vez de depender de serviços em nuvem, o aplicativo armazena perfil, registros e histórico **exclusivamente no navegador** do usuário (`localStorage`), garantindo que informações sensíveis permaneçam sob controle local.

O público-alvo são pessoas que buscam:

- Previsões e contexto sobre as fases do ciclo (menstrual, folicular, ovulação e lútea)
- Um diário diário para fluxo, humor, sintomas e outros sinais corporais
- Visualizações claras de padrões e tendências ao longo dos meses
- Conteúdo educativo acessível sobre ciclo, fertilidade e bem-estar
- Privacidade por design, sem necessidade de cadastro

O aplicativo **não substitui avaliação médica**. Previsões são estimativas baseadas em médias e histórico registrado; avisos legais aparecem nas telas principais para reforçar esse limite.

---

## Funcionalidades

### Onboarding

Na primeira visita, um assistente em seis passos configura o perfil:

1. **Boas-vindas** — apresentação do Luna e compromisso com privacidade local
2. **Nome** — opcional, com formatação inteligente de capitalização
3. **Ciclo** — duração média do ciclo (20–45 dias) e do período (2–10 dias)
4. **Última menstruação** — data de início do último período
5. **Regularidade** — ciclo regular ou irregular
6. **Conclusão** — salvamento do perfil e redirecionamento para a tela principal

Usuários que ainda não concluíram o onboarding são automaticamente direcionados para esse fluxo.

### Hoje

Tela principal do app, com visão do momento atual:

- Saudação personalizada e data em português
- **Anel de ciclo** animado mostrando o dia atual, progresso e dias até a próxima menstruação
- Indicação da **fase atual** com cores e dicas de energia por fase
- **PillCard** — registro rápido de anticoncepcional oral (“Tomei agora”), horário habitual e alerta de atraso
- **Mapa de energia** — orientações contextuais para cada fase
- **Registro rápido** — atalhos para fluxo, humor, sono e atividade
- **Cápsula do próximo ciclo** — previsões de menstruação, ovulação, janela fértil e possível TPM

### Calendário

Visualização mensal navegável do ciclo:

- Grade com cores por fase: menstruação, janela fértil, ovulação e próxima menstruação prevista
- Indicadores para dias com registro de diário
- Seleção de qualquer dia para ver detalhes
- Marcação manual de menstruação no dia selecionado
- Legenda visual para interpretação rápida

### Registrar

Formulário completo de diário diário (com data selecionável, até o dia atual):

| Categoria | O que é registrado |
|-----------|-------------------|
| **Fluxo** | Escape, leve, médio ou intenso |
| **Humor** | Calma, feliz, enérgica, cansada, triste, ansiosa ou irritada |
| **Sintomas** | Cólicas, dor de cabeça, inchaço, seios sensíveis, dor nas costas, acne, náusea, cansaço, desejos |
| **Cólicas** | Intensidade de 0 a 5 |
| **Sono** | Horas de sono |
| **Atividade** | Minutos de atividade física |
| **Temperatura basal** | Em graus Celsius |
| **Relação sexual** | Ocorrência e uso de proteção |
| **Medicações** | Texto livre |
| **Anticoncepcional** | Texto livre |
| **Observações** | Campo aberto para anotações |

### Padrões (Estatísticas)

Painel analítico com base no histórico registrado:

- Duração média do ciclo, total de registros e sono médio
- Gráfico de barras com os últimos intervalos entre menstruações (até 6 ciclos)
- Distribuição de humor com barras de frequência e detalhes por dia
- Grade dos últimos 30 dias cruzando humor e fase do ciclo (com navegação por teclado)
- Ranking dos sintomas mais frequentes

As correlações apresentadas são **observacionais** — ajudam a perceber tendências, mas não constituem diagnóstico.

### Aprender

Biblioteca educativa com artigos em formato de acordeão:

1. **As quatro fases do ciclo** — fundamentos do ciclo menstrual
2. **Janela fértil, sem mistério** — como entender a fertilidade
3. **TPM: por que acontece** — bem-estar emocional e hormonal
4. **Ciclos irregulares** — quando e como observar variações
5. **Temperatura basal como sinal** — uso da temperatura como ferramenta de acompanhamento

### Configurações

Área de personalização e gestão de dados:

- **Perfil** — nome, duração do ciclo/período e regularidade
- **Aparência** — tema claro ou escuro (respeita preferência do sistema)
- **Lembretes** — horário diário configurável (interface preparada; notificações push ainda não implementadas)
- **Backup local** — exportar e importar todos os dados em JSON
- **Zona sensível** — apagar todos os dados e reiniciar o onboarding

### PWA e experiência mobile

O Luna foi pensado como aplicativo instalável:

- Layout **mobile-first** com suporte a safe areas e viewport adaptativo
- Modo **standalone** em tela cheia, orientação retrato
- **Service worker** para cache e uso offline, com página de fallback quando não há conexão
- Banner de instalação com instruções contextuais por sistema operacional e navegador
- Feedback tátil (`navigator.vibrate`) em ações como tomar ou desfazer registro de anticoncepcional

---

## Privacidade

A privacidade é um pilar central do Luna:

- **Sem conta** — não há login, cadastro ou autenticação
- **Sem backend de dados** — perfil, logs e períodos nunca são enviados a um servidor
- **Armazenamento local** — todas as informações ficam no `localStorage` do navegador
- **Backup sob controle do usuário** — exportação e importação manual em JSON
- **Exclusão completa** — opção de apagar todos os dados a qualquer momento

Chaves de armazenamento utilizadas:

| Chave | Conteúdo |
|-------|----------|
| `luna.profile.v1` | Perfil do usuário |
| `luna.logs.v1` | Registros diários por data |
| `luna.periods.v1` | Dias com fluxo menstrual |
| `luna.pill.v1` | Registros de anticoncepcional oral |
| `luna.theme` | Preferência de tema |
| `luna.reminder` | Horário de lembrete |

---

## Como o ciclo é calculado

A lógica de domínio fica isolada em `src/lib/cycle/` e opera de forma determinística sobre os dados locais:

### Detecção de períodos

A partir dos dias com fluxo registrados, o sistema identifica **inícios de menstruação** quando há um intervalo de dois ou mais dias sem fluxo entre registros consecutivos.

### Duração média do ciclo

Com pelo menos dois inícios de período no histórico, calcula-se a média dos intervalos entre eles (considerando apenas gaps entre 15 e 60 dias). Caso contrário, usa-se a duração informada no perfil (padrão: 28 dias).

### Fases e previsões

Com base no último início de período e na duração do ciclo, o app determina:

- **Fase atual** — menstrual, folicular, ovulação ou lútea
- **Dia do ciclo** — posição no ciclo corrente
- **Próxima menstruação** — data prevista e dias restantes
- **Ovulação** — estimada como 14 dias antes do fim do ciclo
- **Janela fértil** — do 5º dia antes da ovulação até 1 dia depois
- **Janela de TPM** — dos 5 dias anteriores à próxima menstruação

Cada fase traz label, dica contextual e orientação de energia em português.

### Anticoncepcional oral

O módulo de pílula registra horário de cada dose, calcula o horário habitual com base nos últimos 30 registros e sinaliza atraso quando aplicável.

---

## Arquitetura

```
src/
├── routes/           # Páginas (roteamento baseado em arquivos)
│   ├── index.tsx     # Hoje
│   ├── onboarding.tsx
│   ├── calendar.tsx
│   ├── log.tsx
│   ├── stats.tsx
│   ├── learn.tsx
│   ├── settings.tsx
│   └── __root.tsx    # Shell global (tema, navegação, PWA)
├── components/       # UI reutilizável (Screen, BottomNav, PillCard, shadcn/ui)
├── hooks/
│   └── useLuna.ts    # Hook central de estado e insights
└── lib/
    └── cycle/        # Domínio: tipos, storage, cálculos, pílula
```

### Rotas

| Rota | Tela |
|------|------|
| `/` | Hoje |
| `/onboarding` | Configuração inicial |
| `/calendar` | Calendário |
| `/log` | Registrar |
| `/stats` | Padrões |
| `/learn` | Aprender |
| `/settings` | Configurações |

A navegação inferior fixa oferece acesso rápido às cinco telas principais, com o botão **Registrar** em destaque no centro.

### Estado e reatividade

O hook `useLuna` centraliza leitura do perfil, logs e dias de período, e expõe o `CycleInsight` computado. Após qualquer alteração nos dados, um evento customizado (`luna:update`) sincroniza todos os componentes — sem API remota e sem banco de dados externo.

### Separação de responsabilidades

- **`lib/cycle/types.ts`** — tipos TypeScript do domínio
- **`lib/cycle/storage.ts`** — leitura e escrita no `localStorage`
- **`lib/cycle/calculations.ts`** — lógica de fases, previsões e médias
- **`lib/cycle/pill.ts`** — registro e análise de anticoncepcional oral
- **Rotas e componentes** — consomem o domínio via `useLuna`, sem lógica de negócio acoplada à UI

---

## Tecnologias

| Camada | Tecnologia |
|--------|------------|
| Framework | [TanStack Start](https://tanstack.com/start) (SSR) + [TanStack Router](https://tanstack.com/router) |
| UI | React 19, TypeScript |
| Estilo | Tailwind CSS v4, [shadcn/ui](https://ui.shadcn.com) (Radix UI) |
| Animações | Framer Motion |
| Datas | date-fns (locale pt-BR) |
| Build | Vite 8, Nitro |
| PWA | vite-plugin-pwa + Workbox |
| Ícones | Lucide React |
| Tipografia | Fraunces (títulos) + Inter (interface) |

---

## Design e identidade visual

O Luna adota uma estética **warm ivory** — tons quentes de marfim (`#faf7f2`), rosa e terracota como cor primária, com variações de cor para cada fase do ciclo. A interface usa glass morphism na barra de navegação, animações suaves com easing personalizado e suporte completo a tema escuro com contraste acessível.

O tom de comunicação é acolhedor e direto, sempre em **português brasileiro**, com disclaimers médicos posicionados de forma clara nas telas de previsão, estatísticas e conteúdo educativo.

---

## Aviso importante

O Luna é uma ferramenta de acompanhamento pessoal e educação em saúde menstrual. **Não substitui consulta, diagnóstico ou tratamento médico.** Previsões de ciclo, janela fértil e correlações em estatísticas são estimativas e observações — não devem ser usadas como único método contraceptivo ou para decisões clínicas.

---

## Licença

Consulte o arquivo de licença do repositório para os termos de uso e distribuição.
