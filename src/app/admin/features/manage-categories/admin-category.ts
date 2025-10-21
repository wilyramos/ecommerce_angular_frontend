//File: frontend/src/app/admin/features/manage-categories/admin-category.ts

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Category } from '../../../shared/models/category.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class AdminCategoryService {

  private readonly apiUrl = environment.apiUrl;

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }

  constructor(private http: HttpClient) {} // Más adelante, inyectarás HttpClient

  createCategory(category: Partial<Category>): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/categories`, category);
  }

  getCategoryById(id: string): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/categories/${id}`);
  }

  updateCategory(id: string, category: Partial<Category>): Observable<Category> {
  return this.http.put<Category>(`${this.apiUrl}/categories/${id}`, category);
}


  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/categories/${id}`);
  }


}
