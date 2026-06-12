import { Client } from "pg";

export class PostgresExtractor {
    // private db :any
    // constructor(db :any){
    //     this.db = db
    // }

    // ts shortcut
    constructor(private db: any) { }

    async extract() {
        //tables ,columns ,fks and relations
        const tables = await this.db.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'    
        `)


        const columns = await this.db.query(`
            SELECT table_name,
            column_name,
            data_type,
            is_nullable    
            FROM information_schema.columns
            where table_schema = 'public'
        `)
        const foreign_keys = await this.db.query(`
        SELECT
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'    
        `)
        const primary_keys = await this.db.query(`
                SELECT
                tc.table_name,
                kcu.column_name
                FROM information_schema.table_constraints tc
                JOIN information_schema.key_column_usage kcu
                ON tc.constraint_name = kcu.constraint_name
                WHERE tc.constraint_type = 'PRIMARY KEY';
         `)

        return {
            tables: tables.rows,
            columns: columns.rows,
            foreign_keys: foreign_keys.rows,
            primary_keys : primary_keys.rows
        }
    }

}