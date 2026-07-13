import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { Screen, ScreenSection } from "@/components/Screen";
import { useRegisterPWA } from "@/hooks/useRegisterPWA";
import { ChevronDown } from "lucide-react";

export const Route = createFileRoute("/learn")({
  component: LearnPage,
});

const articles = [
  {
    title: "As quatro fases do ciclo",
    tag: "Fundamentos",
    body: `Seu ciclo tem quatro fases principais: menstrual, folicular, ovulatória e lútea.
Cada uma é regulada por hormônios diferentes e traz mudanças na energia, humor,
sono e pele. Entender essas mudanças ajuda a planejar melhor sua rotina.`,
  },
  {
    title: "Janela fértil, sem mistério",
    tag: "Fertilidade",
    body: `A janela fértil geralmente cobre os cinco dias antes da ovulação e o próprio dia
da ovulação. Espermatozoides sobrevivem até cinco dias no trato reprodutivo,
por isso o cálculo é uma estimativa — não um método contraceptivo.`,
  },
  {
    title: "TPM: por que acontece",
    tag: "Bem-estar",
    body: `Na fase lútea os níveis de progesterona sobem e depois caem rapidamente,
causando sintomas físicos e emocionais em muitas pessoas. Sono regular,
exercício leve e redução de cafeína costumam ajudar.`,
  },
  {
    title: "Ciclos irregulares",
    tag: "Saúde",
    body: `Estresse, viagens, exercício intenso, alterações de peso e algumas condições
médicas podem alterar o ciclo. Se as variações forem grandes e persistentes,
converse com um profissional de saúde.`,
  },
  {
    title: "Temperatura basal como sinal",
    tag: "Ferramentas",
    body: `Após a ovulação, a temperatura basal sobe ligeiramente (0,2–0,5 °C) e permanece
elevada até a próxima menstruação. Medir sempre no mesmo horário, ao acordar,
melhora a precisão dos padrões observados.`,
  },
];

function LearnPage() {
  useRegisterPWA();
  return (
    <Screen subtitle="Aprender" title="Saúde menstrual">
      <ScreenSection>
        <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
          Conteúdo educativo curado para você entender melhor seu corpo. Textos
          introdutórios — para dúvidas específicas, procure um profissional de saúde.
        </p>
      </ScreenSection>
      <div className="space-y-3">
        {articles.map((a, i) => (
          <ScreenSection key={a.title}>
            <Article article={a} index={i} />
          </ScreenSection>
        ))}
      </div>
    </Screen>
  );
}

function Article({ article, index }: { article: (typeof articles)[number]; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      layout
      className="overflow-hidden rounded-3xl border border-border/60 bg-card"
    >
      <motion.button
        whileTap={{ scale: 0.99 }}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 p-5 text-left"
      >
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">{article.tag}</div>
          <h3 className="mt-1 font-display text-lg text-foreground">{article.title}</h3>
        </div>
        <motion.span animate={{ rotate: open ? 180 : 0 }} className="shrink-0 text-muted-foreground">
          <ChevronDown size={20} />
        </motion.span>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden"
      >
        <p className="whitespace-pre-line px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
          {article.body}
        </p>
      </motion.div>
    </motion.div>
  );
}
