import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY!
);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash"
});


export class GeminiService {
  static async generate(prompt: any,mode : "SQL" | "PLAN" | "EXPLAIN") {
    const systemPrompt = `
You are an NL-to-SQL engine,which also can explain and plan.

Rules:

1. Use ONLY tables, columns and relationships provided in schema context.

2. NEVER invent:
- tables
- columns
- joins
- foreign keys

3. If information is missing from schema:
return a valid JSON response explaining why.

4. Return ONLY JSON.

5. Output format:

{
  "mode":"${mode}",
  "message":"string",
  "sql":"string | null",
  "tablesUsed":["table1","table2"]
}

6. tablesUsed must contain every table used in reasoning.

7. If mode = SQL:
  sql must contain generated SQL.

8. If mode = PLAN:
  sql must be null.

9. If mode = EXPLAIN:
  sql must be null.

10. No markdown.
11. No code fences.
12. No extra text.
13. if user uses keyword PRISMA explicitly,please add double quotes to table names ,for eg table -> "table",user -> "user"
`;

     const response =
      await model.generateContent(
        `${systemPrompt}\n\n${prompt}`
      );


    const text =
      response.response.text();

    return JSON.parse(text);
  }
}