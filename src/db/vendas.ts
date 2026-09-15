import { API_URL } from "./api";

export interface Venda {
  id: number;
  cliente: string;
  produto: string;
  quantidade: number;
  valorVenda: number;
  data: string;
  status: string;
}

export async function listarVendas(): Promise<Venda[]> {
  const resposta = await fetch(`${API_URL}/vendas`);
  return await resposta.json();
}

export async function registrarVenda(dados: {
  produtoId: number;
  clienteId: number;
  quantidade: number;
  valorVenda: number;
  data: string;
  status: string;
}) {
  const resposta = await fetch(`${API_URL}/vendas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });
  if (!resposta.ok) {
    const erro = await resposta.json();
    throw new Error(erro.message || "Erro ao registrar venda.");
  }
  return await resposta.json();
}