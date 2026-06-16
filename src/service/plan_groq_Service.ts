import fetch from "node-fetch";

export class planGroqService {
  static async generatePlan(prompt: any) {

    const systemPrompt = `
You are an NL-to-SQL PLANNING engine.

You DO NOT generate SQL.

Your only job is to analyze the query and produce a structured execution plan.

--------------------------------------------------

RULES:

1. Use ONLY schema context.
2. Never generate SQL.
3. Never use SQL keywords (SELECT, JOIN, WHERE, GROUP BY, etc.).
4. Output ONLY valid JSON.
5. No explanations outside JSON.
6. No markdown or code fences.

--------------------------------------------------

OUTPUT FORMAT:

{
  "mode": "PLAN",
  "message": "string (step-by-step reasoning plan)",
  "sql": null,
  "tablesUsed": ["table1", "table2"]
}

--------------------------------------------------

STRICT BEHAVIOR:

- You MUST describe steps to solve the query
- You MUST identify tables involved
- You MUST explain joins conceptually (not in SQL)
- You MUST NOT output any executable SQL
- sql field is ALWAYS null
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
      const parsed = JSON.parse(text);

    
      if (parsed.sql !== null) {
        throw new Error("PLAN mode violation: SQL is not allowed");
      }

      return parsed;

    } catch (e: any) {
      throw new Error("Invalid PLAN output: " + e.message);
    }
  }
}