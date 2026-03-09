/**
 * Greenput UI Consumer Pact Test
 *
 * This test file defines the contract between the greenput-ui consumer
 * and the greenput-api provider. Each interaction describes:
 * - The HTTP request (method, path, body, headers)
 * - The expected HTTP response (status, body, headers)
 *
 * These contracts are published to the Pact Broker and verified by the
 * provider (greenput-api) to ensure no breaking changes are introduced.
 *
 * Run: nx test tools-pact
 * Publish: nx run tools-pact:publish
 */

import { PactV4 } from '@pact-foundation/pact';
import { PACT_CONFIG } from './pact-config';

const pact = new PactV4({
  consumer: PACT_CONFIG.consumer.greenput.name,
  provider: PACT_CONFIG.provider.name,
  dir: './pacts',
});

describe('Greenput API Consumer Contract', () => {
  describe('Leads API', () => {
    describe('GET /leads', () => {
      it('should return a list of leads', async () => {
        await pact
          .addInteraction()
          .given('leads exist')
          .uponReceiving('a request to list all leads')
          .withRequest('GET', '/leads', (request) => {
            request
              .query({
                tenant_id: 'acme-corp',
                status: 'new',
                limit: '10',
              })
              .header('Authorization', 'Bearer token-123');
          })
          .willRespondWith(200, (response) => {
            response
              .header('Content-Type', 'application/json')
              .jsonBody({
                data: [
                  {
                    id: 'lead-001',
                    tenant_id: 'acme-corp',
                    name: 'John Electrician',
                    email: 'john@example.com',
                    phone: '+1-555-0100',
                    status: 'new',
                    source: 'referral',
                    created_at: '2024-03-01T10:00:00Z',
                    updated_at: '2024-03-01T10:00:00Z',
                  },
                ],
                total: 1,
                limit: 10,
                offset: 0,
              });
          });

        // Execute test with actual HTTP client
        const response = await fetch(
          `${PACT_CONFIG.provider.url}/leads?tenant_id=acme-corp&status=new&limit=10`,
          {
            headers: {
              Authorization: 'Bearer token-123',
            },
          }
        );

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.data).toHaveLength(1);
        expect(body.data[0].id).toBe('lead-001');
      });
    });

    describe('POST /leads', () => {
      it('should create a new lead', async () => {
        await pact
          .addInteraction()
          .given('a tenant exists')
          .uponReceiving('a request to create a lead')
          .withRequest('POST', '/leads', (request) => {
            request
              .header('Authorization', 'Bearer token-123')
              .header('Content-Type', 'application/json')
              .jsonBody({
                tenant_id: 'acme-corp',
                name: 'Jane Contractor',
                email: 'jane@example.com',
                phone: '+1-555-0101',
                source: 'web',
              });
          })
          .willRespondWith(201, (response) => {
            response
              .header('Content-Type', 'application/json')
              .jsonBody({
                id: 'lead-002',
                tenant_id: 'acme-corp',
                name: 'Jane Contractor',
                email: 'jane@example.com',
                phone: '+1-555-0101',
                status: 'new',
                source: 'web',
                created_at: '2024-03-01T10:30:00Z',
                updated_at: '2024-03-01T10:30:00Z',
              });
          });

        const response = await fetch(`${PACT_CONFIG.provider.url}/leads`, {
          method: 'POST',
          headers: {
            Authorization: 'Bearer token-123',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tenant_id: 'acme-corp',
            name: 'Jane Contractor',
            email: 'jane@example.com',
            phone: '+1-555-0101',
            source: 'web',
          }),
        });

        expect(response.status).toBe(201);
        const body = await response.json();
        expect(body.id).toBe('lead-002');
        expect(body.status).toBe('new');
      });
    });

    describe('GET /leads/:id', () => {
      it('should return a single lead by id', async () => {
        await pact
          .addInteraction()
          .given('lead with id "lead-001" exists')
          .uponReceiving('a request to get a specific lead')
          .withRequest('GET', '/leads/lead-001', (request) => {
            request.header('Authorization', 'Bearer token-123');
          })
          .willRespondWith(200, (response) => {
            response
              .header('Content-Type', 'application/json')
              .jsonBody({
                id: 'lead-001',
                tenant_id: 'acme-corp',
                name: 'John Electrician',
                email: 'john@example.com',
                phone: '+1-555-0100',
                status: 'new',
                source: 'referral',
                created_at: '2024-03-01T10:00:00Z',
                updated_at: '2024-03-01T10:00:00Z',
              });
          });

        const response = await fetch(
          `${PACT_CONFIG.provider.url}/leads/lead-001`,
          {
            headers: {
              Authorization: 'Bearer token-123',
            },
          }
        );

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.id).toBe('lead-001');
      });
    });

    describe('PATCH /leads/:id', () => {
      it('should update a lead', async () => {
        await pact
          .addInteraction()
          .given('lead with id "lead-001" exists')
          .uponReceiving('a request to update a lead')
          .withRequest('PATCH', '/leads/lead-001', (request) => {
            request
              .header('Authorization', 'Bearer token-123')
              .header('Content-Type', 'application/json')
              .jsonBody({
                status: 'qualified',
              });
          })
          .willRespondWith(200, (response) => {
            response
              .header('Content-Type', 'application/json')
              .jsonBody({
                id: 'lead-001',
                tenant_id: 'acme-corp',
                name: 'John Electrician',
                email: 'john@example.com',
                phone: '+1-555-0100',
                status: 'qualified',
                source: 'referral',
                created_at: '2024-03-01T10:00:00Z',
                updated_at: '2024-03-01T10:15:00Z',
              });
          });

        const response = await fetch(
          `${PACT_CONFIG.provider.url}/leads/lead-001`,
          {
            method: 'PATCH',
            headers: {
              Authorization: 'Bearer token-123',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              status: 'qualified',
            }),
          }
        );

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.status).toBe('qualified');
      });
    });
  });

  describe('Auth API', () => {
    describe('POST /api/auth/login', () => {
      it('should return a JWT token', async () => {
        await pact
          .addInteraction()
          .given('a user with email exists')
          .uponReceiving('a request to login')
          .withRequest('POST', '/api/auth/login', (request) => {
            request
              .header('Content-Type', 'application/json')
              .jsonBody({
                email: 'user@example.com',
                password: 'password123',
              });
          })
          .willRespondWith(200, (response) => {
            response
              .header('Content-Type', 'application/json')
              .jsonBody({
                token:
                  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsImlhdCI6MTcwOTI4MDAwMH0.token',
                user: {
                  id: 'user-123',
                  email: 'user@example.com',
                  name: 'Test User',
                },
              });
          });

        const response = await fetch(`${PACT_CONFIG.provider.url}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'user@example.com',
            password: 'password123',
          }),
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.token).toBeDefined();
        expect(body.user.id).toBe('user-123');
      });
    });

    describe('GET /api/auth/me', () => {
      it('should return the authenticated user', async () => {
        await pact
          .addInteraction()
          .given('user is authenticated')
          .uponReceiving('a request to get the current user')
          .withRequest('GET', '/api/auth/me', (request) => {
            request.header('Authorization', 'Bearer valid-token');
          })
          .willRespondWith(200, (response) => {
            response
              .header('Content-Type', 'application/json')
              .jsonBody({
                id: 'user-123',
                email: 'user@example.com',
                name: 'Test User',
                tenant_id: 'acme-corp',
                role: 'admin',
              });
          });

        const response = await fetch(`${PACT_CONFIG.provider.url}/api/auth/me`, {
          headers: {
            Authorization: 'Bearer valid-token',
          },
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.email).toBe('user@example.com');
      });
    });
  });

  describe('Health Check', () => {
    describe('GET /health', () => {
      it('should return ok status', async () => {
        await pact
          .addInteraction()
          .uponReceiving('a request to the health endpoint')
          .withRequest('GET', '/health')
          .willRespondWith(200, (response) => {
            response
              .header('Content-Type', 'application/json')
              .jsonBody({
                status: 'ok',
                timestamp: '2024-03-01T10:00:00Z',
              });
          });

        const response = await fetch(`${PACT_CONFIG.provider.url}/health`);

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.status).toBe('ok');
      });
    });
  });
});
