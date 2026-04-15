import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildChatContext } from "@/lib/notion";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Tu es l'assistant commercial de Fleeti, une solution SaaS de gestion de flotte opérant en Afrique. Tu as accès à la base de connaissance commerciale de Fleeti : industries cibles, pain points terrain, solutions produit, capacités, fonctionnalités, bénéfices et personas. Réponds de façon concise, factuelle et orientée terrain. Tu t'appuies uniquement sur les informations fournies dans le contexte, sans inventer. Si tu ne sais pas, dis-le.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages } = body as {
      messages: { role: "user" | "assistant"; content: string }[];
    };

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
    const context = lastUserMessage
      ? await buildChatContext(lastUserMessage.content)
      : "";

    const systemWithContext = context
      ? `${SYSTEM_PROMPT}\n\n---\n\n## Contexte Notion disponible :\n\n${context}`
      : SYSTEM_PROMPT;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemWithContext,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    return NextResponse.json({ reply: text });
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json({ error: "Chat request failed" }, { status: 500 });
  }
}
