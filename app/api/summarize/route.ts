import { NextRequest, NextResponse } from "next/server";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();
    console.log("Received text for summarization:", text);
    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }
    const SystemPrompt = `You are a professional news editor for a global newsroom.
    
    Rules:
    - Be neutral and factual.
    - No opinions or speculations.
    - Clear, concise language.
    - 3-4 sentences maximum.
    - Suitable for audio news broadcast.

    `;
    const summary = await generateText({
      model: openai("gpt-4-turbo"),
      system: SystemPrompt,
      prompt: text,
    });
    await prisma.summary.create({
      data: {
        originalText: text,
        summary: summary.text,
      },
    });

    return NextResponse.json({
      summary: summary.text,
      meta: {
        wordCount: text.split(" ").length,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error in /api/summarize:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
