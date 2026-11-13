import { describe, expect, it } from "vitest";
import { handle } from "../src/app.js";

describe("the app", () => {
  it("says hello on its home page", () => {
    expect(handle({ method: "GET", url: "/" })).toMatchObject({ status: 200, body: expect.stringContaining("Hello") });
  });

  it("shows today's date directly under the heading", () => {
    const now = () => new Date("2026-11-13T10:00:00Z");
    const { body } = handle({ method: "GET", url: "/", now });
    expect(body).toContain('</h1><p id="today"><time datetime="2026-11-13">Friday, 13 November 2026</time></p>');
  });

  it("shows the date of the day the clock gives", () => {
    const now = () => new Date("2027-01-02T23:59:59Z");
    expect(handle({ method: "GET", url: "/", now }).body).toContain("Saturday, 2 January 2027");
  });

  it("shows the current date when no clock is given", () => {
    const today = new Date().toISOString().slice(0, 10);
    expect(handle({ method: "GET", url: "/" }).body).toContain(`datetime="${today}"`);
  });

  it("answers its health check", () => {
    expect(JSON.parse(handle({ method: "GET", url: "/health" }).body)).toEqual({ status: "ok" });
  });

  it("says when there's nothing at an address", () => {
    expect(handle({ method: "GET", url: "/nowhere" }).status).toBe(404);
  });
});
