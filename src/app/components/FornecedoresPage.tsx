import React, { useState } from "react";
import { Search, UserPlus, Pencil, Trash2, X, Truck, AlertCircle } from "lucide-react";
import { PageShell, ConfirmarExclusaoModal } from "./Shared";
import { NovoFornecedorModal } from "./CadastroProdutoPage";
import type { Fornecedor } from "../../db/fornecedores";
import type { Produto } from "../../db/produtos";

function EditarFornecedorModal({
  fornecedor,
  onClose,
  onSalvar,
}: {
  fornecedor: Fornecedor;
  onClose: () => void;
  onSalvar: (id: number, dados: { nome: string; telefone: string; email: string; cidade: string }) => Promise<void>;
}) {
  const [nome, setNome] = useState(fornecedor.nome);
  const [telefone, setTelefone] = useState(fornecedor.telefone ?? "");
  const [email, setEmail] = useState(fornecedor.email ?? "");
  const [cidade, setCidade] = useState(fornecedor.cidade ?? "");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setErro("");
    try {
      await onSalvar(fornecedor.id, { nome, telefone, email, cidade });
      onClose();
    } catch (err: any) {
      setErro(err.message || "Erro ao atualizar fornecedor.");
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-sm p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
          <X size={18} />
        </button>

        <h2 className="text-lg font-bold text-foreground mb-1">Editar fornecedor</h2>
        <p className="text-xs text-muted-foreground mb-5">Atualize os dados abaixo.</p>

        <form onSubmit={handleSalvar} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nome</label>
            <input
              className="w-full mt-1.5 px-4 py-2.5 text-sm rounded-xl border border-border bg-background
                focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              autoFocus
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
              disabled={!nome || salvando}
              className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white
                bg-gradient-to-r from-[#e8a090] to-[#b87c6a]
                hover:from-[#e29483] hover:to-[#a86e5c]
                transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {salvando ? "Salvando..." : "Salvar"}
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

export default function FornecedoresPage({
  onBack,
  fornecedores,
  produtos,
  onCriado,
  onEditar,
  onExcluir,
}: {
  onBack: () => void;
  fornecedores: Fornecedor[];
  produtos: Produto[];
  onCriado: (f: Fornecedor) => void;
  onEditar: (id: number, dados: { nome: string; telefone: string; email: string; cidade: string }) => Promise<void>;
  onExcluir: (id: number) => Promise<void>;
}) {
  const [search, setSearch] = useState("");
  const [criando, setCriando] = useState(false);
  const [editando, setEditando] = useState<Fornecedor | null>(null);
  const [excluindo, setExcluindo] = useState<Fornecedor | null>(null);
  const [erroExclusao, setErroExclusao] = useState("");

  const filtered = fornecedores.filter(
    (f) =>
      f.nome.toLowerCase().includes(search.toLowerCase()) ||
      (f.cidade ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const contarProdutos = (fornecedorId: number) =>
    produtos.filter((p) => p.fornecedorId === fornecedorId).length;

  const handleExcluir = async (f: Fornecedor) => {
    try {
      await onExcluir(f.id);
      setExcluindo(null);
      setErroExclusao("");
    } catch (err: any) {
      setErroExclusao(err.message || "Erro ao excluir fornecedor.");
    }
  };

  return (
    <PageShell
      title="Fornecedores"
      subtitle="Cadastro de fornecedores"
      onBack={onBack}
      headerAction={
        <button
          onClick={() => setCriando(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white
            bg-gradient-to-r from-[#e8a090] to-[#b87c6a] hover:from-[#e29483] hover:to-[#a86e5c]
            shadow-sm transition-all shrink-0"
        >
          <UserPlus size={14} />
          <span className="hidden sm:inline">Novo fornecedor</span>
        </button>
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3 max-w-xs">
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{fornecedores.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">fornecedores</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{produtos.filter((p) => p.fornecedorId).length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">produtos vinculados</p>
          </div>
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-ring/40"
            placeholder="Buscar por nome ou cidade…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {erroExclusao && (
          <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-100 flex items-center gap-2 max-w-md">
            <AlertCircle size={14} className="text-red-600 shrink-0" />
            <p className="text-xs text-red-700 font-medium">{erroExclusao}</p>
          </div>
        )}

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Fornecedor</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Contato</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Cidade</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Produtos</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((f) => (
                  <tr key={f.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                          <Truck size={14} className="text-primary" />
                        </div>
                        <p className="font-medium text-foreground">{f.nome}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                      <p>{f.email ?? "—"}</p>
                      <p className="text-xs">{f.telefone ?? "—"}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{f.cidade ?? "—"}</td>
                    <td className="px-4 py-3 text-right font-mono">{contarProdutos(f.id)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setEditando(f)}
                          title="Editar fornecedor"
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground
                            hover:text-primary hover:bg-secondary transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => { setExcluindo(f); setErroExclusao(""); }}
                          title="Excluir fornecedor"
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground
                            hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      Nenhum fornecedor encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {criando && (
        <NovoFornecedorModal
          onClose={() => setCriando(false)}
          onCriado={(f) => onCriado(f)}
        />
      )}

      {editando && (
        <EditarFornecedorModal
          fornecedor={editando}
          onClose={() => setEditando(null)}
          onSalvar={onEditar}
        />
      )}

      {excluindo && (
        <ConfirmarExclusaoModal
          nome={excluindo.nome}
          entidade="fornecedor"
          onCancel={() => setExcluindo(null)}
          onConfirm={() => handleExcluir(excluindo)}
        />
      )}
    </PageShell>
  );
}