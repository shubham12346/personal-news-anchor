import { prisma } from "../prisma";

export type SearchArticle = {
    id: string;
    title: string;
    content: string;
    source: string | null;
    url: string;
};

export async function searchArticles(
    embedding: number[],
    limit: number = 10,
): Promise<SearchArticle[]> {
    const embeddingVector = `[${embedding.join(",")}]`;
    const results = await prisma.$queryRaw<SearchArticle[]>
        `
       SELECT
      id,
      title,
      content,
      source,
      url
    FROM "Article"
    ORDER BY embedding <=> ${embeddingVector}::vector
    LIMIT ${limit};
        `;
    return results;
}