-- Migration: 0002_deals_treasury_documents
-- Description: Add deals, documents, treasury_accounts, sweep_rules tables

-- =========================================================================
-- DEALS (M&A Pipeline)
-- =========================================================================
CREATE TABLE IF NOT EXISTS deals (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL DEFAULT 'greenput',
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  stage TEXT NOT NULL DEFAULT 'Prospecting'
    CHECK(stage IN ('Prospecting', 'LOI Signed', 'Due Diligence', 'Negotiation', 'Closed Won', 'Closed Lost')),
  value REAL NOT NULL DEFAULT 0,
  target_close TEXT,
  assigned_to TEXT,
  notes TEXT DEFAULT '[]',
  last_activity TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_deals_tenant ON deals(tenant_id);
CREATE INDEX idx_deals_stage ON deals(tenant_id, stage);

-- =========================================================================
-- DOCUMENTS (M&A Document Vault)
-- =========================================================================
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL DEFAULT 'greenput',
  deal_id TEXT REFERENCES deals(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL
    CHECK(type IN ('LOI', 'NDA', 'Financial Statement', 'Due Diligence Report', 'Purchase Agreement', 'Other')),
  status TEXT NOT NULL DEFAULT 'Draft'
    CHECK(status IN ('Draft', 'Under Review', 'Approved', 'Executed')),
  uploaded_by TEXT NOT NULL,
  size TEXT,
  url TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_documents_tenant ON documents(tenant_id);
CREATE INDEX idx_documents_deal ON documents(deal_id);
CREATE INDEX idx_documents_type ON documents(tenant_id, type);

-- =========================================================================
-- TREASURY ACCOUNTS
-- =========================================================================
CREATE TABLE IF NOT EXISTS treasury_accounts (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL DEFAULT 'greenput',
  name TEXT NOT NULL,
  type TEXT NOT NULL
    CHECK(type IN ('operating', 'reserve', 'investment', 'payroll')),
  balance REAL NOT NULL DEFAULT 0,
  yield_apy REAL NOT NULL DEFAULT 0,
  institution TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK(status IN ('active', 'dormant', 'frozen')),
  last_swept TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_treasury_tenant ON treasury_accounts(tenant_id);

-- =========================================================================
-- SWEEP RULES
-- =========================================================================
CREATE TABLE IF NOT EXISTS sweep_rules (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL DEFAULT 'greenput',
  source_account_id TEXT NOT NULL REFERENCES treasury_accounts(id),
  target_account_id TEXT NOT NULL REFERENCES treasury_accounts(id),
  threshold REAL NOT NULL DEFAULT 0,
  enabled INTEGER NOT NULL DEFAULT 1,
  last_run TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_sweep_tenant ON sweep_rules(tenant_id);

-- =========================================================================
-- SEED DATA
-- =========================================================================
INSERT OR IGNORE INTO deals (id, tenant_id, name, company, stage, value, target_close)
VALUES
  ('deal_001', 'greenput', 'Acme Corp Acquisition', 'Acme Corporation', 'Due Diligence', 12500000, '2026-06-15'),
  ('deal_002', 'greenput', 'Widget Inc Merger', 'Widget Industries', 'LOI Signed', 8750000, '2026-08-01'),
  ('deal_003', 'greenput', 'TechStart Buyout', 'TechStart LLC', 'Prospecting', 3200000, '2026-09-30');

INSERT OR IGNORE INTO treasury_accounts (id, tenant_id, name, type, balance, yield_apy, institution, status)
VALUES
  ('acct_001', 'greenput', 'Primary Operating', 'operating', 2450000, 0.5, 'Chase', 'active'),
  ('acct_002', 'greenput', 'Reserve Fund', 'reserve', 5800000, 4.2, 'Treasury Direct', 'active'),
  ('acct_003', 'greenput', 'Growth Investment', 'investment', 1200000, 7.8, 'Vanguard', 'active'),
  ('acct_004', 'greenput', 'Payroll Account', 'payroll', 340000, 0.1, 'Chase', 'active');

INSERT OR IGNORE INTO sweep_rules (id, tenant_id, source_account_id, target_account_id, threshold, enabled)
VALUES
  ('sweep_001', 'greenput', 'acct_001', 'acct_002', 500000, 1),
  ('sweep_002', 'greenput', 'acct_001', 'acct_003', 1000000, 1);

INSERT OR IGNORE INTO documents (id, tenant_id, deal_id, name, type, status, uploaded_by, size)
VALUES
  ('doc_001', 'greenput', 'deal_001', 'Acme Corp LOI.pdf', 'LOI', 'Executed', 'Warren', '2.4 MB'),
  ('doc_002', 'greenput', 'deal_001', 'Acme Corp NDA.pdf', 'NDA', 'Executed', 'Warren', '1.1 MB'),
  ('doc_003', 'greenput', 'deal_001', 'Acme Financial Statements Q4.xlsx', 'Financial Statement', 'Under Review', 'Warren', '4.8 MB'),
  ('doc_004', 'greenput', 'deal_002', 'Widget Industries NDA.pdf', 'NDA', 'Approved', 'Warren', '980 KB');
