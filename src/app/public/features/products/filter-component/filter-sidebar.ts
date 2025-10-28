import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-filter-sidebar',
  templateUrl: './filter-sidebar.html',
})
export class FilterSidebarComponent {
  @Input() filters: any[] = [];
  @Output() filtersChange = new EventEmitter<any[]>();

  constructor(private router: Router) {}

  toggleValue(filter: any, value: string) {
    if (filter.name.toLowerCase() === 'categorias') {
      // Navegar directamente a la categoría seleccionada
      this.router.navigate([`/products/category/${value}`]);
    } else {
      // Toggle normal para otros filtros
      const index = filter.selected.indexOf(value);
      if (index > -1) filter.selected.splice(index, 1);
      else filter.selected.push(value);

      this.filtersChange.emit(this.filters);
    }
  }
}
