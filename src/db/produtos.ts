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
  const resposta = await fetch(`${API_URL}/produtos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
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