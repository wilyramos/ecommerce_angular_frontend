import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Product } from '../../../shared/models/product.model';

@Injectable({
  providedIn: 'root',
})
export class AdminProductService {
  // Datos simulados. Más adelante, esto se conectará a tu API de NestJS.
  private mockProducts: Product[] = [
    {
      _id: 'prod_1',
      name: 'Polo Moderno Negro',
      slug: 'polo-moderno-negro',
      variants: [
        {
          sku: 'P-001-BLK',
          price: 29.99,
          stock: 50,
          attributes: [
            { key: 'Color', value: 'Negro' },
            { key: 'Talla', value: 'M' },
          ],
          images: ['https://picsum.photos/200/300'],
        },
      ],
      category: { _id: 'cat_1', name: 'Ropa', image: '', slug: '' },
      brand: { _id: 'brand_1', name: 'Balenciaga' },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: 'prod_2',
      name: 'Zapatillas Urbanas',
      slug: 'zapatillas-urbanas',
      variants: [
        {
          sku: 'Z-002-WH',
          price: 120.0,
          stock: 30,
          attributes: [
            { key: 'Color', value: 'Blanco' },
            { key: 'Talla', value: '42' },
          ],
          images: ['https://picsum.photos/200'],
        },
      ],
      category: { _id: 'cat_2', name: 'Calzado', image: '', slug: '' },
      brand: { _id: 'brand_1', name: 'Balenciaga' },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  constructor() {} // Más adelante: private http = inject(HttpClient);

  // MÉTODOS CRUD
  getProducts(): Observable<Product[]> {
    return of(this.mockProducts);
  }

  getProductById(id: string): Observable<Product | undefined> {
    return of(this.mockProducts.find((p) => p._id === id));
  }

  createProduct(productData: any): Observable<Product> {
    console.log('Creando producto:', productData);
    const newProduct: Product = {
      _id: `prod_${Date.now()}`,
      ...productData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.mockProducts.push(newProduct);
    return of(newProduct);
  }

  updateProduct(id: string, productData: any): Observable<Product> {
    console.log(`Actualizando producto ${id}:`, productData);
    const index = this.mockProducts.findIndex((p) => p._id === id);
    if (index > -1) {
      this.mockProducts[index] = { ...this.mockProducts[index], ...productData };
      return of(this.mockProducts[index]);
    }
    return of(productData);
  }

  deleteProduct(id: string): Observable<{ message: string }> {
    console.log(`Eliminando producto ${id}`);
    this.mockProducts = this.mockProducts.filter((p) => p._id !== id);
    return of({ message: 'Producto eliminado' });
  }
}
