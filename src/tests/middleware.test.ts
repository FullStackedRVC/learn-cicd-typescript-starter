import { describe, expect, test, vi } from "vitest";

import { middlewareAuth } from '../api/middleware.js';

import { User } from "../db/schema.js";
import { getAPIKey } from '../api/auth.js';
import { getUser } from '../db/queries/users.js';
import { respondWithError } from '../api/json.js';

// Mock the modules
vi.mock('../api/auth', () => ({
  getAPIKey: vi.fn(),
}));
vi.mock('../db/queries/users', () => ({
  getUser: vi.fn(),
}));
vi.mock('../api/json', () => ({
  respondWithError: vi.fn(),
}));



describe('middlewareAuth', () => {
  test('should call handler with authenticated user when API key and user are valid', async () => {
    (getAPIKey as any).mockReturnValue('testkey');
    (getUser as any).mockResolvedValue({ id: '1', name: 'test', apiKey: 'testkey', createdAt: '2023-01-01', updatedAt: '2023-01-01' });
    const req = { headers: {} } as any;
    const res = {} as any;

    const handler = vi.fn();

    await middlewareAuth(handler)(req, res);

    expect(handler).toHaveBeenCalledWith(req, res, expect.objectContaining({ name: 'test' }));
    expect(getAPIKey).toHaveBeenCalledWith(req.headers);
    expect(getUser).toHaveBeenCalledWith('testkey');
  });

  test('should respond with 401 error when no API key is found', async () => {
    (getAPIKey as any).mockReturnValue(null);
    const req = { headers: {} } as any;
    const res = {} as any;

    const handler = vi.fn();

    await middlewareAuth(handler)(req, res);

    expect(respondWithError).toHaveBeenCalledWith(res, 401, "Couldn't find api key");
    expect(handler).not.toHaveBeenCalled();
  });

  test('should respond with 404 error when user is not found', async () => {
    (getAPIKey as any).mockReturnValue('testkey');
    (getUser as any).mockResolvedValue(null);
    const req = { headers: {} } as any;
    const res = {} as any;

    const handler = vi.fn();

    await middlewareAuth(handler)(req, res);

    expect(respondWithError).toHaveBeenCalledWith(res, 404, "Couldn't get user");
    expect(handler).not.toHaveBeenCalled();
  });

  test('should respond with 500 error when authentication throws an error', async () => {
    (getAPIKey as any).mockReturnValue('testkey');
    (getUser as any).mockRejectedValue(new Error('Database error'));
    const req = { headers: {} } as any;
    const res = {} as any;

    const handler = vi.fn();

    await middlewareAuth(handler)(req, res);

    expect(respondWithError).toHaveBeenCalledWith(res, 500, "Couldn't authenticate user", expect.any(Error));
    expect(handler).not.toHaveBeenCalled();
  });
});