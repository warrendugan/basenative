/**
 * MSW Request Handlers
 * Mock Service Worker handlers for local development and testing.
 *
 * These handlers mirror the greenput-api Worker endpoints so Angular apps
 * can run without the backend. Used in:
 * - Unit tests (jest + msw/node)
 * - Dev mode when API is unavailable
 * - Storybook (future)
 *
 * Network requests are automatically intercepted and handled at the network layer,
 * making mocks transparent to the application code.
 */

import { http, HttpResponse } from 'msw';
import { mockLeads, mockUsers } from './fixtures';

/**
 * Define all API handlers for the greenput-api
 * These intercept requests at the network layer before they reach the actual server.
 */
export const handlers = [
  // Health check endpoint
  http.get('/health', () => {
    return HttpResponse.json(
      {
        status: 'ok',
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  }),

  // Leads API - List leads
  http.get('/leads', ({ request }) => {
    const url = new URL(request.url);
    const tenantId = url.searchParams.get('tenant_id');
    const status = url.searchParams.get('status');
    const limit = parseInt(url.searchParams.get('limit') ?? '10');

    let filteredLeads = mockLeads.leads;

    if (tenantId) {
      filteredLeads = filteredLeads.filter((l) => l.tenant_id === tenantId);
    }

    if (status) {
      filteredLeads = filteredLeads.filter((l) => l.status === status);
    }

    const offset = 0;
    const paginatedLeads = filteredLeads.slice(offset, offset + limit);

    return HttpResponse.json(
      {
        data: paginatedLeads,
        total: filteredLeads.length,
        limit,
        offset,
      },
      { status: 200 }
    );
  }),

  // Leads API - Create lead
  http.post('/leads', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;

    const newLead = {
      id: `lead-${Date.now()}`,
      tenant_id: body.tenant_id as string,
      name: body.name as string,
      email: body.email as string,
      phone: body.phone as string,
      status: 'new' as const,
      source: body.source as string,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return HttpResponse.json(newLead, { status: 201 });
  }),

  // Leads API - Get single lead
  http.get('/leads/:id', ({ params }) => {
    const lead = mockLeads.leads.find((l) => l.id === params.id);

    if (!lead) {
      return HttpResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json(lead, { status: 200 });
  }),

  // Leads API - Update lead
  http.patch('/leads/:id', async ({ params, request }) => {
    const lead = mockLeads.leads.find((l) => l.id === params.id);

    if (!lead) {
      return HttpResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    const updates = (await request.json()) as Record<string, unknown>;
    const updatedLead = {
      ...lead,
      ...updates,
      id: lead.id,
      created_at: lead.created_at,
      updated_at: new Date().toISOString(),
    };

    return HttpResponse.json(updatedLead, { status: 200 });
  }),

  // Receipts API - Get receipt
  http.get('/receipts/:id', ({ params }) => {
    return HttpResponse.json(
      {
        id: params.id,
        lead_id: 'lead-001',
        type: 'consent',
        timestamp: new Date().toISOString(),
        data: {
          consent_type: 'email_marketing',
          opted_in: true,
          version: '1.0',
        },
      },
      { status: 200 }
    );
  }),

  // Revocation API
  http.post('/revoke', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;

    return HttpResponse.json(
      {
        success: true,
        revoked_id: body.consent_id,
        revoked_at: new Date().toISOString(),
      },
      { status: 200 }
    );
  }),

  // Calendar API - Get iCalendar feed
  http.get('/calendar/:userId/feed.ics', ({ params }) => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Greenput//Calendar Feed//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Greenput Calendar
X-WR-TIMEZONE:UTC
BEGIN:VEVENT
DTSTART:20240310T100000Z
DTEND:20240310T110000Z
DTSTAMP:20240301T100000Z
UID:event-001@greenput.local
CREATED:20240301T100000Z
DESCRIPTION:Lead follow-up call
LAST-MODIFIED:20240301T100000Z
LOCATION:Phone
SEQUENCE:0
STATUS:CONFIRMED
SUMMARY:John Electrician - Lead Follow-up
TRANSP:OPAQUE
END:VEVENT
END:VCALENDAR`;

    return new HttpResponse(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar',
      },
    });
  }),

  // Auth API - Login
  http.post('/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const email = body.email as string;

    const user = mockUsers.users.find((u) => u.email === email);

    if (!user) {
      return HttpResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({ sub: user.id, email: user.email, iat: Math.floor(Date.now() / 1000) }))}.token`;

    return HttpResponse.json(
      {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 200 }
    );
  }),

  // Auth API - Get current user
  http.get('/api/auth/me', () => {
    const user = mockUsers.users[0];

    return HttpResponse.json(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        tenant_id: user.tenant_id,
        role: user.role,
      },
      { status: 200 }
    );
  }),
];
