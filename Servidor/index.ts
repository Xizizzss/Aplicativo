import express from "express";
import cors from "cors";
import { createConnection } from "./src/db/connection";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

async function iniciarServidor() {
  const db = await createConnection();

  // ────────────── PRODUTOS ──────────────

  // CREATE
  app.post("/produtos", async (req, res) => {
    const { nome, categoria, preco, custo, estoque, fornecedorId } = req.body;
    if (!nome || !categoria || preco == null || custo == null || estoque == null) {
      return res.status(400).json({ message: "Campos obrigatórios não preenchidos!" });
    }
    try {
      const [result]: any = await db.query(
        "INSERT INTO produtos (nome, categoria, preco, custo, estoque, vendidos, fornecedorId) VALUES (?, ?, ?, ?, ?, 0, ?)",
        [nome, categoria, preco, custo, estoque, fornecedorId ?? null]
      );
      res.status(201).json({ id: result.insertId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erro ao salvar produto." });
    }
  });

  // READ (todos, já com nome do fornecedor)
  app.get("/produtos", async (req, res) => {
    const [rows] = await db.query(`
      SELECT p.*, f.nome AS fornecedorNome
      FROM produtos p
      LEFT JOIN fornecedores f ON f.id = p.fornecedorId
      ORDER BY p.nome
    `);
    res.json(rows);
  });

  // READ (um só)
  app.get("/produtos/:id", async (req, res) => {
    const [rows]: any = await db.query(`
      SELECT p.*, f.nome AS fornecedorNome
      FROM produtos p
      LEFT JOIN fornecedores f ON f.id = p.fornecedorId
      WHERE p.id = ?
    `, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: "Produto não encontrado." });
    res.json(rows[0]);
  });

  // UPDATE
  app.put("/produtos/:id", async (req, res) => {
    const { id } = req.params;
    const campos = req.body;
    const chaves = Object.keys(campos);
    if (chaves.length === 0) return res.status(400).json({ message: "Nada para atualizar." });

    try {
      const sets = chaves.map((campo) => `${campo} = ?`).join(", ");
      const valores = chaves.map((campo) => campos[campo]);

      await db.query(`UPDATE produtos SET ${sets} WHERE id = ?`, [...valores, id]);
      res.json({ message: "Produto atualizado." });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erro ao atualizar produto." });
    }
  });

  // DELETE
  app.delete("/produtos/:id", async (req, res) => {
    try {
      await db.query("DELETE FROM produtos WHERE id = ?", [req.params.id]);
      res.json({ message: "Produto excluído." });
    } catch (err: any) {
      if (err.code === "ER_ROW_IS_REFERENCED_2" || err.code === "ER_ROW_IS_REFERENCED") {
        return res.status(409).json({ message: "Não é possível excluir: este produto já possui vendas registradas." });
      }
      console.error(err);
      res.status(500).json({ message: "Erro ao excluir produto." });
    }
  });

  // ────────────── FORNECEDORES ──────────────

  // CREATE
  app.post("/fornecedores", async (req, res) => {
    const { nome, telefone, email, cidade } = req.body;
    if (!nome) {
      return res.status(400).json({ message: "Nome do fornecedor é obrigatório!" });
    }
    try {
      const [result]: any = await db.query(
        "INSERT INTO fornecedores (nome, telefone, email, cidade) VALUES (?, ?, ?, ?)",
        [nome, telefone ?? null, email ?? null, cidade ?? null]
      );
      res.status(201).json({ id: result.insertId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erro ao salvar fornecedor." });
    }
  });

  // READ (todos)
  app.get("/fornecedores", async (req, res) => {
    const [rows] = await db.query("SELECT * FROM fornecedores ORDER BY nome");
    res.json(rows);
  });

  // UPDATE
  app.put("/fornecedores/:id", async (req, res) => {
    const { id } = req.params;
    const campos = req.body;
    const chaves = Object.keys(campos);
    if (chaves.length === 0) return res.status(400).json({ message: "Nada para atualizar." });

    try {
      const sets = chaves.map((campo) => `${campo} = ?`).join(", ");
      const valores = chaves.map((campo) => campos[campo]);

      await db.query(`UPDATE fornecedores SET ${sets} WHERE id = ?`, [...valores, id]);
      res.json({ message: "Fornecedor atualizado." });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erro ao atualizar fornecedor." });
    }
  });

  // DELETE
  app.delete("/fornecedores/:id", async (req, res) => {
    try {
      await db.query("DELETE FROM fornecedores WHERE id = ?", [req.params.id]);
      res.json({ message: "Fornecedor excluído." });
    } catch (err: any) {
      if (err.code === "ER_ROW_IS_REFERENCED_2" || err.code === "ER_ROW_IS_REFERENCED") {
        return res.status(409).json({ message: "Não é possível excluir: este fornecedor está vinculado a produtos." });
      }
      console.error(err);
      res.status(500).json({ message: "Erro ao excluir fornecedor." });
    }
  });

  // ────────────── CLIENTES ──────────────
  // (sem alterações — mantém igual ao seu original)

  app.post("/clientes", async (req, res) => {
    const { nome, cpf, email, cidade } = req.body;
    if (!nome || !cpf || !email || !cidade) {
      return res.status(400).json({ message: "Campos obrigatórios não preenchidos!" });
    }
    try {
      const [result]: any = await db.query(
        "INSERT INTO clientes (nome, cpf, email, cidade) VALUES (?, ?, ?, ?)",
        [nome, cpf, email, cidade]
      );
      res.status(201).json({ id: result.insertId });
    } catch (err: any) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ message: "CPF já cadastrado." });
      }
      console.error(err);
      res.status(500).json({ message: "Erro ao salvar cliente." });
    }
  });

  app.get("/clientes", async (req, res) => {
    const [rows] = await db.query(`
      SELECT
        c.id, c.nome, c.cpf, c.email, c.cidade,
        COUNT(v.id) AS compras,
        COALESCE(SUM(v.valorVenda), 0) AS total,
        MAX(v.data) AS ultima
      FROM clientes c
      LEFT JOIN vendas v ON v.clienteId = c.id
      GROUP BY c.id
    `);
    res.json(rows);
  });

  app.get("/clientes/:id", async (req, res) => {
    const [rows]: any = await db.query("SELECT * FROM clientes WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: "Cliente não encontrado." });
    res.json(rows[0]);
  });

  app.put("/clientes/:id", async (req, res) => {
    const { id } = req.params;
    const campos = req.body;
    const chaves = Object.keys(campos);
    if (chaves.length === 0) return res.status(400).json({ message: "Nada para atualizar." });

    try {
      const sets = chaves.map((campo) => `${campo} = ?`).join(", ");
      const valores = chaves.map((campo) => campos[campo]);

      await db.query(`UPDATE clientes SET ${sets} WHERE id = ?`, [...valores, id]);
      res.json({ message: "Cliente atualizado." });
    } catch (err: any) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ message: "CPF já cadastrado." });
      }
      console.error(err);
      res.status(500).json({ message: "Erro ao atualizar cliente." });
    }
  });

  app.delete("/clientes/:id", async (req, res) => {
    try {
      await db.query("DELETE FROM clientes WHERE id = ?", [req.params.id]);
      res.json({ message: "Cliente excluído." });
    } catch (err: any) {
      if (err.code === "ER_ROW_IS_REFERENCED_2" || err.code === "ER_ROW_IS_REFERENCED") {
        return res.status(409).json({ message: "Não é possível excluir: este cliente já possui vendas registradas." });
      }
      console.error(err);
      res.status(500).json({ message: "Erro ao excluir cliente." });
    }
  });

  // ────────────── VENDAS ──────────────

  // CREATE (agora verifica estoque antes de vender)
  app.post("/vendas", async (req, res) => {
    const { produtoId, clienteId, quantidade, valorVenda, data, status } = req.body;
    if (!produtoId || !clienteId || !quantidade || valorVenda == null || !data) {
      return res.status(400).json({ message: "Campos obrigatórios não preenchidos!" });
    }
    try {
      const [produtoRows]: any = await db.query(
        "SELECT estoque FROM produtos WHERE id = ?",
        [produtoId]
      );
      if (produtoRows.length === 0) {
        return res.status(404).json({ message: "Produto não encontrado." });
      }
      if (produtoRows[0].estoque < quantidade) {
        return res.status(400).json({ message: "Estoque insuficiente para essa venda." });
      }

      const [result]: any = await db.query(
        "INSERT INTO vendas (produtoId, clienteId, quantidade, valorVenda, data, status) VALUES (?, ?, ?, ?, ?, ?)",
        [produtoId, clienteId, quantidade, valorVenda, data, status || "Pendente"]
      );

      await db.query(
        "UPDATE produtos SET estoque = estoque - ?, vendidos = vendidos + ? WHERE id = ?",
        [quantidade, quantidade, produtoId]
      );

      res.status(201).json({ id: result.insertId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erro ao registrar venda." });
    }
  });

  app.get("/vendas", async (req, res) => {
    const [rows] = await db.query(`
      SELECT
        v.id, v.quantidade, v.valorVenda, v.data, v.status,
        c.nome AS cliente,
        p.nome AS produto
      FROM vendas v
      JOIN clientes c ON c.id = v.clienteId
      JOIN produtos p ON p.id = v.produtoId
      ORDER BY v.data DESC
    `);
    res.json(rows);
  });

  app.put("/vendas/:id", async (req, res) => {
    const { id } = req.params;
    const campos = req.body;
    const chaves = Object.keys(campos);
    if (chaves.length === 0) return res.status(400).json({ message: "Nada para atualizar." });

    try {
      const sets = chaves.map((campo) => `${campo} = ?`).join(", ");
      const valores = chaves.map((campo) => campos[campo]);

      await db.query(`UPDATE vendas SET ${sets} WHERE id = ?`, [...valores, id]);
      res.json({ message: "Venda atualizada." });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erro ao atualizar venda." });
    }
  });

  app.delete("/vendas/:id", async (req, res) => {
    try {
      await db.query("DELETE FROM vendas WHERE id = ?", [req.params.id]);
      res.json({ message: "Venda excluída." });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erro ao excluir venda." });
    }
  });

  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

iniciarServidor();