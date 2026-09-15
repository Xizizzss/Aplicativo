import { API_URL } from "./api";

export interface Fornecedor {
  id: number;
  nome: string;
  telefone: string | null;
  email: string | null;
  cidade: string | null;
}

export async function listarFornecedores(): Promise<Fornecedor[]> {
  const resposta = await fetch(`${API_URL}/fornecedores`);
  return await resposta.json();
}

export async function adicionarFornecedor(dados: Omit<Fornecedor, "id">) {
  const resposta = await fetch(`${API_URL}/fornecedores`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });
  const dado = await resposta.json();
  if (!resposta.ok) throw new Error(dado.message || "Erro ao cadastrar fornecedor.");
  return dado;
}

export async function atualizarFornecedor(id: number, dados: Partial<Omit<Fornecedor, "id">>) {
  const resposta = await fetch(`${API_URL}/fornecedores/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });
  const dado = await resposta.json();
  if (!resposta.ok) throw new Error(dado.message || "Erro ao atualizar fornecedor.");
  return dado;
}

export async function excluirFornecedor(id: number) {
  const resposta = await fetch(`${API_URL}/fornecedores/${id}`, { method: "DELETE" });
  const dado = await resposta.json();
  if (!resposta.ok) throw new Error(dado.message || "Erro ao excluir fornecedor.");
  return dado;
}