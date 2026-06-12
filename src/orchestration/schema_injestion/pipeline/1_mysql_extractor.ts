// export class MySQLExtractor {
//   constructor(private db: any) {}

//   async extract() {
//     // TABLES
//     const tables = await this.db.query(`
//       SELECT table_name
//       FROM information_schema.tables
//       WHERE table_schema = DATABASE()
//     `);

//     // COLUMNS
//     const columns = await this.db.query(`
//       SELECT
//         table_name,
//         column_name,
//         data_type,
//         is_nullable
//       FROM information_schema.columns
//       WHERE table_schema = DATABASE()
//     `);

//     // FOREIGN KEYS
//     const foreign_keys = await this.db.query(`
//       SELECT
//         kcu.table_name,
//         kcu.column_name,
//         kcu.referenced_table_name AS foreign_table_name,
//         kcu.referenced_column_name AS foreign_column_name
//       FROM information_schema.key_column_usage kcu
//       JOIN information_schema.table_constraints tc
//         ON tc.constraint_name = kcu.constraint_name
//         AND tc.table_schema = kcu.table_schema
//       WHERE tc.constraint_type = 'FOREIGN KEY'
//         AND tc.table_schema = DATABASE()
//     `);

//     // PRIMARY KEYS
//     const primary_keys = await this.db.query(`
//       SELECT
//         kcu.table_name,
//         kcu.column_name
//       FROM information_schema.table_constraints tc
//       JOIN information_schema.key_column_usage kcu
//         ON tc.constraint_name = kcu.constraint_name
//         AND tc.table_schema = kcu.table_schema
//       WHERE tc.constraint_type = 'PRIMARY KEY'
//         AND tc.table_schema = DATABASE()
//     `);

//     return {
//       tables: tables[0] ?? tables.rows ?? tables,
//       columns: columns[0] ?? columns.rows ?? columns,
//       foreign_keys: foreign_keys[0] ?? foreign_keys.rows ?? foreign_keys,
//       primary_keys: primary_keys[0] ?? primary_keys.rows ?? primary_keys
//     };
//   }
// }


export class MySQLExtractor {
  constructor(private db: any) {}

  private getRows(result: any) {
    return result[0] ?? result.rows ?? result;
  }

  async extract() {
    const tables = await this.db.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
    `);

    const columns = await this.db.query(`
      SELECT
        table_name,
        column_name,
        data_type,
        is_nullable
      FROM information_schema.columns
      WHERE table_schema = DATABASE()
    `);

    const foreign_keys = await this.db.query(`
      SELECT
        kcu.table_name,
        kcu.column_name,
        kcu.referenced_table_name AS foreign_table_name,
        kcu.referenced_column_name AS foreign_column_name
      FROM information_schema.key_column_usage kcu
      JOIN information_schema.table_constraints tc
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = DATABASE()
    `);

    const primary_keys = await this.db.query(`
     SELECT
  kcu.table_name,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
  AND tc.table_name = kcu.table_name
WHERE tc.constraint_type = 'PRIMARY KEY'
  AND tc.table_schema = DATABASE()
    `);

    const normalizedTables = this.getRows(tables).map((t: any) => ({
      table_name: t.table_name ?? t.TABLE_NAME,
    }));

    const normalizedColumns = this.getRows(columns).map((col: any) => ({
      table_name: col.table_name ?? col.TABLE_NAME,
      column_name: col.column_name ?? col.COLUMN_NAME,
      data_type: col.data_type ?? col.DATA_TYPE,
      is_nullable: col.is_nullable ?? col.IS_NULLABLE,
    }));

    const normalizedFK = this.getRows(foreign_keys).map((fk: any) => ({
      table_name: fk.table_name ?? fk.TABLE_NAME,
      column_name: fk.column_name ?? fk.COLUMN_NAME,
      foreign_table_name: fk.foreign_table_name ?? fk.FOREIGN_TABLE_NAME,
      foreign_column_name: fk.foreign_column_name ?? fk.FOREIGN_COLUMN_NAME,
    }));

    const normalizedPK = this.getRows(primary_keys).map((pk: any) => ({
      table_name: pk.table_name ?? pk.TABLE_NAME,
      column_name: pk.column_name ?? pk.COLUMN_NAME,
    }));

    return {
      tables: normalizedTables,
      columns: normalizedColumns,
      foreign_keys: normalizedFK,
      primary_keys: normalizedPK,
    };
  }
}