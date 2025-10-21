import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';

// --- Servicios ---
import { AdminProduct } from '../admin-product';
import { AdminCategoryService } from '../../manage-categories/admin-category';
import { AdminBrandService } from '../../manage-brands/admin-brand';

// --- Modelos ---
import { Product } from '../../../../shared/models/product.model';
import { Category } from '../../../../shared/models/category.model';
import { Brand } from '../../../../shared/models/brand.model';

// --- Componente de Diálogo ---
import { ProductFormComponent } from '../product-form/product-form';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './product-list.html',
})
export class ProductList {
  // --- Inyección de Servicios ---
  private productService = inject(AdminProduct);
  private categoryService = inject(AdminCategoryService);
  private brandService = inject(AdminBrandService);
  private dialog = inject(MatDialog);

  // --- Signals para manejar el estado ---
  public products = signal<Product[]>([]);
  public categories = signal<Category[]>([]);
  public brands = signal<Brand[]>([]);

  ngOnInit() {
    this.loadInitialData();
  }

  loadInitialData() {
    forkJoin({
      products: this.productService.getProducts(),
      categories: this.categoryService.getCategories(),
      brands: this.brandService.getAllBrands(),
    }).subscribe(({ products, categories, brands }) => {
      this.products.set(products);
      this.categories.set(categories);
      this.brands.set(brands);
    });
  }

  openProductDialog(product?: Product): void {
    const dialogRef = this.dialog.open(ProductFormComponent, {
      width: '1600px',
      data: {
        product: product,
        categories: this.categories(),
        brands: this.brands(),
      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadInitialData();
      }
    });
  }

  deleteProduct(id: string) {
    if (confirm('¿Estás seguro de que querés eliminar este producto?')) {
      this.productService.deleteProduct(id).subscribe(() => {
        this.loadInitialData();
      });
    }
  }
}
