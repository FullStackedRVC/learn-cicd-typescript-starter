import { describe, expect, test, vi } from "vitest";
import type { Response } from "express";
import { respondWithError, respondWithJSON } from "../api/json.js";

describe("respondWithJSON", () => {
  test("responds with JSON for object payload", () => {
    const mockRes = {
      setHeader: vi.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      status: vi.fn().mockReturnThis() as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      send: vi.fn().mockReturnThis() as any,
      end: vi.fn(),
    };

    const payload = { message: "test" };
    const code = 200;

    respondWithJSON(mockRes as unknown as Response, code, payload);

    expect(mockRes.setHeader).toHaveBeenCalledWith(
      "Content-Type",
      "application/json",
    );
    expect(mockRes.status).toHaveBeenCalledWith(code);
    expect(mockRes.send).toHaveBeenCalledWith(JSON.stringify(payload));
    expect(mockRes.end).toHaveBeenCalled();
  });

  test("responds with JSON for string payload", () => {
    const mockRes = {
      setHeader: vi.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      status: vi.fn().mockReturnThis() as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      send: vi.fn().mockReturnThis() as any,
      end: vi.fn(),
    };

    const payload = "test string";
    const code = 200;

    respondWithJSON(mockRes as unknown as Response, code, payload);

    expect(mockRes.setHeader).toHaveBeenCalledWith(
      "Content-Type",
      "application/json",
    );
    expect(mockRes.status).toHaveBeenCalledWith(code);
    expect(mockRes.send).toHaveBeenCalledWith(JSON.stringify(payload));
    expect(mockRes.end).toHaveBeenCalled();
  });

  test("throws error for invalid payload", () => {
    const mockRes = {
      setHeader: vi.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      status: vi.fn().mockReturnThis() as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      send: vi.fn().mockReturnThis() as any,
      end: vi.fn(),
    };

    const payload = 123; // number, invalid
    const code = 200;

    expect(() => respondWithJSON(mockRes as unknown as Response, code, payload)).toThrow(
      "Payload must be an object or a string",
    );
  });
});

describe("respondWithError", () => {
  test("responds with error JSON without logging", () => {
    const mockRes = {
      setHeader: vi.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      status: vi.fn().mockReturnThis() as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      send: vi.fn().mockReturnThis() as any,
      end: vi.fn(),
    };

    const code = 400;
    const message = "Bad Request";

    respondWithError(mockRes as unknown as Response, code, message);

    expect(mockRes.setHeader).toHaveBeenCalledWith(
      "Content-Type",
      "application/json",
    );
    expect(mockRes.status).toHaveBeenCalledWith(code);
    expect(mockRes.send).toHaveBeenCalledWith(
      JSON.stringify({ error: message }),
    );
    expect(mockRes.end).toHaveBeenCalled();
  });

  test("responds with error JSON and logs error", () => {
    const mockRes = {
      setHeader: vi.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      status: vi.fn().mockReturnThis() as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      send: vi.fn().mockReturnThis() as any,
      end: vi.fn(),
    };

    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const code = 500;
    const message = "Internal Server Error";
    const logError = new Error("Test error");

    respondWithError(mockRes as unknown as Response, code, message, logError);

    expect(consoleLogSpy).toHaveBeenCalledWith("Test error");
    expect(mockRes.setHeader).toHaveBeenCalledWith(
      "Content-Type",
      "application/json",
    );
    expect(mockRes.status).toHaveBeenCalledWith(code);
    expect(mockRes.send).toHaveBeenCalledWith(
      JSON.stringify({ error: message }),
    );
    expect(mockRes.end).toHaveBeenCalled();

    consoleLogSpy.mockRestore();
  });

  test("logs string error", () => {
    const mockRes = {
      setHeader: vi.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      status: vi.fn().mockReturnThis() as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      send: vi.fn().mockReturnThis() as any,
      end: vi.fn(),
    };

    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const code = 500;
    const message = "Error";
    const logError = "String error";

    respondWithError(mockRes as unknown as Response, code, message, logError);

    expect(consoleLogSpy).toHaveBeenCalledWith("String error");

    consoleLogSpy.mockRestore();
  });

  test("logs unknown error as string", () => {
    const mockRes = {
      setHeader: vi.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      status: vi.fn().mockReturnThis() as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      send: vi.fn().mockReturnThis() as any,
      end: vi.fn(),
    };

    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const code = 500;
    const message = "Error";
    const logError = { custom: "error" };

    respondWithError(mockRes as unknown as Response, code, message, logError);

    expect(consoleLogSpy).toHaveBeenCalledWith("[object Object]");

    consoleLogSpy.mockRestore();
  });
});

describe("respondWithJSON (edge cases)", () => {
  test("throws error for non-object/string payload", () => {
    const mockRes = {
      setHeader: vi.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      status: vi.fn().mockReturnThis() as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      send: vi.fn().mockReturnThis() as any,
      end: vi.fn(),
    };
    expect(() => respondWithJSON(mockRes as unknown as Response, 200, 42)).toThrow();
    expect(() => respondWithJSON(mockRes as unknown as Response, 200, true)).toThrow();
    expect(() => respondWithJSON(mockRes as unknown as Response, 200, undefined)).toThrow();
    expect(() => respondWithJSON(mockRes as unknown as Response, 200, null)).not.toThrow(); // null is typeof object
  });
});
