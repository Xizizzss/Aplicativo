import { API_URL } from "./api";

export interface Cliente {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  cidade: string;
  compras: number;
  total: number;
  ultima: string | null;
}

export async function listarClientes(): Promise<Cliente[]> {
  const resposta = await fetch(`${API_URL}/clientes`);
  return await resposta.json();
}

export async function adicionarCliente(cliente: {
  nome: string;
  cpf: string;
  email: string;
  cidade: string;
}) {
  const resposta = await fetch(`${API_URL}/clientes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cliente),
  });
  return await resposta.json();
}

export async function atualizarCliente(id: number, dados: Partial<Cliente>) {
  const resposta = await fetch(`${API_URL}/clientes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });
  return await resposta.json();
}

export async function excluirCliente(id: number) {
  const resposta = await fetch(`${API_URL}/clientes/${id}`, { method: "DELETE" });
  return await resposta.json();
}