import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true, // <-- Debe ser standalone para ser importado por otro componente standalone
  imports: [CommonModule],
  selector: 'app-filter-sidebar',
  templateUrl: './filter-sidebar.html', // <-- Apunta al archivo HTML
})
export class FilterSidebarComponent {
  @Input() filters: any[] = [];
  @Output() filtersChange = new EventEmitter<any[]>();

  /**
   * Esta función se activa cuando el usuario hace clic en una opción de filtro.
   * Agrega o quita el valor seleccionado del array 'selected' del filtro.
   * @param filter El objeto de filtro (p.ej. { name: 'Categorías', ... })
   * @param value El valor a activar (p.ej. el slug 'camisetas')
   */
  toggleValue(filter: any, value: string) {
    // Si la lógica es de navegación (Categorías), solo permitimos una selección
    // y la reseteamos inmediatamente para que el 'click' sea una acción única.
    if (filter.name === 'Categorías') {
      filter.selected = [value];
    } else {
      // Lógica de filtro normal (checkbox)
      const index = filter.selected.indexOf(value);
      if (index > -1) {
        filter.selected.splice(index, 1); // Quitar si ya está
      } else {
        filter.selected.push(value); // Agregar si no está
      }
    }

    // Emitir el array de filtros actualizado a la página padre
    this.filtersChange.emit(this.filters);
  }
}
