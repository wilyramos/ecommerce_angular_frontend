import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule, MatDrawer } from '@angular/material/sidenav';

import { Header } from '../../components/header/header';
import { CartSheet } from '../../features/cart/cart-sheet';
import { FilterSheetComponent } from '../../features/sheet/filter-sheet';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    Header,
    MatSidenavModule,
    CartSheet,
    FilterSheetComponent,
  ],
  templateUrl: './main-layout.html',
})
export class MainLayout {
  @ViewChild('cartDrawer') cartDrawer!: MatDrawer;
  @ViewChild('filterDrawer') filterDrawer!: MatDrawer;

  /** 🛒 Abre y cierra el carrito */
  openCart() {
    this.cartDrawer.open();
  }
  closeCart() {
    this.cartDrawer.close();
  }

  /** 🧩 Abre y cierra el panel de filtros */
  openFilterDrawer() {
    this.filterDrawer.open();
  }
  closeFilterDrawer() {
    this.filterDrawer.close();
  }
}
