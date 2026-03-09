import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'article[root]',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly page = {
    title: 'Dugan Labs',
    tagline: 'R&D parent for high-integrity infrastructure',
    entities: [
      {
        name: 'Dugan Labs',
        badge: 'Parent',
        badgeType: 'parent',
        description: 'The parent organization and R&D hub for infrastructure innovation and research. Housing our strategic vision and driving cross-entity collaboration.',
        highlights: ['R&D Focus', 'High Integrity', 'Infrastructure'],
        link: 'https://duganlabs.com',
        linkLabel: 'Visit',
      },
      {
        name: 'BaseNative',
        badge: 'Ecosystem',
        badgeType: 'ecosystem',
        description: 'Open-source semantic web foundation with 48V home standards. Building the next generation of interoperable smart home infrastructure.',
        highlights: ['Open Source', 'Semantic Web', 'Smart Home'],
        link: 'https://basenative.com',
        linkLabel: 'Explore',
      },
      {
        name: 'GreenPut',
        badge: 'Fintech',
        badgeType: 'fintech',
        description: 'High-integrity fintech platform featuring logic, state-machines, bill pay, and stablecoin compounding. Integrated with M&A and treasury management.',
        highlights: ['Logic Engine', 'Bill Pay', 'Treasury'],
        link: 'https://greenput.com',
        linkLabel: 'Launch App',
      },
    ],
    footer: {
      copyright: '\u00A9 2026 Dugan Labs. All rights reserved.',
      links: [
        { label: 'Contact', href: 'mailto:hello@duganlabs.com' },
        { label: 'Docs', href: 'https://docs.duganlabs.com' },
        { label: 'GitHub', href: 'https://github.com/duganlabs' },
      ],
    },
  } as const;
}
