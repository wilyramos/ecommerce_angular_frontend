import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { AdminCategoryService } from '../admin-category';
import { Category } from '../../../../shared/models/category.model';
import { CategoryFormComponent } from '../category-form/category-form';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './category-list.html',
})
export class CategoryListComponent {
  private categoryService = inject(AdminCategoryService);
  private dialog = inject(MatDialog);
  public categories = signal<Category[]>([]);

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe((data) => {
      this.categories.set(data);
    });
  }

  openCategoryDialog(category?: Category): void {
    const dialogRef = this.dialog.open(CategoryFormComponent, {
      width: '500px',
      // --- ¡CORRECCIÓN AQUÍ! ---
      // Pasamos tanto la categoría a editar como la lista completa de categorías
      data: {
        category: category,
        categories: this.categories(),
      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadCategories();
      }
    });
  }

  deleteCategory(id: string) {
    if (confirm('¿Estás seguro de que querés eliminar esta categoría?')) {
      this.categoryService.deleteCategory(id).subscribe(() => {
        this.loadCategories();
      });
    }
  }
}
