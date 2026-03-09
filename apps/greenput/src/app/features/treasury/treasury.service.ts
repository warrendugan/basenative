import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Account {
  id: string;
  name: string;
  type: 'Operating' | 'Reserve' | 'Investment' | 'Payroll';
  balance: number;
  yield: number;
  institution: string;
  lastSwept: string;
  status: 'Active' | 'Pending' | 'Paused';
}

export interface SweepRule {
  id: string;
  name: string;
  sourceAccount: string;
  targetAccount: string;
  threshold: number;
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Real-time';
  enabled: boolean;
  lastRun: string;
}

export interface Transaction {
  id: string;
  date: string;
  type: string;
  amount: number;
  source: string;
  destination: string;
  status: string;
}

interface ApiAccount {
  id: string;
  tenant_id: string;
  name: string;
  type: string;
  balance: number;
  yield_apy: number;
  institution: string;
  status: string;
  last_swept: string | null;
  created_at: string;
  updated_at: string;
}

interface ApiSweepRule {
  id: string;
  tenant_id: string;
  source_account_id: string;
  target_account_id: string;
  source_name: string;
  target_name: string;
  threshold: number;
  enabled: number;
  last_run: string | null;
  created_at: string;
  updated_at: string;
}

function capitalizeType(t: string): Account['type'] {
  const map: Record<string, Account['type']> = {
    operating: 'Operating',
    reserve: 'Reserve',
    investment: 'Investment',
    payroll: 'Payroll',
  };
  return map[t.toLowerCase()] ?? 'Operating';
}

function capitalizeStatus(s: string): Account['status'] {
  const map: Record<string, Account['status']> = {
    active: 'Active',
    dormant: 'Paused',
    frozen: 'Paused',
    pending: 'Pending',
  };
  return map[s.toLowerCase()] ?? 'Active';
}

function mapApiAccount(raw: ApiAccount): Account {
  return {
    id: raw.id,
    name: raw.name,
    type: capitalizeType(raw.type),
    balance: raw.balance,
    yield: raw.yield_apy,
    institution: raw.institution,
    lastSwept: raw.last_swept ?? '',
    status: capitalizeStatus(raw.status),
  };
}

function mapApiSweepRule(raw: ApiSweepRule): SweepRule {
  return {
    id: raw.id,
    name: `${raw.source_name} → ${raw.target_name}`,
    sourceAccount: raw.source_account_id,
    targetAccount: raw.target_account_id,
    threshold: raw.threshold,
    frequency: 'Daily',
    enabled: raw.enabled === 1,
    lastRun: raw.last_run ?? '',
  };
}

@Injectable({
  providedIn: 'root',
})
export class TreasuryService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  accounts = signal<Account[]>([]);
  sweepRules = signal<SweepRule[]>([]);
  transactions = signal<Transaction[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  totalBalance = computed(() =>
    this.accounts().reduce((sum, acc) => sum + acc.balance, 0)
  );

  averageYield = computed(() => {
    const accts = this.accounts();
    if (accts.length === 0) return 0;
    const total = this.totalBalance();
    if (total === 0) return 0;
    return accts.reduce((sum, acc) => sum + acc.yield * acc.balance, 0) / total;
  });

  activeSweepCount = computed(() =>
    this.sweepRules().filter((r) => r.enabled).length
  );

  loadAccounts(): void {
    this.loading.set(true);
    this.error.set(null);
    this.http.get<{ data: ApiAccount[] }>(`${this.baseUrl}/treasury`).subscribe({
      next: (res) => {
        this.accounts.set(res.data.map(mapApiAccount));
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.error || 'Failed to load accounts');
        this.loading.set(false);
      },
    });
  }

  loadSweepRules(): void {
    this.http
      .get<{ data: ApiSweepRule[] }>(`${this.baseUrl}/sweep`)
      .subscribe({
        next: (res) => {
          this.sweepRules.set(res.data.map(mapApiSweepRule));
        },
        error: (err) => {
          this.error.set(err?.error?.error || 'Failed to load sweep rules');
        },
      });
  }

  updateAccountBalance(accountId: string, newBalance: number): void {
    this.http
      .patch<{ success: boolean }>(`${this.baseUrl}/treasury/${accountId}`, {
        balance: newBalance,
      })
      .subscribe({
        next: () => {
          this.accounts.update((accts) =>
            accts.map((a) =>
              a.id === accountId ? { ...a, balance: newBalance } : a
            )
          );
        },
        error: (err) => {
          this.error.set(err?.error?.error || 'Failed to update balance');
        },
      });
  }

  toggleSweepRule(ruleId: string): void {
    const rule = this.sweepRules().find((r) => r.id === ruleId);
    if (!rule) return;
    this.http
      .patch<{ success: boolean }>(`${this.baseUrl}/sweep/${ruleId}`, {
        enabled: !rule.enabled,
      })
      .subscribe({
        next: () => {
          this.sweepRules.update((rules) =>
            rules.map((r) =>
              r.id === ruleId ? { ...r, enabled: !r.enabled } : r
            )
          );
        },
        error: (err) => {
          this.error.set(err?.error?.error || 'Failed to toggle rule');
        },
      });
  }
}
