import { Component, Inject, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { Category } from '../../../../shared/models/category.model';
import { AdminCategoryService } from '../admin-category';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
  ],
  templateUrl: './category-form.html',
})
export class CategoryFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private categoryService = inject(AdminCategoryService);
  public dialogRef = inject(MatDialogRef<CategoryFormComponent>);

  isEditMode = false;
  categories: Category[] = []; // lista de categorías para asignar parentCategory

  // === Formulario ===
  categoryForm = this.fb.group({
    name: ['', Validators.required],
    parentCategory: ['' as string | null],
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data: { category?: Category }) {
    this.isEditMode = !!this.data?.category;

    // Si se está editando, precargar valores
    if (this.isEditMode && this.data.category) {
      const parent =
        (this.data.category.parentCategory as any)?._id ||
        (this.data.category.parentCategory as string) ||
        '';
      this.categoryForm.patchValue({
        name: this.data.category.name,
        parentCategory: parent,
      });
    }
  }

  ngOnInit() {
    this.loadCategories();
  }

  // === Cargar categorías para el select ===
  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (cats) => (this.categories = cats),
      error: (err) => console.error('Error al cargar categorías:', err),
    });
  }

  // === Crear o actualizar ===
  onSave(): void {
    if (this.categoryForm.invalid) return;

    const formValue = this.categoryForm.value;

    // Armar el payload que el backend espera
    const payload = {
      name: formValue.name!,
      parentCategory: formValue.parentCategory || undefined, // el backend valida con @IsMongoId()
    };

    const operation = this.isEditMode
      ? this.categoryService.updateCategory(this.data.category!._id, payload)
      : this.categoryService.createCategory(payload);

    operation.subscribe({
      next: (savedCategory) => this.dialogRef.close(savedCategory),
      error: (err) => console.error('Error al guardar categoría:', err),
    });
  }
}
