export const CATEGORIES = [
  "Image Generation",
  "Programming",
  "Writing/Content",
  "Design",
  "Translation",
  "Life Coach",
  "Education",
  "Business",
  "Fun/Creative",
  "Roleplay",
  "Marketing",
  "SEO",
  "Technology",
  "Science",
  "Legal",
  "Finance",
  "Health",
  "Trivia",
  "Academia",
] as const;

export const AI_PLATFORMS = [
  "ChatGPT",
  "Claude",
  "Gemini",
  "Midjourney",
  "DALL-E",
  "Stable Diffusion",
  "Copilot",
] as const;

export const INPUT_MODALITIES = [
  "text",
  "image",
  "file",
  "audio",
  "video",
] as const;

export const PROMPTS_PER_PAGE = 12;

export type Category = (typeof CATEGORIES)[number];
export type AIPlatform = (typeof AI_PLATFORMS)[number];
export type InputModality = (typeof INPUT_MODALITIES)[number];
