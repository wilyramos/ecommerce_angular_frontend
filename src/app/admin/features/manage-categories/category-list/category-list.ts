import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AdminCategoryService } from '../admin-category';
import { Category } from '../../../../shared/models/category.model';
import { CategoryFormComponent } from '../category-form/category-form';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatSnackBarModule],
  templateUrl: './category-list.html',
})
export class CategoryListComponent {
  private categoryService = inject(AdminCategoryService);
  private dialog = inject(MatDialog);
  private snackbar = inject(MatSnackBar);

  public flatCategories = signal<(Category & { level: number })[]>([]);

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.getCategoryTree().subscribe({
      next: (data) => {
        this.flatCategories.set(this.buildFlatList(data));
      },
      error: () => this.snackbar.open('Error al cargar categorías', 'Cerrar', { duration: 3000 }),
    });
  }

  // Convierte árbol → lista con indentación
  private buildFlatList(categories: Category[], level = 0): (Category & { level: number })[] {
    const result: (Category & { level: number })[] = [];
    categories.forEach(cat => {
      result.push({ ...cat, level });
      if (cat.children?.length) {
        result.push(...this.buildFlatList(cat.children, level + 1));
      }
    });
    return result;
  }

  openCategoryDialog(category?: Category): void {
    const dialogRef = this.dialog.open(CategoryFormComponent, {
      width: '500px',
      data: { category },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.loadCategories();
    });
  }

  deleteCategory(category: Category) {
    const cascade = confirm(`¿Eliminar también las subcategorías de "${category.name}"?`);
    if (confirm(`¿Seguro que deseas eliminar la categoría "${category.name}"?`)) {
      this.categoryService.deleteCategory(category._id, cascade).subscribe({
        next: () => {
          this.snackbar.open('Categoría eliminada', 'Cerrar', { duration: 2000 });
          this.loadCategories();
        },
        error: (err) => {
          this.snackbar.open(err.error?.message || 'Error al eliminar', 'Cerrar', { duration: 3000 });
        },
      });
    }
  }
}
