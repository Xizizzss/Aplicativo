import express from "express";
import cors from "cors";
import { createConnection } from "./src/db/connection";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Na Vercel as rotas chegam com o prefixo /api; aqui ele é removido
app.use((req, _res, next) => {
  if (req.url === "/api" || req.url.startsWith("/api/")) {
    req.url = req.url.slice(4) || "/";
  }
  next();
});

async function iniciarServidor() {
  const db = await createConnection();

  // Mantém produtos.estoque = soma das quantidades de todos os tamanhos.
  // Assim as telas que já usam "estoque" continuam funcionando.
  async function recalcularEstoque(produtoId: number | string) {
    await db.query(
      `UPDATE produtos
       SET estoque = (SELECT COALESCE(SUM(quantidade), 0)
                      FROM produto_tamanhos WHERE produto_id = ?)
       WHERE id = ?`,
      [produtoId, produtoId]
    );
  }

  // Normaliza o tamanho (" g " -> "G")
  const normalizarTamanho = (t: any) => String(t ?? "").trim().toUpperCase();

  // ────────────── PRODUTOS ──────────────

  // CREATE
  // Aceita opcionalmente "tamanhos": [{ tamanho: "P", quantidade: 3 }, ...]
  // Se vier "tamanhos", o estoque do produto é a soma deles.
  app.post("/produtos", async (req, res) => {
    const { nome, categoria, preco, custo, fornecedorId } = req.body;
    const tamanhos: { tamanho: string; quantidade: number }[] = Array.isArray(req.body.tamanhos)
      ? req.body.tamanhos
      : [];
    const temTamanhos = tamanhos.length > 0;

    const estoque = temTamanhos
      ? tamanhos.reduce((soma, t) => soma + (Number(t.quantidade) || 0), 0)
      : req.body.estoque;

    if (!nome || !categoria || preco == null || custo == null || estoque == null) {
      return res.status(400).json({ message: "Campos obrigatórios não preenchidos!" });
    }
    try {
      const [result]: any = await db.query(
        "INSERT INTO produtos (nome, categoria, preco, custo, estoque, vendidos, fornecedorId) VALUES (?, ?, ?, ?, ?, 0, ?)",
        [nome, categoria, preco, custo, estoque, fornecedorId ?? null]
      );

      for (const t of tamanhos) {
        const tam = normalizarTamanho(t.tamanho);
        const qtd = Number(t.quantidade) || 0;
        if (!tam || qtd < 0) continue;
        await db.query(
          `INSERT INTO produto_tamanhos (produto_id, tamanho, quantidade)
           VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE quantidade = VALUES(quantidade)`,
          [result.insertId, tam, qtd]
        );
      }
      if (temTamanhos) await recalcularEstoque(result.insertId);

      res.status(201).json({ id: result.insertId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erro ao salvar produto." });
    }
  });

  // READ (todos, já com nome do fornecedor e resumo dos tamanhos, ex.: "P:3,M:5,G:2")
  app.get("/produtos", async (req, res) => {
    const [rows] = await db.query(`
      SELECT p.*, f.nome AS fornecedorNome,
        (SELECT GROUP_CONCAT(CONCAT(t.tamanho, ':', t.quantidade)
                ORDER BY FIELD(t.tamanho, 'PP', 'P', 'M', 'G', 'GG', 'XG', 'XXG'), t.tamanho
                SEPARATOR ',')
         FROM produto_tamanhos t WHERE t.produto_id = p.id) AS tamanhosResumo
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

    const [tamanhos] = await db.query(
      `SELECT tamanho, quantidade FROM produto_tamanhos
       WHERE produto_id = ?
       ORDER BY FIELD(tamanho, 'PP', 'P', 'M', 'G', 'GG', 'XG', 'XXG'), tamanho`,
      [req.params.id]
    );
    res.json({ ...rows[0], tamanhos });
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

  // ────────────── TAMANHOS DO PRODUTO ──────────────

  // listar o estoque por tamanho de um produto
  app.get("/produtos/:id/tamanhos", async (req, res) => {
    try {
      const [rows] = await db.query(
        `SELECT tamanho, quantidade FROM produto_tamanhos
         WHERE produto_id = ?
         ORDER BY FIELD(tamanho, 'PP', 'P', 'M', 'G', 'GG', 'XG', 'XXG'), tamanho`,
        [req.params.id]
      );
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erro ao buscar tamanhos." });
    }
  });

  // definir a quantidade de um tamanho (cria ou atualiza)
  app.put("/produtos/:id/tamanhos", async (req, res) => {
    const tamanho = normalizarTamanho(req.body.tamanho);
    const quantidade = Number(req.body.quantidade);

    if (!tamanho) {
      return res.status(400).json({ message: "Informe o tamanho." });
    }
    if (!Number.isInteger(quantidade) || quantidade < 0) {
      return res.status(400).json({ message: "Quantidade deve ser um número inteiro maior ou igual a 0." });
    }

    try {
      const [prod]: any = await db.query("SELECT id FROM produtos WHERE id = ?", [req.params.id]);
      if (prod.length === 0) return res.status(404).json({ message: "Produto não encontrado." });

      await db.query(
        `INSERT INTO produto_tamanhos (produto_id, tamanho, quantidade)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE quantidade = VALUES(quantidade)`,
        [req.params.id, tamanho, quantidade]
      );
      await recalcularEstoque(req.params.id);
      res.json({ message: "Tamanho atualizado." });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erro ao salvar tamanho." });
    }
  });

  // remover um tamanho do produto
  app.delete("/produtos/:id/tamanhos/:tamanho", async (req, res) => {
    try {
      await db.query(
        "DELETE FROM produto_tamanhos WHERE produto_id = ? AND tamanho = ?",
        [req.params.id, normalizarTamanho(req.params.tamanho)]
      );
      await recalcularEstoque(req.params.id);
      res.json({ message: "Tamanho removido." });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erro ao remover tamanho." });
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

  // CREATE (verifica estoque do tamanho, registra parcelas e o histórico das já pagas)
  // Produtos que têm tamanhos cadastrados exigem o campo "tamanho" na venda.
  // Produtos antigos (sem tamanhos) continuam funcionando como antes.
  app.post("/vendas", async (req, res) => {
    const { produtoId, clienteId, quantidade, valorVenda, data, status } = req.body;
    if (!produtoId || !clienteId || !quantidade || valorVenda == null || !data) {
      return res.status(400).json({ message: "Campos obrigatórios não preenchidos!" });
    }

    const parcelas = Math.max(1, Number(req.body.parcelas) || 1);
    const pagasInformadas =
      req.body.parcelasPagas != null
        ? Number(req.body.parcelasPagas)
        : status === "Pago" ? parcelas : 0;
    const parcelasPagas = Math.min(Math.max(0, pagasInformadas || 0), parcelas);
    const statusFinal = parcelasPagas >= parcelas ? "Pago" : "Pendente";

    try {
      const [produtoRows]: any = await db.query(
        "SELECT estoque FROM produtos WHERE id = ?",
        [produtoId]
      );
      if (produtoRows.length === 0) {
        return res.status(404).json({ message: "Produto não encontrado." });
      }

      // O produto usa divisão por tamanho?
      const [tamRows]: any = await db.query(
        "SELECT tamanho, quantidade FROM produto_tamanhos WHERE produto_id = ?",
        [produtoId]
      );
      const usaTamanhos = tamRows.length > 0;
      const tamanho = normalizarTamanho(req.body.tamanho);

      if (usaTamanhos) {
        if (!tamanho) {
          return res.status(400).json({ message: "Selecione o tamanho da peça." });
        }
        const linha = tamRows.find((t: any) => t.tamanho === tamanho);
        if (!linha) {
          return res.status(400).json({ message: `Este produto não tem o tamanho ${tamanho}.` });
        }
        if (linha.quantidade < quantidade) {
          return res.status(400).json({ message: `Estoque insuficiente no tamanho ${tamanho}.` });
        }
      } else if (produtoRows[0].estoque < quantidade) {
        return res.status(400).json({ message: "Estoque insuficiente para essa venda." });
      }

      const [result]: any = await db.query(
        "INSERT INTO vendas (produtoId, clienteId, quantidade, valorVenda, data, status, parcelas, parcelasPagas, tamanho) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [produtoId, clienteId, quantidade, valorVenda, data, statusFinal, parcelas, parcelasPagas, usaTamanhos ? tamanho : null]
      );

      if (usaTamanhos) {
        await db.query(
          "UPDATE produto_tamanhos SET quantidade = quantidade - ? WHERE produto_id = ? AND tamanho = ?",
          [quantidade, produtoId, tamanho]
        );
      }

      await db.query(
        "UPDATE produtos SET estoque = estoque - ?, vendidos = vendidos + ? WHERE id = ?",
        [quantidade, quantidade, produtoId]
      );

      // Parcelas já pagas no ato da venda entram no histórico (alimenta o lucro)
      if (parcelasPagas > 0) {
        await db.query(
          "INSERT INTO historico_parcelas (vendaId, parcelasAntes, parcelasDepois) VALUES (?, 0, ?)",
          [result.insertId, parcelasPagas]
        );
      }

      res.status(201).json({ id: result.insertId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erro ao registrar venda." });
    }
  });

  // READ (com valor pago e restante)
  app.get("/vendas", async (req, res) => {
    const [rows] = await db.query(`
      SELECT
        v.id, v.quantidade, v.valorVenda,
        DATE_FORMAT(v.data, '%d/%m/%Y') AS data,
        v.status, v.parcelas, v.parcelasPagas, v.tamanho,
        c.nome AS cliente,
        p.nome AS produto,
        ROUND(v.valorVenda / v.parcelas, 2) AS valorParcela,
        CASE WHEN v.parcelasPagas >= v.parcelas
             THEN v.valorVenda
             ELSE ROUND(v.valorVenda / v.parcelas * v.parcelasPagas, 2)
        END AS valorPago,
        v.valorVenda - CASE WHEN v.parcelasPagas >= v.parcelas
             THEN v.valorVenda
             ELSE ROUND(v.valorVenda / v.parcelas * v.parcelasPagas, 2)
        END AS valorRestante
      FROM vendas v
      JOIN clientes c ON c.id = v.clienteId
      JOIN produtos p ON p.id = v.produtoId
      ORDER BY v.data DESC, v.id DESC
    `);
    res.json(rows);
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

  // Atualiza quantas parcelas foram pagas e registra no histórico
  app.put("/vendas/:id/parcelas", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const novas = Number(req.body.parcelasPagas);

      const [rows]: any = await db.query(
        "SELECT parcelas, parcelasPagas FROM vendas WHERE id = ?",
        [id]
      );
      const venda = rows[0];
      if (!venda) return res.status(404).json({ message: "Venda não encontrada." });

      if (!Number.isInteger(novas) || novas < 0 || novas > venda.parcelas) {
        return res
          .status(400)
          .json({ message: `Parcelas pagas deve ser entre 0 e ${venda.parcelas}.` });
      }

      const status = novas >= venda.parcelas ? "Pago" : "Pendente";

      if (novas !== venda.parcelasPagas) {
        await db.query(
          "UPDATE vendas SET parcelasPagas = ?, status = ? WHERE id = ?",
          [novas, status, id]
        );
        await db.query(
          "INSERT INTO historico_parcelas (vendaId, parcelasAntes, parcelasDepois) VALUES (?, ?, ?)",
          [id, venda.parcelasPagas, novas]
        );
      }

      res.json({ id, parcelasPagas: novas, status });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erro ao atualizar parcelas." });
    }
  });

  // Histórico de alterações de parcelas de uma venda
  app.get("/vendas/:id/historico", async (req, res) => {
    try {
      const [rows] = await db.query(
        `SELECT id, parcelasAntes, parcelasDepois,
                DATE_FORMAT(dataAlteracao, '%d/%m/%Y %H:%i') AS dataAlteracao
         FROM historico_parcelas
         WHERE vendaId = ?
         ORDER BY id DESC`,
        [req.params.id]
      );
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erro ao buscar histórico." });
    }
  });

  // ────────────── DASHBOARD ──────────────

  // Resumo mensal (últimos 6 meses): receita e lucro pelo que foi RECEBIDO,
  // no mês em que a parcela foi paga; "vendas" pelo mês da venda.
  app.get("/dashboard/resumo", async (req, res) => {
    try {
      const [recebido]: any = await db.query(`
        SELECT
          DATE_FORMAT(h.dataAlteracao, '%Y-%m') AS mes,
          SUM((h.parcelasDepois - h.parcelasAntes) * v.valorVenda / v.parcelas) AS receita,
          SUM((h.parcelasDepois - h.parcelasAntes)
              * (v.valorVenda - p.custo * v.quantidade) / v.parcelas) AS lucro
        FROM historico_parcelas h
        JOIN vendas v ON v.id = h.vendaId
        JOIN produtos p ON p.id = v.produtoId
        WHERE h.dataAlteracao >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 5 MONTH), '%Y-%m-01')
        GROUP BY mes
      `);

      const [vendidas]: any = await db.query(`
        SELECT DATE_FORMAT(data, '%Y-%m') AS mes, SUM(quantidade) AS vendas
        FROM vendas
        WHERE data >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 5 MONTH), '%Y-%m-01')
        GROUP BY mes
      `);

      const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
      const porMes = new Map<string, { receita: number; lucro: number; vendas: number }>();
      const pegar = (mes: string) => {
        if (!porMes.has(mes)) porMes.set(mes, { receita: 0, lucro: 0, vendas: 0 });
        return porMes.get(mes)!;
      };

      recebido.forEach((r: any) => {
        const m = pegar(r.mes);
        m.receita = Number(r.receita);
        m.lucro = Number(r.lucro);
      });
      vendidas.forEach((r: any) => {
        pegar(r.mes).vendas = Number(r.vendas);
      });

      const dados = [...porMes.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([mes, v]) => ({
          mes: MESES[Number(mes.split("-")[1]) - 1],
          receita: Math.round(v.receita * 100) / 100,
          lucro: Math.round(v.lucro * 100) / 100,
          vendas: v.vendas,
        }));

      res.json(dados);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erro ao buscar resumo." });
    }
  });

  if (!process.env.VERCEL) {
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  }
}

iniciarServidor();

export default app;
