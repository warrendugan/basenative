import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentService, Document } from './document.service';

export type DocumentType =
  | 'LOI'
  | 'NDA'
  | 'Financial Statement'
  | 'Due Diligence Report'
  | 'Purchase Agreement'
  | 'Other';

export type DocumentStatus = 'Draft' | 'Under Review' | 'Approved' | 'Executed';

@Component({
  selector: 'section[pb-documents]',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './documents.html',
  styleUrl: './documents.css',
})
export class DocumentsComponent implements OnInit {
  private documentService = inject(DocumentService);

  readonly page = {
    title: 'Document Vault',
    subtitle: 'M&A transaction documents and agreements',
    filters: {
      typeLabel: 'Filter by Type',
      statusLabel: 'Filter by Status',
      allTypes: 'All Types',
      allStatuses: 'All Statuses',
    },
    columns: {
      name: 'Document Name',
      type: 'Type',
      status: 'Status',
      uploadedBy: 'Uploaded By',
      date: 'Upload Date',
      size: 'Size',
    },
    empty: {
      title: 'No Documents Found',
      message: 'Try adjusting your filters or upload new documents.',
    },
    types: [
      'LOI',
      'NDA',
      'Financial Statement',
      'Due Diligence Report',
      'Purchase Agreement',
      'Other',
    ] as const,
    statuses: ['Draft', 'Under Review', 'Approved', 'Executed'] as const,
  } as const;

  documents = this.documentService.documents;
  selectedType = signal<string>('');
  selectedStatus = signal<string>('');

  ngOnInit(): void {
    this.documentService.loadDocuments();
  }

  filteredDocuments = computed(() => {
    let filtered = this.documents();

    if (this.selectedType()) {
      filtered = filtered.filter((doc) => doc.type === this.selectedType());
    }

    if (this.selectedStatus()) {
      filtered = filtered.filter((doc) => doc.status === this.selectedStatus());
    }

    return filtered;
  });

  getDocIcon(type: string): string {
    const icons: Record<string, string> = {
      'LOI': '📝',
      'NDA': '🔒',
      'Financial Statement': '💹',
      'Due Diligence Report': '🔍',
      'Purchase Agreement': '✍️',
      'Other': '📄',
    };
    return icons[type] ?? '📄';
  }
}

