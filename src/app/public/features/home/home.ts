import { Component, inject, signal } from '@angular/core';
import { Category as CategoryService } from '../categories/category';
import { Category as CategoryModel } from '../../../shared/models/category.model';
import { CategoryCard } from '../../../shared/components/category-card/category-card';
import { RouterModule } from '@angular/router'; // <-- import RouterModule

@Component({
  selector: 'app-home',
  standalone: true, // make sure this is a standalone component
  imports: [CategoryCard, RouterModule], // <-- add RouterModule here
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home {
  private categoryService = inject(CategoryService);

  public treeCategories = signal<CategoryModel[]>([]);
  public rootCategories = signal<CategoryModel[]>([]);

  enlaces = [
    { nombre: 'Como realizar un pedido', description: 'Aprende a hacer pedidos en nuestra tienda', url: '/help/how-to-order' },
    { nombre: 'Politicas de devolucion', description: 'Conoce nuestras politicas de devolucion', url: '/help/return-policy' },
    { nombre: 'Metodos de pago', description: 'Descubre los metodos de pago disponibles', url: '/help/payment-methods' },
    { nombre: 'Envios y entregas', description: 'Informacion sobre envios y entregas', url: '/help/shipping-delivery' },
  ];

  ngOnInit() {
    this.loadTreeCategories();
  }

  private loadTreeCategories() {
    this.categoryService.getTreeCategories().subscribe({
      next: (data) => {
        this.treeCategories.set(data);
        const roots = data.filter((cat: CategoryModel) => !cat.parentCategory);
        this.rootCategories.set(roots);
      },
      error: (error) => console.error('Error fetching tree categories:', error)
    });
  }
}
