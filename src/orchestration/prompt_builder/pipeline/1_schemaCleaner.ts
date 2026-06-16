export class schemaCleaner{
    private readonly SYSTEM_TABLES = new Set([
        "_prisma_migrations",
    ])
    cleaner(schema:any):any{
        const cleanedNodes = schema.nodes.filter((node:any)=>{
            return !this.SYSTEM_TABLES.has(node.table)
        })


        const survivedtables = new Set(
            cleanedNodes.map((node:any)=> node.table)
        )
        const cleanedEdges = schema.edges.filter((edge:any)=>{
            return (
                survivedtables.has(edge.fromTable) && survivedtables.has(edge.toTable)
            )
        })
         const cleanedAdjacency: any = {};

        for (const [tableName, neighbours ] of Object.entries(
            schema.adjacency
        )) {
             const data:any = neighbours
            
            // remove entire adjacency key if table died
            if (!survivedtables.has(tableName)) {
                continue;
            }

            cleanedAdjacency[tableName] = data.filter(
                (neighbour : any) =>
                    survivedtables.has(neighbour.table)
            );
        }

        return {
            nodes: cleanedNodes,
            edges: cleanedEdges,
            adjacency: cleanedAdjacency,
        };
    }
}
