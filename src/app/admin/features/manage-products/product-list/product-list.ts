import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { AdminProductService } from '../admin-product';
import { Product } from '../../../../shared/models/product.model';
import { ProductFormComponent } from '../product-form/product-form';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './product-list.html',
})
export class ProductListComponent {
  private productService = inject(AdminProductService);
  private dialog = inject(MatDialog);
  public products = signal<Product[]>([]);

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getProducts().subscribe((data) => {
      this.products.set(data);
    });
  }

  openProductDialog(product?: Product): void {
    const dialogRef = this.dialog.open(ProductFormComponent, {
      width: '800px',
      data: { product },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadProducts();
      }
    });
  }

  deleteProduct(id: string) {
    if (confirm('¿Estás seguro de que querés eliminar este producto?')) {
      this.productService.deleteProduct(id).subscribe(() => {
        this.loadProducts();
      });
    }
  }
}
