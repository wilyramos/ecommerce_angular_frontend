import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import type { ProductBase, PopulatedProduct } from '../../../shared/models/product.model';
import { environment } from '../../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class AdminProduct {

  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/products`;

  constructor() { }

  getProducts(): Observable<PopulatedProduct[]> {
    return this.http.get<PopulatedProduct[]>(this.apiUrl);
  }

  createProduct(product: ProductBase): Observable<ProductBase> {
    return this.http.post<ProductBase>(this.apiUrl, product);
  }

  updateProduct(productId: string, product: ProductBase): Observable<ProductBase> {
    const url = `${this.apiUrl}/${productId}`;
    return this.http.patch<ProductBase>(url, product);
  }

  deleteProduct(productId: string): Observable<void> {
    const url = `${this.apiUrl}/${productId}`;
    return this.http.delete<void>(url);
  }

  uploadImages(files: File[]): Observable<any> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return this.http.post(this.apiUrl + '/upload-images', formData);
  }
}
