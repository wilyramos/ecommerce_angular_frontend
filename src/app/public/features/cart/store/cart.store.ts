import { Injectable, signal, computed, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type { ProductAttribute } from '@shared/models/product.model';

export interface CartVariant {
  sku: string;
  attributes: ProductAttribute[];
  price: number;
  salePrice?: number | null;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  qty: number;
  variant: CartVariant;
}

const CART_KEY = 'app_cart_v1';

@Injectable({ providedIn: 'root' })
export class CartStore {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  private items = signal<CartItem[]>(this.loadFromStorage());
  opened = signal(false);

  readonly totalItems = computed(() =>
    this.items().reduce((acc, item) => acc + item.qty, 0)
  );

  readonly totalPrice = computed(() =>
    this.items().reduce((acc, item) => acc + item.price * item.qty, 0)
  );

  constructor() {
    if (this.isBrowser) {
      effect(() => {
        const current = this.items();
        try {
          localStorage.setItem(CART_KEY, JSON.stringify(current));
        } catch (err) {
          console.warn('Error saving cart to localStorage', err);
        }
      });
    }
  }

  private loadFromStorage(): CartItem[] {
    if (!this.isBrowser) return [];
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

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

    this.opened.set(true);
  }

  updateQty(id: string, qty: number) {
    this.items.update(items =>
      items.map(i => (i.id === id ? { ...i, qty } : i))
    );
  }

  remove(id: string) {
    this.items.update(items => items.filter(i => i.id !== id));
  }

  clear() {
    this.items.set([]);
    if (this.isBrowser) localStorage.removeItem(CART_KEY);
  }

  open() {
    this.opened.set(true);
  }

  close() {
    this.opened.set(false);
  }
}
