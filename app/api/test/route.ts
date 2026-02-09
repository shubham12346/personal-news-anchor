import { fetchGlobalNews } from "@/app/lib/news/fetchGlobalNewsParser";

export async function GET(request: Request) {
    const articles = await fetchGlobalNews();
    if (!articles) {
        return new Response("No articles found", { status: 404 });
    }
    console.log(articles);
    return new Response(JSON.stringify(articles), { status: 200 });
}