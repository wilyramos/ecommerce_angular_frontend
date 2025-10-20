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

}
