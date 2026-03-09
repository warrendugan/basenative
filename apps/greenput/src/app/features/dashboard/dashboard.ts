import { Component, signal, computed } from '@angular/core';

interface SummaryCard {
  label: string;
  value: string | number;
  icon: string;
}

interface ActivityItem {
  id: number;
  description: string;
  timestamp: string;
  type: 'lead' | 'estimate' | 'invoice' | 'team';
}

@Component({
  selector: 'section[dashboard]',
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent {
  // Page model: All strings typed as readonly
  readonly page = {
    title: 'Dashboard',
    subtitle: 'Welcome back! Here\'s your Greenput overview.',
    activity: {
      title: 'Recent Activity',
    },
  } as const;

  // Signal-based state
  totalLeads = signal(47);
  activeProjects = signal(12);
  revenueMtd = signal(28500);
  pendingEstimates = signal(8);

  // Computed cards for display
  summaryCards = computed<SummaryCard[]>(() => [
    {
      label: 'Total Leads',
      value: this.totalLeads(),
      icon: '📋',
    },
    {
      label: 'Active Projects',
      value: this.activeProjects(),
      icon: '⚡',
    },
    {
      label: 'Revenue MTD',
      value: `$${this.revenueMtd().toLocaleString()}`,
      icon: '💰',
    },
    {
      label: 'Pending Estimates',
      value: this.pendingEstimates(),
      icon: '📊',
    },
  ]);

  // Recent activity mock data
  recentActivity = signal<ActivityItem[]>([
    {
      id: 1,
      description: 'New lead from Acme Corp',
      timestamp: '2 hours ago',
      type: 'lead',
    },
    {
      id: 2,
      description: 'Estimate approved for Tesla Charging Install',
      timestamp: '4 hours ago',
      type: 'estimate',
    },
    {
      id: 3,
      description: 'Invoice sent for Panel Upgrade',
      timestamp: '1 day ago',
      type: 'invoice',
    },
    {
      id: 4,
      description: 'New technician added: John Smith',
      timestamp: '2 days ago',
      type: 'team',
    },
  ]);
}
