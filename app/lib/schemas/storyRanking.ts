import { z } from "zod";

export const StoryRankingSchema = z.object({
  id: z.string(),
  title: z.string(),
  score: z.number().min(0).max(1),
  reason: z.string(),
});

export const StoryRankingResponseSchema = z.object({
  ranked_stories: z.array(StoryRankingSchema),
});
