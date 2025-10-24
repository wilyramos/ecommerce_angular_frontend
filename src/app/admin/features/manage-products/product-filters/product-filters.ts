import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import type { Category } from '../../../../shared/models/category.model';
import type { Brand } from '../../../../shared/models/brand.model';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-product-filters',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatIcon,
  ],
  templateUrl: './product-filters.html',
})
export class ProductFiltersComponent implements OnInit {
  @Input() categories: Category[] = [];
  @Input() brands: Brand[] = [];
  @Output() filtersChange = new EventEmitter<any>();

  private fb = new FormBuilder();

  filterForm = this.fb.group({
    search: [''],
    category: [''],
    brand: [''],
    sortBy: ['createdAt'],
    sortOrder: ['desc'],
  });

  ngOnInit() {
    this.filterForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((filters) => this.filtersChange.emit(filters));
  }

  clearFilters() {
    this.filterForm.reset({ sortBy: 'createdAt', sortOrder: 'desc' });
  }
}
