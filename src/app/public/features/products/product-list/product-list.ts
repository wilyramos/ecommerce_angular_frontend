import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../product';
import { Product } from '../../../../shared/models/product.model';
import { ProductCard } from '../../../../shared/components/product-card/product-card';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, ProductCard],
  templateUrl: './product-list.html',
})
export class ProductListComponent {
  private productService = inject(ProductService);
  public products = signal<Product[]>([]);

  ngOnInit() {
    this.productService.getProducts().subscribe(data => {
      this.products.set(data);
    });
  }
}
