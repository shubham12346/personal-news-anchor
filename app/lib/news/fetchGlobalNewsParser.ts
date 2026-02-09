import Parser from "rss-parser";
import { RSS_SOURCES } from "./rssParser";

export type GlobalNewsArticle = {
    title: string;
    content: string;
    source: string;
    publishedAt: string;
    url: string;
  };
  
const parser = new Parser();

async function parseFeedWithFallback(url: string) {
  try {
    return await parser.parseURL(url);
  } catch (error) {
    console.warn(`parseURL failed for ${url}, trying fetch+parseString`, error);
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch RSS (${response.status}) for ${url}`);
  }

  const xml = await response.text();
  return parser.parseString(xml);
}

export async function fetchGlobalNews(): Promise<GlobalNewsArticle[]> {
  const articles: GlobalNewsArticle[] = [];

  for (const source of RSS_SOURCES) {
    try {
      const feed = await parseFeedWithFallback(source.url);

      for (const item of feed.items) {
        if (!item.title || !item.link) continue;

        const content =
          item.contentSnippet ||
          item.content ||
          item.summary ||
          "";

        if (content.length < 200) continue; // important for embeddings
        console.log("items ",item);
        articles.push({
          title: item.title,
          content: `
Title: ${item.title}
Source: ${source.name}
Content: ${content}
          `.trim(),
          source: source.name,
          publishedAt: item.isoDate || new Date().toISOString(),
          url: item.link,
        });
      }
    } catch (error) {
      console.error(`Failed to fetch ${source.name}`, error);
    }
  }

  return articles;
}
