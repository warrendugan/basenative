import { Router, Response } from 'express';
import { ExtendedRequest, AuthPayload } from '../types';

const router = Router();

interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

// Mock data store per tenant
const leadsStore: Record<string, Lead[]> = {
  greenput: [
    {
      id: 'lead-1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '555-1234',
      company: 'Acme Corp',
      status: 'qualified',
      tenantId: 'greenput',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'lead-2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      company: 'Tech Startup',
      status: 'new',
      tenantId: 'greenput',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'lead-3',
      name: 'Bob Johnson',
      email: 'bob@example.com',
      phone: '555-5678',
      company: 'Enterprise Inc',
      status: 'contacted',
      tenantId: 'greenput',
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
};

// Middleware to require authentication for leads routes
function requireAuth(req: ExtendedRequest, res: Response, next: Function): void {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
}

router.get('/', requireAuth, (req: ExtendedRequest, res: Response) => {
  const tenantId = req.tenant?.id || 'greenput';
  const leads = leadsStore[tenantId] || [];

  res.json({
    data: leads,
    total: leads.length,
    tenantId,
  });
});

router.post('/', requireAuth, (req: ExtendedRequest, res: Response) => {
  const tenantId = req.tenant?.id || 'greenput';
  const { name, email, phone, company, status = 'new' } = req.body;

  if (!name || !email) {
    res.status(400).json({ error: 'Name and email are required' });
    return;
  }

  const newLead: Lead = {
    id: `lead-${Date.now()}`,
    name,
    email,
    phone,
    company,
    status: status || 'new',
    tenantId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (!leadsStore[tenantId]) {
    leadsStore[tenantId] = [];
  }

  leadsStore[tenantId].push(newLead);

  res.status(201).json(newLead);
});

router.get('/:id', requireAuth, (req: ExtendedRequest, res: Response) => {
  const tenantId = req.tenant?.id || 'greenput';
  const leadId = req.params['id'];

  const leads = leadsStore[tenantId] || [];
  const lead = leads.find((l) => l.id === leadId && l.tenantId === tenantId);

  if (!lead) {
    res.status(404).json({ error: 'Lead not found' });
    return;
  }

  res.json(lead);
});

router.patch('/:id', requireAuth, (req: ExtendedRequest, res: Response) => {
  const tenantId = req.tenant?.id || 'greenput';
  const leadId = req.params['id'];
  const { status } = req.body as { status?: string };

  const leads = leadsStore[tenantId] || [];
  const leadIndex = leads.findIndex((l) => l.id === leadId && l.tenantId === tenantId);

  if (leadIndex === -1) {
    res.status(404).json({ error: 'Lead not found' });
    return;
  }

  const lead = leads[leadIndex];
  if (status && ['new', 'contacted', 'qualified', 'converted', 'lost'].includes(status)) {
    lead.status = status as Lead['status'];
  }
  lead.updatedAt = new Date().toISOString();

  res.json(lead);
});

export default router;
