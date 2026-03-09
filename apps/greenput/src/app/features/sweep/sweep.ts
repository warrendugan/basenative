import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreasuryService } from '../treasury/treasury.service';

@Component({
  selector: 'section[yp-sweep]',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sweep.html',
  styleUrl: './sweep.css',
})
export class SweepComponent implements OnInit {
  treasuryService = inject(TreasuryService);

  ngOnInit(): void {
    this.treasuryService.loadSweepRules();
  }

  readonly page = {
    title: 'Sweep Configuration',
    subtitle: 'Configure automated yield sweep parameters and thresholds',
    labels: {
      source: 'Source Account',
      target: 'Target Account',
      threshold: 'Sweep Threshold',
      thresholdDesc: 'Minimum balance to trigger sweep',
      lastRun: 'Last Run',
      sourceLabel: 'Operating Account',
      targetLabel: 'Reserve / Investment Pool',
      ruleId: 'Rule ID',
    },
    stats: {
      total: 'Total Rules',
      enabled: 'Enabled Rules',
      disabled: 'Disabled Rules',
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
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  isRecent(dateString: string): boolean {
    const date = new Date(dateString);
    const now = new Date();
    const daysDiff = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff < 1;
  }

  getRunStatus(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const hoursDiff = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (hoursDiff < 1) {
      return 'Just now';
    } else if (hoursDiff < 24) {
      return `${Math.floor(hoursDiff)}h ago`;
    } else {
      const daysDiff = Math.floor(hoursDiff / 24);
      return `${daysDiff}d ago`;
    }
  }
}
