import {
  Component,
  input,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BreadcrumbItem } from './breadcrumbs.models';

@Component({
  selector: 'nav[bn-breadcrumbs]',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './breadcrumbs.html',
  styleUrls: ['./breadcrumbs.css'],
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'bn-breadcrumbs',
  },
})
export class BreadcrumbsComponent {
  items = input<BreadcrumbItem[]>([]);
}
