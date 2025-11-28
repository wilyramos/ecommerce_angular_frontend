import { Component, EventEmitter, Output, ViewChild, inject, effect } from '@angular/core';
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
import { RouterModule } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CartSheetComponent } from '../../features/cart/cart-sheet';
import { CartStore } from '../../features/cart/store/cart.store';

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
    CommonModule,
    RouterModule,
    MatSelectModule,
    MatFormFieldModule,
    CartSheetComponent
  ],
  templateUrl: './header.html',
})
export class Header {
  public categoryService = new CategoryService();

  @ViewChild('cartSheet') cartSheet!: CartSheetComponent;
  private dialog = inject(MatDialog);
  private cartStore = inject(CartStore);

  cartItemCount = 0;
  favoritesItemCount = 5;
  isLoggedIn = false;

  categoriesRoot: any[] = [];
  selectedCategory: any | null = null;

  @Output() openCart = new EventEmitter<void>();

  constructor() {
    // Mantiene el contador sincronizado con el store
    effect(() => {
      this.cartItemCount = this.cartStore.totalItems();
    });
  }

  openCartSheet() {
    this.cartSheet.toggle();
  }

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.getTreeCategories().subscribe({
      next: (data) => {
        this.categoriesRoot = data.filter(cat => !cat.parentCategory);
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
      width: '450px',
      autoFocus: false,
    });
  }
}
