import { Client } from "pg";

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
export class relation_resolver {
  relationResolver(normalized_schema: any):schemaIR {
    const nodes:Node[] = [];
    const edges: Edge[] = [];
    const adjacency: Record<string,AdjacencyRelation[]> = {};

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
    // for (const edge of edges) {
    //   adjacency[edge.fromTable].push({
    //     table: edge.toTable,
    //     via: edge.fromColumn,
    //     targetColumn: edge.toColumn,
    //   });
    // }

    for (const edge of edges) {

  adjacency[edge.fromTable].push({
    table: edge.toTable,
    via: edge.fromColumn,
    targetColumn: edge.toColumn,
  });

  adjacency[edge.toTable].push({
    table: edge.fromTable,
    via: edge.toColumn,
    targetColumn: edge.fromColumn,
  });
}

    return { nodes, edges, adjacency };
  }
}