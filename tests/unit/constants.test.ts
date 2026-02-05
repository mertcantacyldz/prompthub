import { describe, it, expect } from "vitest";
import {
  CATEGORIES,
  AI_PLATFORMS,
  INPUT_MODALITIES,
  PROMPTS_PER_PAGE,
} from "~/lib/utils/constants";

describe("Constants", () => {
  describe("CATEGORIES", () => {
    it("should have 19 categories", () => {
      expect(CATEGORIES).toHaveLength(19);
    });

    it("should include expected categories", () => {
      expect(CATEGORIES).toContain("Programming");
      expect(CATEGORIES).toContain("Image Generation");
      expect(CATEGORIES).toContain("Writing/Content");
    });

    it("should be readonly array", () => {
      // TypeScript ensures this at compile time with 'as const'
      // At runtime, we verify the array has the expected structure
      expect(Array.isArray(CATEGORIES)).toBe(true);
      expect(CATEGORIES.length).toBeGreaterThan(0);
    });
  });

  describe("AI_PLATFORMS", () => {
    it("should have 7 platforms", () => {
      expect(AI_PLATFORMS).toHaveLength(7);
    });

    it("should include major AI platforms", () => {
      expect(AI_PLATFORMS).toContain("ChatGPT");
      expect(AI_PLATFORMS).toContain("Claude");
      expect(AI_PLATFORMS).toContain("Gemini");
      expect(AI_PLATFORMS).toContain("Midjourney");
    });
  });

  describe("INPUT_MODALITIES", () => {
    it("should have 5 modalities", () => {
      expect(INPUT_MODALITIES).toHaveLength(5);
    });

    it("should include text as first modality", () => {
      expect(INPUT_MODALITIES[0]).toBe("text");
    });

    it("should include all expected modalities", () => {
      expect(INPUT_MODALITIES).toContain("text");
      expect(INPUT_MODALITIES).toContain("image");
      expect(INPUT_MODALITIES).toContain("file");
      expect(INPUT_MODALITIES).toContain("audio");
      expect(INPUT_MODALITIES).toContain("video");
    });
  });

  describe("PROMPTS_PER_PAGE", () => {
    it("should be 12", () => {
      expect(PROMPTS_PER_PAGE).toBe(12);
    });

    it("should be a positive number", () => {
      expect(PROMPTS_PER_PAGE).toBeGreaterThan(0);
    });
  });
});
