"use client";

import { useEffect, useState } from "react";
import { Download, X, ChevronRight, Smartphone, Share2, MoreVertical, PlusSquare, Monitor } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { getInstallContext, type InstallContext, type OS, type Browser } from "@/lib/pwa-detect";
import { cn } from "@/lib/utils";

const DISMISS_KEY = "luna.install-prompt.dismissed";

function getInstructions(ctx: InstallContext) {
  const { os, browser } = ctx;

  if (os === "ios") {
    return {
      title: "Adicionar à Tela de Início",
      summary: "No Safari, toque no botão Compartilhar e depois em 'Adicionar à Tela de Início'.",
      steps: [
        { icon: Share2, text: "Toque no botão Compartilhar na barra de ferramentas do Safari." },
        { icon: PlusSquare, text: "Role as opções e toque em 'Adicionar à Tela de Início'." },
        { icon: Smartphone, text: "Toque em 'Adicionar' para confirmar. O ícone aparecerá na sua home." },
      ],
    };
  }

  if (os === "android") {
    if (browser === "samsung") {
      return {
        title: "Adicionar à tela inicial",
        summary: "No Samsung Internet, toque no menu ⋮ e escolha 'Adicionar página à tela inicial'.",
        steps: [
          { icon: MoreVertical, text: "Toque no menu ⋮ no canto inferior direito." },
          { icon: PlusSquare, text: "Escolha 'Adicionar página à tela inicial'." },
          { icon: Smartphone, text: "Confirme para adicionar o ícone do Luna." },
        ],
      };
    }
    if (browser === "chrome") {
      return {
        title: "Adicionar à tela inicial",
        summary: "No Chrome, toque no menu ⋮ e escolha 'Adicionar à tela inicial'.",
        steps: [
          { icon: MoreVertical, text: "Toque no menu ⋮ no canto superior direito." },
          { icon: PlusSquare, text: "Toque em 'Adicionar à tela inicial' ou 'Instalar app'." },
          { icon: Smartphone, text: "Toque em 'Instalar' para confirmar." },
        ],
      };
    }
    return {
      title: "Adicionar à tela inicial",
      summary: "Abra o menu do navegador e procure por 'Adicionar à tela inicial' ou 'Instalar app'.",
      steps: [
        { icon: MoreVertical, text: "Toque no menu do navegador (geralmente ⋮)." },
        { icon: PlusSquare, text: "Procure 'Adicionar à tela inicial' ou 'Instalar app'." },
        { icon: Smartphone, text: "Confirme a instalação para ter o ícone na home." },
      ],
    };
  }

  if (browser === "chrome" || browser === "edge") {
    return {
      title: "Instalar o app Luna",
      summary: "Clique no ícone de instalação na barra de endereço ou use o menu do navegador.",
      steps: [
        { icon: Monitor, text: "Procure o ícone de instalação (um monitor com seta) na barra de endereço." },
        { icon: Download, text: "Clique em 'Instalar Luna — Ciclo & Bem-estar'." },
        { icon: Smartphone, text: "Confirme para criar um atalho no seu computador." },
      ],
    };
  }

  if (browser === "safari" && os === "macos") {
    return {
      title: "Adicionar ao Dock",
      summary: "No Safari para Mac, arraste o ícone de favoritos para o Dock ou use Compartilhar > Adicionar ao Dock.",
      steps: [
        { icon: Share2, text: "Clique em Compartilhar na barra de ferramentas do Safari." },
        { icon: PlusSquare, text: "Escolha 'Adicionar ao Dock'." },
        { icon: Monitor, text: "Confirme para fixar o app no Dock do Mac." },
      ],
    };
  }

  if (browser === "firefox") {
    return {
      title: "Criar atalho no Firefox",
      summary: "O Firefox não instala PWAs diretamente, mas você pode criar um atalho na área de trabalho.",
      steps: [
        { icon: MoreVertical, text: "Clique no menu ☰ e vá em 'Mais ferramentas'." },
        { icon: PlusSquare, text: "Escolha 'Criar atalho...' ou 'Instalar página como PWA' se disponível." },
        { icon: Monitor, text: "Confirme para criar o atalho na área de trabalho." },
      ],
    };
  }

  return {
    title: "Instalar o app Luna",
    summary: "Use o menu do navegador para adicionar o app à tela inicial ou área de trabalho.",
    steps: [
      { icon: MoreVertical, text: "Abra o menu do navegador (geralmente ⋮ ou ☰)." },
      { icon: PlusSquare, text: "Procure 'Adicionar à tela inicial', 'Instalar app' ou 'Criar atalho'." },
      { icon: Monitor, text: "Confirme para fixar o app no seu dispositivo." },
    ],
  };
}

