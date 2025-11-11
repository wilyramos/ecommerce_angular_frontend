import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartStore } from './store/cart.store';
import type { CartItem } from './store/cart.store';

@Component({
  selector: 'app-cart-sheet',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart-sheet.html',
})
export class CartSheetComponent {
  store = inject(CartStore);
  open = false;
  visible = false;

  constructor() {
    // Reacciona automáticamente al cambio de estado en CartStore.opened
    effect(() => {
      const isOpen = this.store.opened();
      if (isOpen) this.show();
      else this.close();
    });
  }

  toggle() {
    this.store.opened.set(!this.store.opened());
  }

  show() {
    this.visible = true;
    requestAnimationFrame(() => (this.open = true));
  }

  close() {
    this.open = false;
    setTimeout(() => (this.visible = false), 300);
    this.store.close(); // sincroniza el estado global
  }

  backdropClick(e: MouseEvent) {
    if ((e.target as HTMLElement).id === 'sheet-backdrop') this.close();
  }

  increment(item: CartItem) {
  this.store.add({ ...item, qty: 1 });
}

decrement(item: CartItem) {
  if (item.qty > 1) {
    this.store.updateQty(item.id, item.qty - 1);
  } else {
    this.store.remove(item.id);
  }
}
}
