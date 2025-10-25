import { Component, inject, signal } from '@angular/core';
import { Category as CategoryService } from '../categories/category';
import { Category as CategoryModel } from '../../../shared/models/category.model';
import { CategoryCard } from '../../../shared/components/category-card/category-card';

@Component({
  selector: 'app-home',
  imports: [CategoryCard],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  private categoryService = inject(CategoryService);

  public treeCategories = signal<CategoryModel[]>([]);
  public rootCategories = signal<CategoryModel[]>([]);

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
