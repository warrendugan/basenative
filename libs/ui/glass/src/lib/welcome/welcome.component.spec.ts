import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WelcomeComponent } from './welcome.component';
import { ThemeService } from '@basenative/tokens';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';

describe('WelcomeComponent', () => {
  let fixture: ComponentFixture<WelcomeComponent>;
  let component: WelcomeComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WelcomeComponent],
      providers: [
        {
          provide: ThemeService,
          useValue: {
            isDark: signal(false),
            mode: signal('system'),
            setMode: jest.fn(),
            toggleMode: jest.fn(),
          },
        },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WelcomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render header with BaseNative title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const title = compiled.querySelector('.title');
    expect(title?.textContent).toContain('BaseNative');
    expect(compiled.querySelector('h1')).toBe(title); // Semantic check
  });

  it('should display the correct version', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const version = compiled.querySelector('.version');
    expect(version?.textContent).toContain('v0.1.0');
  });

  it('should render semantic hero section', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const h2 = compiled.querySelector('main h2');
    expect(h2?.textContent).toContain("Enhance, don't wrap.");
  });

  it('should have accessible links in features grid', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const links = compiled.querySelectorAll('.card');
    expect(links.length).toBe(8);

    const docsLink = Array.from(links).find((l) =>
      l.getAttribute('href')?.includes('/docs'),
    );
    const mediaLink = Array.from(links).find((l) =>
      l.getAttribute('href')?.includes('/media'),
    );
    const statusLink = Array.from(links).find((l) =>
      l.getAttribute('href')?.includes('/status'),
    );

    expect(docsLink?.getAttribute('aria-label')).toBe('Documentation');
    expect(mediaLink?.getAttribute('aria-label')).toBe('Media');
    expect(statusLink?.getAttribute('aria-label')).toBe('System Status');

    expect(docsLink?.querySelector('h3')?.textContent).toContain(
      'Documentation',
    );
  });

  it('should render footer with semantic version tag', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const footer = compiled.querySelector('footer');
    expect(footer?.textContent).toContain('BaseNative');
    expect(footer?.querySelector('.version-tag')?.textContent).toContain(
      'v0.1.0',
    );
  });
});
