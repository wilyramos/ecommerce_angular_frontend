import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import type { PopulatedProduct, ProductVariant } from '../../models/product.model';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './product-card.html',
  styleUrls: ['./product-card.css'],
})
export class ProductCard {
  @Input({ required: true }) product!: PopulatedProduct;

  /** Retorna la primera variante activa del producto */
  get variant(): ProductVariant {
    return this.product.variants[0];
  }

  /** Retorna la URL de imagen principal */
  get mainImage(): string | null {
    return this.variant.images?.[0] ?? null;
  }

  get secondaryImage(): string | null {
    return this.variant.images?.[1] ?? null;
  }

  /** Retorna true si el producto tiene precio en oferta */
  get hasDiscount(): boolean {
    return !!this.variant.salePrice && this.variant.salePrice < this.variant.price;
  }

  /** Calcula el porcentaje de descuento */
  get discountPercent(): number {
    if (!this.hasDiscount) return 0;
    const diff = this.variant.price - (this.variant.salePrice ?? this.variant.price);
    return Math.round((diff / this.variant.price) * 100);
  }

  /** Devuelve la URL del detalle del producto */
  get productUrl(): string {
    return `/products/${this.product.slug || this.product._id}`;
  }

  onAddToWishlist(event: MouseEvent): void {
    // Lógica para agregar a la lista de deseos
    console.log(`Agregar ${this.product.name} a la lista de deseos`);
  }
}
