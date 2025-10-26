import { Component, Input } from '@angular/core';
import type { Category } from '../../models/category.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-category-card',
  imports: [RouterLink],
  templateUrl: './category-card.html',
  styleUrl: './category-card.css'
})
export class CategoryCard {
  @Input({ required: true }) category!: Category;
  @Input() mode: 'overlay' | 'below' = 'overlay'; // 👈 modo visual

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/images/placeholder-category.png';
  }
}
