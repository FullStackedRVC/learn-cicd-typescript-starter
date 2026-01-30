import { describe, expect, test } from "vitest";
import { getAPIKey } from "../api/auth.js";

describe("getAPIKey", () => {
  test("returns API key when authorization header is valid", () => {
    const headers = { authorization: "ApiKey testkey" };
    expect(getAPIKey(headers)).toBe("testkey");
  });

  test("returns null when no authorization header is present", () => {
    const headers = {};
    expect(getAPIKey(headers)).toBe(null);
  });

  test("returns null when authorization header does not start with 'ApiKey'", () => {
    const headers = { authorization: "Bearer token" };
    expect(getAPIKey(headers)).toBe(null);
  });

  test("returns null when 'ApiKey' is present but no key follows", () => {
    const headers = { authorization: "ApiKey" };
    expect(getAPIKey(headers)).toBe(null);
  });

  
});