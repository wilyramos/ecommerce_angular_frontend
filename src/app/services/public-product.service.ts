import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import type { PopulatedProduct } from '../shared/models/product.model';
import { environment } from '../../environments/environment';

export interface PublicProductFilterParams {
  page?: number;
  limit?: number;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  attributes?: { key: string; value: string }[];
  search?: string;
  sortBy?: 'price' | 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// Tomar el PublicProductFilterParams y cambiar 'category' por 'categorias' como array
export interface PublicProductCategoryFilterParams {
  page?: number;
  limit?: number;
  categorias?: string[];
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  attributes?: { key: string; value: string }[];
  search?: string;
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
export class PublicProductService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/products`;

  /**
   * Obtener productos visibles al público con filtros
   */
  getProducts(filters: PublicProductFilterParams = {}): Observable<PaginatedResponse<PopulatedProduct>> {
    let params = new HttpParams();

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

  /**
   * Obtener detalle de producto por ID o slug
   */
  getProductByIdOrSlug(idOrSlug: string): Observable<PopulatedProduct> {
    // Si el valor parece un ObjectId (24 caracteres hex), usamos /:id
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);
    const url = isObjectId
      ? `${this.apiUrl}/${idOrSlug}`
      : `${this.apiUrl}/slug/${idOrSlug}`;
    return this.http.get<PopulatedProduct>(url);
  }

  /**
   * Obtener productos relacionados (misma categoría, marca, etc.)
   */
  getRelatedProducts(productId: string): Observable<PopulatedProduct[]> {
    return this.http.get<PopulatedProduct[]>(`${this.apiUrl}/${productId}/related`);
  }

  // Get product categories slug
  findProductsByCategorySlug(
    slug: string,
    params: PublicProductCategoryFilterParams = {}
  ): Observable<PaginatedResponse<PopulatedProduct>> {
    let httpParams = new HttpParams();

    // Paginación
    httpParams = httpParams.set('page', (params.page || 1).toString());
    httpParams = httpParams.set('limit', (params.limit || 12).toString());

    // Categorías
    if (params.categorias?.length) {
      params.categorias.forEach(cat => {
        httpParams = httpParams.append('categorias', cat);
      });
    }

    // Marca
    if (params.brand) httpParams = httpParams.set('brand', params.brand);

    // Rango de precios
    if (params.minPrice !== undefined) httpParams = httpParams.set('minPrice', params.minPrice.toString());
    if (params.maxPrice !== undefined) httpParams = httpParams.set('maxPrice', params.maxPrice.toString());

    // Tags
    if (params.tags?.length) {
      params.tags.forEach(tag => {
        httpParams = httpParams.append('tags', tag);
      });
    }

    // Attributes
    if (params.attributes?.length) {
      params.attributes.forEach(attr => {
        httpParams = httpParams.append('attributes', JSON.stringify(attr));
      });
    }

    // Search y ordenamiento
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
    if (params.sortOrder) httpParams = httpParams.set('sortOrder', params.sortOrder);

    console.log('Fetching a la url con params:', `${this.apiUrl}/by-category/${slug}`, httpParams.toString());

    return this.http.get<PaginatedResponse<PopulatedProduct>>(
      `${this.apiUrl}/by-category/${slug}`,
      { params: httpParams }
    );
  }

}
