import { curatorAgent } from "@/app/lib/agents/curator";
import { journalistAgent } from "@/app/lib/agents/journalist";
import { editorInChiefAgent } from "@/app/lib/agents/editorInChief";
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { openai } from "@/app/lib/ai/ai-config";
import {
  experimental_generateSpeech as generateSpeech,
  generateText,
  stepCountIs,
  tool,
} from "ai";
import { z } from "zod";
import { writeFile } from "fs/promises";
import path from "path";




type ArticleSummary = {
  title: string;
  content: string;
  source: string;
};

export async function POST(req: Request) {
  const { interests, userId } = await req.json();
  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }
  const normalizedInterests = Array.isArray(interests)
    ? interests.map((item) => String(item).trim()).filter(Boolean)
    : String(interests ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
  if (normalizedInterests.length === 0) {
    return NextResponse.json({ error: "Interests are required" }, { status: 400 });
  }

  let curatedArticles: ArticleSummary[] = [];
  let finalScript: string | null = null;
  let audioUrl: string | null = null;
  let broadcastId: string | null = null;

  const agentTools = {
    curateArticles: tool({
      description: "Curate relevant articles for the given interests.",
      inputSchema: z.object({
        interests: z.array(z.string().min(1)),
      }),
      execute: async ({ interests }) => {
        const articles = await curatorAgent(interests.join(", "));
        if (!articles || articles.length === 0) {
          throw new Error("No articles found");
        }
        curatedArticles = articles.map((article) => ({
          title: article.title,
          content: article.content,
          source: article.source ?? "",
        }));
        return curatedArticles;
      },
    }),
    writeDraft: tool({
      description: "Write a factual news draft based on curated articles.",
      inputSchema: z.object({
        articles: z.array(
          z.object({
            title: z.string(),
            content: z.string(),
            source: z.string(),
          })
        ),
      }),
      execute: async ({ articles }) => {
        const draft = await journalistAgent(articles);
        if (!draft?.draft) {
          throw new Error("Failed to write a draft");
        }
        return draft.draft;
      },
    }),
    editDraft: tool({
      description: "Edit the draft for neutrality, clarity, and verification.",
      inputSchema: z.object({
        draft: z.string().min(1),
      }),
      execute: async ({ draft }) => {
        const edited = await editorInChiefAgent(draft);
        if (!edited) {
          throw new Error("Failed to edit the draft");
        }
        finalScript = edited;
        return edited;
      },
    }),
    generateAudio: tool({
      description: "Generate audio for the final script and return its URL.",
      inputSchema: z.object({
        script: z.string().min(1),
        interests: z.array(z.string().min(1)),
      }),
      execute: async ({ script, interests }) => {
        const { audio } = await generateSpeech({
          model: openai.speech("tts-1"),
          text: script,
          voice: "alloy",
        });

        const fileName = `${interests.join(",")}-${Date.now()}.mp3`;
        const filePath = path.join(process.cwd(), "public", fileName);
        await writeFile(filePath, audio.uint8Array);
        audioUrl = `/${fileName}`;
        return { audioUrl };
      },
    }),
    persistBroadcast: tool({
      description:
        "Persist the ranking and broadcast, return the broadcast id.",
      inputSchema: z.object({
        userId: z.string().min(1),
        interests: z.array(z.string().min(1)),
        articles: z.array(
          z.object({
            title: z.string(),
            source: z.string(),
          })
        ),
        script: z.string().min(1),
        audioUrl: z.string().min(1),
      }),
      execute: async ({ userId, interests, articles, script, audioUrl }) => {
        await prisma.storyRanking.create({
          data: {
            articles,
            interests,
            rankedResult: {
              final: script,
            },
          },
        });

        const broadcast = await prisma.broadcast.create({
          data: {
            userId,
            script,
            audioUrl,
          },
        });

        broadcastId = broadcast.id;
        return { broadcastId };
      },
    }),
  };

  await generateText({
    model: openai("gpt-4o-mini"),
    tools: agentTools,
    stopWhen: stepCountIs(6),
    prompt: `
You are the Newsroom Orchestrator.
Use tools in this order:
1) curateArticles
2) writeDraft
3) editDraft
4) generateAudio
5) persistBroadcast

Inputs:
- userId: ${userId}
- interests: ${JSON.stringify(normalizedInterests)}

Call the tools with correct arguments and do not skip steps.`,
  });

  if (curatedArticles.length === 0) {
    return NextResponse.json({ error: "No articles found" }, { status: 404 });
  }
  if (!finalScript) {
    return NextResponse.json(
      { error: "Failed to produce final script" },
      { status: 500 }
    );
  }
  if (!audioUrl) {
    return NextResponse.json(
      { error: "Failed to generate audio" },
      { status: 500 }
    );
  }
  if (!broadcastId) {
    return NextResponse.json(
      { error: "Failed to persist broadcast" },
      { status: 500 }
    );
  }

  return Response.json({
    interests: normalizedInterests,
    final: finalScript,
    audioUrl,
    broadcastId,
    sources: curatedArticles.map((a) => ({
      title: a.title,
      source: a.source,
    })),
  });
}