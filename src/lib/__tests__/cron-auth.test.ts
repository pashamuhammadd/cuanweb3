import { describe, expect, it } from "vitest";
import { isAuthorizedCronRequest } from "../cron-auth";
import { safeRedirectPath } from "../safe-redirect";

const SECRET = "x".repeat(40);

describe("cron auth", () => {
  it("accepts only the exact bearer secret", () => {
    expect(isAuthorizedCronRequest(`Bearer ${SECRET}`, SECRET)).toBe(true);
    expect(isAuthorizedCronRequest(`Bearer ${SECRET}y`, SECRET)).toBe(false);
    expect(isAuthorizedCronRequest(SECRET, SECRET)).toBe(false);
    expect(isAuthorizedCronRequest(null, SECRET)).toBe(false);
  });
  it("rejects when the secret is missing or weak", () => {
    expect(isAuthorizedCronRequest("Bearer ", undefined)).toBe(false);
    expect(isAuthorizedCronRequest("Bearer short", "short")).toBe(false);
  });
});

describe("safeRedirectPath", () => {
  it("blocks open redirects", () => {
    for (const bad of ["//evil.com", "/\\evil.com", "@evil.com", "https://evil.com", "javascript:alert(1)", "/\tx"]) {
      expect(safeRedirectPath(bad)).toBe("/akun");
    }
    expect(safeRedirectPath("/peluang?x=1#a")).toBe("/peluang?x=1#a");
  });
});
