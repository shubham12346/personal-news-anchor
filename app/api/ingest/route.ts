import { prisma } from "@/app/lib/prisma";
import { fetchGlobalNews } from "@/app/lib/news/fetchGlobalNewsParser";
import { randomUUID } from "crypto";

import { NextRequest } from "next/server";
import { embedText } from "@/app/lib/ai/embedding";

export async function POST(_request: NextRequest) { 
    console.log("Starting ingestion...");

    try {
      console.log("Fetching global news...");
      const articles = await fetchGlobalNews();
      console.log(`Fetched ${articles.length} articles.`);
  
      let inserted = 0;
  
      for (const article of articles) {
        console.log(`Processing article: ${article.title}`);
  
        // Prevent duplicates
        const exists = await prisma.article.findUnique({
          where: { url: article.url },
        });
  
        if (exists) {
          console.log(`Skipping duplicate: ${article.url}`);
          continue;
        }
  
        console.log("Creating embedding...");
        const embedding = await embedText(`${article.title}\n${article.content}`);
        console.log("Embedding created for article:", article.title);
  
        const embeddingVector = `[${embedding.join(",")}]`;
        await prisma.$executeRaw`
          INSERT INTO "Article" ("id", "title", "content", "source", "url", "publishedAt", "embedding")
          VALUES (
            ${randomUUID()},
            ${article.title},
            ${article.content},
            ${article.source},
            ${article.url},
            ${new Date(article.publishedAt)},
            ${embeddingVector}::vector
          )
        `;
  
        inserted++;
        console.log(`Inserted article (${inserted}/${articles.length}).`);
      }
  
      console.log("Ingestion completed.");
  
      return Response.json({
        status: "completed",
        totalFetched: articles.length,
        inserted,
      });
    } catch (error) {
      console.error("Ingestion failed:", error);
      return Response.json(
        { status: "failed", message: "Ingestion failed." },
        { status: 500 }
      );
    }
}