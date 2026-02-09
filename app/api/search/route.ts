import { generateText } from "ai";

import { openai } from "@ai-sdk/openai";
import { prisma } from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { searchArticles } from "@/app/lib/news/searchArticles";
import { embedText } from "@/app/lib/ai/embedding";
import { buildRagPrompt } from "@/app/lib/prompts/ragPrompt";

export async function POST(request: NextRequest) {
    const { query } = await request.json();
    const embedding = await embedText(query);

    const articles = await searchArticles(embedding);

    const prompt = buildRagPrompt(query, articles);

    const result = await generateText({
        model: openai("gpt-4-turbo"),
        system: prompt,
        prompt: query,
    });

    await prisma.summary.create({
        data: {
          originalText: query,
          summary: result.text,
        },
      });
    return NextResponse.json({
        summary: result.text,
        sources: articles.map((a) => ({
          title: a.title,
          source: a.source,
          url: a.url,
        })),
    });
}