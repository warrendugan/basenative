-- Migration: 0001_initial_schema
-- Date: 2026-03-08
-- Description: Full schema for the Labor Abstraction Ecosystem (multi-tenant)

-- =========================================================================
-- USERS
-- =========================================================================
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL DEFAULT 'greenput',
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'technician'
    CHECK(role IN ('admin', 'manager', 'technician', 'sales')),
  password_hash TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);

-- =========================================================================
-- LEADS
-- =========================================================================
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL DEFAULT 'greenput',
  receipt_id TEXT,
  status TEXT NOT NULL DEFAULT 'new'
    CHECK(status IN ('new', 'contacted', 'qualified', 'proposal', 'won', 'lost')),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  service_type TEXT
    CHECK(service_type IN ('panel-upgrade', 'ev-charger', 'solar', 'battery-storage', 'whole-home-rewire', 'other')),
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  notes TEXT,
  source TEXT DEFAULT 'website',
  assigned_to TEXT,
  estimated_value REAL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_leads_tenant ON leads(tenant_id);
CREATE INDEX idx_leads_status ON leads(tenant_id, status);
CREATE INDEX idx_leads_assigned ON leads(tenant_id, assigned_to);

-- =========================================================================
-- CONSENT RECEIPTS
-- =========================================================================
CREATE TABLE IF NOT EXISTS receipts (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL DEFAULT 'greenput',
  lead_id TEXT REFERENCES leads(id),
  purposes TEXT NOT NULL,
  policy_version TEXT NOT NULL DEFAULT '1.0.0',
  hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'granted'
    CHECK(status IN ('granted', 'revoked')),
  user_agent TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_receipts_lead ON receipts(lead_id);

-- =========================================================================
-- REVOCATIONS
-- =========================================================================
CREATE TABLE IF NOT EXISTS revocations (
  id TEXT PRIMARY KEY,
  receipt_id TEXT NOT NULL REFERENCES receipts(id),
  tenant_id TEXT NOT NULL DEFAULT 'greenput',
  reason TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- =========================================================================
-- EVENTS (Calendar / Scheduling)
-- =========================================================================
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL DEFAULT 'greenput',
  user_id TEXT NOT NULL,
  lead_id TEXT REFERENCES leads(id),
  title TEXT NOT NULL,
  description TEXT,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  event_type TEXT DEFAULT 'appointment'
    CHECK(event_type IN ('appointment', 'follow-up', 'site-visit', 'install', 'inspection')),
  url TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_events_user ON events(tenant_id, user_id);
CREATE INDEX idx_events_lead ON events(lead_id);

-- =========================================================================
-- SEED DATA
-- =========================================================================
INSERT OR IGNORE INTO users (id, tenant_id, email, display_name, role, is_active)
VALUES ('usr_001', 'greenput', 'warren@greenput.com', 'Warren', 'admin', 1);
