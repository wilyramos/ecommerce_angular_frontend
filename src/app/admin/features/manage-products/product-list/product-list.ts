import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { forkJoin } from 'rxjs';

import { ProductFiltersComponent } from '../product-filters/product-filters';
import { AdminProduct } from '../admin-product';
import { AdminCategoryService } from '../../manage-categories/admin-category';
import { AdminBrandService } from '../../manage-brands/admin-brand';
import { ProductFormComponent } from '../product-form/product-form';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { MatDialog } from '@angular/material/dialog';

import type { PopulatedProduct } from '../../../../shared/models/product.model';
import type { Category } from '../../../../shared/models/category.model';
import type { Brand } from '../../../../shared/models/brand.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatPaginatorModule,
    ProductFiltersComponent,
  ],
  templateUrl: './product-list.html',
})
export class ProductList implements OnInit {
  private productService = inject(AdminProduct);
  private categoryService = inject(AdminCategoryService);
  private brandService = inject(AdminBrandService);
  private dialog = inject(MatDialog);

  public products = signal<PopulatedProduct[]>([]);
  public total = signal(0);
  public page = signal(1);
  public limit = 10;
  public filters = signal<any>({});
  public categories = signal<Category[]>([]);
  public brands = signal<Brand[]>([]);

  ngOnInit() {
    this.loadInitialData();
  }

  loadInitialData() {
    forkJoin({
      categories: this.categoryService.getCategories(),
      brands: this.brandService.getAllBrands(),
    }).subscribe(({ categories, brands }) => {
      this.categories.set(categories);
      this.brands.set(brands);
      this.fetchProducts();
    });
  }

  fetchProducts() {
    const params = { ...this.filters(), page: this.page(), limit: this.limit };
    this.productService.getProducts(params).subscribe((res) => {
      this.products.set(res.data);
      this.total.set(res.total);
    });
  }

  onFiltersChange(newFilters: any) {
    this.page.set(1);
    this.filters.set(newFilters);
    this.fetchProducts();
  }

  // 📄 Paginación
  onPageChange(e: PageEvent) {
    this.page.set(e.pageIndex + 1);
    this.limit = e.pageSize;
    this.fetchProducts();
  }

  // 🧱 Abrir modal de producto (crear o editar)
  openProductDialog(product?: PopulatedProduct): void {
    const dialogRef = this.dialog.open(ProductFormComponent, {
      width: '2000px',
      data: {
        product,
        categories: this.categories(),
        brands: this.brands(),
      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.fetchProducts();
    });
  }

  // 🗑️ Eliminar producto
  deleteProduct(id: string) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '600px',
      data: {
        title: 'Confirmar eliminación',
        message: '¿Estás seguro de que deseas eliminar este producto?',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.productService.deleteProduct(id).subscribe(() => {
          this.fetchProducts();
        });
      }
    });
  }
}
