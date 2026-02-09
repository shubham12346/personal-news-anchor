export async function factCheck(claim: string) {
    const apiKey = process.env.FACT_CHECK_API_KEY;
    if (!apiKey) {
      return {
        verdict: "Unverified",
        explanation: "FACT_CHECK_API_KEY is not configured.",
      };
    }

    const url = `https://factchecktools.googleapis.com/v1alpha1/claims:search?query=${encodeURIComponent(
      claim,
    )}&key=${apiKey}`;

    const response = await fetch(url);
    if (!response.ok) {
      return {
        verdict: "Unverified",
        explanation: "Fact check service failed to respond.",
      };
    }

    const data = (await response.json()) as {
      claims?: Array<{
        text?: string;
        claimReview?: Array<{
          publisher?: { name?: string; site?: string };
          url?: string;
          textualRating?: string;
          title?: string;
        }>;
      }>;
    };

    const claimReview = data.claims?.[0]?.claimReview?.[0];
    if (!claimReview) {
      return {
        verdict: "Unverified",
        explanation: "No matching fact-check review found.",
      };
    }

    return {
      verdict: claimReview.textualRating ?? "Unverified",
      explanation:
        claimReview.title ??
        "Fact-check review found, but no summary was provided.",
      source: {
        publisher: claimReview.publisher?.name ?? "Unknown",
        url: claimReview.url ?? "",
      },
    };
  }