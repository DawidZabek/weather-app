import { describe, expect, it, vi, beforeEach } from "vitest";
import { GET } from "../app/api/map/radar/route";

function mockFetchOnce(response: any, ok = true, status = 200) {
  (global.fetch as any).mockResolvedValueOnce({
    ok,
    status,
    json: async () => response,
    text: async () => JSON.stringify(response),
  });
}

describe("GET /api/map/radar", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns 200 with tileUrlTemplate when frame exists", async () => {
    mockFetchOnce({
      host: "https://tilecache.rainviewer.com",
      generated: 123,
      radar: { past: [{ path: "/v2/radar/abc" }] },
    });

    const res = await GET();
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.tileUrlTemplate).toContain("tilecache.rainviewer.com");
    expect(body.maxZoom).toBe(10);
  });

  it("returns 502 when frames missing", async () => {
    mockFetchOnce({ host: "x", radar: { past: [] } });

    const res = await GET();
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });
});
