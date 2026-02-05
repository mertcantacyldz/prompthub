import { vi } from "vitest";

// Mock Supabase client
export const mockSupabaseClient = {
  auth: {
    getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signInWithOAuth: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    })),
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    contains: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn(),
    maybeSingle: vi.fn(),
  })),
  storage: {
    from: vi.fn(() => ({
      upload: vi.fn(),
      remove: vi.fn(),
      getPublicUrl: vi.fn(() => ({ data: { publicUrl: "https://example.com/avatar.jpg" } })),
    })),
  },
};

// Mock Supabase responses
export const mockPrompt = {
  id: "prompt-1",
  user_id: "user-1",
  title: "Test Prompt",
  description: "A test prompt description",
  prompt_text: "This is the prompt text",
  categories: ["Programming", "Education"],
  ai_platforms: ["ChatGPT", "Claude"],
  input_modality: "text" as const,
  is_public: true,
  view_count: 100,
  copy_count: 50,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const mockProfile = {
  id: "user-1",
  email: "test@example.com",
  username: "testuser",
  display_name: "Test User",
  bio: "A test user bio",
  avatar_url: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const mockRating = {
  id: "rating-1",
  user_id: "user-1",
  prompt_id: "prompt-1",
  score: 4,
  created_at: new Date().toISOString(),
};

// Helper to reset all mocks
export function resetSupabaseMocks() {
  vi.clearAllMocks();
}
