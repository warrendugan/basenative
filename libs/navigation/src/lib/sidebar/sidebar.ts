import {
  Component,
  input,
  output,
  ViewEncapsulation,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { SidebarItem } from './sidebar.models';

@Component({
  selector: 'nav[bn-sidebar]',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css'],
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'bn-sidebar',
  },
})
export class SidebarComponent {
  items = input<SidebarItem[]>([]);
  collapsed = input(false);
  itemSelected = output<SidebarItem>();
}
