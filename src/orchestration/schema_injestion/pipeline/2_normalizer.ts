import { Client } from "pg";
import { typeMap } from "./2_typeMapper.js";
export class SchemaNormalizer {
    normalize(raw: any) {
        const schema: any = {}
        //add tables and create space inside for columns and FKs
        for (const table of raw.tables) {
            schema[table.table_name] = {
                columns: [],
                foreignKeys: [],
                primaryKeys:[]
            }
        }

        //now fill the insides of columns INSIDE the tables u created

        for (const col of raw.columns) {
            if (!schema[col.table_name]) continue;

            schema[col.table_name].columns.push({
                name: col.column_name,
                type: typeMap(col.data_type),
                nullable: col.is_nullable === "YES"  ///if yes -> store true //if no -> store false
            })
        }
        //attach foreign keys
        for (const fk of raw.foreign_keys) {
            if (!schema[fk.table_name]) continue;

            schema[fk.table_name].foreignKeys.push({
                column: fk.column_name,
                references: {
                    table: fk.foreign_table_name,
                    column: fk.foreign_column_name
                }
            })
        }

        for (const pk of raw.primary_keys) {

            if (!schema[pk.table_name]) continue;

            schema[pk.table_name].primaryKeys.push(
                pk.column_name
            );
        }

        return schema;
    }

}