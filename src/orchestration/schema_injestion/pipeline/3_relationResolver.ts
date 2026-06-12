import { Client } from "pg";

// export class relation_resolver{
//     relationResolver(normalized_schema :any){
//         const nodes = []
//         const edges = []
//         const adjacency:any = {}
        
     

// // level 1 
//         // for(const [tablename ,tabledata] of Object.entries(normalized_schema)){
//         //     const data:any = tabledata
//         //     for (const fk of data.foreignKeys){
//         //         relationships.push({
//         //             fromTable : tablename,
//         //             fromColumn : fk.column,
//         //             toTable : fk.references.table,
//         //             toColumn : fk.references.column
//         //         })
//         //     }
//         // }
//         // return relationships


// // level2
//         for (const [tablename,tabledata] of Object.entries(normalized_schema)){
//             const data:any = tabledata
            
//                 nodes.push({
//                     table : tablename,
//                     columns : data.columns,
//                     primaryKeys : data.primaryKeys
//                 })
//                 adjacency[tablename] = []

//             for(const fk of data.foreignKeys){
//                 edges.push({
//                     fromTable : tablename,
//                     fromColumn : fk.column,
//                     toTable : fk.references.table,
//                     toColumn : fk.references.column
//                 })
//             }
//         }
//         for (const edge of edges){
//             adjacency[edge.fromTable].push({
//                 table : edge.toTable,
//                 via : edge.fromColumn,
//                 targetColumn : edge.toColumn
//             })
//         }
       
//         return {nodes,edges,adjacency}
//     }
// }

export class relation_resolver {
  relationResolver(normalized_schema: any) {
    const nodes: any[] = [];
    const edges: any[] = [];
    const adjacency: any = {};

    // 1. build nodes + edges first
    for (const [tablename, tabledata] of Object.entries(normalized_schema)) {
      const data: any = tabledata;

      nodes.push({
        table: tablename,
        columns: data.columns,
        primaryKeys: data.primaryKeys,
      });

      adjacency[tablename] = [];

      for (const fk of data.foreignKeys) {
        edges.push({
          fromTable: tablename,
          fromColumn: fk.column,
          toTable: fk.references.table,
          toColumn: fk.references.column,
        });
      }
    }

    // 2. build adjacency AFTER edges are complete
    for (const edge of edges) {
      adjacency[edge.fromTable].push({
        table: edge.toTable,
        via: edge.fromColumn,
        targetColumn: edge.toColumn,
      });
    }

    return { nodes, edges, adjacency };
  }
}