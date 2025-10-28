import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-sort-control',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule],
  templateUrl: './sort-control.html',
})
export class SortControlComponent {
  // Opciones de ordenamiento
  sortOptions = [
    { value: 'relevance', label: 'Relevancia' },
    { value: 'price-asc', label: 'Precio: Menor a Mayor' },
    { value: 'price-desc', label: 'Precio: Mayor a Menor' },
    { value: 'name-asc', label: 'Nombre: A - Z' },
    { value: 'name-desc', label: 'Nombre: Z - A' },
  ];

  // Valor actual del sort
  @Input() currentSort: string | null = null;

  // Emite el nuevo valor cuando el usuario cambia la selección
  @Output() sortChange = new EventEmitter<string>();

  onSortChange(newValue: string) {
    this.sortChange.emit(newValue);
  }
}
