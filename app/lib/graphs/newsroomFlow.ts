export const getNewsroomAgenticFlowMermaid = (): string => `
flowchart TD
  A[POST /api/news-room] --> B[Validate userId + interests]
  B --> C[Orchestrator: generateText]
  C --> D[Tool: curateArticles]
  D --> E[Tool: writeDraft]
  E --> F[Tool: editDraft]
  F --> G[Tool: generateAudio]
  G --> H[Tool: persistBroadcast]
  H --> I[Response: script + audioUrl + broadcastId + sources]

  D -.-> D1[Curated articles]
  E -.-> E1[Draft]
  F -.-> F1[Final script]
  G -.-> G1[MP3 in /public]
  H -.-> H1[StoryRanking + Broadcast]
`;

