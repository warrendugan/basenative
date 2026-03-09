import { Router, Response } from 'express';
import { ExtendedRequest } from '../types';

const router = Router();

interface Deal {
  id: string;
  title: string;
  description?: string;
  stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  value: number;
  currency: string;
  clientName: string;
  contactEmail: string;
  notes?: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

// Mock data store per tenant
const dealsStore: Record<string, Deal[]> = {
  greenput: [
    {
      id: 'deal-1',
      title: 'Enterprise Software License',
      description: 'Annual software license renewal for enterprise customer',
      stage: 'proposal',
      value: 45000,
      currency: 'USD',
      clientName: 'Acme Corporation',
      contactEmail: 'procurement@acme.com',
      notes: 'Waiting for budget approval from finance department',
      tenantId: 'greenput',
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: 'user-1',
    },
    {
      id: 'deal-2',
      title: 'Consulting Services Contract',
      description: 'Six-month consulting engagement for digital transformation',
      stage: 'negotiation',
      value: 125000,
      currency: 'USD',
      clientName: 'TechVision Inc',
      contactEmail: 'cto@techvision.com',
      notes: 'Reviewing final contract terms, timeline adjusted to Q2',
      tenantId: 'greenput',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'user-1',
    },
    {
      id: 'deal-3',
      title: 'Cloud Infrastructure Migration',
      description: 'Move legacy systems to cloud platform',
      stage: 'qualification',
      value: 250000,
      currency: 'USD',
      clientName: 'Global Financial Services',
      contactEmail: 'operations@globalfinance.com',
      notes: 'Initial discovery call scheduled for next week',
      tenantId: 'greenput',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'user-1',
    },
    {
      id: 'deal-4',
      title: 'SaaS Platform Subscription',
      description: 'Annual subscription with custom integrations',
      stage: 'closed-won',
      value: 75000,
      currency: 'USD',
      clientName: 'Innovate Labs',
      contactEmail: 'admin@innovatelabs.com',
      notes: 'Onboarding scheduled for March 15th',
      tenantId: 'greenput',
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: 'user-1',
    },
  ],
};

// Middleware to require authentication
function requireAuth(req: ExtendedRequest, res: Response, next: Function): void {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
}

// GET /api/deals - list deals with optional stage filter
router.get('/', requireAuth, (req: ExtendedRequest, res: Response) => {
  const tenantId = req.tenant?.id || 'greenput';
  let deals = dealsStore[tenantId] || [];

  // Apply stage filter if provided
  const stageFilter = req.query['stage'] as string | undefined;
  if (stageFilter) {
    deals = deals.filter((d) => d.stage === stageFilter);
  }

  res.json({
    data: deals,
    total: deals.length,
    tenantId,
  });
});

// GET /api/deals/:id - get deal by id
router.get('/:id', requireAuth, (req: ExtendedRequest, res: Response) => {
  const tenantId = req.tenant?.id || 'greenput';
  const dealId = req.params['id'];

  const deals = dealsStore[tenantId] || [];
  const deal = deals.find((d) => d.id === dealId && d.tenantId === tenantId);

  if (!deal) {
    res.status(404).json({ error: 'Deal not found' });
    return;
  }

  res.json(deal);
});

// POST /api/deals - create deal
router.post('/', requireAuth, (req: ExtendedRequest, res: Response) => {
  const tenantId = req.tenant?.id || 'greenput';
  const {
    title,
    description,
    stage = 'prospecting',
    value,
    currency = 'USD',
    clientName,
    contactEmail,
    notes,
  } = req.body;

  if (!title || !clientName || !contactEmail || value === undefined) {
    res
      .status(400)
      .json({ error: 'title, clientName, contactEmail, and value are required' });
    return;
  }

  const newDeal: Deal = {
    id: `deal-${Date.now()}`,
    title,
    description,
    stage: stage || 'prospecting',
    value,
    currency,
    clientName,
    contactEmail,
    notes,
    tenantId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: req.user?.sub,
  };

  if (!dealsStore[tenantId]) {
    dealsStore[tenantId] = [];
  }

  dealsStore[tenantId].push(newDeal);

  res.status(201).json(newDeal);
});

// PATCH /api/deals/:id - update deal (stage changes, notes)
router.patch('/:id', requireAuth, (req: ExtendedRequest, res: Response) => {
  const tenantId = req.tenant?.id || 'greenput';
  const dealId = req.params['id'];
  const { stage, notes, description } = req.body;

  const deals = dealsStore[tenantId] || [];
  const dealIndex = deals.findIndex((d) => d.id === dealId && d.tenantId === tenantId);

  if (dealIndex === -1) {
    res.status(404).json({ error: 'Deal not found' });
    return;
  }

  const deal = deals[dealIndex];

  // Validate stage if provided
  const validStages = [
    'prospecting',
    'qualification',
    'proposal',
    'negotiation',
    'closed-won',
    'closed-lost',
  ];
  if (stage && !validStages.includes(stage)) {
    res.status(400).json({ error: 'Invalid stage' });
    return;
  }

  if (stage) {
    deal.stage = stage;
  }
  if (notes !== undefined) {
    deal.notes = notes;
  }
  if (description !== undefined) {
    deal.description = description;
  }
  deal.updatedAt = new Date().toISOString();

  res.json(deal);
});

// DELETE /api/deals/:id - soft delete
router.delete('/:id', requireAuth, (req: ExtendedRequest, res: Response) => {
  const tenantId = req.tenant?.id || 'greenput';
  const dealId = req.params['id'];

  const deals = dealsStore[tenantId] || [];
  const dealIndex = deals.findIndex((d) => d.id === dealId && d.tenantId === tenantId);

  if (dealIndex === -1) {
    res.status(404).json({ error: 'Deal not found' });
    return;
  }

  // Soft delete by removing from array
  const deletedDeal = deals.splice(dealIndex, 1)[0];

  res.json({
    message: 'Deal deleted successfully',
    id: deletedDeal.id,
  });
});

export default router;
