import { createEvents } from 'ics';
/// <reference types="@cloudflare/workers-types" />

/**
 * Greenput API Worker
 *
 * Multi-tenant API powering the Labor Abstraction Ecosystem.
 * Bindings: D1 (DB), KV (SESSIONS)
 */

interface Env {
  DB: D1Database;
  SESSIONS: KVNamespace;
  JWT_SECRET: string;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LeadPayload {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
  serviceType?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  notes?: string;
  source?: string;
  estimatedValue?: number;
  purposes?: Record<string, string>;
}

interface RevocationRequest {
  receiptId: string;
  reason?: string;
}

interface DealPayload {
  name: string;
  company: string;
  stage?: string;
  value?: number;
  targetClose?: string;
  assignedTo?: string;
}

interface DocumentPayload {
  name: string;
  type: string;
  status?: string;
  dealId?: string;
  uploadedBy: string;
  size?: string;
  url?: string;
}

interface TreasuryAccountPayload {
  name: string;
  type: string;
  balance?: number;
  yieldApy?: number;
  institution: string;
}

interface SweepRulePayload {
  sourceAccountId: string;
  targetAccountId: string;
  threshold: number;
  enabled?: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getCorsOrigin(request: Request): string {
  const origin = request.headers.get('Origin') ?? '';
  const allowedPatterns = [
    /^https:\/\/.*\.duganlabs\.com$/,
    /^https:\/\/greenput\.com$/,
    /^http:\/\/localhost:\d+$/,
  ];

  if (allowedPatterns.some(pattern => pattern.test(origin))) {
    return origin;
  }
  return 'https://duganlabs.com';
}

function getCorsHeaders(request: Request): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': getCorsOrigin(request),
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Tenant-ID',
    'Access-Control-Allow-Credentials': 'true',
  };
}

function json(data: unknown, status = 200, corsHeaders?: Record<string, string>): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...(corsHeaders || {}), 'Content-Type': 'application/json' },
  });
}

function error(message: string, status: number, corsHeaders?: Record<string, string>): Response {
  return json({ error: message }, status, corsHeaders);
}

function resolveTenant(request: Request): string {
  const header = request.headers.get('X-Tenant-ID');
  if (header) return header;

  const origin = request.headers.get('Origin') ?? '';
  if (origin.includes('localhost:4300') || origin.includes('greenput'))
    return 'greenput';

  return 'greenput';
}

async function sha256(input: string): Promise<string> {
  const buffer = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(input),
  );
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// ---------------------------------------------------------------------------
// Route Matching
// ---------------------------------------------------------------------------

type RouteHandler = (
  request: Request,
  env: Env,
  params: Record<string, string>,
  tenantId: string,
  corsHeaders: Record<string, string>,
) => Promise<Response>;

interface Route {
  method: string;
  pattern: RegExp;
  handler: RouteHandler;
}

