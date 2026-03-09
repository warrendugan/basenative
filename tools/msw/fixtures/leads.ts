/**
 * Mock Lead Data Fixtures
 * Realistic sample leads for electrician/contractor services (Greenput domain).
 *
 * These fixtures are used by MSW handlers to provide consistent
 * mock data in tests and development environments.
 */

export interface Lead {
  id: string;
  tenant_id: string;
  name: string;
  email: string;
  phone: string;
  status: 'new' | 'qualified' | 'contacted' | 'converted' | 'lost';
  source: 'referral' | 'web' | 'phone' | 'instagram' | 'facebook';
  created_at: string;
  updated_at: string;
}

export const mockLeads = {
  leads: [
    {
      id: 'lead-001',
      tenant_id: 'acme-corp',
      name: 'John Martinez',
      email: 'john.martinez@email.com',
      phone: '+1-555-0100',
      status: 'new' as const,
      source: 'referral' as const,
      created_at: '2024-02-28T14:30:00Z',
      updated_at: '2024-02-28T14:30:00Z',
    },
    {
      id: 'lead-002',
      tenant_id: 'acme-corp',
      name: 'Sarah Wilson',
      email: 'sarah.wilson@email.com',
      phone: '+1-555-0101',
      status: 'qualified' as const,
      source: 'web' as const,
      created_at: '2024-02-27T09:15:00Z',
      updated_at: '2024-02-28T10:45:00Z',
    },
    {
      id: 'lead-003',
      tenant_id: 'acme-corp',
      name: 'Michael Chen',
      email: 'michael.chen@email.com',
      phone: '+1-555-0102',
      status: 'contacted' as const,
      source: 'instagram' as const,
      created_at: '2024-02-26T16:20:00Z',
      updated_at: '2024-02-28T11:00:00Z',
    },
    {
      id: 'lead-004',
      tenant_id: 'acme-corp',
      name: 'Emma Thompson',
      email: 'emma.thompson@email.com',
      phone: '+1-555-0103',
      status: 'converted' as const,
      source: 'phone' as const,
      created_at: '2024-02-20T13:45:00Z',
      updated_at: '2024-02-27T15:30:00Z',
    },
    {
      id: 'lead-005',
      tenant_id: 'acme-corp',
      name: 'David Rodriguez',
      email: 'david.rodriguez@email.com',
      phone: '+1-555-0104',
      status: 'lost' as const,
      source: 'facebook' as const,
      created_at: '2024-02-15T08:00:00Z',
      updated_at: '2024-02-25T12:30:00Z',
    },
  ] as Lead[],
};
