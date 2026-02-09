import "dotenv/config";
export type GlobalNewsArticle = {
    title: string;
    content: string;
    source: string;
    publishedAt: string;
    url: string;
};
  
const GNEWS_ENDPOINT = "https://gnews.io/api/v4/top-headlines";


export async function fetchGlobalNews() {
  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) {
    return { errors: ["Missing GNEWS_API_KEY env var."] };
  }

  let from12HoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);

  const news = await fetch(`${GNEWS_ENDPOINT}?apikey=${apiKey}&category=general&from=${from12HoursAgo.toISOString()}`);
  const data = await news.json();
  return data;
}
