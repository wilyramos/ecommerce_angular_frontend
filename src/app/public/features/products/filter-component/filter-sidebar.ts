import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  // standalone: true,
  imports: [CommonModule],
  selector: 'app-filter-sidebar',
  templateUrl: './filter-sidebar.html',
})
export class FilterSidebarComponent {
  @Input() filters: any[] = [];
  @Output() filtersChange = new EventEmitter<any[]>();

  toggleValue(filter: any, value: string) {
    const index = filter.selected.indexOf(value);
    if (index > -1) filter.selected.splice(index, 1);
    else filter.selected.push(value);

    this.filtersChange.emit(this.filters);
  }
}
