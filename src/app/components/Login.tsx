import React, { useState } from "react";
import { ShoppingBag, Lock, User, Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react";

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    // TODO: trocar por validação real (API, Supabase, etc.)
    setTimeout(() => {
      if (usuario === "admin" && senha === "123") {
        onLogin();
      } else {
        setErro("Usuário e/ou senha inválidos");
        setCarregando(false);
      }
    }, 600);
  };

  return (
    <div
      className="min-h-screen flex bg-background"
      style={{ fontFamily: "'Nunito', sans-serif" }}
    >
      {/* Painel visual — some em telas pequenas */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12"
        style={{
          background: "linear-gradient(150deg, #f4b8aa 0%, #e8a090 45%, #b87c6a 100%)",
        }}
      >
        {/* Formas decorativas */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-[#8a4a3a]/20 blur-3xl" />

        <div className="relative z-10 flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
            <ShoppingBag size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white">Closet Pro</span>
        </div>

        <div className="relative z-10 space-y-5 max-w-sm">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 text-white text-xs font-semibold">
            <Sparkles size={12} />
            gestão de roupas
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight">
            Seu negócio,<br />organizado com estilo.
          </h2>
          <p className="text-white/80 text-sm leading-relaxed">
            Estoque, vendas, clientes e lucro em um só lugar — tudo pensado
            pra quem cuida da moda com carinho.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-6 text-white/70 text-xs">
          <span>© 2026 Closet Pro</span>
        </div>
      </div>

      {/* Painel do formulário */}
      <div className="flex-1 flex items-center justify-center px-6 sm:px-12 py-12">
        <div className="w-full max-w-sm">
          {/* Logo mobile (só aparece sem o painel lateral) */}
          <div className="flex lg:hidden flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-3 shadow-lg shadow-primary/20">
              <ShoppingBag size={22} className="text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Closet Pro</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Bem-vindo(a) de volta 👋
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Entre com seu login e senha para acessar o painel.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Usuário
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
                  placeholder="seu usuário"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Senha
                </label>
                <button
                  type="button"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative mt-1.5 group">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
                />
                <input
                  type={mostrarSenha ? "text" : "password"}
                  className="w-full pl-10 pr-10 py-3 text-sm rounded-xl border border-border bg-card
                    focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                    transition-all placeholder:text-muted-foreground/60"
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {erro && (
              <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-100">
                <p className="text-xs text-red-500 font-medium text-center">{erro}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white
                bg-gradient-to-r from-[#e8a090] to-[#b87c6a]
                hover:from-[#e29483] hover:to-[#a86e5c]
                shadow-lg shadow-[#e8a090]/30
                transition-all flex items-center justify-center gap-2
                disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {carregando ? (
                "Entrando..."
              ) : (
                <>
                  Entrar
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-8">
            Ainda não tem acesso?{" "}
            <button className="font-semibold text-primary hover:underline">
              Fale com o administrador
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}