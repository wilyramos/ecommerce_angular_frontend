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
  lucideTags,
  lucideBadgeCheck,
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

  // Page & limit
  this.page = +params['page'] || 1;
  this.limit = +params['limit'] || 12;

  // ✅ Convertir filtros URL → arrays
  const filters: any = {};
  Object.keys(params).forEach(key => {
    if (['sort', 'page', 'limit'].includes(key)) return;
    filters[key] = params[key].split(',');
  });

  // ✅ Convertir sort URL → sortBy + sortOrder
  let sortBy = 'createdAt';
  let sortOrder: 'asc' | 'desc' = 'desc';

  if (params['sort']) {
    const [field, order] = params['sort'].split('-');
    sortBy = field === 'relevance' ? 'createdAt' : field;
    sortOrder = order === 'asc' ? 'asc' : 'desc';
  }

  this.productService.findProductsByCategorySlug(this.slug, {
    page: this.page,
    limit: this.limit,
    categorias: [this.slug],
    brand: filters.brand?.join(','),
    sortBy,
    sortOrder,
  }).subscribe({
    next: (res) => {
      this.products = res.data;
      this.total = res.total;
      this.totalPages = res.totalPages;
      this.isLoading = false;
    },
    error: () => {
      this.error = 'No se pudieron cargar los productos.';
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
  const queryParams: any = { page: 1 };

  Object.keys(newFilters).forEach(key => {
    if (newFilters[key].length > 0) {
      queryParams[key] = newFilters[key].join(',');
    }
  });

  this.router.navigate([], {
    relativeTo: this.route,
    queryParams,
    queryParamsHandling: 'merge',
  });
}

  openFilterDrawer() {
    this.mainLayout.openFilterDrawer();
  }

  closeFilterDrawer() {
    this.mainLayout.closeFilterDrawer();
  }

  onSortChange(newSort: string) {
  this.sort = newSort;

  this.router.navigate([], {
    relativeTo: this.route,
    queryParams: { sort: this.sort, page: 1 },
    queryParamsHandling: 'merge',
  });
}

}
