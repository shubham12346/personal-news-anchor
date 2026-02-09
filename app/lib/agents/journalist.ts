import { generateText, stepCountIs } from "ai";
import { openai } from "@ai-sdk/openai";
import { tools } from "@/app/lib/tools/tools";
import { prisma } from "../prisma";


export async function journalistAgent(articles: {
    title: string;
    content: string;
    source: string;
}[]) { 

    const context = articles
    .map(
      (a, i) => `
[${i + 1}] ${a.title} (${a.source})
${a.content}
`
    )
        .join("\n");
    
        const result = await generateText({
            model: openai("gpt-4o-mini"),
            prompt: `
        You are a journalist writing a factual news brief.
        
        Use tools if needed to verify claims or add context.
        
        Articles:
        ${context}
        `,
            tools,
            stopWhen: stepCountIs(3),
        });
    
        await prisma.summary.create({
            data: {
              originalText: context,
              summary: result.text,
            },
          });
    
    return {
        draft: result.text,
        toolCalls: result.toolCalls,
    }
}