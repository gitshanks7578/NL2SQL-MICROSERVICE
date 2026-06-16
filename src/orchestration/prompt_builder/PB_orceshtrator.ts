import type { Node,Edge,schemaIR } from "./pipeline/2_contextRetriever.js"
import { schemaCleaner } from "./pipeline/1_schemaCleaner.js"
import { ContextRetriever } from "./pipeline/2_contextRetriever.js"

export const promptbuilder = (schema:any,query:string,history : any)=>{
    const sc = new schemaCleaner()
    const cleanedSchema = sc.cleaner(schema)

    const cr = new ContextRetriever()
    const trimmedSchema = cr.retrieve(query,cleanedSchema)

    return {schema : trimmedSchema,query : query,history }
}