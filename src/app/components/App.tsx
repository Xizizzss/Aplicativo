import React, { useState, useEffect } from "react";
import Login from "./Login";
import CadastroProdutoPage from "./CadastroProdutoPage";

import { listarProdutos, adicionarProdutos, atualizarProduto, excluirProduto, type Produto } from "../../db/produtos";
import { listarClientes, adicionarCliente, atualizarCliente, excluirCliente, type Cliente } from "../../db/clientes";
import { listarVendas, type Venda } from "../../db/vendas";

import {
  Package,
  Users,
  ShoppingBag,
  TrendingUp,
  AlertCircle,
  ArrowLeft,
  Search,
  ChevronUp,
  ChevronDown,
  UserPlus,
  Hash,
  User,
  Save,
  CheckCircle2,
  Pencil,
  Trash2,
  X,
  Plus,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// ─── Logo ─────────────────────────────────────────────────────────────────────

function ClosetProIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cpIconGradApp" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f4b8aa" />
          <stop offset="45%" stopColor="#e8a090" />
          <stop offset="100%" stopColor="#b87c6a" />
        </linearGradient>
      </defs>
      <rect width="160" height="160" rx="36" fill="url(#cpIconGradApp)" />
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

// ─── Types ────────────────────────────────────────────────────────────────────

type PageId =
  | "login"
  | "home"
  | "estoque"
  | "lucro"
  | "clientes"
  | "vendas"
  | "cadastroCliente"
  | "cadastroProduto";

// ─── Data (ainda fictício — não vem do banco) ──────────────────────────────────
// TODO: no futuro, calcular isso a partir de uma consulta agregada por mês na tabela "vendas"

const salesMonths = [
  { mes: "Mar", receita: 3200, lucro: 1100, vendas: 58 },
  { mes: "Abr", receita: 4100, lucro: 1540, vendas: 74 },
  { mes: "Mai", receita: 3750, lucro: 1280, vendas: 65 },
  { mes: "Jun", receita: 5200, lucro: 2050, vendas: 92 },
  { mes: "Jul", receita: 4800, lucro: 1890, vendas: 83 },
  { mes: "Ago", receita: 6100, lucro: 2480, vendas: 107 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function StockBadge({ qty }: { qty: number }) {
  if (qty === 0)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-600">
        <AlertCircle size={10} /> Esgotado
      </span>
    );
  if (qty <= 3)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-600">
        <AlertCircle size={10} /> Baixo ({qty})
      </span>
    );
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-600">
      {qty} un.
    </span>
  );
}

// ─── Page Shell ───────────────────────────────────────────────────────────────

