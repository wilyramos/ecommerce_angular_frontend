import { Component, EventEmitter, Output, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { AuthDialog } from '../../features/auth/auth-dialog/auth-dialog';
import { Category as CategoryService } from '../../features/categories/category';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatMenuModule,
    MatDividerModule,
    CommonModule
  ],
  templateUrl: './header.html',
})
export class Header {
  public categoryService = new CategoryService();

  cartItemCount = 3;
  favoritesItemCount = 5;
  isLoggedIn = false;

  categoriesRoot: any[] = [];
  selectedCategory: any | null = null; // categoría root seleccionada

  private dialog = inject(MatDialog);
  @Output() openCart = new EventEmitter<void>();

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    // Usamos getTreeCategories para recibir la jerarquía completa
    this.categoryService.getTreeCategories().subscribe({
      next: (data) => {
        console.log('Categorías cargadas:', data);
        // Solo guardamos las root (las que no tienen parentCategory)
        this.categoriesRoot = data.filter(cat => !cat.parentCategory);
        // Seleccionamos por defecto la primera
        if (this.categoriesRoot.length > 0) {
          this.selectedCategory = this.categoriesRoot[0];
        }
      },
      error: (error) => console.error('Error al cargar categorías:', error)
    });
  }

  selectCategory(category: any) {
    this.selectedCategory = category;
  }

  openAuthDialog(): void {
    this.dialog.open(AuthDialog, {
      width: '400px',
      autoFocus: false,
    });
  }

  openCartSheet(): void {
    this.openCart.emit();
  }
}
