import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Document {
  id: string;
  name: string;
  type: string;
  status: string;
  uploadedBy: string;
  size: string;
  dealId: string | null;
  createdAt: string;
}

interface ApiDocument {
  id: string;
  tenant_id: string;
  deal_id: string | null;
  name: string;
  type: string;
  status: string;
  uploaded_by: string;
  size: string | null;
  url: string | null;
  created_at: string;
  updated_at: string;
}

function mapApiDocument(raw: ApiDocument): Document {
  return {
    id: raw.id,
    name: raw.name,
    type: raw.type,
    status: raw.status,
    uploadedBy: raw.uploaded_by,
    size: raw.size ?? '',
    dealId: raw.deal_id,
    createdAt: raw.created_at,
  };
}

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/documents`;

  documents = signal<Document[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  loadDocuments(filters?: {
    type?: string;
    status?: string;
    dealId?: string;
  }): void {
    this.loading.set(true);
    this.error.set(null);

    let url = this.apiUrl;
    const params: string[] = [];
    if (filters?.type) params.push(`type=${encodeURIComponent(filters.type)}`);
    if (filters?.status)
      params.push(`status=${encodeURIComponent(filters.status)}`);
    if (filters?.dealId)
      params.push(`dealId=${encodeURIComponent(filters.dealId)}`);
    if (params.length) url += `?${params.join('&')}`;

    this.http.get<{ data: ApiDocument[] }>(url).subscribe({
      next: (res) => {
        this.documents.set(res.data.map(mapApiDocument));
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.error || 'Failed to load documents');
        this.loading.set(false);
      },
    });
  }

  updateDocumentStatus(id: string, status: string): void {
    this.http
      .patch<{ success: boolean }>(`${this.apiUrl}/${id}`, { status })
      .subscribe({
        next: () => {
          this.documents.update((docs) =>
            docs.map((d) => (d.id === id ? { ...d, status } : d))
          );
        },
        error: (err) => {
          this.error.set(err?.error?.error || 'Failed to update document');
        },
      });
  }
}
