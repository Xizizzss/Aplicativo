import Dexie, { type Table } from "dexie";

// Nomes dos campos alinhados com o que a interface do Figma já espera,
// pra não precisar reescrever toda a tabela HTML depois.
export interface Produto {
  id?: number;
  nome: string;
  categoria: string;
  preco: number;      // era "precoVenda" — renomeado pra bater com o Figma
  custo: number;       // era "precoCompra" — renomeado
  estoque: number;      // era "quantidade" — renomeado
  vendidos: number;     // NOVO — o Figma usa isso pra calcular lucro por produto
}

export interface Venda {
  id?: number;
  produtoId: number;
  clienteNome: string;
  quantidade: number;
  valorVenda: number;
  data: string;
}

class AppDatabase extends Dexie {
  produtos!: Table<Produto>;
  vendas!: Table<Venda>;

  constructor() {
    super("appRoupasDB");

    this.version(1).stores({
      produtos: "++id, nome, categoria",
      vendas: "++id, produtoId, clienteNome, data",
    });
  }
}

export const db = new AppDatabase();