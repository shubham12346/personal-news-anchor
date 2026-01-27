import { NextResponse, NextRequest } from "next/server";
import { openai } from "@ai-sdk/openai";
import { generateText, Output } from "ai";
import { StoryRankingResponseSchema } from "@/app/lib/schemas/storyRanking";

interface Article {
  id: string;
  title: string;
  summary: string;
}

export async function POST(req: NextRequest) {
  try {
    const {
      articles,
      interests,
    }: { articles: Article[]; interests: string[] } = await req.json();

    if (!articles || !interests) {
      return NextResponse.json(
        { error: "Articles and interests are required" },
        { status: 400 },
      );
    }

    const result = await generateText({
      model: openai("gpt-4-turbo"),
      system: `
You are a senior news editor.

Task:
- Evaluate news stories based on user interests
- Rank only the most relevant stories
- Be strict and selective

Rules:
- Output VALID JSON only
- Score from 0 to 1
- Include a short editorial reason
- Exclude irrelevant stories
- Do NOT add commentary outside JSON

Output format:
{
  "ranked_stories": [
    {
      "id": "string",
      "title": "string",
      "score": number,
      "reason": "string"
    }
  ]
}
      `,
      prompt: `
User interests:
${interests.join(", ")}

Articles:
${articles
  .map((a) => `ID: ${a.id}\nTitle: ${a.title}\nSummary: ${a.summary}`)
  .join("\n\n")}
      `,
      output: Output.object({
        schema: StoryRankingResponseSchema,
      }),
    });

    return NextResponse.json(result.output);
  } catch (error) {
    console.error("Story selection error:", error);
    return NextResponse.json(
      { error: "Failed to rank stories" },
      { status: 500 },
    );
  }
}
