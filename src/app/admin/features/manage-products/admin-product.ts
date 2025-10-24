import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import type { PopulatedProduct } from '../../../shared/models/product.model';
import { environment } from '../../../../environments/environment';

export interface ProductFilterParams {
  page?: number;
  limit?: number;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  attributes?: { key: string; value: string }[];
  search?: string;
  isActive?: boolean;
  sortBy?: 'price' | 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

@Injectable({ providedIn: 'root' })
export class AdminProduct {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/products`;

  getProducts(filters: ProductFilterParams = {}): Observable<PaginatedResponse<PopulatedProduct>> {

    console.log('Filtros enviados al servicio:', filters);
    let params = new HttpParams();

    // Convierte filtros a parámetros de URL
    Object.entries(filters).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') return;

      if (Array.isArray(value)) {
        value.forEach(v => params = params.append(key, v.toString()));
      } else if (typeof value === 'object' && key === 'attributes') {
        (value as any[]).forEach(attr => {
          params = params.append('attributes', JSON.stringify(attr));
        });
      } else {
        params = params.append(key, value.toString());
      }
    });


    return this.http.get<PaginatedResponse<PopulatedProduct>>(`${this.apiUrl}/search`, { params });
  }

  getProductById(id: string): Observable<PopulatedProduct> {
    return this.http.get<PopulatedProduct>(`${this.apiUrl}/${id}`);
  }

  createProduct(product: any) {
    return this.http.post(`${this.apiUrl}`, product);
  }

  updateProduct(productId: string, product: any) {
    return this.http.patch(`${this.apiUrl}/${productId}`, product);
  }

  deleteProduct(productId: string) {
    return this.http.delete(`${this.apiUrl}/${productId}`);
  }

  uploadImages(files: File[]) {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return this.http.post(this.apiUrl + '/upload-images', formData);
  }
}
