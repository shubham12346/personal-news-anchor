import { embedText } from "@/app/lib/ai/embedding";
import { searchArticles } from "@/app/lib/news/searchArticles";

export async function curatorAgent(topic: string) {
  const embedding = await embedText(topic);

  const articles = await searchArticles(embedding);

  return articles;
}