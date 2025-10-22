import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Category } from '../../../shared/models/category.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AdminCategoryService {
  private readonly apiUrl = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) {}

  /** Obtener lista plana */
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}`);
  }

  /** Obtener árbol jerárquico */
  getCategoryTree(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/tree`);
  }

  /** Crear */
  createCategory(category: Partial<Category>): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}`, category);
  }

  /** Obtener por ID */
  getCategoryById(id: string): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`);
  }

  /** Actualizar */
  updateCategory(id: string, category: Partial<Category>): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/${id}`, category);
  }

  /** Eliminar (con opción cascade) */
  deleteCategory(id: string, cascade = false): Observable<void> {
    const params = cascade ? '?cascade=true' : '';
    return this.http.delete<void>(`${this.apiUrl}/${id}${params}`);
  }
}
