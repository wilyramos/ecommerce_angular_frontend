import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideLayoutDashboard,
  lucidePackage,
  lucideShoppingCart,
  lucideUsers,
  lucideStore,
  lucideTags,       // → para Categorías
  lucideBadgeCheck, // → para Marcas
} from '@ng-icons/lucide';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgIconComponent],
  providers: [
    provideIcons({
      lucideLayoutDashboard,
      lucidePackage,
      lucideShoppingCart,
      lucideUsers,
      lucideStore,
      lucideTags,
      lucideBadgeCheck,
    }),
  ],
  templateUrl: './sidebar.html',
})
export class Sidebar {}
