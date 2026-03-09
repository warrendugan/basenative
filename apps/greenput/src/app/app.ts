import { Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ThemeService } from '@basenative/tokens';
import { ThemeSelectorComponent } from '@basenative/ui-glass';
import { LogoComponent } from '@basenative/ui-glass';

interface NavItem {
  readonly label: string;
  readonly route: string;
}

interface NavSection {
  readonly label: string;
  readonly items: readonly NavItem[];
}

interface PageModel {
  readonly appTitle: string;
  readonly navToggleLabel: string;
  readonly navCloseLabel: string;
  readonly nav: {
    readonly core: NavSection;
    readonly ma: NavSection;
    readonly treasury: NavSection;
    readonly settings: NavSection;
  };
}

@Component({
  selector: 'article[root]',
  standalone: true,
  imports: [RouterModule, ThemeSelectorComponent, LogoComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private themeService = inject(ThemeService);

  isNavOpen = signal(false);

  readonly page: PageModel = {
    appTitle: 'Greenput CRM',
    navToggleLabel: 'Toggle navigation menu',
    navCloseLabel: 'Close navigation menu',
    nav: {
      core: {
        label: 'Core',
        items: [
          { label: 'Dashboard', route: '/dashboard' },
          { label: 'Leads', route: '/leads' },
        ],
      },
      ma: {
        label: 'M&A Pipeline',
        items: [
          { label: 'Deals', route: '/deals' },
          { label: 'Documents', route: '/documents' },
        ],
      },
      treasury: {
        label: 'Treasury',
        items: [
          { label: 'Accounts', route: '/treasury' },
          { label: 'Sweep Config', route: '/sweep' },
        ],
      },
      settings: {
        label: 'Settings',
        items: [{ label: 'Settings', route: '/settings' }],
      },
    },
  };

  toggleNav(): void {
    this.isNavOpen.update((val) => !val);
  }

  closeNav(): void {
    this.isNavOpen.set(false);
  }
}
