import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-filters',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, ReactiveFormsModule],
  templateUrl: './product-filters.html',
})
export class ProductFiltersComponent {
  @Output() filtersChange = new EventEmitter<any>();
  private fb = new FormBuilder();

  filterForm = this.fb.group({
    search: [''],
    category: [''],
    brand: [''],
    sortBy: ['createdAt'],
    sortOrder: ['desc'],
  });

  applyFilters() {
    this.filtersChange.emit(this.filterForm.value);
  }

  clearFilters() {
    this.filterForm.reset({ sortBy: 'createdAt', sortOrder: 'desc' });
    this.applyFilters();
  }
}
