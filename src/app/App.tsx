import React, { useState, useEffect } from "react";

import { listarProdutos, adicionarProdutos } from "../db/produtos";

import type { Produto } from "../db/database";

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

// ─── Types ────────────────────────────────────────────────────────────────────

type PageId = "home" | "estoque" | "lucro" | "clientes" | "vendas";

// ─── Data ─────────────────────────────────────────────────────────────────────

const products = [
  { id: 1, nome: "Blusa Linho Rosa", categoria: "Blusas", preco: 89.9, custo: 38.0, estoque: 14, vendidos: 42 },
  { id: 2, nome: "Calça Wide Leg Bege", categoria: "Calças", preco: 159.9, custo: 68.0, estoque: 3, vendidos: 27 },
  { id: 3, nome: "Vestido Midi Floral", categoria: "Vestidos", preco: 219.9, custo: 92.0, estoque: 8, vendidos: 35 },
  { id: 4, nome: "Cropped Tricot Off", categoria: "Blusas", preco: 119.9, custo: 51.0, estoque: 0, vendidos: 61 },
  { id: 5, nome: "Saia Plissada Lilás", categoria: "Saias", preco: 139.9, custo: 58.0, estoque: 5, vendidos: 19 },
  { id: 6, nome: "Blazer Oversized Nude", categoria: "Blazers", preco: 289.9, custo: 128.0, estoque: 6, vendidos: 12 },
  { id: 7, nome: "Conjunto Linho Terracota", categoria: "Conjuntos", preco: 349.9, custo: 145.0, estoque: 2, vendidos: 8 },
  { id: 8, nome: "Short Jeans Destroyed", categoria: "Shorts", preco: 109.9, custo: 44.0, estoque: 11, vendidos: 33 },
];

const salesMonths = [
  { mes: "Mar", receita: 3200, lucro: 1100, vendas: 58 },
  { mes: "Abr", receita: 4100, lucro: 1540, vendas: 74 },
  { mes: "Mai", receita: 3750, lucro: 1280, vendas: 65 },
  { mes: "Jun", receita: 5200, lucro: 2050, vendas: 92 },
  { mes: "Jul", receita: 4800, lucro: 1890, vendas: 83 },
  { mes: "Ago", receita: 6100, lucro: 2480, vendas: 107 },
];

const clients = [
  { id: 1, nome: "Ana Beatriz Souza", email: "ana.beatriz@gmail.com", cidade: "São Paulo", compras: 7, total: 1248.3, ultima: "02/08/2026" },
  { id: 2, nome: "Camila Ferreira", email: "camilafer@hotmail.com", cidade: "Curitiba", compras: 4, total: 689.6, ultima: "29/07/2026" },
  { id: 3, nome: "Fernanda Lima", email: "ferlima@gmail.com", cidade: "Rio de Janeiro", compras: 11, total: 2340.0, ultima: "01/08/2026" },
  { id: 4, nome: "Juliana Carvalho", email: "jucarvalho@outlook.com", cidade: "Belo Horizonte", compras: 2, total: 459.8, ultima: "18/07/2026" },
  { id: 5, nome: "Mariana Costa", email: "mari.costa@gmail.com", cidade: "Florianópolis", compras: 9, total: 1876.5, ultima: "03/08/2026" },
  { id: 6, nome: "Patricia Mendes", email: "pati.mendes@gmail.com", cidade: "Salvador", compras: 3, total: 779.7, ultima: "27/07/2026" },
  { id: 7, nome: "Renata Oliveira", email: "renataoliveira@gmail.com", cidade: "Recife", compras: 6, total: 1102.4, ultima: "31/07/2026" },
];

const recentSales = [
  { id: 1, cliente: "Mariana Costa", produto: "Vestido Midi Floral", valor: 219.9, data: "03/08/2026", status: "Pago" },
  { id: 2, cliente: "Ana Beatriz Souza", produto: "Blusa Linho Rosa", valor: 89.9, data: "02/08/2026", status: "Pago" },
  { id: 3, cliente: "Fernanda Lima", produto: "Blazer Oversized Nude", valor: 289.9, data: "01/08/2026", status: "Pago" },
  { id: 4, cliente: "Renata Oliveira", produto: "Calça Wide Leg Bege", valor: 159.9, data: "31/07/2026", status: "Pago" },
  { id: 5, cliente: "Camila Ferreira", produto: "Short Jeans Destroyed", valor: 109.9, data: "29/07/2026", status: "Pago" },
  { id: 6, cliente: "Patricia Mendes", produto: "Saia Plissada Lilás", valor: 139.9, data: "27/07/2026", status: "Pago" },
  { id: 7, cliente: "Juliana Carvalho", produto: "Conjunto Linho Terracota", valor: 349.9, data: "18/07/2026", status: "Pendente" },
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
}: {
  title: string;
  subtitle: string;
  onBack: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'Nunito', sans-serif" }}>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-border px-4 sm:px-8 py-4 flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">Início</span>
        </button>
        <div className="w-px h-5 bg-border" />
        <div>
          <h1 className="text-base font-bold text-foreground leading-tight">{title}</h1>
          <p className="text-xs text-muted-foreground hidden sm:block">{subtitle}</p>
        </div>
      </header>

      <main className="px-4 sm:px-8 py-6 max-w-5xl mx-auto">{children}</main>
    </div>
  );
}

// ─── Page: Estoque ────────────────────────────────────────────────────────────

