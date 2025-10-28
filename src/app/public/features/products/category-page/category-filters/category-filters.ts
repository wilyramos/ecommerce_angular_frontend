import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-category-filters',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-filters.html',
})
export class CategoryFiltersComponent {
  @Input() filters: { name: string; values: string[] }[] = [];
  @Input() selectedFilters: Record<string, string[]> = {};
  @Output() filterChange = new EventEmitter<Record<string, string[]>>();

  toggleFilter(filterName: string, value: string) {
    const currentValues = this.selectedFilters[filterName] || [];

    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    this.selectedFilters = {
      ...this.selectedFilters,
      [filterName]: newValues,
    };

    this.filterChange.emit(this.selectedFilters);
  }

  isSelected(filterName: string, value: string): boolean {
    return this.selectedFilters[filterName]?.includes(value) ?? false;
  }

  clearAll() {
    this.selectedFilters = {};
    this.filterChange.emit(this.selectedFilters);
  }
}
