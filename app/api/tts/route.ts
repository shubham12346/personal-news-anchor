import { openai } from "@/app/lib/ai/ai-config";
import { experimental_generateSpeech as generateSpeech } from 'ai';
import { prisma } from "@/app/lib/prisma";
import type { Prisma } from "@prisma/client";
import { writeFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) { 
    const { broadcastId } = await req.json();

    
  // 1️⃣ Get broadcast script
  const broadcast = await prisma.broadcast.findUnique({
    where: { id: broadcastId },
  });
    
  if (!broadcast) {
    return Response.json({ error: "Broadcast not found" }, { status: 404 });
    }
    
    const { audio } = await generateSpeech({
        model: openai.speech('tts-1'),
        text: broadcast.script,
        voice: 'alloy',
    });
    // Save file locally
// Save file locally
const fileName = `${broadcastId}.mp3`;
const filePath = path.join(process.cwd(), "public", fileName);

await writeFile(filePath, audio.uint8Array);

    const audioUrl: string = `/${fileName}`;

     // 4️⃣ Save audio URL in DB
  await prisma.broadcast.update({
    where: { id: broadcastId },
    data: { audioUrl } as Prisma.BroadcastUpdateInput,
  });
    console.log(`Broadcast audio saved to: ${audioUrl}`);
    return NextResponse.json({ audioUrl });
}