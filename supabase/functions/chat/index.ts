import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SYSTEM_PROMPT =
  "Tu es Braise, la mascotte-compagnon de l'application SAPIE. Tu es un pote de classe bienveillant, décontracté (tutoiement, 2 à 4 phrases max, pas de listes). Réponds en te basant UNIQUEMENT sur les extraits de cours fournis.";

const GEMINI_MODEL = "gemini-1.5-flash";
const EMBEDDING_MODEL = "text-embedding-004";

type ChatMessage = { role: "user" | "model"; text: string };

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { messages, chapterId, subject } = await req.json();
    const geminiKey = Deno.env.get("GEMINI_API_KEY");

    if (!geminiKey) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build RAG context from course_chunks
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Embed the latest user message for semantic search
    const lastUserMsg = [...messages].reverse().find((m: ChatMessage) => m.role === "user");
    let contextText = "";

    if (lastUserMsg) {
      try {
        const embedRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: { parts: [{ text: lastUserMsg.text }] } }),
          }
        );

        if (embedRes.ok) {
          const embedData = await embedRes.json();
          const queryEmbedding = embedData.embedding?.values;

          if (queryEmbedding) {
            const { data: chunks } = await supabase.rpc("match_course_chunks", {
              embedding: queryEmbedding,
              match_count: 5,
            });

            if (chunks && chunks.length > 0) {
              const filtered = chapterId
                ? chunks.filter((c: { chapter_id: string }) => c.chapter_id === chapterId)
                : chunks;
              const toUse = filtered.length > 0 ? filtered : chunks;
              contextText = toUse
                .map((c: { content: string; chapter_title: string }) => `[${c.chapter_title}] ${c.content}`)
                .join("\n\n");
            }
          }
        }
      } catch (_e) {
        // Embedding/retrieval is best-effort; continue without context
      }
    }

    // Build the full prompt for Gemini
    const promptParts: string[] = [SYSTEM_PROMPT];
    if (contextText) {
      promptParts.push(
        `\nVoici les extraits de cours pertinents. Réponds en te basant UNIQUEMENT sur ces extraits :\n\n${contextText}`
      );
    }
    promptParts.push("\nHistorique de la conversation :");

    for (const msg of messages) {
      promptParts.push(`${msg.role === "user" ? "L'élève" : "Braise"} : ${msg.text}`);
    }
    promptParts.push("Braise :");

    const fullPrompt = promptParts.join("\n");

    // Stream Gemini response
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 300,
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return new Response(
        JSON.stringify({ error: `Gemini API error: ${geminiRes.status}`, detail: errText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geminiData = await geminiRes.json();
    const responseText =
      geminiData.candidates?.[0]?.content?.parts?.[0]?.text ??
      "Désolé, je n'ai pas bien compris. Tu peux reformuler ?";

    return new Response(
      JSON.stringify({ text: responseText.trim() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
