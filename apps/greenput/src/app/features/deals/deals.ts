import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DealService, Deal, DealStage } from './deal.service';

@Component({
  selector: 'section[pb-deals]',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './deals.html',
  styleUrl: './deals.css',
})
export class DealsComponent implements OnInit {
  private dealService = inject(DealService);

  ngOnInit(): void {
    this.dealService.loadDeals();
  }

  readonly page = {
    title: 'Deal Pipeline',
    subtitle: 'Kanban view of all M&A transactions',
    actions: {
      nextStage: 'Next Stage',
      addNote: 'Add Note',
      saveNote: 'Save',
    },
    labels: {
      lastActivity: 'Last Activity',
      notes: 'Notes',
      targetClose: 'Target Close',
      notePlaceholder: 'Add a note...',
    },
  } as const;

  deals = this.dealService.deals;
  expandedDealId = signal<string | null>(null);
  activeNoteInput = signal<string | null>(null);
  noteText = signal<string>('');

  stages: DealStage[] = [
    'Prospecting',
    'LOI Signed',
    'Due Diligence',
    'Negotiation',
    'Closed Won',
    'Closed Lost',
  ];

  getDealsInStage(stage: DealStage): Deal[] {
    return this.deals().filter((deal) => deal.stage === stage);
  }

  toggleExpandDeal(dealId: string): void {
    this.expandedDealId.update((current) =>
      current === dealId ? null : dealId
    );
    this.activeNoteInput.set(null);
    this.noteText.set('');
  }

  showNoteInput(dealId: string): void {
    this.activeNoteInput.set(this.activeNoteInput() === dealId ? null : dealId);
    this.noteText.set('');
  }

  addNote(dealId: string): void {
    if (this.noteText().trim()) {
      this.dealService.addNote(dealId, this.noteText());
      this.noteText.set('');
      this.activeNoteInput.set(null);
    }
  }

  advanceDeal(dealId: string, currentStage: DealStage): void {
    const stageIndex = this.stages.indexOf(currentStage);
    if (stageIndex < this.stages.length - 1) {
      const nextStage = this.stages[stageIndex + 1];
      this.dealService.updateDealStage(dealId, nextStage);
    }
  }
}
