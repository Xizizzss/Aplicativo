import "dotenv/config";
import mysql from "mysql2/promise";

const host = process.env.DB_HOST ?? "localhost";
const remoto = host !== "localhost" && host !== "127.0.0.1";

const pool = mysql.createPool({
  host,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER ?? "root",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME ?? "closet_pro",
  decimalNumbers: true, // DECIMAL vira number, não string
  waitForConnections: true,
  connectionLimit: 5,
  // O TiDB exige conexão criptografada (TLS)
  ssl: remoto ? { minVersion: "TLSv1.2", rejectUnauthorized: true } : undefined,
});

export async function createConnection() {
  console.log("Pool de conexões MySQL pronto.");
  return pool;
}