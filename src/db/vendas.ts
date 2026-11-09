import { API_URL } from "./api";

export interface Venda {
  id: number;
  cliente: string;
  produto: string;
  quantidade: number;
  valorVenda: number;
  data: string;
  status: string;
  parcelas: number;
  parcelasPagas: number;
  valorParcela: number;
  valorPago: number;
  valorRestante: number;
}

export interface HistoricoParcela {
  id: number;
  parcelasAntes: number;
  parcelasDepois: number;
  dataAlteracao: string;
}

export async function listarVendas(): Promise<Venda[]> {
  const resposta = await fetch(`${API_URL}/vendas`);
  if (!resposta.ok) throw new Error("Erro ao buscar vendas.");
  const lista = await resposta.json();

  // O MySQL devolve valores DECIMAL como texto; converte para número
  return lista.map((v: any) => ({
    ...v,
    valorVenda: Number(v.valorVenda),
    parcelas: Number(v.parcelas),
    parcelasPagas: Number(v.parcelasPagas),
    valorParcela: Number(v.valorParcela),
    valorPago: Number(v.valorPago),
    valorRestante: Number(v.valorRestante),
  }));
}

export async function registrarVenda(dados: {
  produtoId: number;
  clienteId: number;
  quantidade: number;
  valorVenda: number;
  data: string;
  status?: string;
  parcelas?: number;
  parcelasPagas?: number;
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

// Atualiza quantas parcelas já foram pagas (o backend recalcula o status)
export async function atualizarParcelasPagas(id: number, parcelasPagas: number) {
  const resposta = await fetch(`${API_URL}/vendas/${id}/parcelas`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ parcelasPagas }),
  });
  if (!resposta.ok) {
    const erro = await resposta.json();
    throw new Error(erro.message || "Erro ao atualizar parcelas.");
  }
  return await resposta.json();
}

export async function listarHistoricoParcelas(id: number): Promise<HistoricoParcela[]> {
  const resposta = await fetch(`${API_URL}/vendas/${id}/historico`);
  if (!resposta.ok) throw new Error("Erro ao buscar histórico.");
  return await resposta.json();
}

export interface ResumoMes {
  mes: string;
  receita: number;
  lucro: number;
  vendas: number;
}

export async function buscarResumoMensal(): Promise<ResumoMes[]> {
  const resposta = await fetch(`${API_URL}/dashboard/resumo`);
  if (!resposta.ok) throw new Error("Erro ao buscar resumo.");
  return await resposta.json();
}