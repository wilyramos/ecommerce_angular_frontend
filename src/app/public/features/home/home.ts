import { Component, inject, signal } from '@angular/core';
import { Category as CategoryService } from '../categories/category';
import { Category as CategoryModel} from '../../../shared/models/category.model';
import { CategoryCard } from '../../../shared/components/category-card/category-card';

@Component({
  selector: 'app-home',
  imports: [CategoryCard],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {

  private categoryService = inject(CategoryService);
  public categories = signal<CategoryModel[]>([]);

  ngOnInit() {
    this.fetchCategories();
  }

  private fetchCategories() {
    this.categoryService.getAllCategories().subscribe({
      next: (data) => this.categories.set(data),
      error: (error) => console.error('Error fetching categories:', error)
    });
  }
}
