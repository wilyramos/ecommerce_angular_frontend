import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import { Header } from '../../components/header/header';
// import { CartSheet } from '../../features/cart/cart-sheet';
// import { FilterSheetComponent } from '../../features/sheet/filter-sheet';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    Header,
    Footer,
  ],
  templateUrl: './main-layout.html',
})
export class MainLayout {
  isCartOpen = false;

  isFilterOpen = false;

  openCart() {
    this.isCartOpen = true;
  }
  closeCart() {
    this.isCartOpen = false;
  }

  openFilterDrawer() {
    this.isFilterOpen = true;
  }
  closeFilterDrawer() {
    this.isFilterOpen = false;
  }
}
