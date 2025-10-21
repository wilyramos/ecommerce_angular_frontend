import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Brand } from '../../../shared/models/brand.model'; // Cambiado a Brand
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AdminBrandService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/brands`;

  // OBTENER TODAS
  getAllBrands(): Observable<Brand[]> {
    return this.http.get<Brand[]>(this.apiUrl);
  }

  // CREAR
  createBrand(brand: Partial<Brand>): Observable<Brand> {
    return this.http.post<Brand>(this.apiUrl, brand);
  }

  // ACTUALIZAR (usando PUT como en tu backend)
  updateBrand(id: string, brand: Partial<Brand>): Observable<Brand> {
    return this.http.put<Brand>(`${this.apiUrl}/${id}`, brand);
  }

  // ELIMINAR
  deleteBrand(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
