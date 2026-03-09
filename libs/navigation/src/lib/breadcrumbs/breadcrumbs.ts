import {
  Component,
  input,
  ViewEncapsulation,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { BreadcrumbItem } from './breadcrumbs.models';

@Component({
  selector: 'nav[bn-breadcrumbs]',
  standalone: true,
  imports: [RouterModule],
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
