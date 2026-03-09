import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay, map, of } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root',
})
export class IconService {
  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);

  // Cache for raw SVG strings to avoid re-fetching
  private cache = new Map<string, Observable<SafeHtml>>();
  private platformId = inject(PLATFORM_ID);

  getIcon(name: string): Observable<SafeHtml> {
    if (!isPlatformBrowser(this.platformId)) {
      return of(this.sanitizer.bypassSecurityTrustHtml(''));
    }

    const cached = this.cache.get(name);
    if (cached) {
      return cached;
    }

    const request$ = this.http
      .get(`assets/icons/${name}.svg`, { responseType: 'text' })
      .pipe(
        map((svg) => this.sanitizer.bypassSecurityTrustHtml(svg)),
        shareReplay(1),
      );

    this.cache.set(name, request$);
    return request$;
  }

  preload(names: string[]) {
    names.forEach((name) => {
      void this.getIcon(name).subscribe();
    });
  }
}