function EstoquePage({ onBack }: { onBack: () => void }) {
  const [search, setSearch] = useState("");
  const filtered = products.filter(
    (p) =>
      p.nome.toLowerCase().includes(search.toLowerCase()) ||
      p.categoria.toLowerCase().includes(search.toLowerCase())
  );
  const semEstoque = products.filter((p) => p.estoque === 0).length;
  const baixoEstoque = products.filter((p) => p.estoque > 0 && p.estoque <= 3).length;

  return (
    <PageShell title="Estoque" subtitle="Controle de peças disponíveis" onBack={onBack}>
      <div className="space-y-5">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{products.length}</p>
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

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Produto</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Categoria</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Preço</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Custo</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Margem</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Estoque</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const m = (((p.preco - p.custo) / p.preco) * 100).toFixed(0);
                  return (
                    <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">{p.nome}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{p.categoria}</td>
                      <td className="px-4 py-3 text-right font-mono text-sm">{fmt(p.preco)}</td>
                      <td className="px-4 py-3 text-right font-mono text-sm text-muted-foreground hidden md:table-cell">{fmt(p.custo)}</td>
                      <td className="px-4 py-3 text-right hidden md:table-cell">
                        <span className="font-mono text-sm text-emerald-600">{m}%</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StockBadge qty={p.estoque} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

// ─── Page: Lucro ──────────────────────────────────────────────────────────────

function LucroPage({ onBack }: { onBack: () => void }) {
  const totalReceita = salesMonths.reduce((s, d) => s + d.receita, 0);
  const totalLucro = salesMonths.reduce((s, d) => s + d.lucro, 0);
  const margemMedia = ((totalLucro / totalReceita) * 100).toFixed(1);

  const categorias = ["Blusas", "Calças", "Vestidos", "Saias", "Blazers", "Conjuntos", "Shorts"];
  const pieData = categorias.map((cat) => {
    const ps = products.filter((p) => p.categoria === cat);
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
              {[...products]
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

// ─── Page: Clientes ───────────────────────────────────────────────────────────

function ClientesPage({ onBack }: { onBack: () => void }) {
  const [search, setSearch] = useState("");
  const filtered = clients.filter(
    (c) =>
      c.nome.toLowerCase().includes(search.toLowerCase()) ||
      c.cidade.toLowerCase().includes(search.toLowerCase())
  );
  const total = clients.reduce((s, c) => s + c.total, 0);
  const topCliente = [...clients].sort((a, b) => b.total - a.total)[0];

  return (
    <PageShell title="Clientes" subtitle="Histórico e base de compradores" onBack={onBack}>
      <div className="space-y-5">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{clients.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">clientes</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <p className="text-xl font-bold text-foreground">{fmt(total / clients.length)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">ticket médio</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <p className="text-xl font-bold text-primary">{topCliente.nome.split(" ")[0]}</p>
            <p className="text-xs text-muted-foreground mt-0.5">top cliente</p>
          </div>
        </div>

        <div className="relative max-w-xs">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-ring/40"
            placeholder="Buscar por nome ou cidade…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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
                    <td className="px-4 py-3 text-right font-mono hidden sm:table-cell">{fmt(c.total)}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground hidden md:table-cell">{c.ultima}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

// ─── Page: Vendas ─────────────────────────────────────────────────────────────

function VendasPage({ onBack }: { onBack: () => void }) {
  const totalVendas = salesMonths.reduce((s, d) => s + d.vendas, 0);
  const totalReceita = salesMonths.reduce((s, d) => s + d.receita, 0);
  const ticketMedio = totalReceita / totalVendas;

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
                {recentSales.map((s) => (
                  <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{s.cliente}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{s.produto}</td>
                    <td className="px-4 py-3 text-right font-mono">{fmt(s.valor)}</td>
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

function HomePage({ onNavigate }: { onNavigate: (p: PageId) => void }) {
  const totalReceita = salesMonths.reduce((s, d) => s + d.receita, 0);
  const totalLucro = salesMonths.reduce((s, d) => s + d.lucro, 0);

  return (
    <div
      className="min-h-screen bg-background flex flex-col"
      style={{ fontFamily: "'Nunito', sans-serif" }}
    >
      {/* Top bar */}
      <header className="px-6 sm:px-10 pt-8 pb-0 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <ShoppingBag size={16} className="text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Closet Pro</span>
          </div>
          <p className="text-xs text-muted-foreground pl-10">gestão de roupas</p>
        </div>
        <p className="text-xs text-muted-foreground pt-2">Agosto 2026</p>
      </header>

      {/* Welcome */}
      <section className="px-6 sm:px-10 pt-10 pb-6">
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight">
          Olá, bem-vinda! 👋
        </h2>
        <p className="text-muted-foreground mt-2 text-base">
          Seu negócio em dia. Escolha uma seção para começar.
        </p>
      </section>

      {/* Navigation buttons */}
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

      {/* Summary cards */}
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
            <p className="text-lg font-bold text-foreground mt-0.5">{clients.length}</p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-4">
            <p className="text-xs text-muted-foreground">Produtos</p>
            <p className="text-lg font-bold text-foreground mt-0.5">{products.length}</p>
          </div>
        </div>
      </section>

      {/* Quick access cards */}
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
  const [page, setPage] = useState<PageId>("home");

  const goHome = () => setPage("home");

  return (
    <>
      {page === "home" && <HomePage onNavigate={setPage} />}
      {page === "estoque" && <EstoquePage onBack={goHome} />}
      {page === "lucro" && <LucroPage onBack={goHome} />}
      {page === "clientes" && <ClientesPage onBack={goHome} />}
      {page === "vendas" && <VendasPage onBack={goHome} />}
    </>
  );
}
