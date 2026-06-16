// import fetch from "node-fetch";

// export class GroqService {
//   static async sqlgenerate(prompt: any, mode: "SQL" | "PLAN" | "EXPLAIN") {
//     const systemPrompt = `
// You are an NL-to-SQL engine,which also can explain and plan.

// Rules:

// 1. Use ONLY tables, columns and relationships provided in schema context.

// 2. NEVER invent:
// - tables
// - columns
// - joins
// - foreign keys

// 3. If information is missing from schema:
// return a valid JSON response explaining why.

// 4. Return ONLY JSON.

// 5. Output format:

// {
//   "mode":"${mode}",
//   "message":"string",
//   "sql":"string | null",
//   "tablesUsed":["table1","table2"]
// }

// 6. tablesUsed must contain every table used in reasoning.

// --FORCED CONTRAINTS (TOP PRIORITY)  (even if u can generate you're NOT ALLOWED ,if mode differs)
// 7. If mode = SQL:
//   sql must contain generated SQL. 

// 8. If mode = PLAN:
//   sql must be null. (FORCED)

// 9. If mode = EXPLAIN:
//   sql must be null. (FORCED)

// 10. No markdown.
// 11. No code fences.
// 12. No extra text.
// `;

//     const response = await fetch(
//       "https://api.groq.com/openai/v1/chat/completions",
//       {
//         method: "POST",
//         headers: {
//           "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify({
//           model: "llama-3.3-70b-versatile",
//           messages: [
//             {
//               role: "system",
//               content: systemPrompt
//             },
//             {
//               role: "user",
//               content: prompt
//             }
//           ],
//           temperature: 0.2
//         })
//       }
//     );

//     if (!response.ok) {
//       const err = await response.text();
//       throw new Error(`Groq API Error: ${err}`);
//     }

//     const data : any = await response.json();

//     const text = data.choices?.[0]?.message?.content;

//     if (!text) {
//       throw new Error("Empty response from Groq");
//     }

//     try {
//   return JSON.parse(text);
// } catch (e) {
//   throw new Error("Invalid JSON from model: " + text);
// }
//   }
// }


import fetch from "node-fetch";

export class sqlGroqService {
  static async generateSQL(prompt: any) {

    const systemPrompt = `
You are an NL-to-SQL engine.

You ONLY generate SQL.

RULES (HARD ENFORCED):

1. Use ONLY provided schema context.
   Never invent:
   - tables
   - columns
   - joins
   - relationships

2. Output MUST be valid JSON only.

3. DO NOT output explanations.
4. DO NOT output planning steps.
5. DO NOT output markdown or code fences.
6. DO NOT output anything except JSON.

7. If schema is insufficient:
   return sql = null and explain in message.

---

OUTPUT FORMAT:

{
  "mode": "SQL",
  "message": "string",
  "sql": "string | null",
  "tablesUsed": ["table1", "table2"]
}

---

STRICT RULES:

- sql MUST be valid SQL when possible
- sql MUST be null ONLY if impossible
- NEVER output PLAN or EXPLAIN modes
- mode is ALWAYS "SQL"
`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.2
        })
      }
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Groq API Error: ${err}`);
    }

    const data: any = await response.json();
    const text = data.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error("Empty response from Groq");
    }

    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error("Invalid JSON from model: " + text);
    }
  }
}