import {
  Component,
  ElementRef,
  ViewChildren,
  QueryList,
  AfterViewInit,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  IconComponent,
  FeatureLayoutComponent,
  ButtonComponent,
} from '@basenative/ui-glass';

@Component({
  selector: 'section[media-page]',
  standalone: true,
  imports: [
    CommonModule,
    IconComponent,
    FeatureLayoutComponent,
    ButtonComponent,
  ],
  templateUrl: './media.html',
  styleUrl: './media.css',
})
export class MediaPage implements AfterViewInit {
  items = Array.from({ length: 9 }, (_, i) => i + 1);
  shareStatus = signal('');

  @ViewChildren('galleryItem') galleryItems!: QueryList<ElementRef>;

  private platformId = inject(PLATFORM_ID);

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    const options = {
      root: null,
      rootMargin: '-10% 0px -10% 0px', // Shrink the viewport for the effect
      threshold: Array.from({ length: 20 }, (_, i) => i * 0.05), // Granular updates
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const element = entry.target as HTMLElement;
        const ratio = entry.intersectionRatio;
        const y = entry.boundingClientRect.y;
        const windowHeight = window.innerHeight;

        // Calculate position relative to center of viewport
        const centerOffset =
          y + entry.boundingClientRect.height / 2 - windowHeight / 2;
        const normalizedOffset = centerOffset / (windowHeight / 2); // -1 (top) to 1 (bottom)

        if (entry.isIntersecting) {
          element.style.opacity = Math.min(ratio * 2, 1).toString();

          // 3D Parallax Effect
          // Rotate X based on scroll position (tilt up/down)
          const rotateX = normalizedOffset * -20; // Max 20deg tilt
          const scale = 0.8 + ratio * 0.2; // Scale up as it centers

          element.style.transform = `
                        perspective(1000px) 
                        rotateX(${rotateX}deg) 
                        scale(${scale})
                   `;
        }
      });
    }, options);

    this.galleryItems.forEach((item) => {
      observer.observe(item.nativeElement);
    });
  }

  async share() {
    if (!isPlatformBrowser(this.platformId) || !('share' in navigator)) {
      this.shareStatus.set('Web Share API not supported');
      return;
    }

    try {
      await (
        navigator as unknown as { share: (data: unknown) => Promise<void> }
      ).share({
        title: 'BaseNative Showcase',
        text: 'Check out this awesome Glass UI theme!',
        url: window.location.href,
      });
      this.shareStatus.set('Shared successfully!');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      this.shareStatus.set('Share cancelled or failed.');
    }
  }
}
