export type FieldHelpId =
  | "flow"
  | "mood"
  | "symptoms"
  | "cramps"
  | "sleep"
  | "activity"
  | "weight"
  | "basalTemp"
  | "sex"
  | "medications"
  | "notes"
  | "cycleLength"
  | "periodLength"
  | "lastPeriod"
  | "regularity"
  | "reminder";

export const fieldHelp: Record<FieldHelpId, { title: string; body: string }> = {
  flow: {
    title: "Fluxo menstrual",
    body: `Indica a intensidade do sangramento neste dia. Isso ajuda a marcar o calendário e calcular a duração do período.

• Escape — pequenas manchas ou gotas
• Leve — absorvente leve por algumas horas
• Médio — fluxo moderado, troca regular
• Intenso — fluxo forte, troca frequente`,
  },
  mood: {
    title: "Humor",
    body: `Registra como você se sentiu emocionalmente hoje. O humor pode variar conforme a fase do ciclo — registrar ajuda a perceber padrões ao longo do tempo.

Toque no emoji que mais combina com o seu dia. Você pode alterar a qualquer momento.`,
  },
  symptoms: {
    title: "Sintomas",
    body: `Marque os sinais físicos que você sentiu hoje. É comum ter sintomas diferentes em cada fase do ciclo.

Selecione todos que se aplicam. Eles aparecem nas estatísticas para você acompanhar o que mais se repete.`,
  },
  cramps: {
    title: "Intensidade das cólicas",
    body: `Escala de 0 a 5 para medir a força das cólicas menstruais:

0 — sem cólicas
1–2 — leves, incômodo tolerável
3 — moderadas, afetam um pouco a rotina
4–5 — fortes, com dor significativa

Se as cólicas forem muito intensas ou frequentes, converse com um profissional de saúde.`,
  },
  sleep: {
    title: "Sono",
    body: `Quantas horas você dormiu na noite anterior (ou no período principal de descanso).

O sono costuma mudar ao longo do ciclo — especialmente na TPM e na menstruação. Registrar ajuda a correlacionar cansaço com as fases.`,
  },
  activity: {
    title: "Atividade física",
    body: `Minutos de movimento intencional no dia: caminhada, yoga, academia, dança, etc.

Não precisa ser exercício intenso — qualquer atividade que você considere relevante vale. Útil para entender como a energia varia no ciclo.`,
  },
  weight: {
    title: "Peso corporal",
    body: `Seu peso em quilogramas (kg) no dia do registro.

É normal haver pequenas variações de peso ao longo do ciclo por retenção de líquidos, especialmente antes da menstruação. O acompanhamento diário ajuda a observar tendências — não substitui avaliação médica.`,
  },
  basalTemp: {
    title: "Temperatura basal",
    body: `Temperatura medida ao acordar, ainda deitada, antes de levantar ou fazer esforço — em graus Celsius (°C).

Após a ovulação, ela costuma subir cerca de 0,2 a 0,5 °C e permanecer elevada até a próxima menstruação. Medir sempre no mesmo horário melhora a consistência dos dados.`,
  },
  sex: {
    title: "Relação sexual",
    body: `Registro opcional e privado. Ative se houve relação sexual neste dia.

Em versões futuras você poderá indicar uso de proteção. Os dados ficam apenas no seu dispositivo.`,
  },
  medications: {
    title: "Medicações",
    body: `Remédios que você tomou hoje, separados por vírgula.

Exemplos: ibuprofeno para cólica, antialérgico, vitamina D. Útil para lembrar o que usou em dias com sintomas mais intensos.`,
  },
  notes: {
    title: "Observações",
    body: `Espaço livre para anotar qualquer coisa sobre o dia: como se sentiu, eventos, alimentação, estresse ou lembretes para você mesma.

Tudo fica salvo localmente no calendário deste dia.`,
  },
  cycleLength: {
    title: "Duração média do ciclo",
    body: `Número de dias do primeiro dia de uma menstruação até o dia anterior da próxima menstruação.

A média mais comum é 28 dias, mas ciclos entre 21 e 35 dias também podem ser normais. O Luna usa esse valor para previsões quando ainda há pouco histórico.`,
  },
  periodLength: {
    title: "Duração média do período",
    body: `Quantos dias você costuma menstruar — do primeiro dia com fluxo até o último dia com fluxo.

A maioria das pessoas fica entre 3 e 7 dias. Ajuste conforme a sua experiência habitual.`,
  },
  lastPeriod: {
    title: "Última menstruação",
    body: `Data em que começou o seu último período (primeiro dia com fluxo).

É o ponto de partida para calcular em que fase do ciclo você está hoje e estimar a próxima menstruação.`,
  },
  regularity: {
    title: "Regularidade do ciclo",
    body: `Regular — seus ciclos variam pouco (por exemplo, entre 26 e 30 dias).

Irregular — as durações mudam bastante ou são difíceis de prever.

Isso não é diagnóstico; apenas ajuda o app a contextualizar as previsões.`,
  },
  reminder: {
    title: "Lembrete diário",
    body: `Horário em que você gostaria de ser lembrada a registrar o dia ou tomar a pílula.

A notificação push ainda está em desenvolvimento — por enquanto o horário fica salvo para quando o recurso estiver ativo.`,
  },
};
