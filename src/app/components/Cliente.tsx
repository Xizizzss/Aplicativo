import React, { useState } from "react";
import { ArrowLeft, User, Hash, Save, CheckCircle2 } from "lucide-react";

/** Ícone da logo Closet Pro — sacola com cabide, gradiente da marca. */
function ClosetProIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cpIconGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f4b8aa" />
          <stop offset="45%" stopColor="#e8a090" />
          <stop offset="100%" stopColor="#b87c6a" />
        </linearGradient>
      </defs>
      <rect width="160" height="160" rx="36" fill="url(#cpIconGrad3)" />
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

export default function Cliente({ onVoltar }: { onVoltar: () => void }) {
  const [matricula, setMatricula] = useState("");
  const [nome, setNome] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  const handleGravar = (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setSalvo(false);

    // TODO: trocar por gravação real (API, Supabase, etc.)
    setTimeout(() => {
      setSalvando(false);
      setSalvo(true);
    }, 600);
  };

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
            onClick={onVoltar}
            className="flex items-center gap-1.5 text-white/85 hover:text-white text-xs font-semibold
              px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={14} />
            Menu
          </button>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="px-6 sm:px-12 py-10 max-w-md mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Cadastro de clientes
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Preencha os dados abaixo para cadastrar um novo cliente.
          </p>
        </div>

        <form onSubmit={handleGravar} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Matrícula
            </label>
            <div className="relative mt-1.5 group">
              <Hash
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
              />
              <input
                className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-border bg-card
                  focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                  transition-all placeholder:text-muted-foreground/60"
                placeholder="ex: 117212"
                value={matricula}
                onChange={(e) => {
                  setMatricula(e.target.value);
                  setSalvo(false);
                }}
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Nome
            </label>
            <div className="relative mt-1.5 group">
              <User
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
              />
              <input
                className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-border bg-card
                  focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                  transition-all placeholder:text-muted-foreground/60"
                placeholder="nome completo"
                value={nome}
                onChange={(e) => {
                  setNome(e.target.value);
                  setSalvo(false);
                }}
              />
            </div>
          </div>

          {salvo && (
            <div className="px-3 py-2 rounded-lg bg-green-50 border border-green-100 flex items-center gap-2">
              <CheckCircle2 size={14} className="text-green-600 shrink-0" />
              <p className="text-xs text-green-700 font-medium">Cliente cadastrado com sucesso.</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={salvando || !matricula || !nome}
              className="flex-1 py-3 rounded-xl font-semibold text-sm text-white
                bg-gradient-to-r from-[#e8a090] to-[#b87c6a]
                hover:from-[#e29483] hover:to-[#a86e5c]
                shadow-lg shadow-[#e8a090]/30
                transition-all flex items-center justify-center gap-2
                disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {salvando ? (
                "Gravando..."
              ) : (
                <>
                  <Save size={16} />
                  Gravar
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onVoltar}
              className="flex-1 py-3 rounded-xl font-semibold text-sm text-foreground
                border border-border bg-card hover:bg-muted transition-all"
            >
              Voltar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