function matchRoute(
  method: string,
  path: string,
  routes: Route[],
): { handler: RouteHandler; params: Record<string, string> } | null {
  for (const route of routes) {
    if (route.method !== method) continue;
    const match = path.match(route.pattern);
    if (match) {
      const params: Record<string, string> = {};
      const keys = route.pattern.source.match(/\?<(\w+)>/g);
      if (keys) {
        for (const key of keys) {
          const name = key.slice(2, -1);
          params[name] = match.groups?.[name] ?? '';
        }
      }
      return { handler: route.handler, params };
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

const listLeads: RouteHandler = async (_req, env, _params, tenantId, corsHeaders) => {
  const { results } = await env.DB.prepare(
    'SELECT * FROM leads WHERE tenant_id = ? ORDER BY created_at DESC LIMIT 100',
  )
    .bind(tenantId)
    .all();
  return json({ data: results ?? [] }, 200, corsHeaders);
};

const createLead: RouteHandler = async (req, env, _params, tenantId, corsHeaders) => {
  const body = (await req.json()) as LeadPayload;

  if (!body.firstName || !body.lastName) {
    return error('firstName and lastName are required', 400, corsHeaders);
  }

  const leadId = crypto.randomUUID();
  let receiptId: string | null = null;

  // If consent purposes are provided, generate a receipt
  if (body.purposes && Object.keys(body.purposes).length > 0) {
    receiptId = crypto.randomUUID();
    const hash = await sha256(JSON.stringify(body.purposes));

    await env.DB.prepare(
      `INSERT INTO receipts (id, tenant_id, lead_id, purposes, policy_version, hash, status, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, 'granted', ?)`,
    )
      .bind(
        receiptId,
        tenantId,
        leadId,
        JSON.stringify(body.purposes),
        'v1.0-lead-flow',
        hash,
        req.headers.get('User-Agent') ?? 'unknown',
      )
      .run();
  }

  await env.DB.prepare(
    `INSERT INTO leads (id, tenant_id, receipt_id, first_name, last_name, email, phone, company, service_type, address, city, state, zip, notes, source, estimated_value)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      leadId,
      tenantId,
      receiptId,
      body.firstName,
      body.lastName,
      body.email ?? null,
      body.phone ?? null,
      body.company ?? null,
      body.serviceType ?? null,
      body.address ?? null,
      body.city ?? null,
      body.state ?? null,
      body.zip ?? null,
      body.notes ?? null,
      body.source ?? 'website',
      body.estimatedValue ?? null,
    )
    .run();

  return json({ data: { id: leadId, receiptId } }, 201, corsHeaders);
};

const getLead: RouteHandler = async (_req, env, params, tenantId, corsHeaders) => {
  const result = await env.DB.prepare(
    'SELECT * FROM leads WHERE id = ? AND tenant_id = ?',
  )
    .bind(params['id'], tenantId)
    .first();

  if (!result) return error('Lead not found', 404, corsHeaders);
  return json({ data: result }, 200, corsHeaders);
};

const patchLead: RouteHandler = async (req, env, params, tenantId, corsHeaders) => {
  const body = (await req.json()) as Partial<{
    status: string;
    assignedTo: string;
    notes: string;
    estimatedValue: number;
  }>;

  const sets: string[] = ["updated_at = datetime('now')"];
  const binds: (string | number | null)[] = [];

  if (body.status) {
    sets.push('status = ?');
    binds.push(body.status);
  }
  if (body.assignedTo !== undefined) {
    sets.push('assigned_to = ?');
    binds.push(body.assignedTo);
  }
  if (body.notes !== undefined) {
    sets.push('notes = ?');
    binds.push(body.notes);
  }
  if (body.estimatedValue !== undefined) {
    sets.push('estimated_value = ?');
    binds.push(body.estimatedValue);
  }

  await env.DB.prepare(
    `UPDATE leads SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`,
  )
    .bind(...binds, params['id'], tenantId)
    .run();

  return json({ success: true }, 200, corsHeaders);
};

const getReceipt: RouteHandler = async (_req, env, params, tenantId, corsHeaders) => {
  const result = await env.DB.prepare(
    'SELECT * FROM receipts WHERE id = ? AND tenant_id = ?',
  )
    .bind(params['id'], tenantId)
    .first();

  if (!result) return error('Receipt not found', 404, corsHeaders);
  return json({ data: result }, 200, corsHeaders);
};

const revokeConsent: RouteHandler = async (req, env, _params, tenantId, corsHeaders) => {
  const { receiptId, reason } = (await req.json()) as RevocationRequest;

  if (!receiptId) return error('receiptId is required', 400, corsHeaders);

  await env.DB.prepare(
    "UPDATE receipts SET status = 'revoked' WHERE id = ? AND tenant_id = ?",
  )
    .bind(receiptId, tenantId)
    .run();

  await env.DB.prepare(
    'INSERT INTO revocations (id, receipt_id, tenant_id, reason) VALUES (?, ?, ?, ?)',
  )
    .bind(crypto.randomUUID(), receiptId, tenantId, reason ?? 'User initiated')
    .run();

  return json({ success: true }, 200, corsHeaders);
};

const calendarFeed: RouteHandler = async (_req, env, params, tenantId, corsHeaders) => {
  const { results } = await env.DB.prepare(
    'SELECT * FROM events WHERE user_id = ? AND tenant_id = ?',
  )
    .bind(params['userId'], tenantId)
    .all();

  const events = (results ?? []).map((row: Record<string, unknown>) => {
    const start = new Date(row['start_time'] as string);
    const end = new Date(row['end_time'] as string);
    return {
      start: [
        start.getUTCFullYear(),
        start.getUTCMonth() + 1,
        start.getUTCDate(),
        start.getUTCHours(),
        start.getUTCMinutes(),
      ],
      end: [
        end.getUTCFullYear(),
        end.getUTCMonth() + 1,
        end.getUTCDate(),
        end.getUTCHours(),
        end.getUTCMinutes(),
      ],
      title: row['title'],
      description: row['description'],
      url: row['url'],
      uid: String(row['id']),
      productId: 'basenative/ics',
    };
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const icsContent = await new Promise<string>((resolve, reject) => {
    createEvents(events as any, (err, value) => {
      if (err) reject(err);
      else resolve(value);
    });
  });

  return new Response(icsContent, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'inline; filename=calendar.ics',
      ...corsHeaders,
    },
  });
};

const healthCheck: RouteHandler = async (_req, env, _params, tenantId, corsHeaders) => {
  return json({
    status: 'ok',
    tenant: tenantId,
    timestamp: new Date().toISOString(),
  }, 200, corsHeaders);
};

// --- Deals ---

const listDeals: RouteHandler = async (_req, env, _params, tenantId, corsHeaders) => {
  const { results } = await env.DB.prepare(
    'SELECT * FROM deals WHERE tenant_id = ? ORDER BY updated_at DESC',
  ).bind(tenantId).all();
  return json({ data: results ?? [] }, 200, corsHeaders);
};

const getDeal: RouteHandler = async (_req, env, params, tenantId, corsHeaders) => {
  const result = await env.DB.prepare(
    'SELECT * FROM deals WHERE id = ? AND tenant_id = ?',
  ).bind(params['id'], tenantId).first();
  if (!result) return error('Deal not found', 404, corsHeaders);
  return json({ data: result }, 200, corsHeaders);
};

const createDeal: RouteHandler = async (req, env, _params, tenantId, corsHeaders) => {
  const body = (await req.json()) as DealPayload;
  if (!body.name || !body.company) return error('name and company required', 400, corsHeaders);
  const id = crypto.randomUUID();
  await env.DB.prepare(
    `INSERT INTO deals (id, tenant_id, name, company, stage, value, target_close, assigned_to)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  ).bind(id, tenantId, body.name, body.company, body.stage ?? 'Prospecting', body.value ?? 0, body.targetClose ?? null, body.assignedTo ?? null).run();
  return json({ data: { id } }, 201, corsHeaders);
};

const patchDeal: RouteHandler = async (req, env, params, tenantId, corsHeaders) => {
  const body = (await req.json()) as Partial<DealPayload & { notes: string }>;
  const sets: string[] = ["updated_at = datetime('now')"];
  const binds: (string | number | null)[] = [];

  if (body.stage) { sets.push('stage = ?'); binds.push(body.stage); }
  if (body.value !== undefined) { sets.push('value = ?'); binds.push(body.value); }
  if (body.targetClose !== undefined) { sets.push('target_close = ?'); binds.push(body.targetClose); }
  if (body.assignedTo !== undefined) { sets.push('assigned_to = ?'); binds.push(body.assignedTo); }
  if (body.notes !== undefined) { sets.push('notes = ?'); binds.push(body.notes); }
  if (body.name) { sets.push('name = ?'); binds.push(body.name); }

  sets.push("last_activity = datetime('now')");

  await env.DB.prepare(
    `UPDATE deals SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`,
  ).bind(...binds, params['id'], tenantId).run();
  return json({ success: true }, 200, corsHeaders);
};

const deleteDeal: RouteHandler = async (_req, env, params, tenantId, corsHeaders) => {
  await env.DB.prepare('DELETE FROM deals WHERE id = ? AND tenant_id = ?').bind(params['id'], tenantId).run();
  return json({ success: true }, 200, corsHeaders);
};

// --- Documents ---

const listDocuments: RouteHandler = async (req, env, _params, tenantId, corsHeaders) => {
  const url = new URL(req.url);
  const dealId = url.searchParams.get('dealId');
  const type = url.searchParams.get('type');
  const status = url.searchParams.get('status');

  let query = 'SELECT * FROM documents WHERE tenant_id = ?';
  const binds: string[] = [tenantId];

  if (dealId) { query += ' AND deal_id = ?'; binds.push(dealId); }
  if (type) { query += ' AND type = ?'; binds.push(type); }
  if (status) { query += ' AND status = ?'; binds.push(status); }

  query += ' ORDER BY created_at DESC';

  const stmt = env.DB.prepare(query);
  const { results } = await stmt.bind(...binds).all();
  return json({ data: results ?? [] }, 200, corsHeaders);
};

const createDocument: RouteHandler = async (req, env, _params, tenantId, corsHeaders) => {
  const body = (await req.json()) as DocumentPayload;
  if (!body.name || !body.type || !body.uploadedBy) return error('name, type, and uploadedBy required', 400, corsHeaders);
  const id = crypto.randomUUID();
  await env.DB.prepare(
    `INSERT INTO documents (id, tenant_id, deal_id, name, type, status, uploaded_by, size, url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).bind(id, tenantId, body.dealId ?? null, body.name, body.type, body.status ?? 'Draft', body.uploadedBy, body.size ?? null, body.url ?? null).run();
  return json({ data: { id } }, 201, corsHeaders);
};

const patchDocument: RouteHandler = async (req, env, params, tenantId, corsHeaders) => {
  const body = (await req.json()) as Partial<DocumentPayload>;
  const sets: string[] = ["updated_at = datetime('now')"];
  const binds: (string | null)[] = [];

  if (body.status) { sets.push('status = ?'); binds.push(body.status); }
  if (body.name) { sets.push('name = ?'); binds.push(body.name); }
  if (body.type) { sets.push('type = ?'); binds.push(body.type); }

  await env.DB.prepare(
    `UPDATE documents SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`,
  ).bind(...binds, params['id'], tenantId).run();
  return json({ success: true }, 200, corsHeaders);
};

const deleteDocument: RouteHandler = async (_req, env, params, tenantId, corsHeaders) => {
  await env.DB.prepare('DELETE FROM documents WHERE id = ? AND tenant_id = ?').bind(params['id'], tenantId).run();
  return json({ success: true }, 200, corsHeaders);
};

// --- Treasury ---

const listTreasuryAccounts: RouteHandler = async (_req, env, _params, tenantId, corsHeaders) => {
  const { results } = await env.DB.prepare(
    'SELECT * FROM treasury_accounts WHERE tenant_id = ? ORDER BY type, name',
  ).bind(tenantId).all();
  return json({ data: results ?? [] }, 200, corsHeaders);
};

const getTreasuryAccount: RouteHandler = async (_req, env, params, tenantId, corsHeaders) => {
  const result = await env.DB.prepare(
    'SELECT * FROM treasury_accounts WHERE id = ? AND tenant_id = ?',
  ).bind(params['id'], tenantId).first();
  if (!result) return error('Account not found', 404, corsHeaders);
  return json({ data: result }, 200, corsHeaders);
};

const createTreasuryAccount: RouteHandler = async (req, env, _params, tenantId, corsHeaders) => {
  const body = (await req.json()) as TreasuryAccountPayload;
  if (!body.name || !body.type || !body.institution) return error('name, type, and institution required', 400, corsHeaders);
  const id = crypto.randomUUID();
  await env.DB.prepare(
    `INSERT INTO treasury_accounts (id, tenant_id, name, type, balance, yield_apy, institution)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).bind(id, tenantId, body.name, body.type, body.balance ?? 0, body.yieldApy ?? 0, body.institution).run();
  return json({ data: { id } }, 201, corsHeaders);
};

const patchTreasuryAccount: RouteHandler = async (req, env, params, tenantId, corsHeaders) => {
  const body = (await req.json()) as Partial<TreasuryAccountPayload & { status: string; lastSwept: string }>;
  const sets: string[] = ["updated_at = datetime('now')"];
  const binds: (string | number | null)[] = [];

  if (body.balance !== undefined) { sets.push('balance = ?'); binds.push(body.balance); }
  if (body.yieldApy !== undefined) { sets.push('yield_apy = ?'); binds.push(body.yieldApy); }
  if (body.status) { sets.push('status = ?'); binds.push(body.status); }
  if (body.lastSwept) { sets.push('last_swept = ?'); binds.push(body.lastSwept); }
  if (body.name) { sets.push('name = ?'); binds.push(body.name); }

  await env.DB.prepare(
    `UPDATE treasury_accounts SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`,
  ).bind(...binds, params['id'], tenantId).run();
  return json({ success: true }, 200, corsHeaders);
};

// --- Sweep Rules ---

const listSweepRules: RouteHandler = async (_req, env, _params, tenantId, corsHeaders) => {
  const { results } = await env.DB.prepare(
    `SELECT sr.*, sa.name as source_name, ta.name as target_name
     FROM sweep_rules sr
     JOIN treasury_accounts sa ON sr.source_account_id = sa.id
     JOIN treasury_accounts ta ON sr.target_account_id = ta.id
     WHERE sr.tenant_id = ?
     ORDER BY sr.created_at DESC`,
  ).bind(tenantId).all();
  return json({ data: results ?? [] }, 200, corsHeaders);
};

const createSweepRule: RouteHandler = async (req, env, _params, tenantId, corsHeaders) => {
  const body = (await req.json()) as SweepRulePayload;
  if (!body.sourceAccountId || !body.targetAccountId) return error('sourceAccountId and targetAccountId required', 400, corsHeaders);
  const id = crypto.randomUUID();
  await env.DB.prepare(
    `INSERT INTO sweep_rules (id, tenant_id, source_account_id, target_account_id, threshold, enabled)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).bind(id, tenantId, body.sourceAccountId, body.targetAccountId, body.threshold ?? 0, body.enabled !== false ? 1 : 0).run();
  return json({ data: { id } }, 201, corsHeaders);
};

const patchSweepRule: RouteHandler = async (req, env, params, tenantId, corsHeaders) => {
  const body = (await req.json()) as Partial<SweepRulePayload>;
  const sets: string[] = ["updated_at = datetime('now')"];
  const binds: (string | number | null)[] = [];

  if (body.threshold !== undefined) { sets.push('threshold = ?'); binds.push(body.threshold); }
  if (body.enabled !== undefined) { sets.push('enabled = ?'); binds.push(body.enabled ? 1 : 0); }
  if (body.sourceAccountId) { sets.push('source_account_id = ?'); binds.push(body.sourceAccountId); }
  if (body.targetAccountId) { sets.push('target_account_id = ?'); binds.push(body.targetAccountId); }

  await env.DB.prepare(
    `UPDATE sweep_rules SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`,
  ).bind(...binds, params['id'], tenantId).run();
  return json({ success: true }, 200, corsHeaders);
};

const deleteSweepRule: RouteHandler = async (_req, env, params, tenantId, corsHeaders) => {
  await env.DB.prepare('DELETE FROM sweep_rules WHERE id = ? AND tenant_id = ?').bind(params['id'], tenantId).run();
  return json({ success: true }, 200, corsHeaders);
};

// ---------------------------------------------------------------------------
// Route Table
// ---------------------------------------------------------------------------

const routes: Route[] = [
  { method: 'GET', pattern: /^\/health$/, handler: healthCheck },
  { method: 'GET', pattern: /^\/leads$/, handler: listLeads },
  { method: 'POST', pattern: /^\/leads$/, handler: createLead },
  {
    method: 'GET',
    pattern: /^\/leads\/(?<id>[a-f0-9-]+)$/,
    handler: getLead,
  },
  {
    method: 'PATCH',
    pattern: /^\/leads\/(?<id>[a-f0-9-]+)$/,
    handler: patchLead,
  },
  {
    method: 'GET',
    pattern: /^\/receipts\/(?<id>[a-f0-9-]+)$/,
    handler: getReceipt,
  },
  { method: 'POST', pattern: /^\/revoke$/, handler: revokeConsent },
  {
    method: 'GET',
    pattern: /^\/calendar\/(?<userId>[^/]+)\/feed\.ics$/,
    handler: calendarFeed,
  },
  // Deals
  { method: 'GET', pattern: /^\/deals$/, handler: listDeals },
  { method: 'POST', pattern: /^\/deals$/, handler: createDeal },
  { method: 'GET', pattern: /^\/deals\/(?<id>[a-f0-9-]+)$/, handler: getDeal },
  { method: 'PATCH', pattern: /^\/deals\/(?<id>[a-f0-9-]+)$/, handler: patchDeal },
  { method: 'DELETE', pattern: /^\/deals\/(?<id>[a-f0-9-]+)$/, handler: deleteDeal },
  // Documents
  { method: 'GET', pattern: /^\/documents$/, handler: listDocuments },
  { method: 'POST', pattern: /^\/documents$/, handler: createDocument },
  { method: 'PATCH', pattern: /^\/documents\/(?<id>[a-f0-9-]+)$/, handler: patchDocument },
  { method: 'DELETE', pattern: /^\/documents\/(?<id>[a-f0-9-]+)$/, handler: deleteDocument },
  // Treasury
  { method: 'GET', pattern: /^\/treasury$/, handler: listTreasuryAccounts },
  { method: 'POST', pattern: /^\/treasury$/, handler: createTreasuryAccount },
  { method: 'GET', pattern: /^\/treasury\/(?<id>[a-f0-9-]+)$/, handler: getTreasuryAccount },
  { method: 'PATCH', pattern: /^\/treasury\/(?<id>[a-f0-9-]+)$/, handler: patchTreasuryAccount },
  // Sweep Rules
  { method: 'GET', pattern: /^\/sweep$/, handler: listSweepRules },
  { method: 'POST', pattern: /^\/sweep$/, handler: createSweepRule },
  { method: 'PATCH', pattern: /^\/sweep\/(?<id>[a-f0-9-]+)$/, handler: patchSweepRule },
  { method: 'DELETE', pattern: /^\/sweep\/(?<id>[a-f0-9-]+)$/, handler: deleteSweepRule },
];

// ---------------------------------------------------------------------------
// Entry
// ---------------------------------------------------------------------------

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const corsHeaders = getCorsHeaders(request);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const tenantId = resolveTenant(request);

    try {
      const matched = matchRoute(request.method, path, routes);
      if (matched) {
        return await matched.handler(request, env, matched.params, tenantId, corsHeaders);
      }
      return error('Not Found', 404, corsHeaders);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Internal Server Error';
      return error(message, 500, corsHeaders);
    }
  },
};
