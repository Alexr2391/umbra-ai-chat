import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/supabase", () => ({ supabase: { from: vi.fn() } }));
vi.mock("@/lib/groq", () => ({ groq: { models: { list: vi.fn() } } }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/utils/sanitize", () => ({
  sanitizePreferences: vi.fn((x) => x),
}));

function makeChain(result: { data: unknown; error: unknown }) {
  const chain: Record<string, unknown> = {};
  chain.select = vi.fn(() => chain);
  chain.eq = vi.fn(() => chain);
  chain.single = vi.fn(() => Promise.resolve(result));
  return chain as unknown as ReturnType<typeof supabase.from>;
}

describe("getConversation — ownership check", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when there is no authenticated session", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);

    const { getConversation } = await import("@/app/actions");
    const result = await getConversation("conv-123");

    expect(result).toBeNull();
  });

  it("returns null when the conversation belongs to a different user", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { email: "alice@example.com" } } as never);

    vi.mocked(supabase.from).mockReturnValueOnce(
      makeChain({ data: { id: "user-alice" }, error: null })
    );

    vi.mocked(supabase.from).mockReturnValueOnce(
      makeChain({ data: null, error: null })
    );

    const { getConversation } = await import("@/app/actions");
    const result = await getConversation("conv-owned-by-bob");

    expect(result).toBeNull();
  });

  it("returns the conversation when it belongs to the authenticated user", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { email: "alice@example.com" } } as never);

    vi.mocked(supabase.from).mockReturnValueOnce(
      makeChain({ data: { id: "user-alice" }, error: null })
    );
    vi.mocked(supabase.from).mockReturnValueOnce(
      makeChain({ data: { id: "conv-123" }, error: null })
    );

    const { getConversation } = await import("@/app/actions");
    const result = await getConversation("conv-123");

    expect(result).toEqual({ id: "conv-123" });
  });
});
