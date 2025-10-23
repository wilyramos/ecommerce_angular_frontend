import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';

import { AdminCategoryService } from '../admin-category';
import { Category } from '../../../../shared/models/category.model';
import { CategoryFormComponent } from '../category-form/category-form';

// Interfaz interna para manejar jerarquía visual
type CategoryWithLevel = Category & { level: number };

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatDialogModule,
  ],
  templateUrl: './category-list.html',
})
export class CategoryListComponent implements OnInit {
  private categoryService = inject(AdminCategoryService);
  private dialog = inject(MatDialog);
  private snackbar = inject(MatSnackBar);

  public flatCategories = signal<CategoryWithLevel[]>([]);
  public isLoading = signal(true);

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading.set(true);
    this.categoryService
      .getCategoryTree()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (tree) => {
          this.flatCategories.set(this.buildFlatList(tree));
        },
        error: () => this.showError('Error al cargar las categorías'),
      });
  }

  /**
   * Convierte el árbol jerárquico en una lista plana con niveles
   * para facilitar la visualización y la indentación.
   */
  private buildFlatList(categories: Category[], level = 0): CategoryWithLevel[] {
    const result: CategoryWithLevel[] = [];
    for (const cat of categories) {
      result.push({ ...cat, level });
      if (cat.children?.length) {
        result.push(...this.buildFlatList(cat.children, level + 1));
      }
    }
    return result;
  }

  openCategoryDialog(category?: Category): void {
    const dialogRef = this.dialog.open(CategoryFormComponent, {
      width: '650px',
      data: { category, allCategories: this.flatCategories() },
      disableClose: true,
      panelClass: 'dialog-responsive',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.showSuccess(category ? 'Categoría actualizada' : 'Categoría creada');
        this.loadCategories();
      }
    });
  }

  deleteCategory(category: Category): void {
    const cascade = confirm(
      `¿Desea eliminar también todas las subcategorías de "${category.name}"? Esta acción no se puede deshacer.`
    );

    if (cascade) {
      this.categoryService.deleteCategory(category._id).subscribe({
        next: () => {
          this.showSuccess('Categoría eliminada correctamente');
          this.loadCategories();
        },
        error: () => this.showError('Error al eliminar la categoría'),
      });
    }
  }

  private showSuccess(message: string): void {
    this.snackbar.open(message, 'Cerrar', { duration: 3000 });
  }

  private showError(message: string): void {
    this.snackbar.open(message, 'Cerrar', {
      duration: 4000,
      panelClass: 'error-snackbar',
    });
  }
}
