//File: frontend/src/app/public/features/cart/cart-sheet.ts

import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-cart-sheet',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './cart-sheet.html',
})
export class CartSheet {
  @Output() close = new EventEmitter<void>();

  carItems = [
    { name: 'Producto 1', quantity: 2, price: 20 },
    { name: 'Producto 2', quantity: 1, price: 15 },
    { name: 'Producto 3', quantity: 3, price: 30 },
  ];

  get totalItems() {
    return this.carItems.reduce((t, i) => t + i.quantity, 0);
  }

  get totalPrice() {
    return this.carItems.reduce((t, i) => t + i.price * i.quantity, 0);
  }

  onClose() {
    this.close.emit();
  }
}
