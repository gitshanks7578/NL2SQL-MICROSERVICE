export type validationResult = {
    valid : boolean,
    errors : string[]
}

export class validatorService{
    static validate(sql:string | null , schemaIR : any) : validationResult{
        if(!sql){
            return {
                valid : true,
                errors : []
            }
        }
        const errors : string[] = []
        const forbidden = [
            "DROP",
            "ALTER",
            "TRUNCATE",
              "DELETE"
        ]
        for(const keyword of forbidden){
            if(sql.toUpperCase().includes(keyword)){
                errors.push(
                    `forbidden keyword : ${keyword}`
                )
            }
        }


    const tableMatches = [
      ...sql.matchAll(
         /\b(?:FROM|JOIN|UPDATE|INTO)\s+"?([a-zA-Z_][a-zA-Z0-9_]*)"?/gi
      )
    ];

    const usedTables = [
  ...new Set(
    tableMatches.map(
      (match) => match[1]!.toLowerCase()
    )
  )
];

console.log(schemaIR.tables)
console.log(schemaIR.nodes)
const schemaTables =
  schemaIR.nodes.map(
    (table: any) =>
      table.table.toLowerCase()
  );

    for (const table of usedTables) {
      if (!schemaTables.includes(table)) {
        errors.push(
          `Unknown table: ${table}`
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };




    }
}