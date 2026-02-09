import { embed } from "ai";
import { openai } from "./ai-config";

export async function embedText(input: string | string[]) {
    const text = Array.isArray(input)
        ? input.map((item) => String(item).trim()).filter(Boolean).join(", ")
        : String(input ?? "").trim();
    if (!text) {
        throw new Error("Embedding input must be a non-empty string.");
    }
    const { embedding } = await embed({
        model: openai.embedding("text-embedding-3-small"),
        value: text,
    });
    return embedding;
}