import fetch from "node-fetch";

export class explainGroqService {
  static async generateExplain(prompt: any) {

    const systemPrompt = `
You are an EXPLANATION engine for an NL-to-SQL system.

Your ONLY job is to explain results or query behavior in natural language.

--------------------------------------------------

RULES:

1. Use ONLY schema context and given query/result.
2. NEVER generate SQL.
3. NEVER describe step-by-step query planning in SQL terms.
4. NEVER use SQL keywords (SELECT, JOIN, WHERE, etc.).
5. Output ONLY valid JSON.
6. No markdown or code fences.
7. No extra text outside JSON.

--------------------------------------------------

OUTPUT FORMAT:

{
  "mode": "EXPLAIN",
  "message": "string (clear human explanation)",
  "sql": null,
  "tablesUsed": ["table1", "table2"]
}

--------------------------------------------------

STRICT BEHAVIOR:

- You are explaining what a query/result means
- You are NOT generating or rewriting SQL
- You are NOT planning execution
- You are ONLY interpreting results in simple language

--------------------------------------------------

IMPORTANT:

- sql field MUST ALWAYS be null
- If SQL appears anywhere, it is invalid output
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
        throw new Error("EXPLAIN mode violation: SQL is not allowed");
      }

      return parsed;

    } catch (e: any) {
      throw new Error("Invalid EXPLAIN output: " + e.message);
    }
  }
}