function PageShell({
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

// ─── Page: Estoque ────────────────────────────────────────────────────────────

function EstoquePage({
  onBack,
  produtos,
  onNovoProduto,
  onEditar,
  onExcluir,
}: {
  onBack: () => void;
  produtos: Produto[];
  onNovoProduto: () => void;
  onEditar: (id: number, dados: {
    nome: string;
    categoria: string;
    preco: number;
    custo: number;
    estoque: number;
  }) => void;
  onExcluir: (id: number) => void;
}) {
  const [search, setSearch] = useState("");
  const [editando, setEditando] = useState<Produto | null>(null);
  const [excluindo, setExcluindo] = useState<Produto | null>(null);
  const [erroExclusao, setErroExclusao] = useState("");

  const filtered = produtos.filter(
    (p) =>
      p.nome.toLowerCase().includes(search.toLowerCase()) ||
      p.categoria.toLowerCase().includes(search.toLowerCase())
  );
  const semEstoque = produtos.filter((p) => p.estoque === 0).length;
  const baixoEstoque = produtos.filter((p) => p.estoque > 0 && p.estoque <= 3).length;

  const handleExcluir = async (p: Produto) => {
    try {
      await onExcluir(p.id);
      setExcluindo(null);
      setErroExclusao("");
    } catch (err: any) {
      setErroExclusao(err.message || "Erro ao excluir produto.");
    }
  };

  return (
    <PageShell
      title="Estoque"
      subtitle="Controle de peças disponíveis"
      onBack={onBack}
      headerAction={
        <button
          onClick={onNovoProduto}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white
            bg-gradient-to-r from-[#e8a090] to-[#b87c6a] hover:from-[#e29483] hover:to-[#a86e5c]
            shadow-sm transition-all shrink-0"
        >
          <Plus size={14} />
          <span className="hidden sm:inline">Novo produto</span>
        </button>
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{produtos.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">produtos</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <p className="text-2xl font-bold text-amber-500">{baixoEstoque}</p>
            <p className="text-xs text-muted-foreground mt-0.5">estoque baixo</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <p className="text-2xl font-bold text-red-500">{semEstoque}</p>
            <p className="text-xs text-muted-foreground mt-0.5">esgotados</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-ring/40"
              placeholder="Buscar produto ou categoria…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
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
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Produto</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Categoria</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Fornecedor</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Preço</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Custo</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Margem</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Estoque</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const m = (((p.preco - p.custo) / p.preco) * 100).toFixed(0);
                  return (
                    <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">{p.nome}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{p.categoria}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{p.fornecedorNome ?? "—"}</td>
                      <td className="px-4 py-3 text-right font-mono text-sm">{fmt(p.preco)}</td>
                      <td className="px-4 py-3 text-right font-mono text-sm text-muted-foreground hidden md:table-cell">{fmt(p.custo)}</td>
                      <td className="px-4 py-3 text-right hidden md:table-cell">
                        <span className="font-mono text-sm text-emerald-600">{m}%</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StockBadge qty={p.estoque} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setEditando(p)}
                            title="Editar produto"
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground
                              hover:text-primary hover:bg-secondary transition-colors"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => { setExcluindo(p); setErroExclusao(""); }}
                            title="Excluir produto"
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground
                              hover:text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      Nenhum produto encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {editando && (
        <EditarProdutoModal
          produto={editando}
          onClose={() => setEditando(null)}
          onSalvar={(id, dados) => onEditar(id, dados)}
        />
      )}

      {excluindo && (
        <ConfirmarExclusaoModal
          nome={excluindo.nome}
          entidade="produto"
          onCancel={() => setExcluindo(null)}
          onConfirm={() => handleExcluir(excluindo)}
        />
      )}
    </PageShell>
  );
}

// ─── Page: Lucro ──────────────────────────────────────────────────────────────

function LucroPage({ onBack, produtos }: { onBack: () => void; produtos: Produto[] }) {
  const totalReceita = salesMonths.reduce((s, d) => s + d.receita, 0);
  const totalLucro = salesMonths.reduce((s, d) => s + d.lucro, 0);
  const margemMedia = totalReceita > 0 ? ((totalLucro / totalReceita) * 100).toFixed(1) : "0.0";

  const categorias = Array.from(new Set(produtos.map((p) => p.categoria)));
  const pieData = categorias.map((cat) => {
    const ps = produtos.filter((p) => p.categoria === cat);
    const lucro = ps.reduce((s, p) => s + (p.preco - p.custo) * p.vendidos, 0);
    return { name: cat, value: Math.round(lucro) };
  }).filter((d) => d.value > 0);

  const PIE_COLORS = ["#f4b8aa", "#b87c6a", "#e8c4b8", "#d4927e", "#c4a09a", "#f0cfc8", "#a86050"];

  return (
    <PageShell title="Lucro" subtitle="Análise de rentabilidade" onBack={onBack}>
      <div className="space-y-5">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-xs text-muted-foreground">Receita total</p>
            <p className="text-xl font-bold text-foreground mt-0.5">{fmt(totalReceita)}</p>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-0.5">
              <ChevronUp size={12} className="text-emerald-500" /> 6 meses
            </p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-xs text-muted-foreground">Lucro total</p>
            <p className="text-xl font-bold text-foreground mt-0.5">{fmt(totalLucro)}</p>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-0.5">
              <ChevronUp size={12} className="text-emerald-500" /> 6 meses
            </p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-xs text-muted-foreground">Margem média</p>
            <p className="text-xl font-bold text-emerald-600 mt-0.5">{margemMedia}%</p>
            <p className="text-xs text-muted-foreground mt-1">sobre receita</p>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm font-semibold text-foreground mb-4">Receita × Lucro por mês</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={salesMonths} barGap={4}>
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#8a7168" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#8a7168" }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ borderRadius: 8, border: "1px solid #e8d5cc", fontSize: 12 }} />
              <Bar dataKey="receita" fill="#f4c5b8" radius={[4, 4, 0, 0]} name="Receita" />
              <Bar dataKey="lucro" fill="#b87c6a" radius={[4, 4, 0, 0]} name="Lucro" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm font-semibold text-foreground mb-4">Lucro por categoria</p>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" paddingAngle={3}>
                  {pieData.map((entry, i) => (
                    <Cell key={`cell-${entry.name}`} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ borderRadius: 8, border: "1px solid #e8d5cc", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-1 mt-2">
              {pieData.map((d, i) => (
                <div key={`legend-${d.name}`} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  {d.name}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm font-semibold text-foreground mb-4">Evolução do lucro</p>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={salesMonths}>
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#8a7168" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#8a7168" }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ borderRadius: 8, border: "1px solid #e8d5cc", fontSize: 12 }} />
                <Line type="monotone" dataKey="lucro" stroke="#b87c6a" strokeWidth={2.5} dot={{ fill: "#b87c6a", r: 4 }} name="Lucro" />
              </LineChart>
            </ResponsiveContainer>

            <div className="mt-3 border-t border-border pt-3">
              <p className="text-xs text-muted-foreground mb-2">Produto mais lucrativo</p>
              {[...produtos]
                .sort((a, b) => (b.preco - b.custo) * b.vendidos - (a.preco - a.custo) * a.vendidos)
                .slice(0, 3)
                .map((p, i) => (
                  <div key={p.id} className="flex items-center justify-between text-xs py-1">
                    <span className="text-foreground font-medium">{i + 1}. {p.nome}</span>
                    <span className="font-mono text-emerald-600">{fmt((p.preco - p.custo) * p.vendidos)}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

// ─── Modal: Editar Produto ──────────────────────────────────────────────────

function EditarProdutoModal({
  produto,
  onClose,
  onSalvar,
}: {
  produto: Produto;
  onClose: () => void;
  onSalvar: (id: number, dados: {
    nome: string;
    categoria: string;
    preco: number;
    custo: number;
    estoque: number;
  }) => void;
}) {
  const [nome, setNome] = useState(produto.nome);
  const [categoria, setCategoria] = useState(produto.categoria);
  const [preco, setPreco] = useState(String(produto.preco));
  const [custo, setCusto] = useState(String(produto.custo));
  const [estoque, setEstoque] = useState(String(produto.estoque));

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    onSalvar(produto.id, {
      nome,
      categoria,
      preco: Number(preco),
      custo: Number(custo),
      estoque: Number(estoque),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-sm p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={18} />
        </button>

        <h2 className="text-lg font-bold text-foreground mb-1">Editar produto</h2>
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
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Categoria</label>
            <input
              className="w-full mt-1.5 px-4 py-2.5 text-sm rounded-xl border border-border bg-background
                focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Preço</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full mt-1.5 px-4 py-2.5 text-sm rounded-xl border border-border bg-background
                  focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Custo</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full mt-1.5 px-4 py-2.5 text-sm rounded-xl border border-border bg-background
                  focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                value={custo}
                onChange={(e) => setCusto(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Estoque</label>
            <input
              type="number"
              min="0"
              className="w-full mt-1.5 px-4 py-2.5 text-sm rounded-xl border border-border bg-background
                focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              value={estoque}
              onChange={(e) => setEstoque(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={!nome}
              className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white
                bg-gradient-to-r from-[#e8a090] to-[#b87c6a]
                hover:from-[#e29483] hover:to-[#a86e5c]
                transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Salvar
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

// ─── Modal: Editar Cliente ──────────────────────────────────────────────────

function EditarClienteModal({
  cliente,
  onClose,
  onSalvar,
}: {
  cliente: Cliente;
  onClose: () => void;
  onSalvar: (id: number, dados: { nome: string; email: string; cidade: string }) => void;
}) {
  const [nome, setNome] = useState(cliente.nome);
  const [email, setEmail] = useState(cliente.email);
  const [cidade, setCidade] = useState(cliente.cidade);

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    onSalvar(cliente.id, { nome, email, cidade });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-sm p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={18} />
        </button>

        <h2 className="text-lg font-bold text-foreground mb-1">Editar cliente</h2>
        <p className="text-xs text-muted-foreground mb-5">Atualize os dados abaixo.</p>

        <form onSubmit={handleSalvar} className="space-y-4">
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
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-border bg-background
                  focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              E-mail
            </label>
            <div className="relative mt-1.5 group">
              <Hash
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
              />
              <input
                type="email"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-border bg-background
                  focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Cidade
            </label>
            <input
              className="w-full mt-1.5 px-4 py-2.5 text-sm rounded-xl border border-border bg-background
                focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={!nome}
              className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white
                bg-gradient-to-r from-[#e8a090] to-[#b87c6a]
                hover:from-[#e29483] hover:to-[#a86e5c]
                transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Salvar
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

// ─── Modal: Confirmar Exclusão ──────────────────────────────────────────────

function ConfirmarExclusaoModal({
  nome,
  entidade = "cliente",
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

// ─── Page: Clientes ───────────────────────────────────────────────────────────

function ClientesPage({
  onBack,
  onNovoCliente,
  clients,
  onEditar,
  onExcluir,
}: {
  onBack: () => void;
  onNovoCliente: () => void;
  clients: Cliente[];
  onEditar: (id: number, dados: { nome: string; email: string; cidade: string }) => void;
  onExcluir: (id: number) => void;
}) {
  const [search, setSearch] = useState("");
  const [editando, setEditando] = useState<Cliente | null>(null);
  const [excluindo, setExcluindo] = useState<Cliente | null>(null);

  const filtered = clients.filter(
    (c) =>
      c.nome.toLowerCase().includes(search.toLowerCase()) ||
      c.cidade.toLowerCase().includes(search.toLowerCase())
  );
  const total = clients.reduce((s, c) => s + Number(c.total), 0);
  const topCliente = clients.length ? [...clients].sort((a, b) => Number(b.total) - Number(a.total))[0] : null;

  return (
    <PageShell
      title="Clientes"
      subtitle="Histórico e base de compradores"
      onBack={onBack}
      headerAction={
        <button
          onClick={onNovoCliente}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white
            bg-gradient-to-r from-[#e8a090] to-[#b87c6a] hover:from-[#e29483] hover:to-[#a86e5c]
            shadow-sm transition-all shrink-0"
        >
          <UserPlus size={14} />
          <span className="hidden sm:inline">Novo cliente</span>
        </button>
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{clients.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">clientes</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <p className="text-xl font-bold text-foreground">{clients.length ? fmt(total / clients.length) : fmt(0)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">ticket médio</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <p className="text-xl font-bold text-primary">{topCliente ? topCliente.nome.split(" ")[0] : "—"}</p>
            <p className="text-xs text-muted-foreground mt-0.5">top cliente</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-ring/40"
              placeholder="Buscar por nome ou cidade…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Cliente</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Cidade</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Compras</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Total gasto</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Última compra</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-primary shrink-0">
                          {c.nome.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{c.nome}</p>
                          <p className="text-xs text-muted-foreground hidden sm:block">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{c.cidade}</td>
                    <td className="px-4 py-3 text-right font-mono">{c.compras}</td>
                    <td className="px-4 py-3 text-right font-mono hidden sm:table-cell">{fmt(Number(c.total))}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground hidden md:table-cell">{c.ultima ?? "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setEditando(c)}
                          title="Editar cliente"
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground
                            hover:text-primary hover:bg-secondary transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setExcluindo(c)}
                          title="Excluir cliente"
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
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      Nenhum cliente encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {editando && (
        <EditarClienteModal
          cliente={editando}
          onClose={() => setEditando(null)}
          onSalvar={(id, dados) => onEditar(id, dados)}
        />
      )}

      {excluindo && (
        <ConfirmarExclusaoModal
          nome={excluindo.nome}
          entidade="cliente"
          onCancel={() => setExcluindo(null)}
          onConfirm={() => {
            onExcluir(excluindo.id);
            setExcluindo(null);
          }}
        />
      )}
    </PageShell>
  );
}

// ─── Page: Cadastro de Cliente ─────────────────────────────────────────────────

function CadastroClientePage({
  onBack,
  onSalvar,
}: {
  onBack: () => void;
  onSalvar: (nome: string, cpf: string, email: string, cidade: string) => void;
}) {
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [cidade, setCidade] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [erro, setErro] = useState("");

  const handleGravar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setSalvo(false);
    setErro("");

    try {
      await onSalvar(nome, cpf, email, cidade || "—");
      setSalvo(true);
      setNome("");
      setCpf("");
      setEmail("");
      setCidade("");
    } catch (err: any) {
      setErro(err.message || "Erro ao gravar cliente.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <PageShell title="Cadastro de clientes" subtitle="Adicionar novo cliente" onBack={onBack}>
      <div className="max-w-md">
        <form onSubmit={handleGravar} className="space-y-4">
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
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              CPF
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
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => {
                  setCpf(e.target.value);
                  setSalvo(false);
                }}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              E-mail
            </label>
            <div className="relative mt-1.5 group">
              <Hash
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
              />
              <input
                type="email"
                className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-border bg-card
                  focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                  transition-all placeholder:text-muted-foreground/60"
                placeholder="email@exemplo.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setSalvo(false);
                }}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Cidade
            </label>
            <div className="relative mt-1.5 group">
              <input
                className="w-full pl-4 pr-4 py-3 text-sm rounded-xl border border-border bg-card
                  focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                  transition-all placeholder:text-muted-foreground/60"
                placeholder="cidade"
                value={cidade}
                onChange={(e) => {
                  setCidade(e.target.value);
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

          {erro && (
            <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-100 flex items-center gap-2">
              <AlertCircle size={14} className="text-red-600 shrink-0" />
              <p className="text-xs text-red-700 font-medium">{erro}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={salvando || !nome || !cpf}
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
              onClick={onBack}
              className="flex-1 py-3 rounded-xl font-semibold text-sm text-foreground
                border border-border bg-card hover:bg-muted transition-all"
            >
              Voltar
            </button>
          </div>
        </form>
      </div>
    </PageShell>
  );
}

// ─── Page: Vendas ─────────────────────────────────────────────────────────────

function VendasPage({ onBack, vendas }: { onBack: () => void; vendas: Venda[] }) {
  const totalVendas = salesMonths.reduce((s, d) => s + d.vendas, 0);
  const totalReceita = salesMonths.reduce((s, d) => s + d.receita, 0);
  const ticketMedio = totalVendas > 0 ? totalReceita / totalVendas : 0;

  return (
    <PageShell title="Vendas" subtitle="Histórico e desempenho de vendas" onBack={onBack}>
      <div className="space-y-5">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{totalVendas}</p>
            <p className="text-xs text-muted-foreground mt-0.5">peças vendidas</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <p className="text-xl font-bold text-foreground">{fmt(totalReceita)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">receita total</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <p className="text-xl font-bold text-foreground">{fmt(ticketMedio)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">ticket médio</p>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm font-semibold text-foreground mb-4">Volume de vendas mensais</p>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={salesMonths}>
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#8a7168" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#8a7168" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e8d5cc", fontSize: 12 }} />
              <Bar dataKey="vendas" fill="#f4b8aa" radius={[4, 4, 0, 0]} name="Peças vendidas" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold text-foreground">Vendas recentes</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Cliente</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Produto</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Valor</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Data</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody>
                {vendas.map((s) => (
                  <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{s.cliente}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{s.produto}</td>
                    <td className="px-4 py-3 text-right font-mono">{fmt(Number(s.valorVenda))}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground hidden md:table-cell">{s.data}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        s.status === "Pago"
                          ? "bg-emerald-100 text-emerald-600"
                          : "bg-amber-100 text-amber-600"
                      }`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {vendas.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      Nenhuma venda registrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

// ─── Home Page ────────────────────────────────────────────────────────────────

const navButtons: { id: PageId; label: string; icon: React.FC<{ size?: number; className?: string }>; desc: string }[] = [
  { id: "estoque", label: "Estoque", icon: Package, desc: "Peças disponíveis e alertas" },
  { id: "lucro", label: "Lucro", icon: TrendingUp, desc: "Margens e rentabilidade" },
  { id: "clientes", label: "Clientes", icon: Users, desc: "Base de compradores" },
  { id: "vendas", label: "Vendas", icon: ShoppingBag, desc: "Histórico de pedidos" },
];

function HomePage({
  onNavigate,
  totalClientes,
  totalProdutos,
}: {
  onNavigate: (p: PageId) => void;
  totalClientes: number;
  totalProdutos: number;
}) {
  const totalReceita = salesMonths.reduce((s, d) => s + d.receita, 0);
  const totalLucro = salesMonths.reduce((s, d) => s + d.lucro, 0);

  return (
    <div
      className="min-h-screen bg-background flex flex-col"
      style={{ fontFamily: "'Nunito', sans-serif" }}
    >
      <header className="px-6 sm:px-10 pt-8 pb-0 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0">
              <ClosetProIcon size={32} />
            </div>
            <span className="text-xl font-bold text-foreground">Closet Pro</span>
          </div>
          <p className="text-xs text-muted-foreground pl-10">gestão de roupas</p>
        </div>
        <p className="text-xs text-muted-foreground pt-2">Agosto 2026</p>
      </header>

      <section className="px-6 sm:px-10 pt-10 pb-6">
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight">
          Olá, bem-vinda! 👋
        </h2>
        <p className="text-muted-foreground mt-2 text-base">
          Seu negócio em dia. Escolha uma seção para começar.
        </p>
      </section>

      <section className="px-6 sm:px-10">
        <div className="flex flex-wrap gap-3">
          {navButtons.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm
                bg-[#fce4df] text-[#8a4a3a] border border-[#f4c5b8]
                hover:bg-[#f4b8aa] hover:border-[#e8a090] transition-colors"
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="px-6 sm:px-10 pt-8 pb-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Resumo dos últimos 6 meses</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-card rounded-2xl border border-border p-4">
            <p className="text-xs text-muted-foreground">Receita</p>
            <p className="text-lg font-bold text-foreground mt-0.5">{fmt(totalReceita)}</p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-4">
            <p className="text-xs text-muted-foreground">Lucro</p>
            <p className="text-lg font-bold text-emerald-600 mt-0.5">{fmt(totalLucro)}</p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-4">
            <p className="text-xs text-muted-foreground">Clientes</p>
            <p className="text-lg font-bold text-foreground mt-0.5">{totalClientes}</p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-4">
            <p className="text-xs text-muted-foreground">Produtos</p>
            <p className="text-lg font-bold text-foreground mt-0.5">{totalProdutos}</p>
          </div>
        </div>
      </section>

      <section className="px-6 sm:px-10 pt-4 pb-10 flex-1">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Acesso rápido</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {navButtons.map(({ id, label, icon: Icon, desc }) => (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4
                hover:bg-secondary/60 hover:border-[#f4c5b8] transition-colors text-left group"
            >
              <div className="w-11 h-11 rounded-xl bg-[#fce4df] flex items-center justify-center shrink-0 group-hover:bg-[#f4b8aa] transition-colors">
                <Icon size={20} className="text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState<PageId>("login");
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [clients, setClients] = useState<Cliente[]>([]);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregarDados = async () => {
    setCarregando(true);
    try {
      const [prods, clis, vds] = await Promise.all([
        listarProdutos(),
        listarClientes(),
        listarVendas(),
      ]);
      setProdutos(prods);
      setClients(clis);
      setVendas(vds);
    } catch (err) {
      console.error("Erro ao carregar dados do servidor:", err);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    if (page !== "login") {
      carregarDados();
    }
  }, [page === "login"]);

  const goHome = () => setPage("home");
  const goClientes = () => setPage("clientes");
  const goEstoque = () => setPage("estoque");

  const handleSalvarCliente = async (nome: string, cpf: string, email: string, cidade: string) => {
    const resultado = await adicionarCliente({ nome, cpf, email, cidade });
    if (resultado.message && resultado.message.includes("já cadastrado")) {
      throw new Error(resultado.message);
    }
    await carregarDados();
  };

  const handleEditarCliente = async (id: number, dados: { nome: string; email: string; cidade: string }) => {
    await atualizarCliente(id, dados);
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...dados } : c)));
  };

  const handleExcluirCliente = async (id: number) => {
    await excluirCliente(id);
    setClients((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSalvarProduto = async (dados: {
    nome: string;
    categoria: string;
    preco: number;
    custo: number;
    estoque: number;
    fornecedorId: number | null;
  }) => {
    const resultado = await adicionarProdutos(dados);
    if (resultado.message && !resultado.id) {
      throw new Error(resultado.message);
    }
    await carregarDados();
  };

  const handleEditarProduto = async (id: number, dados: {
    nome: string;
    categoria: string;
    preco: number;
    custo: number;
    estoque: number;
  }) => {
    await atualizarProduto(id, dados);
    setProdutos((prev) => prev.map((p) => (p.id === id ? { ...p, ...dados } : p)));
  };

  const handleExcluirProduto = async (id: number) => {
    await excluirProduto(id);
    setProdutos((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <>
      {page === "login" && <Login onLogin={goHome} />}
      {page === "home" && (
        <HomePage onNavigate={setPage} totalClientes={clients.length} totalProdutos={produtos.length} />
      )}
      {page === "estoque" && (
        <EstoquePage
          onBack={goHome}
          produtos={produtos}
          onNovoProduto={() => setPage("cadastroProduto")}
          onEditar={handleEditarProduto}
          onExcluir={handleExcluirProduto}
        />
      )}
      {page === "lucro" && <LucroPage onBack={goHome} produtos={produtos} />}
      {page === "clientes" && (
        <ClientesPage
          onBack={goHome}
          onNovoCliente={() => setPage("cadastroCliente")}
          clients={clients}
          onEditar={handleEditarCliente}
          onExcluir={handleExcluirCliente}
        />
      )}
      {page === "cadastroCliente" && (
        <CadastroClientePage onBack={goClientes} onSalvar={handleSalvarCliente} />
      )}
      {page === "cadastroProduto" && (
        <CadastroProdutoPage onBack={goEstoque} onSalvar={handleSalvarProduto} />
      )}
      {page === "vendas" && <VendasPage onBack={goHome} vendas={vendas} />}
    </>
  );
}