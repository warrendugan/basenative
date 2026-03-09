import worker from './index';

// Mock D1 Database
const mockD1 = {
  prepare: jest.fn().mockReturnThis(),
  bind: jest.fn().mockReturnThis(),
  run: jest.fn().mockResolvedValue({ success: true }),
  first: jest.fn().mockResolvedValue(null),
  all: jest.fn().mockResolvedValue({ results: [] }),
};

const mockKV = {
  get: jest.fn().mockResolvedValue(null),
  put: jest.fn().mockResolvedValue(undefined),
};

describe('Greenput API Worker', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let env: any;

  beforeEach(() => {
    env = { DB: mockD1, SESSIONS: mockKV, JWT_SECRET: 'test-secret' } as any;
    jest.clearAllMocks();
    // Reset chained mocks
    mockD1.prepare.mockReturnThis();
    mockD1.bind.mockReturnThis();
    mockD1.run.mockResolvedValue({ success: true });
    mockD1.first.mockResolvedValue(null);
    mockD1.all.mockResolvedValue({ results: [] });
  });

  it('should handle OPTIONS request (CORS)', async () => {
    const req = new Request('http://localhost/leads', {
      method: 'OPTIONS',
      headers: { Origin: 'http://localhost:4200' },
    });
    const res = await worker.fetch(req, env);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:4200');
    expect(res.status).toBe(200);
  });

  it('should create a lead (POST /leads)', async () => {
    const payload = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      purposes: { analytics: 'granted' },
    };
    const req = new Request('http://localhost/leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': 'test-tenant',
        Origin: 'http://localhost:4200',
      },
      body: JSON.stringify(payload),
    });

    const res = await worker.fetch(req, env);
    const body = (await res.json()) as Record<string, unknown>;

    expect(res.status).toBe(201);
    expect(body).toHaveProperty('data');
    const data = body['data'] as Record<string, unknown>;
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('receiptId');
    expect(mockD1.prepare).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO receipts'),
    );
    expect(mockD1.prepare).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO leads'),
    );
  });

  it('should retrieve a receipt (GET /receipts/:id)', async () => {
    const mockReceipt = { id: '123', status: 'granted', purposes: '{}', tenant_id: 'test-tenant' };
    mockD1.first.mockResolvedValue(mockReceipt);

    const req = new Request('http://localhost/receipts/a1b2c3d4-e5f6-7890-abcd-ef1234567890', {
      method: 'GET',
      headers: { 'X-Tenant-ID': 'test-tenant', Origin: 'http://localhost:4200' },
    });
    const res = await worker.fetch(req, env);
    const body = (await res.json()) as Record<string, unknown>;

    expect(res.status).toBe(200);
    const data = body['data'] as Record<string, unknown>;
    expect(data['id']).toBe('123');
    expect(mockD1.prepare).toHaveBeenCalledWith(
      expect.stringContaining('SELECT * FROM receipts'),
    );
  });

  it('should return 404 for unknown receipt', async () => {
    mockD1.first.mockResolvedValue(null);
    const req = new Request('http://localhost/receipts/a1b2c3d4-e5f6-7890-abcd-ef1234567890', {
      method: 'GET',
      headers: { 'X-Tenant-ID': 'test-tenant', Origin: 'http://localhost:4200' },
    });
    const res = await worker.fetch(req, env);
    expect(res.status).toBe(404);
  });

  it('should revoke consent (POST /revoke)', async () => {
    const req = new Request('http://localhost/revoke', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': 'test-tenant',
        Origin: 'http://localhost:4200',
      },
      body: JSON.stringify({ receiptId: '123' }),
    });

    const res = await worker.fetch(req, env);
    const body = (await res.json()) as Record<string, unknown>;

    expect(res.status).toBe(200);
    expect(body['success']).toBe(true);
    expect(mockD1.prepare).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE receipts SET status'),
    );
    expect(mockD1.prepare).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO revocations'),
    );
  });
});
