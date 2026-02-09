import * as m from "~/paraglide/messages.js";

const CATEGORY_MESSAGE_MAP: Record<string, () => string> = {
  "Image Generation": m.category_imageGeneration,
  "Programming": m.category_programming,
  "Writing/Content": m.category_writingContent,
  "Design": m.category_design,
  "Translation": m.category_translation,
  "Life Coach": m.category_lifeCoach,
  "Education": m.category_education,
  "Business": m.category_business,
  "Fun/Creative": m.category_funCreative,
  "Roleplay": m.category_roleplay,
  "Marketing": m.category_marketing,
  "SEO": m.category_seo,
  "Technology": m.category_technology,
  "Science": m.category_science,
  "Legal": m.category_legal,
  "Finance": m.category_finance,
  "Health": m.category_health,
  "Trivia": m.category_trivia,
  "Academia": m.category_academia,
};

const MODALITY_MESSAGE_MAP: Record<string, () => string> = {
  "text": m.modality_text,
  "image": m.modality_image,
  "file": m.modality_file,
  "audio": m.modality_audio,
  "video": m.modality_video,
};

export function getCategoryDisplayName(dbValue: string): string {
  const messageFn = CATEGORY_MESSAGE_MAP[dbValue];
  return messageFn ? messageFn() : dbValue;
}

export function getModalityDisplayName(dbValue: string): string {
  const messageFn = MODALITY_MESSAGE_MAP[dbValue];
  return messageFn ? messageFn() : dbValue;
}
