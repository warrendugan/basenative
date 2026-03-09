import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard').then((m) => m.DashboardComponent),
  },
  {
    path: 'leads',
    loadComponent: () =>
      import('./features/lead-intake/lead-intake').then(
        (m) => m.LeadIntakeComponent
      ),
  },
  {
    path: 'leads/new',
    loadComponent: () =>
      import('./features/lead-intake/lead-form').then(
        (m) => m.LeadFormComponent
      ),
  },
  {
    path: 'deals',
    loadComponent: () =>
      import('./features/deals/deals').then((m) => m.DealsComponent),
  },
  {
    path: 'documents',
    loadComponent: () =>
      import('./features/documents/documents').then((m) => m.DocumentsComponent),
  },
  {
    path: 'treasury',
    loadComponent: () =>
      import('./features/treasury/treasury').then((m) => m.TreasuryComponent),
  },
  {
    path: 'sweep',
    loadComponent: () =>
      import('./features/sweep/sweep').then((m) => m.SweepComponent),
  },
  {
    path: '**',
    redirectTo: '/dashboard',
  },
];
