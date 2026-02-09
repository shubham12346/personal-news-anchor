import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function editorInChiefAgent(draft: string) { 
    const result = await generateText({
        model: openai("gpt-4o-mini"),
        prompt: `
    You are the Editor-in-Chief of a news organization.
    
    Review the draft below:
    - Remove speculation
    - Ensure neutrality
    - Improve clarity
    - Approve only verified facts
    
    Draft:
    ${draft}
    
    Return the final approved news script.
    `,
      });
    
      return result.text;
}