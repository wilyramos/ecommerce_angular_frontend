import { Component, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../product';
import { Product } from '../../../../shared/models/product.model';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './product-detail.html',
})
export class ProductDetailComponent {
  // Nueva forma de recibir parámetros de ruta con Signals
  public slug = input.required<string>();
  private productService = inject(ProductService);
  public product = signal<Product | undefined>(undefined);

  ngOnInit() {
    this.productService.getProductBySlug(this.slug()).subscribe(data => {
      this.product.set(data);
    });
  }
}
