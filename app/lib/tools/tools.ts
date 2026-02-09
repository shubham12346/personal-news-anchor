import { tool } from "ai";
import { z } from "zod";
import { factCheck } from "@/app/lib/tools/factCheck";
import { getWeather } from "@/app/lib/tools/waether";

export const tools = {
  factCheck: tool({
    description: "Verify factual claims in news content",
    inputSchema: z.object({
      claim: z.string(),
    }),
    execute: async ({ claim }) => factCheck(claim),
  }),
  getWeather: tool({
    description: "Get current weather for a city",
    inputSchema: z.object({
      city: z.string(),
    }),
    execute: async ({ city }) => getWeather(city),
  }),
};