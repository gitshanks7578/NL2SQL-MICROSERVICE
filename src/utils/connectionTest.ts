import { Client } from "pg";
import mysql from "mysql2/promise";
export const testPostgresConnection = async ({
  host,
  port,
  username,
  password,
  dbName,
}: {
  host: string;
  port?: number;
  username: string;
  password: string;
  dbName: string;
}) => {
  const client = new Client({
    host,
    port: port || 5432,
    user: username,
    password,
    database: dbName,
    ssl: {
  rejectUnauthorized: false,
}
  });

  try {
    await client.connect();
    await client.query("SELECT 1"); // lightweight health check
    console.log(("reached connectiontest || success || now ending"))
    await client.end();

    return true;
  } catch (err) {
    await client.end().catch(() => {});
    const message = err instanceof Error ? err.message : "weird error"
    throw new Error(`Database connection failed || ${message}`);
  }
};

export const testMysqlConnection = async({
   host,
  port,
  username,
  password,
  dbName,
} : {
   host: string;
  port?: number;
  username: string;
  password: string;
  dbName: string;
}) =>{
   const connection = await mysql.createConnection({
    host,
    port: port || 3306,
    user: username,
    password,
    database: dbName,
  });
try {
    await connection.query("SELECT 1");
    console.log("connection stable || now ending")
    await connection.end();
    return true;
  } catch (err) {
    await connection.end().catch(() => {});
    const message = err instanceof Error ? err.message : "weird error"
    throw new Error(`Database connection failed || ${message}`);
  }
}

