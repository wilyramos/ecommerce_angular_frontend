// src/app/pages/public/category-page/category-page.page.ts

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PublicProductService } from '../../../../services/public-product.service';
import type { PopulatedProduct } from '../../../../shared/models/product.model';
import { ProductCard } from '../../../../shared/components/product-card/product-card';
import { PaginatorComponent } from '../../../../shared/components/pagination/paginator';
import { Category as CategoryService } from '../../categories/category';
import { FilterSidebarComponent } from '../filter-component/filter-sidebar';
// Routerlink
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-category-page',
  standalone: true,
  imports: [CommonModule, ProductCard, PaginatorComponent, FilterSidebarComponent, RouterLink],
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
    this.route.paramMap.subscribe((params) => {
      this.slug = params.get('slug')!;
      this.resetStateAndLoad();
    });

    this.route.queryParams.subscribe(() => {
      if (this.slug && !this.isLoading) {
        this.loadProducts();
      }
    });
  }

  resetStateAndLoad() {
    this.products = [];
    this.filters = [];
    this.selectedFilters = [];
    this.isLoading = true;
    this.loadFromQueryParams();
    this.loadFilters();
  }

  loadFromQueryParams() {
    const params = this.route.snapshot.queryParams;
    this.page = +params['page'] || 1;
    this.limit = +params['limit'] || 12;
    this.loadProducts();
  }

  loadProducts() {
    this.isLoading = true;
    this.error = null;

    const filterParams = {
      page: this.page,
      limit: this.limit,
      attributes: this.selectedFilters
        .filter(f => f.name !== 'Categorías') // <-- Ignoramos el filtro de navegación
        .flatMap(f =>
          f.selected.map((v: string) => ({ key: f.name, value: v }))
        ),
    };

    this.productService.findProductsByCategorySlug(this.slug, filterParams)
      .subscribe({
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

  // <-- MÉTODO CLAVE MODIFICADO
  loadFilters() {
    this.categoryService.getCategoryDescendantsBySlug(this.slug).subscribe({
      next: (descendants) => {
        // Si la categoría tiene descendientes, los mostramos para navegar
        if (descendants && descendants.length > 0) {
          this.filters = [
            {
              name: 'Categorías',
              values: descendants.map(desc => ({
                name: desc.name,
                value: desc.slug // Asumiendo que el backend devuelve el slug
              })),
              selected: []
            }
          ];
        } else {
          // Si no hay descendientes, es una categoría final. Mostramos sus atributos para filtrar.
          this.categoryService.getCategoryBySlug(this.slug).subscribe({
            next: (category) => {
              this.filters = (category.attributes || []).map(attr => ({
                ...attr,
                selected: []
              }));
            },
            error: (err) => console.error('Error al cargar atributos de categoría:', err)
          });
        }
      },
      error: (err) => {
        console.error('Error al cargar descendientes de categoría:', err);
      }
    });
  }

  // <-- MÉTODO CLAVE MODIFICADO
  onFiltersChange(updatedFilters: any[]) {
    this.selectedFilters = updatedFilters;

    // Verificamos si el filtro que cambió fue el de 'Categorías'
    const categoryNavigationFilter = this.selectedFilters.find(f => f.name === 'Categorías');

    if (categoryNavigationFilter && categoryNavigationFilter.selected.length > 0) {
      // MODO NAVEGACIÓN: El usuario seleccionó una subcategoría de la lista
      const selectedSlug = categoryNavigationFilter.selected[0];

      // Reseteamos la selección para que no quede marcada
      categoryNavigationFilter.selected = [];

      // Navegamos a la nueva categoría
      this.router.navigate(['/categories', selectedSlug]);
    } else {
      // MODO FILTRO: El usuario seleccionó un atributo, recargamos los productos
      this.loadProducts();
    }
  }

  onPageChange(newPage: number) {
    this.page = newPage;
    this.updateQueryParams();
  }

  updateQueryParams() {
    this.router.navigate([], {
      queryParams: { page: this.page, limit: this.limit },
      relativeTo: this.route,
      queryParamsHandling: 'merge',
    });
  }

}
