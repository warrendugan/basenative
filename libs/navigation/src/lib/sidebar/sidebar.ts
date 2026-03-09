import {
  Component,
  input,
  output,
  ViewEncapsulation,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarItem } from './sidebar.models';

@Component({
  selector: 'nav[bn-sidebar]',
  standalone: true,
  imports: [CommonModule, RouterModule],
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
