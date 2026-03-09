import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export type DealStage =
  | 'Prospecting'
  | 'LOI Signed'
  | 'Due Diligence'
  | 'Negotiation'
  | 'Closed Won'
  | 'Closed Lost';

export interface Deal {
  id: string;
  companyName: string;
  dealValue: number;
  stage: DealStage;
  assignee: string;
  lastActivity: string;
  targetClose: string;
  notes: string[];
}

interface ApiDeal {
  id: string;
  tenant_id: string;
  name: string;
  company: string;
  stage: DealStage;
  value: number;
  assigned_to: string | null;
  target_close: string | null;
  last_activity: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

function mapApiDeal(raw: ApiDeal): Deal {
  let notes: string[] = [];
  try {
    notes = JSON.parse(raw.notes || '[]');
  } catch {
    notes = [];
  }
  return {
    id: raw.id,
    companyName: raw.company,
    dealValue: raw.value,
    stage: raw.stage,
    assignee: raw.assigned_to ?? '',
    lastActivity: raw.last_activity,
    targetClose: raw.target_close ?? '',
    notes,
  };
}

@Injectable({
  providedIn: 'root',
})
export class DealService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/deals`;

  deals = signal<Deal[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  loadDeals(): void {
    this.loading.set(true);
    this.error.set(null);
    this.http.get<{ data: ApiDeal[] }>(this.apiUrl).subscribe({
      next: (res) => {
        this.deals.set(res.data.map(mapApiDeal));
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.error || 'Failed to load deals');
        this.loading.set(false);
      },
    });
  }

  getDeals() {
    return this.deals();
  }

  getDealById(id: string): Deal | undefined {
    return this.deals().find((deal) => deal.id === id);
  }

  updateDealStage(id: string, newStage: DealStage): void {
    this.http
      .patch<{ success: boolean }>(`${this.apiUrl}/${id}`, { stage: newStage })
      .subscribe({
        next: () => {
          this.deals.update((deals) =>
            deals.map((d) =>
              d.id === id
                ? {
                    ...d,
                    stage: newStage,
                    lastActivity: new Date().toISOString().split('T')[0],
                  }
                : d
            )
          );
        },
        error: (err) => {
          this.error.set(err?.error?.error || 'Failed to update deal');
        },
      });
  }

  addNote(id: string, note: string): void {
    const deal = this.deals().find((d) => d.id === id);
    if (!deal) return;
    const updatedNotes = [...deal.notes, note];
    this.http
      .patch<{ success: boolean }>(`${this.apiUrl}/${id}`, {
        notes: JSON.stringify(updatedNotes),
      })
      .subscribe({
        next: () => {
          this.deals.update((deals) =>
            deals.map((d) =>
              d.id === id
                ? {
                    ...d,
                    notes: updatedNotes,
                    lastActivity: new Date().toISOString().split('T')[0],
                  }
                : d
            )
          );
        },
        error: (err) => {
          this.error.set(err?.error?.error || 'Failed to add note');
        },
      });
  }
}
