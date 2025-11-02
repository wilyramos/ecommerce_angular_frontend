import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { BrandService } from '../../../brands/brand';
import { Brand as BrandModel } from '../../../../../shared/models/brand.model';

interface FilterOption {
  slug: string;
  name: string;
}

interface FilterConfig {
  name: string;
  values: FilterOption[];
}

@Component({
  selector: 'app-category-filters',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-filters.html',
})
export class CategoryFiltersComponent implements OnInit {

  filters: FilterConfig[] = []; // ✅ ahora interno
  selectedFilters: Record<string, string[]> = {};

  @Output() filterChange = new EventEmitter<Record<string, string[]>>();

  constructor(
    private brandService: BrandService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.initializeFilters();
    this.loadFiltersFromUrl(); // ✅ para mantener estado al recargar
  }

  /** ✅ Armamos todos los filtros internos */
  initializeFilters() {
    this.filters = [
      {
        name: 'color',
        values: [
          // { slug: 'black', name: 'Negro' },
          // { slug: 'white', name: 'Blanco' },
          // { slug: 'blue', name: 'Azul' },
        ]
      }
      // luego podrás meter más filtros internos aquí
      // { name: 'storage', values: [...] },
      // { name: 'condition', values: [...] },
    ];

    this.loadBrands(); // ✅ añade brands dinámicamente
  }

  /** ✅ Añadir filtro dinámico de marcas */
  loadBrands() {
    this.brandService.getAllBrands().subscribe((brands: BrandModel[]) => {
      this.filters.push({
        name: 'brand',
        values: brands.map(b => ({
          slug: b.slug,
          name: b.name
        }))
      });
    });
  }

  /** ✅ Leer filtros desde URL (cuando entras a la página) */
  loadFiltersFromUrl() {
    this.route.queryParams.subscribe(params => {
      for (const key in params) {
        const values = params[key].split(',');
        this.selectedFilters[key] = values;
      }
    });
  }

  /** ✅ Al hacer click, actualizar estado + URL */
  toggleFilter(filterName: string, slug: string) {
    const current = this.selectedFilters[filterName] || [];

    const newValues = current.includes(slug)
      ? current.filter(v => v !== slug)
      : [...current, slug];

    this.selectedFilters = {
      ...this.selectedFilters,
      [filterName]: newValues,
    };

    this.updateUrl();
    this.filterChange.emit(this.selectedFilters);
  }

  updateUrl() {
    const queryParams: any = {};

    Object.keys(this.selectedFilters).forEach(key => {
      const values = this.selectedFilters[key];
      if (values.length > 0) queryParams[key] = values.join(',');
    });

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
    });
  }

  isSelected(filterName: string, slug: string): boolean {
    return this.selectedFilters[filterName]?.includes(slug) ?? false;
  }

  clearAll() {
    this.selectedFilters = {};
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
    });
    this.filterChange.emit(this.selectedFilters);
  }
}
