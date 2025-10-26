import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PublicProductService } from '../../../../services/public-product.service';
import type { PopulatedProduct, PaginatedProducts } from '../../../../shared/models/product.model';
import { ProductCard } from '../../../../shared/components/product-card/product-card';
import { PaginatorComponent } from '../../../../shared/components/pagination/paginator';
import { Category as CategoryService } from '../../categories/category';
import { FilterSidebarComponent } from '../filter-component/filter-sidebar';

@Component({
  selector: 'app-category-page',
  standalone: true,
  imports: [CommonModule, ProductCard, PaginatorComponent, FilterSidebarComponent],
  templateUrl: './category-page.page.html',
  styleUrls: ['./category-page.page.css'],
})
export class CategoryPagePage implements OnInit {
  private productService = inject(PublicProductService);
  private categoryService = inject(CategoryService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  slug = '';
  products: PopulatedProduct[] = [];
  isLoading = true;
  error: string | null = null;
  filters: any[] = [];
  selectedFilters: any[] = [];

  page = 1;
  limit = 12;
  total = 0;
  totalPages = 0;

  ngOnInit() {
    // Escuchar cambios de slug o query params (paginación)
    this.route.paramMap.subscribe((params) => {
      this.slug = params.get('slug')!;
      this.loadFromQueryParams();
      this.loadFilters();
    });

    // También escuchamos cambios en query params (paginación)
    this.route.queryParams.subscribe(() => {
      if (this.slug) {
        this.loadProducts();
      }
    });
  }

  loadFromQueryParams() {
    const params = this.route.snapshot.queryParams;
    this.page = +params['page'] || 1;
    this.limit = +params['limit'] || 12;
    this.loadProducts();
  }

  loadProducts(customFilters: any = {}) {
    this.isLoading = true;
    this.error = null;

    const filterParams = {
      page: this.page,
      limit: this.limit,
      attributes: this.selectedFilters.flatMap(f =>
        f.selected.map((v: string) => ({ key: f.name, value: v }))
      ),
      ...customFilters
    };

    this.productService.findProductsByCategorySlug(this.slug, filterParams)
      .subscribe({
        next: (res) => {
          this.products = res.data;
          this.total = res.total;
          this.totalPages = res.totalPages;
        },
        error: (err) => {
          console.error('Error al cargar productos:', err);
          this.error = 'No se pudieron cargar los productos. Intenta nuevamente.';
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }



  onPageChange(newPage: number) {
    this.page = newPage;
    this.updateQueryParams();
  }

  updateQueryParams() {
    this.router.navigate([], {
      queryParams: {
        page: this.page,
        limit: this.limit,
      },
      relativeTo: this.route,
      queryParamsHandling: 'merge',
    });
  }

  loadFilters() {
    this.categoryService.getCategoryBySlug(this.slug).subscribe({
      next: (category) => {
        this.filters = (category.attributes || []).map(attr => ({
          ...attr,
          selected: []  // <-- inicializamos aquí
        }));
        console.log('Filtros de categoría cargados:', this.filters);
      },
      error: (err) => {
        console.error('Error al cargar filtros de categoría:', err);
      },
    });
  }

  onFiltersChange(updatedFilters: any[]) {
    this.selectedFilters = updatedFilters; // actualizamos la referencia

    const filterQuery: any = {};
    this.selectedFilters.forEach(f => {
      if (f.selected && f.selected.length > 0) {
        filterQuery[f.name.toLowerCase()] = f.selected;
      }
    });

    // recargar productos con filtros
    this.loadProducts();
  }

}
