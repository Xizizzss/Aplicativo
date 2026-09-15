import React, { useState, useEffect } from "react";
import { Package, Hash, Save, CheckCircle2, AlertCircle, Truck, Plus, X } from "lucide-react";
import { listarFornecedores, adicionarFornecedor, type Fornecedor } from "../../db/fornecedores";
import { PageShell } from "./Shared";

export function NovoFornecedorModal({
  onClose,
  onCriado,
}: {
  onClose: () => void;
  onCriado: (fornecedor: Fornecedor) => void;
}) {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [cidade, setCidade] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setErro("");
    try {
      const resultado = await adicionarFornecedor({ nome, telefone, email, cidade });
      onCriado({ id: resultado.id, nome, telefone, email, cidade });
      onClose();
    } catch (err: any) {
      setErro(err.message || "Erro ao cadastrar fornecedor.");
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-sm p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
          <X size={18} />
        </button>

        <h2 className="text-lg font-bold text-foreground mb-1">Novo fornecedor</h2>
        <p className="text-xs text-muted-foreground mb-5">Cadastre um fornecedor rapidamente.</p>

        <form onSubmit={handleSalvar} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nome</label>
            <input
              className="w-full mt-1.5 px-4 py-2.5 text-sm rounded-xl border border-border bg-background
                focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Telefone</label>
            <input
              className="w-full mt-1.5 px-4 py-2.5 text-sm rounded-xl border border-border bg-background
                focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">E-mail</label>
            <input
              type="email"
              className="w-full mt-1.5 px-4 py-2.5 text-sm rounded-xl border border-border bg-background
                focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Cidade</label>
            <input
              className="w-full mt-1.5 px-4 py-2.5 text-sm rounded-xl border border-border bg-background
                focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
            />
          </div>

          {erro && (
            <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-100 flex items-center gap-2">
              <AlertCircle size={14} className="text-red-600 shrink-0" />
              <p className="text-xs text-red-700 font-medium">{erro}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={salvando || !nome}
              className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white
                bg-gradient-to-r from-[#e8a090] to-[#b87c6a]
                hover:from-[#e29483] hover:to-[#a86e5c]
                transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {salvando ? "Salvando..." : "Cadastrar"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-foreground
                border border-border bg-background hover:bg-muted transition-all"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CadastroProdutoPage({
  onBack,
  onSalvar,
}: {
  onBack: () => void;
  onSalvar: (dados: {
    nome: string;
    categoria: string;
    preco: number;
    custo: number;
    estoque: number;
    fornecedorId: number | null;
  }) => Promise<void>;
}) {
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("");
  const [preco, setPreco] = useState("");
  const [custo, setCusto] = useState("");
  const [estoque, setEstoque] = useState("");
  const [fornecedorId, setFornecedorId] = useState<string>("");
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [modalAberto, setModalAberto] = useState(false);

  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [erro, setErro] = useState("");

  const carregarFornecedores = async () => {
    const lista = await listarFornecedores();
    setFornecedores(lista);
  };

  useEffect(() => {
    carregarFornecedores();
  }, []);

  const handleGravar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setSalvo(false);
    setErro("");

    try {
      await onSalvar({
        nome,
        categoria,
        preco: Number(preco),
        custo: Number(custo),
        estoque: Number(estoque),
        fornecedorId: fornecedorId ? Number(fornecedorId) : null,
      });
      setSalvo(true);
      setNome("");
      setCategoria("");
      setPreco("");
      setCusto("");
      setEstoque("");
      setFornecedorId("");
    } catch (err: any) {
      setErro(err.message || "Erro ao gravar produto.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <PageShell title="Cadastro de produtos" subtitle="Adicionar novo produto" onBack={onBack}>
      <div className="max-w-md mx-auto">
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6 sm:p-8">
          <form onSubmit={handleGravar} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nome</label>
              <div className="relative mt-1.5 group">
                <Package
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
                />
                <input
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-border bg-background
                    focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                    transition-all placeholder:text-muted-foreground/60"
                  placeholder="nome do produto"
                  value={nome}
                  onChange={(e) => { setNome(e.target.value); setSalvo(false); }}
                  autoFocus
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Categoria</label>
              <input
                className="w-full mt-1.5 px-4 py-3 text-sm rounded-xl border border-border bg-background
                  focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                  transition-all placeholder:text-muted-foreground/60"
                placeholder="ex: vestidos, calçados…"
                value={categoria}
                onChange={(e) => { setCategoria(e.target.value); setSalvo(false); }}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Preço</label>
                <div className="relative mt-1.5 group">
                  <Hash size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-border bg-background
                      focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    value={preco}
                    onChange={(e) => { setPreco(e.target.value); setSalvo(false); }}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Custo</label>
                <div className="relative mt-1.5 group">
                  <Hash size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-border bg-background
                      focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    value={custo}
                    onChange={(e) => { setCusto(e.target.value); setSalvo(false); }}
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Estoque inicial</label>
              <input
                type="number"
                min="0"
                className="w-full mt-1.5 px-4 py-3 text-sm rounded-xl border border-border bg-background
                  focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                value={estoque}
                onChange={(e) => { setEstoque(e.target.value); setSalvo(false); }}
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Fornecedor</label>
              <div className="flex gap-2 mt-1.5">
                <div className="relative flex-1 group">
                  <Truck size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <select
                    className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-border bg-background
                      focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all appearance-none"
                    value={fornecedorId}
                    onChange={(e) => { setFornecedorId(e.target.value); setSalvo(false); }}
                  >
                    <option value="">Sem fornecedor</option>
                    {fornecedores.map((f) => (
                      <option key={f.id} value={f.id}>{f.nome}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => setModalAberto(true)}
                  title="Cadastrar novo fornecedor"
                  className="w-11 h-11 shrink-0 rounded-xl border border-border bg-background
                    flex items-center justify-center text-muted-foreground
                    hover:text-primary hover:bg-secondary transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {salvo && (
              <div className="px-3 py-2 rounded-lg bg-green-50 border border-green-100 flex items-center gap-2">
                <CheckCircle2 size={14} className="text-green-600 shrink-0" />
                <p className="text-xs text-green-700 font-medium">Produto cadastrado com sucesso.</p>
              </div>
            )}

            {erro && (
              <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-100 flex items-center gap-2">
                <AlertCircle size={14} className="text-red-600 shrink-0" />
                <p className="text-xs text-red-700 font-medium">{erro}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                disabled={salvando || !nome || !categoria || !preco || !custo || !estoque}
                className="flex-1 py-3 rounded-xl font-semibold text-sm text-white
                  bg-gradient-to-r from-[#e8a090] to-[#b87c6a]
                  hover:from-[#e29483] hover:to-[#a86e5c]
                  shadow-lg shadow-[#e8a090]/30
                  transition-all flex items-center justify-center gap-2
                  disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {salvando ? "Gravando..." : (<><Save size={16} /> Gravar</>)}
              </button>
              <button
                type="button"
                onClick={onBack}
                className="flex-1 py-3 rounded-xl font-semibold text-sm text-foreground
                  border border-border bg-background hover:bg-muted transition-all"
              >
                Voltar
              </button>
            </div>
          </form>
        </div>
      </div>

      {modalAberto && (
        <NovoFornecedorModal
          onClose={() => setModalAberto(false)}
          onCriado={(f) => {
            setFornecedores((prev) => [...prev, f]);
            setFornecedorId(String(f.id));
          }}
        />
      )}
    </PageShell>
  );
}