import {
  Component,
  inject,
  signal,
  computed,
  ViewEncapsulation,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, switchMap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { marked } from 'marked';
import { IconComponent } from '@basenative/ui-glass';

interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
}

@Component({
  selector: 'article[philosophies-page]',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './philosophies.html',
  styleUrl: './philosophies.css',
  encapsulation: ViewEncapsulation.None,
})
export class PhilosophiesPage {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);

  // Use query params to drive the state
  selectedId = toSignal(
    this.route.queryParams.pipe(map((params) => params['article'] ?? null)),
  );

  items = signal<Article[]>([]);

  view = computed(() => {
    const id = this.selectedId();
    if (!id) return { mode: 'list' as const, items: this.items() };
    const article = this.items().find((i) => i.id === id);
    return { mode: 'detail' as const, article };
  });

  constructor() {
    this.http
      .get<{ file: string; slug: string }[]>('assets/articles/manifest.json')
      .pipe(
        switchMap((manifest) => {
          const requests = manifest.map((item) =>
            this.http
              .get('assets/articles/' + item.file, { responseType: 'text' })
              .pipe(map((text) => this.parseArticle(text, item.slug))),
          );
          return forkJoin(requests);
        }),
      )
      .subscribe((articles) => {
        this.items.set(articles);
      });
  }

  select(id: string) {
    const nav = () =>
      this.router.navigate([], {
        queryParams: { article: id },
        queryParamsHandling: 'merge',
      });

    if (!('startViewTransition' in document)) {
      nav();
      return;
    }
    (
      document as Document & { startViewTransition: (cb: () => void) => void }
    ).startViewTransition(() => {
      nav();
    });
  }

  back() {
    const nav = () =>
      this.router.navigate([], {
        queryParams: { article: null },
        queryParamsHandling: 'merge',
      });

    if (!('startViewTransition' in document)) {
      nav();
      return;
    }
    (
      document as Document & { startViewTransition: (cb: () => void) => void }
    ).startViewTransition(() => {
      nav();
    });
  }

  private parseArticle(text: string, slug: string): Article {
    // Simple FrontMatter Parser
    const match = text.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);

    if (!match) {
      return {
        id: slug,
        title: slug,
        description: '',
        content: this.parseMarkdown(text),
      };
    }

    const frontMatter = match[1];
    const content = match[2];

    const titleMatch = frontMatter.match(/title:\s*(.*)/);
    const descMatch = frontMatter.match(/description:\s*(.*)/);

    return {
      id: slug,
      title: titleMatch ? titleMatch[1].trim() : slug,
      description: descMatch ? descMatch[1].trim() : '',
      content: this.parseMarkdown(content.trim()),
    };
  }

  private parseMarkdown(text: string): string {
    return marked.parse(text) as string;
  }
}
