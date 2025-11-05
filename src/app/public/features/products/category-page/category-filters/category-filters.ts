import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, Params } from '@angular/router';
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

  filters: FilterConfig[] = []; // filtros internos + dinámicos
  selectedFilters: Record<string, string[]> = {};

  @Output() filterChange = new EventEmitter<Record<string, string[]>>();

  constructor(
    private brandService: BrandService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.initializeFilters();

    this.route.queryParams.subscribe(params => {
      this.syncFiltersWithUrl(params);
    });
  }

  /** Inicializa filtros internos y carga marcas dinámicas */
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
    ];

    this.loadBrands();
  }

  /** Carga marcas dinámicas */
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

  /** 🔹 Sincroniza los filtros seleccionados con la URL */
  private syncFiltersWithUrl(params: Params) {
    const newSelected: Record<string, string[]> = {};

    for (const key in params) {
      if (params[key]) {
        newSelected[key] = params[key].split(',');
      }
    }

    this.selectedFilters = newSelected;
    this.filterChange.emit(this.selectedFilters);
  }

  /** Toggle de filtro al hacer click */
  toggleFilter(filterName: string, slug: string) {
    const current = this.selectedFilters[filterName] || [];

    const newValues = current.includes(slug)
      ? current.filter(v => v !== slug)
      : [...current, slug];

    if (newValues.length === 0) {
      const updated = { ...this.selectedFilters };
      delete updated[filterName];
      this.selectedFilters = updated;
    } else {
      this.selectedFilters = {
        ...this.selectedFilters,
        [filterName]: newValues
      };
    }

    this.updateUrl();
    this.filterChange.emit(this.selectedFilters);
  }

  /** Actualiza la URL con los filtros seleccionados */
  updateUrl() {
    const queryParams: any = {};

    Object.keys(this.selectedFilters).forEach(key => {
      const values = this.selectedFilters[key];
      if (values?.length > 0) {
        queryParams[key] = values.join(',');
      }
    });

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: '',
    });
  }

  /** Comprueba si un filtro está seleccionado */
  isSelected(filterName: string, slug: string): boolean {
    return this.selectedFilters[filterName]?.includes(slug) ?? false;
  }

  /** Limpiar todos los filtros */
  clearAll() {
    this.selectedFilters = {};
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
    });
    this.filterChange.emit(this.selectedFilters);
  }
}
