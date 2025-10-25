import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Category as CategoryModel } from '../../../shared/models/category.model';
import { environment } from '../../../../environments/environment';



@Injectable({
  providedIn: 'root'
})
export class Category {
  private http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl + '/categories';

  constructor() { }

  getAllCategories() {
    console.log('Fetching categories from:', this.apiUrl);
    return this.http.get<CategoryModel[]>(this.apiUrl);
  }

  getTreeCategories() {
    return this.http.get<CategoryModel[]>(`${this.apiUrl}/tree`);
  }
}
