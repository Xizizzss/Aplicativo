import React from "react";
import { Users, ListChecks, LogOut, ChevronRight } from "lucide-react";

/** Ícone da logo Closet Pro — sacola com cabide, gradiente da marca. */
function ClosetProIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cpIconGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f4b8aa" />
          <stop offset="45%" stopColor="#e8a090" />
          <stop offset="100%" stopColor="#b87c6a" />
        </linearGradient>
      </defs>
      <rect width="160" height="160" rx="36" fill="url(#cpIconGrad2)" />
      <path
        d="M52 68 C52 48 64 34 80 34 C96 34 108 48 108 68"
        stroke="#fffaf7"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M40 68 H120 C126 68 130 72 130 78 L122 128 C121 134 116 138 110 138 H50 C44 138 39 134 38 128 L30 78 C30 72 34 68 40 68 Z"
        fill="#fffaf7"
      />
      <circle cx="80" cy="100" r="6" fill="#b87c6a" />
    </svg>
  );
}

type MenuOption = {
  label: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
};

export default function Menu({
  userName = "Ediberto Silva",
  onNavigateClientes,
  onNavigateListas,
  onLogout,
}: {
  userName?: string;
  onNavigateClientes: () => void;
  onNavigateListas: () => void;
  onLogout: () => void;
}) {
  const options: MenuOption[] = [
    {
      label: "Clientes",
      description: "Cadastrar, consultar e editar clientes",
      icon: <Users size={22} />,
      onClick: onNavigateClientes,
    },
    {
      label: "Cadastro de listas",
      description: "Organizar listas de estoque e itens",
      icon: <ListChecks size={22} />,
      onClick: onNavigateListas,
    },
  ];

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'Nunito', sans-serif" }}>
      {/* Cabeçalho com gradiente da marca */}
      <div
        className="relative overflow-hidden px-6 sm:px-12 py-8"
        style={{
          background: "linear-gradient(150deg, #f4b8aa 0%, #e8a090 45%, #b87c6a 100%)",
        }}
      >
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30"
              style={{ width: 40, height: 40 }}
            >
              <ClosetProIcon size={22} />
            </div>
            <span className="text-xl font-bold text-white">Closet Pro</span>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-white/85 hover:text-white text-xs font-semibold
              px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <LogOut size={14} />
            Sair
          </button>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="px-6 sm:px-12 py-10 max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Olá, {userName.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            O que você precisa organizar agora?
          </p>
        </div>

        <div className="space-y-3">
          {options.map((opt) => (
            <button
              key={opt.label}
              onClick={opt.onClick}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card
                hover:border-primary/40 hover:shadow-md transition-all text-left group"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0"
                style={{ background: "linear-gradient(135deg, #e8a090, #b87c6a)" }}
              >
                {opt.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{opt.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>
              </div>
              <ChevronRight
                size={18}
                className="text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
