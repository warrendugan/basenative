import { Router, Response } from 'express';
import { ExtendedRequest } from '../types';

const router = Router();

interface TreasuryAccount {
  id: string;
  accountNumber: string;
  accountName: string;
  accountType: 'checking' | 'savings' | 'money-market' | 'sweep';
  balance: number;
  currency: string;
  apy: number;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

interface Transaction {
  id: string;
  accountId: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'interest' | 'fee';
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  tenantId: string;
  createdAt: string;
}

interface SweepRule {
  id: string;
  accountId: string;
  enabled: boolean;
  sweepDirection: 'in' | 'out';
  minBalance: number;
  maxBalance: number;
  targetAccountId: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  lastExecuted?: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

// Mock data store per tenant
const accountsStore: Record<string, TreasuryAccount[]> = {
  greenput: [
    {
      id: 'acc-1',
      accountNumber: '***-***-4567',
      accountName: 'Primary Operating Account',
      accountType: 'checking',
      balance: 1250000,
      currency: 'USD',
      apy: 4.5,
      tenantId: 'greenput',
      createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'acc-2',
      accountNumber: '***-***-8901',
      accountName: 'High Yield Savings',
      accountType: 'savings',
      balance: 3500000,
      currency: 'USD',
      apy: 5.2,
      tenantId: 'greenput',
      createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'acc-3',
      accountNumber: '***-***-2345',
      accountName: 'Money Market Account',
      accountType: 'money-market',
      balance: 2750000,
      currency: 'USD',
      apy: 4.85,
      tenantId: 'greenput',
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
};

const transactionsStore: Record<string, Transaction[]> = {
  greenput: [
    {
      id: 'txn-1',
      accountId: 'acc-1',
      type: 'deposit',
      amount: 500000,
      description: 'Customer deposits',
      status: 'completed',
      tenantId: 'greenput',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'txn-2',
      accountId: 'acc-1',
      type: 'transfer',
      amount: 250000,
      description: 'Sweep to high yield savings',
      status: 'completed',
      tenantId: 'greenput',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'txn-3',
      accountId: 'acc-2',
      type: 'interest',
      amount: 15234,
      description: 'Monthly interest accrual',
      status: 'completed',
      tenantId: 'greenput',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'txn-4',
      accountId: 'acc-1',
      type: 'withdrawal',
      amount: 100000,
      description: 'Payroll processing',
      status: 'pending',
      tenantId: 'greenput',
      createdAt: new Date().toISOString(),
    },
  ],
};

const sweepRulesStore: Record<string, SweepRule[]> = {
  greenput: [
    {
      id: 'sweep-1',
      accountId: 'acc-1',
      enabled: true,
      sweepDirection: 'out',
      minBalance: 1000000,
      maxBalance: 2000000,
      targetAccountId: 'acc-2',
      frequency: 'daily',
      lastExecuted: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      tenantId: 'greenput',
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'sweep-2',
      accountId: 'acc-2',
      enabled: true,
      sweepDirection: 'in',
      minBalance: 2500000,
      maxBalance: 4000000,
      targetAccountId: 'acc-3',
      frequency: 'weekly',
      lastExecuted: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      tenantId: 'greenput',
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
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

// GET /api/treasury/accounts - list accounts
router.get('/accounts', requireAuth, (req: ExtendedRequest, res: Response) => {
  const tenantId = req.tenant?.id || 'greenput';
  const accounts = accountsStore[tenantId] || [];

  res.json({
    data: accounts,
    total: accounts.length,
    tenantId,
  });
});

// GET /api/treasury/accounts/:id - get account
router.get('/accounts/:id', requireAuth, (req: ExtendedRequest, res: Response) => {
  const tenantId = req.tenant?.id || 'greenput';
  const accountId = req.params['id'];

  const accounts = accountsStore[tenantId] || [];
  const account = accounts.find((a) => a.id === accountId && a.tenantId === tenantId);

  if (!account) {
    res.status(404).json({ error: 'Account not found' });
    return;
  }

  res.json(account);
});

// GET /api/treasury/transactions - list transactions
router.get('/transactions', requireAuth, (req: ExtendedRequest, res: Response) => {
  const tenantId = req.tenant?.id || 'greenput';
  let transactions = transactionsStore[tenantId] || [];

  // Optional account filter
  const accountId = req.query['accountId'] as string | undefined;
  if (accountId) {
    transactions = transactions.filter((t) => t.accountId === accountId);
  }

  res.json({
    data: transactions,
    total: transactions.length,
    tenantId,
  });
});

// GET /api/treasury/sweep-rules - list sweep rules
router.get('/sweep-rules', requireAuth, (req: ExtendedRequest, res: Response) => {
  const tenantId = req.tenant?.id || 'greenput';
  const rules = sweepRulesStore[tenantId] || [];

  res.json({
    data: rules,
    total: rules.length,
    tenantId,
  });
});

// PATCH /api/treasury/sweep-rules/:id - toggle/update sweep rule
router.patch('/sweep-rules/:id', requireAuth, (req: ExtendedRequest, res: Response) => {
  const tenantId = req.tenant?.id || 'greenput';
  const ruleId = req.params['id'];
  const { enabled, minBalance, maxBalance, frequency } = req.body;

  const rules = sweepRulesStore[tenantId] || [];
  const ruleIndex = rules.findIndex((r) => r.id === ruleId && r.tenantId === tenantId);

  if (ruleIndex === -1) {
    res.status(404).json({ error: 'Sweep rule not found' });
    return;
  }

  const rule = rules[ruleIndex];

  if (enabled !== undefined) {
    rule.enabled = enabled;
  }
  if (minBalance !== undefined) {
    rule.minBalance = minBalance;
  }
  if (maxBalance !== undefined) {
    rule.maxBalance = maxBalance;
  }
  if (frequency !== undefined) {
    const validFrequencies = ['daily', 'weekly', 'monthly'];
    if (!validFrequencies.includes(frequency)) {
      res.status(400).json({ error: 'Invalid frequency' });
      return;
    }
    rule.frequency = frequency;
  }
  rule.updatedAt = new Date().toISOString();

  res.json(rule);
});

// GET /api/treasury/summary - aggregated treasury dashboard data
router.get('/summary', requireAuth, (req: ExtendedRequest, res: Response) => {
  const tenantId = req.tenant?.id || 'greenput';
  const accounts = accountsStore[tenantId] || [];
  const transactions = transactionsStore[tenantId] || [];
  const rules = sweepRulesStore[tenantId] || [];

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalYield = accounts.reduce((sum, acc) => sum + (acc.balance * acc.apy) / 100, 0);
  const recentTransactions = transactions.slice(-5);
  const activeRules = rules.filter((r) => r.enabled).length;

  // Calculate 30-day activity
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const recentActivity = transactions.filter((t) => new Date(t.createdAt).getTime() > thirtyDaysAgo);

  res.json({
    summary: {
      totalBalance,
      totalYield: Math.round(totalYield),
      accountCount: accounts.length,
      activeRulesCount: activeRules,
      transactionCount: transactions.length,
      thirtyDayActivityCount: recentActivity.length,
    },
    accounts,
    recentTransactions,
    rules,
    tenantId,
  });
});

export default router;
