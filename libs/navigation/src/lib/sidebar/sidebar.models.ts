export interface SidebarItem {
  readonly icon: string;
  readonly label: string;
  readonly route: string;
  readonly badge?: number;
  readonly children?: readonly SidebarItem[];
}
