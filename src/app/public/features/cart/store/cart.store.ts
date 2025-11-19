// File: frontend/src/app/store/cart.store.ts
import { Injectable, signal, computed, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { CartApiService } from 'src/app/services/cart-api.service';

export interface CartVariant {
  sku: string;
  attributes: any[];
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

@Injectable({ providedIn: 'root' })
export class CartStore {
  private api = inject(CartApiService);
  private platformId = inject(PLATFORM_ID);

  private items = signal<CartItem[]>([]);
  opened = signal(false);

  readonly totalItems = computed(() =>
    this.items().reduce((acc, item) => acc + item.qty, 0)
  );

  readonly totalPrice = computed(() =>
    this.items().reduce((acc, item) => acc + item.price * item.qty, 0)
  );

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadFromBackend();
    }
  }

  private getSessionId(): string {
    if (!isPlatformBrowser(this.platformId)) return '';

    const key = 'cart_session_id';
    let id = localStorage.getItem(key);

    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(key, id);
    }

    return id;
  }

  private loadFromBackend() {
    if (!isPlatformBrowser(this.platformId)) return;

    const sessionId = this.getSessionId();
    if (!sessionId) return;

    this.api.getCart(sessionId).subscribe((cart: any) => {
      if (!cart || !Array.isArray(cart.items)) {
        this.items.set([]);
        return;
      }

      const mapped: CartItem[] = cart.items.map((i: any) => ({
        id: `${i.productId}-${i.sku}`,
        productId: i.productId,
        name: i.name ?? '',
        price: i.priceSnapshot,
        image: i.images?.[0] ?? '',
        qty: i.quantity,
        variant: {
          sku: i.sku,
          attributes: i.attributes ?? [],
          price: i.priceSnapshot,
          salePrice: null
        }
      }));

      this.items.set(mapped);
    });
  }

  get all() {
    return this.items();
  }

  add(item: CartItem) {
    if (!isPlatformBrowser(this.platformId)) return;

    const sessionId = this.getSessionId();

    this.api
      .addItem(
        {
          productId: item.productId,
          sku: item.variant.sku,
          quantity: item.qty
        },
        sessionId
      )
      .subscribe(() => {
        this.loadFromBackend();
        this.opened.set(true);
      });
  }

  updateQty(id: string, qty: number) {
    if (!isPlatformBrowser(this.platformId)) return;

    const item = this.items().find(i => i.id === id);
    if (!item) return;

    const sessionId = this.getSessionId();

    this.api
      .updateQty(item.productId, item.variant.sku, qty, sessionId)
      .subscribe(() => {
        this.loadFromBackend();
      });
  }

  remove(id: string) {
    if (!isPlatformBrowser(this.platformId)) return;

    const item = this.items().find(i => i.id === id);
    if (!item) return;

    const sessionId = this.getSessionId();

    this.api
      .remove(item.productId, item.variant.sku, sessionId)
      .subscribe(() => {
        this.loadFromBackend();
      });
  }

  clear() {
    if (!isPlatformBrowser(this.platformId)) return;

    const sessionId = this.getSessionId();

    this.api.clear(sessionId).subscribe(() => {
      this.items.set([]);
    });
  }

  open() {
    this.opened.set(true);
  }

  close() {
    this.opened.set(false);
  }
}
