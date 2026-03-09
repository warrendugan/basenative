import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreasuryService } from './treasury.service';

@Component({
  selector: 'section[yp-treasury]',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './treasury.html',
  styleUrl: './treasury.css',
})
export class TreasuryComponent implements OnInit {
  treasuryService = inject(TreasuryService);

  ngOnInit(): void {
    this.treasuryService.loadAccounts();
  }

  readonly page = {
    title: 'Treasury Accounts',
    subtitle: 'Monitor idle capital positions across corporate entities',
    sections: {
      active: 'Active Accounts',
    },
    columns: {
      name: 'Account Name',
      type: 'Type',
      balance: 'Balance',
      yield: 'Yield (APY)',
      institution: 'Institution',
      status: 'Status',
      lastSwept: 'Last Swept',
    },
  } as const;

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
