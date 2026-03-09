/**
 * Mock User Data Fixtures
 * Sample user accounts for testing authentication and authorization flows.
 *
 * These fixtures are used by MSW handlers to provide mock user data
 * for login, session, and user profile endpoints.
 */

export interface User {
  id: string;
  email: string;
  name: string;
  tenant_id: string;
  role: 'admin' | 'manager' | 'operator' | 'viewer';
}

export const mockUsers = {
  users: [
    {
      id: 'user-001',
      email: 'admin@acme-corp.com',
      name: 'Alice Adams',
      tenant_id: 'acme-corp',
      role: 'admin' as const,
    },
    {
      id: 'user-002',
      email: 'manager@acme-corp.com',
      name: 'Bob Manager',
      tenant_id: 'acme-corp',
      role: 'manager' as const,
    },
    {
      id: 'user-003',
      email: 'operator@acme-corp.com',
      name: 'Charlie Operator',
      tenant_id: 'acme-corp',
      role: 'operator' as const,
    },
    {
      id: 'user-004',
      email: 'viewer@acme-corp.com',
      name: 'Diana Viewer',
      tenant_id: 'acme-corp',
      role: 'viewer' as const,
    },
  ] as User[],
};
