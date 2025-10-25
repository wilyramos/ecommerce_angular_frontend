//File: frontend/src/app/public/features/products/product-list/product-list.page.ts

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductCard } from '../../../../shared/components/product-card/product-card';
import { PublicProductService } from '../../../../services/public-product.service';
import type { PopulatedProduct } from '../../../../shared/models/product.model';
import { PaginatorComponent } from '../../../../shared/components/pagination/paginator';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, ProductCard, PaginatorComponent],
  templateUrl: './product-list.page.html',
})
export class ProductListPage implements OnInit {
  private productService = inject(PublicProductService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  products: PopulatedProduct[] = [];
  isLoading = true;
  error: string | null = null;

  // 📦 Paginación y filtros
  page = 1;
  limit = 12;
  total = 0;
  totalPages = 0;

  search = '';
  category = '';
  sort = 'newest';

  ngOnInit() {
    // Escuchar cambios en los query params
    this.route.queryParams.subscribe((params) => {
      this.page = +params['page'] || 1;
      this.limit = +params['limit'] || 12;
      this.search = params['search'] || '';
      this.category = params['category'] || '';
      this.sort = params['sort'] || 'newest';
      this.loadProducts();
    });
  }

  loadProducts() {
    this.isLoading = true;
    this.error = null;

    const query = {
      page: this.page,
      limit: this.limit,
      search: this.search,
      category: this.category,
      sort: this.sort,
    };

    this.productService.getProducts(query).subscribe({
      next: (res) => {
        this.products = res.data;
        this.total = res.total;
        this.totalPages = res.totalPages;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.error = 'No se pudieron cargar los productos. Intenta nuevamente.';
        this.isLoading = false;
      },
    });
  }

  onPageChange(newPage: number) {
    this.page = newPage;
    this.updateQueryParams();
  }

  onPageSizeChange(newLimit: number) {
    this.limit = newLimit;
    this.updateQueryParams();
  }

  updateQueryParams() {
    this.router.navigate([], {
      queryParams: {
        ...this.route.snapshot.queryParams,
        page: this.page,
        limit: this.limit,
      },
      queryParamsHandling: 'merge',
    });
  }


  // 👇 Ejemplo para cambiar filtro (llámalo desde tus select o inputs)
  onFilterChange(newFilters: any) {
    this.router.navigate([], {
      queryParams: {
        ...this.route.snapshot.queryParams,
        ...newFilters,
        page: 1, // al aplicar filtro, volver a la primera página
      },
      queryParamsHandling: 'merge',
    });
  }
}
