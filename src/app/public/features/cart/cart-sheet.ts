import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartStore } from './store/cart.store';

@Component({
  selector: 'app-cart-sheet',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart-sheet.html',
})
export class CartSheetComponent {
  store = inject(CartStore);
  open = signal(false);
  visible = signal(false);

  toggle() {
    this.open() ? this.close() : this.show();
  }

  show() {
    this.visible.set(true);
    requestAnimationFrame(() => this.open.set(true));
  }

  close() {
    this.open.set(false);
    setTimeout(() => this.visible.set(false), 300);
  }

  backdropClick(e: MouseEvent) {
    if ((e.target as HTMLElement).id === 'sheet-backdrop') this.close();
  }
}
