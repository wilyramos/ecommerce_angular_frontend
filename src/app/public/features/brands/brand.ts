//File: frontend/src/app/public/features/brands/brand.ts

import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Brand as BrandModel } from '../../../shared/models/brand.model';
import { environment } from '../../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class BrandService {
  private http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl + '/brands';

  constructor() { }

  getAllBrands() {
    return this.http.get<BrandModel[]>(this.apiUrl);
  }

  getBrandBySlug(slug: string) {
    return this.http.get<BrandModel>(`${this.apiUrl}/slug/${slug}`);
  }

  getAllBrandSlugs() {
    return this.http.get<string[]>(`${this.apiUrl}/slugs`);
  }

}
