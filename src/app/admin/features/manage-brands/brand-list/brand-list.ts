import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { AdminBrandService } from '../admin-brand';
import { Brand } from '../../../../shared/models/brand.model';
import { BrandFormComponent } from '../brand-form/brand-form';

@Component({
  selector: 'app-brand-list',
  standalone: true, // Asegúrate de que es standalone
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './brand-list.html',
})
export class BrandListComponent {
  private brandService = inject(AdminBrandService);
  private dialog = inject(MatDialog);
  public brands = signal<Brand[]>([]);

  ngOnInit() {
    this.loadBrands();
  }

  loadBrands() {
    this.brandService.getAllBrands().subscribe((brands) => {
      this.brands.set(brands);
    });
  }

  openBrandDialog(brand?: Brand) {
    const dialogRef = this.dialog.open(BrandFormComponent, {
      width: '500px',
      data: { brand }, // Estructura consistente
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadBrands();
      }
    });
  }

  deleteBrand(brandId: string) {
    if (confirm('¿Estás seguro de que querés eliminar esta marca?')) {
      this.brandService.deleteBrand(brandId).subscribe(() => {
        this.loadBrands();
      });
    }
  }
}
