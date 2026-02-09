import { generateText, stepCountIs } from "ai";
import { openai } from "@ai-sdk/openai";
import { tools } from "@/app/lib/tools/tools";
import { journalistPrompt } from "@/app/lib/prompts/JournalistPrompt";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { context } = await req.json();
  
    const result = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: journalistPrompt(context),
      tools,
      stopWhen: stepCountIs(3),
    });
  
    return NextResponse.json({
      output: result.text,
      toolCalls: result.toolCalls,
    });
  }