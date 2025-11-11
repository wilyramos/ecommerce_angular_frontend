// src/app/store/cart.store.ts
import { Injectable, signal, computed } from '@angular/core';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  qty: number;
}

@Injectable({ providedIn: 'root' })
export class CartStore {
  private items = signal<CartItem[]>([]);

  readonly totalItems = computed(() =>
    this.items().reduce((acc, item) => acc + item.qty, 0)
  );

  readonly totalPrice = computed(() =>
    this.items().reduce((acc, item) => acc + item.price * item.qty, 0)
  );

  get all() {
    return this.items();
  }

  add(item: CartItem) {
    const current = this.items();
    const existing = current.find(i => i.id === item.id);

    if (existing) {
      this.items.update(items =>
        items.map(i =>
          i.id === item.id ? { ...i, qty: i.qty + item.qty } : i
        )
      );
    } else {
      this.items.update(items => [...items, item]);
    }
  }

  remove(id: string) {
    this.items.update(items => items.filter(i => i.id !== id));
  }

  clear() {
    this.items.set([]);
  }
}
