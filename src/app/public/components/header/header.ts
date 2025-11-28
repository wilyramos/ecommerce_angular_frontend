import {
  Component,
  EventEmitter,
  Output,
  ViewChild,
  inject,
  effect,
} from '@angular/core';
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
import { RouterModule, Router } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CartSheetComponent } from '../../features/cart/cart-sheet';
import { CartStore } from '../../features/cart/store/cart.store';
import { FormsModule } from '@angular/forms';


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
    FormsModule,
    CartSheetComponent,
  ],
  templateUrl: './header.html',
})
export class Header {
  public categoryService = new CategoryService();

  @ViewChild('cartSheet') cartSheet!: CartSheetComponent;
  private dialog = inject(MatDialog);
  private cartStore = inject(CartStore);
  private router = inject(Router);

  cartItemCount = 0;
  favoritesItemCount = 5;

  categoriesRoot: any[] = [];
  selectedCategory: any | null = null;

  @Output() openCart = new EventEmitter<void>();

  constructor() {
    effect(() => {
      this.cartItemCount = this.cartStore.totalItems();
    });
  }

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.getTreeCategories().subscribe({
      next: (data) => {
        this.categoriesRoot = data.filter((cat) => !cat.parentCategory);
        if (this.categoriesRoot.length > 0) {
          this.selectedCategory = this.categoriesRoot[0];
        }
      },
      error: (error) =>
        console.error('Error al cargar categorías:', error),
    });
  }

  selectCategory(category: any) {
    this.selectedCategory = category;
  }

  openAuthDialog() {
    this.dialog.open(AuthDialog, {
      width: '450px',
      autoFocus: false,
    });
  }

  openCartSheet() {
    this.cartSheet.toggle();
  }

  /* -------------------- BUSCADOR -------------------- */

  searchOpen = false;
  searchQuery = '';
  recentSearches: string[] = [];
  suggestions: string[] = [];

  openSearchOverlay() {
    this.searchOpen = true;
    setTimeout(() => {
      const el = document.querySelector(
        'input[autofocus]'
      ) as HTMLInputElement;
      el?.focus();
    }, 10);
  }

  closeSearchOverlay() {
    this.searchOpen = false;
    this.searchQuery = '';
    this.suggestions = [];
  }

  handleBlur() {
    setTimeout(() => {
      if (!this.searchQuery.trim()) this.closeSearchOverlay();
    }, 150);
  }

  submitSearch() {
    const q = this.searchQuery.trim();
    if (!q) return;

    this.recentSearches = [
      q,
      ...this.recentSearches.filter((i) => i !== q),
    ].slice(0, 8);

    this.router.navigate(['/search'], {
      queryParams: { q },
    });

    this.closeSearchOverlay();
  }

  filterSuggestions() {
    const q = this.searchQuery.toLowerCase();
    this.suggestions =
      q.length < 2
        ? []
        : this.recentSearches.filter((r) =>
            r.toLowerCase().includes(q)
          );
  }

  selectRecent(val: string) {
    this.searchQuery = val;
    this.submitSearch();
  }

  selectSuggestion(val: string) {
    this.searchQuery = val;
    this.submitSearch();
  }
}