function getPlatformLabel(ctx: InstallContext) {
  const labels: Record<OS, string> = {
    ios: "iPhone/iPad",
    android: "Android",
    windows: "Windows",
    macos: "Mac",
    linux: "Linux",
    other: "seu dispositivo",
  };

  const browserLabels: Record<Browser, string> = {
    safari: "Safari",
    chrome: "Chrome",
    edge: "Edge",
    firefox: "Firefox",
    samsung: "Samsung Internet",
    opera: "Opera",
    other: "navegador",
  };

  return `${labels[ctx.os] || "seu dispositivo"} · ${browserLabels[ctx.browser] || "navegador"}`;
}

export function InstallPrompt() {
  const [mounted, setMounted] = useState(false);
  const [ctx, setCtx] = useState<InstallContext | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [dismissed, setDismissed] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCtx(getInstallContext());
    try {
      setDismissed(localStorage.getItem(DISMISS_KEY) === "true");
    } catch {
      setDismissed(false);
    }

    function onBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  }, []);

  if (!mounted) return null;
  if (!ctx) return null;
  if (ctx.isStandalone) return null;
  if (dismissed) return null;

  const instructions = getInstructions(ctx);
  const platformLabel = getPlatformLabel(ctx);

  async function handleInstall() {
    if (deferredPrompt) {
      // @ts-expect-error deferred prompt API
      await deferredPrompt.prompt();
      // @ts-expect-error deferred prompt API
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDismissed(true);
        try {
          localStorage.setItem(DISMISS_KEY, "true");
        } catch {}
      }
      setDeferredPrompt(null);
    } else {
      setOpen(true);
    }
  }

  function handleDismiss() {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "true");
    } catch {}
  }

  return (
    <>
      <div
        role="banner"
        aria-label="Instalar app Luna"
        className={cn(
          "fixed bottom-[calc(env(safe-area-inset-bottom)+4.5rem)] left-4 right-4 z-50 mx-auto max-w-md",
          "rounded-2xl border border-border bg-card/95 p-4 shadow-lg backdrop-blur-sm",
          "animate-in slide-in-from-bottom-4 fade-in duration-300"
        )}
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Download className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">Instale o Luna no {platformLabel}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              Acesse mais rápido, use offline e tenha o app como se fosse nativo.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button size="sm" className="rounded-full">
                    {deferredPrompt ? "Instalar agora" : "Ver como instalar"}
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="rounded-t-3xl pb-8">
                  <SheetHeader className="text-left">
                    <SheetTitle>{instructions.title}</SheetTitle>
                    <SheetDescription>{instructions.summary}</SheetDescription>
                  </SheetHeader>
                  <ol className="mt-6 space-y-4">
                    {instructions.steps.map((step, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-3 rounded-2xl bg-secondary/50 p-3"
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {index + 1}
                        </span>
                        <div className="flex items-start gap-3">
                          <step.icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                          <span className="text-sm text-foreground">{step.text}</span>
                        </div>
                      </li>
                    ))}
                  </ol>
                  <SheetFooter className="mt-6">
                    <SheetClose asChild>
                      <Button
                        className="w-full rounded-full"
                        onClick={() => {
                          if (deferredPrompt) {
                            handleInstall();
                          }
                        }}
                      >
                        {deferredPrompt ? "Instalar agora" : "Entendi"}
                      </Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="-mr-1 -mt-1 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Dispensar aviso de instalação"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </>
  );
}
