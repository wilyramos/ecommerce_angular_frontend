import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSidenavModule, MatDrawer } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { PublicProductService } from '../../../../services/public-product.service';
import type { PopulatedProduct } from '../../../../shared/models/product.model';
import { ProductCard } from '../../../../shared/components/product-card/product-card';
import { PaginatorComponent } from '../../../../shared/components/pagination/paginator';
import { CategoryFiltersComponent } from './category-filters/category-filters';
import { FilterSheetComponent } from '../../sheet/filter-sheet';
import { MainLayout } from '../../../layouts/main-layout/main-layout';
import {
  lucideLayoutDashboard,
  lucidePackage,
  lucideShoppingCart,
  lucideUsers,
  lucideStore,
  lucideTags,       // → para Categorías
  lucideBadgeCheck, // → para Marcas
  lucideFilter,
  lucideSun,
} from '@ng-icons/lucide';
import { provideIcons } from '@ng-icons/core';
import { SortControlComponent } from '../../../../shared/components/sort-control/sort-control';

@Component({
  selector: 'app-category-page',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    ProductCard,
    PaginatorComponent,
    CategoryFiltersComponent,
    FilterSheetComponent,
    SortControlComponent,
  ],
  providers: [
    provideIcons({
      lucideLayoutDashboard,
      lucidePackage,
      lucideShoppingCart,
      lucideUsers,
      lucideStore,
      lucideTags,
      lucideBadgeCheck,
      lucideFilter,
      lucideSun,
    }),
  ],
  templateUrl: './category-page.page.html',
  styleUrls: ['./category-page.page.css'],
})
export class CategoryPagePage implements OnInit {
  private productService = inject(PublicProductService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private mainLayout = inject(MainLayout);

  sort = 'relevance';


  @ViewChild('filterDrawer') filterDrawer!: MatDrawer;

  slug = '';
  products: PopulatedProduct[] = [];
  isLoading = true;
  error: string | null = null;

  page = 1;
  limit = 12;
  total = 0;
  totalPages = 0;

  filters = [
    { name: 'Marca', values: ['Apple', 'Samsung', 'Xiaomi'] },
  ];

  selectedFilters: Record<string, string[]> = {};

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.slug = params.get('slug')!;
      this.loadProducts();
    });

    this.route.queryParams.subscribe((params) => {
      this.sort = params['sort'] || 'relevance';
      this.page = +params['page'] || 1;
      this.limit = +params['limit'] || 12;

      if (this.slug && !this.isLoading) {
        this.loadProducts();
      }
    });
  }

  loadProducts() {
    this.isLoading = true;
    this.error = null;

    const params = this.route.snapshot.queryParams;
    this.page = +params['page'] || 1;
    this.limit = +params['limit'] || 12;

    const filterParams = {
      page: this.page,
      limit: this.limit,
      filters: this.selectedFilters,
      sort: this.sort,
    };

    this.productService.findProductsByCategorySlug(this.slug, filterParams).subscribe({
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
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: this.page, limit: this.limit },
      queryParamsHandling: 'merge',
    });
  }

  onFilterChange(newFilters: Record<string, string[]>) {
    this.selectedFilters = newFilters;
    this.loadProducts();
  }

  openFilterDrawer() {
    this.mainLayout.openFilterDrawer();
  }

  closeFilterDrawer() {
    this.mainLayout.closeFilterDrawer();
  }

  onSortChange(newSort: string) {
    this.sort = newSort;

    // Actualiza la URL con el nuevo sort, sin recargar la página
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { sort: this.sort, page: 1 }, // reset page al cambiar sort
      queryParamsHandling: 'merge',
    });

    this.loadProducts();
  }
}
