import { Client } from "pg";
import mysql from "mysql2/promise";
import { ApiError } from "./errorHandler.js";
import { decrypt } from "./decrypter.js";
export class executor {

    static async postgresExecutor(db: any,sql:string) {
         const client = new Client({
                host : db.host,
                port : db.port,
                user : db.username,
                password : decrypt(db.password),
                database:db.dbName,
                ssl:{
                    rejectUnauthorized:false
                }});

        try {
           
                await client.connect()
                const result = await client.query(sql);
            
                return {
                    rows : result.rows,
                    rowCount : result.rowCount,
                    command : result.command
                }

        } catch (error) {
            const message = error instanceof Error ? error.message : "weird message"

            throw new ApiError(`message : ${message} || postgres executor failed`,500)
        }finally{
            await client.end()
        }
    }
    static async mysqlExecutor(db: any,sql:string) {
        const connection = await mysql.createConnection({
            host:db.host,
            port: db.port,
            user: db.username,
            password : decrypt(db.password),
            database: db.dbName,
          });
        try {
            const [result] = await connection.query(sql);
            if(Array.isArray(result)){
                return {
                    rows : result,
                    rowCount : result.length,
                    command : "SELECT"
                }
            }
            const command = sql.trim().split(/\s+/)[0]!.toUpperCase();
             return {
                    rows :[],
                    rowCount : result.affectedRows,
                    command
                }

        } catch (error) {
            const message = error instanceof Error ? error.message : "weird message"
            throw new ApiError(`message : ${message} || mysql executor failed`,500)
        }finally{
            await connection.end()
        }
    }
}