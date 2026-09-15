import React from "react";
import { ArrowLeft, Trash2 } from "lucide-react";

export const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function PageShell({
  title,
  subtitle,
  onBack,
  children,
  headerAction,
}: {
  title: string;
  subtitle: string;
  onBack: () => void;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'Nunito', sans-serif" }}>
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-border px-4 sm:px-8 py-4 flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">Início</span>
        </button>
        <div className="w-px h-5 bg-border" />
        <div className="flex-1">
          <h1 className="text-base font-bold text-foreground leading-tight">{title}</h1>
          <p className="text-xs text-muted-foreground hidden sm:block">{subtitle}</p>
        </div>
        {headerAction}
      </header>

      <main className="px-4 sm:px-8 py-6 max-w-5xl mx-auto">{children}</main>
    </div>
  );
}

export function ConfirmarExclusaoModal({
  nome,
  entidade = "item",
  onCancel,
  onConfirm,
}: {
  nome: string;
  entidade?: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-sm p-6">
        <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <Trash2 size={18} className="text-red-500" />
        </div>
        <h2 className="text-lg font-bold text-foreground mb-1">Excluir {entidade}</h2>
        <p className="text-sm text-muted-foreground mb-5">
          Tem certeza que deseja excluir <span className="font-semibold text-foreground">{nome}</span>? Essa ação não pode ser desfeita.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white bg-red-500 hover:bg-red-600 transition-all"
          >
            Excluir
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-foreground
              border border-border bg-background hover:bg-muted transition-all"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}