export function buildRagPrompt(query: string, articles: {
    title: string;
    source: string | null;
    content: string;
}[]) {

    const context = articles.map((article) => `
    Title: ${article.title}
    Source: ${article.source ?? "Unknown"}
    Content: ${article.content}
    `).join("\n\n");


    return  `
    You are a professional news anchor.
    
    Answer the question using ONLY the information in the articles below.
    If the answer is not present, say:
    "This information is not available in the provided sources."
    
    Articles:
    ${context}
    
    Question:
    ${query}
    `;
}