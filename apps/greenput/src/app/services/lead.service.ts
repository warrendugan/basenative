import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Lead } from '../features/lead-intake/lead-intake';

@Injectable({
  providedIn: 'root',
})
export class LeadService {
  private httpClient = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/leads`;

  leads = signal<Lead[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  loadLeads(): void {
    this.loading.set(true);
    this.error.set(null);

    this.httpClient.get<{ data: Lead[] }>(this.apiUrl).subscribe({
      next: (response) => {
        this.leads.set(response.data);
        this.loading.set(false);
      },
      error: (err) => {
        const errorMessage = err?.error?.error || 'Failed to load leads';
        this.error.set(errorMessage);
        this.loading.set(false);
        console.error('Error loading leads:', err);
      },
    });
  }

  createLead(data: Omit<Lead, 'id' | 'createdAt'>): void {
    this.loading.set(true);
    this.error.set(null);

    this.httpClient.post<Lead>(this.apiUrl, data).subscribe({
      next: (response) => {
        this.leads.update((leads) => [...leads, response]);
        this.loading.set(false);
      },
      error: (err) => {
        const errorMessage = err?.error?.error || 'Failed to create lead';
        this.error.set(errorMessage);
        this.loading.set(false);
        console.error('Error creating lead:', err);
      },
    });
  }

  updateLead(id: number, data: Partial<Omit<Lead, 'id' | 'createdAt'>>): void {
    this.loading.set(true);
    this.error.set(null);

    this.httpClient.patch<Lead>(`${this.apiUrl}/${id}`, data).subscribe({
      next: (response) => {
        this.leads.update((leads) =>
          leads.map((lead) => (lead.id === id ? response : lead))
        );
        this.loading.set(false);
      },
      error: (err) => {
        const errorMessage = err?.error?.error || 'Failed to update lead';
        this.error.set(errorMessage);
        this.loading.set(false);
        console.error('Error updating lead:', err);
      },
    });
  }

  deleteLead(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.httpClient.delete<{ message: string }>(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        this.leads.update((leads) => leads.filter((lead) => lead.id !== id));
        this.loading.set(false);
      },
      error: (err) => {
        const errorMessage = err?.error?.error || 'Failed to delete lead';
        this.error.set(errorMessage);
        this.loading.set(false);
        console.error('Error deleting lead:', err);
      },
    });
  }
}
