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


// header.ts
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

  categories: any[] = []; // <-- aquí guardaremos las categorías

  private dialog = inject(MatDialog);

  @Output() openCart = new EventEmitter<void>();

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.getAllCategories().subscribe({
      next: (data) => {
        console.log('Categorías cargadas:', data);
        this.categories = data; // guardamos las categorías para iterar en template
      },
      error: (error) => console.error('Error al cargar categorías:', error)
    });
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
