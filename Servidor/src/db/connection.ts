import mysql from "mysql2/promise";

export async function createConnection() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "dudu1504",
    database: "closet_pro",
    decimalNumbers: true   // ← adiciona isso: faz DECIMAL virar number, não string
  });

  console.log("Conectado ao banco de dados MySQL!");
  return connection;
}