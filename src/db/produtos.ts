import { API_URL } from "./api";

export interface Produto {
  id: number;
  nome: string;
  categoria: string;
  preco: number;
  custo: number;
  estoque: number;
  vendidos: number;
  fornecedorId: number | null;
  fornecedorNome: string | null;
  // Resumo vindo do back, ex.: "P:3,M:5,G:2" (null/vazio se o produto não tem tamanhos)
  tamanhosResumo?: string | null;
}

export interface TamanhoEstoque {
  tamanho: string;
  quantidade: number;
}

// Converte "P:3,M:5,G:2" em [{ tamanho: "P", quantidade: 3 }, ...]
export function lerTamanhos(resumo?: string | null): TamanhoEstoque[] {
  if (!resumo) return [];
  return resumo
    .split(",")
    .map((item) => {
      const [tamanho, quantidade] = item.split(":");
      return { tamanho, quantidade: Number(quantidade) || 0 };
    })
    .filter((t) => t.tamanho);
}

export async function listarProdutos(): Promise<Produto[]> {
  const resposta = await fetch(`${API_URL}/produtos`);
  return await resposta.json();
}

export async function adicionarProdutos(dados: {
  nome: string;
  categoria: string;
  preco: number;
  custo: number;
  estoque: number;
  fornecedorId: number | null;
  tamanhos?: TamanhoEstoque[];
}) {
  const resposta = await fetch(`${API_URL}/produtos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });
  const dado = await resposta.json();
  if (!resposta.ok) throw new Error(dado.message || "Erro ao cadastrar produto.");
  return dado;
}

export async function atualizarProduto(id: number, dados: Partial<Produto>) {
  // Campos que só existem na leitura (não são colunas da tabela produtos)
  const { fornecedorNome, tamanhosResumo, ...campos } = dados as any;

  const resposta = await fetch(`${API_URL}/produtos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(campos),
  });
  const dado = await resposta.json();
  if (!resposta.ok) throw new Error(dado.message || "Erro ao atualizar produto.");
  return dado;
}

export async function excluirProduto(id: number) {
  const resposta = await fetch(`${API_URL}/produtos/${id}`, { method: "DELETE" });
  const dado = await resposta.json();
  if (!resposta.ok) throw new Error(dado.message || "Erro ao excluir produto.");
  return dado;
}

// ────────────── Tamanhos do produto ──────────────

export async function listarTamanhos(produtoId: number): Promise<TamanhoEstoque[]> {
  const resposta = await fetch(`${API_URL}/produtos/${produtoId}/tamanhos`);
  const dado = await resposta.json();
  if (!resposta.ok) throw new Error(dado.message || "Erro ao buscar tamanhos.");
  return dado;
}

// Cria ou atualiza a quantidade de um tamanho
export async function definirTamanho(produtoId: number, tamanho: string, quantidade: number) {
  const resposta = await fetch(`${API_URL}/produtos/${produtoId}/tamanhos`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tamanho, quantidade }),
  });
  const dado = await resposta.json();
  if (!resposta.ok) throw new Error(dado.message || "Erro ao salvar tamanho.");
  return dado;
}

export async function removerTamanho(produtoId: number, tamanho: string) {
  const resposta = await fetch(
    `${API_URL}/produtos/${produtoId}/tamanhos/${encodeURIComponent(tamanho)}`,
    { method: "DELETE" }
  );
  const dado = await resposta.json();
  if (!resposta.ok) throw new Error(dado.message || "Erro ao remover tamanho.");
  return dado;
}