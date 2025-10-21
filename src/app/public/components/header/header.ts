import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { NgIf } from '@angular/common';

import { AuthDialog } from '../../features/auth/auth-dialog/auth-dialog';
import { MatDialog } from '@angular/material/dialog';

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
  ],
  templateUrl: './header.html',
})
export class Header{
  cartItemCount = 3;
  isLoggedIn = false;
  favoritesItemCount = 5;

  private dialog = inject(MatDialog);

  openAuthDialog(): void {
    this.dialog.open(AuthDialog, {
      width: '400px',
      autoFocus: false, // Evita que el primer botón se enfoque automáticamente
    });
  }

  logout() {
    this.isLoggedIn = false;
    console.log('Usuario cerró sesión');
  }
}
