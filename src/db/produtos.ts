import { db, type Produto } from "./database";

// CREATE — adicionar produto novo
export async function adicionarProdutos(produto: Omit<Produto, "id" | "vendidos">) {
  return await db.produtos.add({ ...produto, vendidos: 0 });
}

// READ — listar todos os produtos
export async function listarProdutos() {
  return await db.produtos.toArray();
}

// UPDATE — atualizar um produto (ex: baixar estoque após venda)
export async function atualizaProdutos(id: number, dados: Partial<Produto>) {
  return await db.produtos.update(id, dados);
}

// DELETE — remover produtos
export async function excluirProdutos(id: number) {
  return await db.produtos.delete(id);
}