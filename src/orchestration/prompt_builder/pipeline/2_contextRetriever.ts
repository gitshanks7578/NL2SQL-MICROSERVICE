// // // console.log("hi")

// // // const str = "give me post and users with comments"
// // // const q = str.toLowerCase()
// // // const seeds = []



// // // // npx ts-node 5_contextRetriever.ts 



// export class contextRetriever{
//     public  maxDepth = 2
//     constructor(maxDepth=2){
//         this.maxDepth = maxDepth;
//     }
//     //main entry
//     retrieve(schema:any,query:string){
//         //get seeds

//         //keep fallback ->return whole schema
        
//         //expand till 2 nodes

//         //safety check to not lose seeds

//         //pruned(final output)
//         const q = query.toLowerCase();
//         const seeds = [];

//         for(const node of schema.nodes){
//             const table = schema.nodes.toLowerCase()
//             if(q.includes(node.table)){
//                 seeds.push(node.table)
//             }
            
//         }
//      return seeds
        
//     }
// }


export interface Node {
  table: string;
  columns: {
    name: string;
    type: string;
    nullable: boolean;
  }[];
  primaryKeys: string[];
}

export interface Edge {
  toTable: string;
  toColumn: string;
  fromTable: string;
  fromColumn: string;
 
}

export interface AdjacencyRelation {
  via: string;
  table: string;
  targetColumn: string;
}

export interface schemaIR{
   nodes: Node[],
   edges : Edge[],
   adjacency : Record<string,AdjacencyRelation[]>
}

export class ContextRetriever {
    constructor(public maxDepth = 2) {
        this.maxDepth = maxDepth;
    }

    /* -----------------------------
        MAIN ENTRY
    ------------------------------*/
    retrieve(query : string, schema : schemaIR)  {
        const seeds : string[] = this.getSeeds(query, schema);

        // Fallback 1: no seeds found
        if (seeds.length === 0) {
            return this.fallback(schema);
        }

        const keep = this.expand(seeds, schema);

        // Safety check: never lose seeds
        for (const seed of seeds) {
            if (!keep.has(seed)) {
                return this.fallback(schema);
            }
        }

        return this.prune(schema, keep);
    }

    /* -----------------------------
        SEED DETECTION
        (strict lexical match)
    ------------------------------*/
    getSeeds(query : string, schema : schemaIR):string[] {
        const q = query.toLowerCase();
        const seeds = [];

        for (const node of schema.nodes) {
            const table = node.table.toLowerCase();

            // direct table mention
            if (q.includes(table)) {
                seeds.push(node.table);
                continue;
            }

            // column mention
            for (const col of node.columns) {
                if (q.includes(col.name.toLowerCase())) {
                    seeds.push(node.table);
                    break;
                }
            }
        }

        return [...new Set(seeds)];
    }

    /* -----------------------------
        GRAPH EXPANSION (BFS)
        maxDepth = 2 default
    ------------------------------*/
    expand(seeds : string[], schema : schemaIR):Set<string> {
        const keep = new Set<string>(seeds);
        let frontier : string[] = [...seeds];
        let depth = 0;

        while (frontier.length > 0 && depth < this.maxDepth) {
            const next : string[] = [];

            for (const table of frontier) {
                const neighbors = schema.adjacency[table] || [];

                for (const edge of neighbors) {
                    const neighborTable = edge.table;

                    if (!keep.has(neighborTable)) {
                        keep.add(neighborTable);
                        next.push(neighborTable);
                    }
                }
            }

            frontier = next;
            depth++;
        }

        return keep;
    }

    /* -----------------------------
        PRUNE SCHEMA
    ------------------------------*/
    prune(schema:schemaIR, keep : Set<string>) {
        const nodes = schema.nodes.filter(n =>
            keep.has(n.table)
        );

        const edges = schema.edges.filter(e =>
            keep.has(e.fromTable) &&
            keep.has(e.toTable)
        );
            const adjacency: Record<string, AdjacencyRelation[]> = {};

          for (const node of nodes) {
        adjacency[node.table] =
            (schema.adjacency[node.table] || [])
                .filter(rel => keep.has(rel.table));
    }
        return { nodes, edges,adjacency };
    }

    /* -----------------------------
        FALLBACK (SAFE MODE)
    ------------------------------*/
    fallback(schema:schemaIR) {
        return {
            nodes: schema.nodes,
            edges: schema.edges,
            adjacency : schema.adjacency
        };
    }
}