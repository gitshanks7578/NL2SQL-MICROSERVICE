import { MySQLExtractor } from "./pipeline/1_mysql_extractor";
import { PostgresExtractor } from "./pipeline/1_postgres_extractor";
import { SchemaNormalizer } from "./pipeline/2_normalizer";
import { relation_resolver } from "./pipeline/3_relationResolver";
import { ApiError } from "../../utils/errorHandler";
import mysql from "mysql2/promise";
import { Client } from "pg";
import { decrypt } from "../../utils/decrypter.js";
export const runSchemaIngestion = async (db: any) => {
    let connection: any;
    try {
        if (db.type === "MYSQL") {
            connection = await mysql.createConnection({
                host: db.host,
                user: db.username,
                password: decrypt(db.password),
                database: db.dbName,
                port: db.port || 3306
            });
        }

        if (db.type === "POSTGRES") {
            connection = new Client({
                host: db.host,
                user: db.username,
                password: decrypt(db.password),
                database: db.dbName,
                port: db.port || 5432,
                  ssl: {
  rejectUnauthorized: false,
}
            });

            await connection.connect();
        }
        if (!connection) {
            throw new Error("Unsupported database type");
        }

        let extractor;

        if (db.type === "MYSQL") {
            extractor = new MySQLExtractor(connection);
        } else {
            extractor = new PostgresExtractor(connection);
        }

        const raw = await extractor.extract();

        const normalizer = new SchemaNormalizer();
        const normalized = normalizer.normalize(raw);


        // 4. Relation resolve
        const relation = new relation_resolver()
        const resolved = relation.relationResolver(normalized);
        if (db.type === "POSTGRES") {
            await connection.end?.();
        } else {
            await connection.destroy?.();
        }


        return resolved;
    } catch (error) {
        if (connection) {
            try {
                if (db.type === "POSTGRES") await connection.end();
                else connection.destroy?.();
            } catch { }
        }

        throw error;
    }

};