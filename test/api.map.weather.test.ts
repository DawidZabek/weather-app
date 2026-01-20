import { describe, expect, it, vi, beforeEach } from "vitest";
import { GET } from "../app/api/map/weather/route";

function mockFetchOnce(response: any, ok = true, status = 200) {
  (global.fetch as any).mockResolvedValueOnce({
    ok,
    status,
    json: async () => response,
    text: async () => JSON.stringify(response),
  });
}

describe("GET /api/map/weather", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns 400 when lat/lon missing", async () => {
    const req = new Request("http://localhost/api/map/weather");
    const res = await GET(req);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.error).toBeTruthy();
  });

  it("returns 200 and normalized payload on success", async () => {
    mockFetchOnce({
      current: {
        temperature_2m: 10.5,
        precipitation: 1.2,
        wind_speed_10m: 12.3,
        wind_direction_10m: 270,
        time: "2026-01-20T00:00",
      },
    });

    const req = new Request("http://localhost/api/map/weather?lat=52.2&lon=21.0");
    const res = await GET(req);

    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body.latitude).toBe(52.2);
    expect(body.longitude).toBe(21.0);
    expect(body.current.temperature).toBe(10.5);
    expect(body.current.precipitation).toBe(1.2);
    expect(body.current.windSpeed).toBe(12.3);
    expect(body.current.windDirection).toBe(270);
    expect(body.current.time).toBe("2026-01-20T00:00");
  });

  it("returns 502 on upstream error", async () => {
    mockFetchOnce({ message: "fail" }, false, 500);

    const req = new Request("http://localhost/api/map/weather?lat=1&lon=2");
    const res = await GET(req);

    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error).toBe("Upstream weather API error");
    expect(body.upstreamStatus).toBe(500);
  });
});
