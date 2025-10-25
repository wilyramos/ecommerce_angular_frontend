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

  /** Obtener lista plana de todas las categorías */
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}`);
  }

  /** Obtener el árbol jerárquico completo de categorías */
  getCategoryTree(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/tree`);
  }

  /** Crear una nueva categoría */
  createCategory(category: Partial<Category>): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}`, category);
  }

  /** Obtener una categoría por su ID */
  getCategoryById(id: string): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`);
  }

  /** Actualizar una categoría existente */
  updateCategory(id: string, category: Partial<Category>): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/${id}`, category);
  }

  /** Eliminar una categoría por su ID */
  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /** Subir imagen para una categoría */
  uploadCategoryImage(files: File[]) {
    const formData = new FormData();
    files.forEach(file => formData.append('file', file));
    return this.http.post<any>(`${this.apiUrl}/upload-image`, formData);
  }
}
