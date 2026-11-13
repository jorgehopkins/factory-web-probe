import { describe, expect, it } from "vitest";
import { handle } from "../src/app.js";

describe("the app", () => {
  it("says hello on its home page", () => {
    expect(handle({ method: "GET", url: "/" })).toMatchObject({ status: 200, body: expect.stringContaining("Hello") });
  });

  it("answers its health check", () => {
    expect(JSON.parse(handle({ method: "GET", url: "/health" }).body)).toEqual({ status: "ok" });
  });

  it("says when there's nothing at an address", () => {
    expect(handle({ method: "GET", url: "/nowhere" }).status).toBe(404);
  });
});
