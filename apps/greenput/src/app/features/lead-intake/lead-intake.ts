import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardComponent, ListComponent } from '@basenative/layout';
import { ButtonComponent } from '@basenative/ui-glass';

export interface Lead {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  serviceType: 'Panel Upgrade' | 'EV Charger' | 'Solar' | 'Battery Storage' | 'Whole Home Rewire';
  status: 'New' | 'Contacted' | 'Estimated' | 'Won' | 'Lost';
  createdAt: Date;
}

@Component({
  selector: 'section[lead-intake]',
  standalone: true,
  imports: [CommonModule, RouterModule, CardComponent, ListComponent, ButtonComponent],
  templateUrl: './lead-intake.html',
  styleUrl: './lead-intake.css',
})
export class LeadIntakeComponent {
  readonly page = {
    title: 'Lead Management',
    subtitle: 'Track and manage incoming leads',
    columns: {
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      service: 'Service Type',
      status: 'Status',
      created: 'Created',
    },
    actions: {
      newLead: 'New Lead',
    },
    statuses: {
      new: 'New',
      contacted: 'Contacted',
      estimated: 'Estimated',
      won: 'Won',
      lost: 'Lost',
    } as Record<string, string>,
  } as const;

  leads = signal<Lead[]>([
    {
      id: 1,
      firstName: 'John',
      lastName: 'Smith',
      phone: '(555) 123-4567',
      email: 'john.smith@example.com',
      address: '123 Main St, Springfield, IL 62701',
      serviceType: 'Panel Upgrade',
      status: 'New',
      createdAt: new Date('2024-03-05'),
    },
    {
      id: 2,
      firstName: 'Sarah',
      lastName: 'Johnson',
      phone: '(555) 234-5678',
      email: 'sarah.j@example.com',
      address: '456 Oak Ave, Chicago, IL 60601',
      serviceType: 'EV Charger',
      status: 'Contacted',
      createdAt: new Date('2024-03-04'),
    },
    {
      id: 3,
      firstName: 'Mike',
      lastName: 'Chen',
      phone: '(555) 345-6789',
      email: 'mike.chen@example.com',
      address: '789 Pine Rd, Naperville, IL 60540',
      serviceType: 'Solar',
      status: 'Estimated',
      createdAt: new Date('2024-03-01'),
    },
    {
      id: 4,
      firstName: 'Emma',
      lastName: 'Williams',
      phone: '(555) 456-7890',
      email: 'emma.w@example.com',
      address: '321 Elm St, Evanston, IL 60201',
      serviceType: 'Battery Storage',
      status: 'Won',
      createdAt: new Date('2024-02-28'),
    },
    {
      id: 5,
      firstName: 'David',
      lastName: 'Brown',
      phone: '(555) 567-8901',
      email: 'david.b@example.com',
      address: '654 Maple Dr, Schaumburg, IL 60173',
      serviceType: 'Whole Home Rewire',
      status: 'Lost',
      createdAt: new Date('2024-02-25'),
    },
  ]);

  getStatusClass(status: Lead['status']): string {
    const statusMap: Record<Lead['status'], string> = {
      New: 'gp-badge-primary',
      Contacted: 'gp-badge-warning',
      Estimated: 'gp-badge-warning',
      Won: 'gp-badge-success',
      Lost: 'gp-badge-error',
    };
    return statusMap[status] || 'gp-badge-neutral';
  }

  getServiceTypeIcon(serviceType: Lead['serviceType']): string {
    const iconMap: Record<Lead['serviceType'], string> = {
      'Panel Upgrade': '⚡',
      'EV Charger': '🔌',
      Solar: '☀️',
      'Battery Storage': '🔋',
      'Whole Home Rewire': '🏠',
    };
    return iconMap[serviceType] || '📋';
  }
}
