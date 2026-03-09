import { Component, computed, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-calendar-subscription',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar-subscription.component.html',
  styleUrls: ['./calendar-subscription.component.css'],
})
export class CalendarSubscriptionComponent {
  feedUrl = input.required<string>();
  copied = signal(false);

  webcalUrl = computed(() => {
    const url = this.feedUrl();
    if (!url) return '';
    return url.replace(/^https?:\/\//, 'webcal://');
  });

  copyLink(): void {
    navigator.clipboard.writeText(this.feedUrl());
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }
}
