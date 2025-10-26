import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Header } from '../../components/header/header';
import { MatSidenavModule, MatDrawer } from '@angular/material/sidenav';
import { CartSheet } from '../../features/cart/cart-sheet';

@Component({
  selector: 'app-main-layout',
  imports: [ CommonModule, RouterOutlet, Header, MatSidenavModule, CartSheet ],
  templateUrl: './main-layout.html',
})
export class MainLayout {

  @ViewChild('cartDrawer') cartDrawer!: MatDrawer;

  openCart() {
    this.cartDrawer.open();
  }

  closeCart() {
    this.cartDrawer.close();
  }
}
