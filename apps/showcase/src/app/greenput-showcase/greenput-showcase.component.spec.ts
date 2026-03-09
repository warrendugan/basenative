import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { ThemeService } from '@basenative/tokens';
import { signal } from '@angular/core';
import { GreenputShowcaseComponent } from './greenput-showcase.component';

describe('GreenputShowcaseComponent', () => {
  let component: GreenputShowcaseComponent;
  let fixture: ComponentFixture<GreenputShowcaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GreenputShowcaseComponent, FormsModule],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        {
          provide: ThemeService,
          useValue: {
            mode: signal('system'),
            isDark: signal(false),
            lowPowerMode: signal(false),
            setMode: jest.fn(),
            toggleMode: jest.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GreenputShowcaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the lead intake header', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain(
      "Sparky's Electric",
    );
  });

  it('should show lead form initially', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('form')).toBeTruthy();
    expect(compiled.querySelector('input[name="email"]')).toBeTruthy();
  });

  it('should NOT show legacy consent banner', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('greenput-disclosure')).toBeFalsy();
  });
});
