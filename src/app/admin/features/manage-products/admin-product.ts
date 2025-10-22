import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import type { Product } from '../../../shared/models/product.model';
import { environment } from '../../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class AdminProduct {

  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/products`;

  constructor() { }

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  updateProduct(productId: string, product: Product): Observable<Product> {
    const url = `${this.apiUrl}/${productId}`;
    return this.http.patch<Product>(url, product);
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
