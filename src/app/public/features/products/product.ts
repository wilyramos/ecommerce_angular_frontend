import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Product } from '../../../shared/models/product.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/products`;

  // Datos simulados para desarrollo
  private mockProducts: Product[] = [
    {
      _id: '1', name: 'Polo Moderno Oversize', slug: 'polo-moderno-oversize',
      shortDescription: 'Un polo cómodo y con estilo para cualquier ocasión.',
      variants: [{ sku: 'P-001-BLK', price: 35.50, stock: 50, attributes: [{key: 'Color', value: 'Negro'}, {key: 'Talla', value: 'M'}], images: ['https://placehold.co/600x800/000000/FFFFFF/?text=Polo1', 'https://placehold.co/600x800/333333/FFFFFF/?text=Polo2'] }],
      category: { name: 'Ropa' }, brand: { name: 'Balenciaga' }, isActive: true, createdAt: '', updatedAt: ''
    },
    {
      _id: '2', name: 'Zapatillas Urbanas Blancas', slug: 'zapatillas-urbanas-blancas',
      shortDescription: 'Zapatillas versátiles para un look casual y moderno.',
      variants: [{ sku: 'Z-002-WH', price: 125.00, stock: 30, attributes: [{key: 'Color', value: 'Blanco'}, {key: 'Talla', value: '42'}], images: ['https://placehold.co/600x800/FFFFFF/000000/?text=Zapa1', 'https://placehold.co/600x800/EEEEEE/000000/?text=Zapa2'] }],
      category: { name: 'Calzado' }, brand: { name: 'Balenciaga' }, isActive: true, createdAt: '', updatedAt: ''
    },
    // Agregá más productos simulados aquí
  ];

  // Obtiene todos los productos
  getProducts(): Observable<Product[]> {
    // return this.http.get<Product[]>(this.apiUrl); // Descomentá para usar la API real
    return of(this.mockProducts); // Usamos datos simulados por ahora
  }

  // Obtiene un producto por su slug
  getProductBySlug(slug: string): Observable<Product | undefined> {
    // const url = `${this.apiUrl}/slug/${slug}`;
    // return this.http.get<Product>(url); // Descomentá para usar la API real
    return of(this.mockProducts.find(p => p.slug === slug)); // Usamos datos simulados
  }
}
