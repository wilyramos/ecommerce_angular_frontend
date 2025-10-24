import { Component, Inject, OnInit, inject } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';
import { Category } from '../../../../shared/models/category.model';
import { AdminCategoryService } from '../admin-category';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { CategoryAttribute } from '../../../../shared/models/category.model';

// --- (1) ACTUALIZACIÓN DE LA INTERFAZ ---
interface AttributeFormGroup {
  name: FormControl<string | null>;
  values: FormArray<FormControl<string | null>>;
  isVariant: FormControl<boolean | null>; // Añadido
  isFilter: FormControl<boolean | null>;  // Añadido
}

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule, // Asegúrate de que MatCheckboxModule esté importado
    MatIconModule,
    MatChipsModule,
  ],
  templateUrl: './category-form.html',
})
export class CategoryFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private categoryService = inject(AdminCategoryService);
  private dialogRef = inject(MatDialogRef<CategoryFormComponent>);

  isEditMode = false;
  categories: Category[] = [];

  categoryForm = this.fb.group({
    name: ['', Validators.required],
    slug: [''],
    description: [''],
    parentCategory: [null as string | null],
    attributes: this.fb.array<FormGroup<AttributeFormGroup>>([]),
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data: { category?: Category, allCategories?: Category[] }) {
    this.isEditMode = !!this.data?.category;

    if (this.data.allCategories) {
        this.categories = this.data.allCategories;
    }

    if (this.isEditMode && this.data.category) {
      this.initFormForEdit(this.data.category);
    }
  }

  ngOnInit() {
    if (!this.data.allCategories) {
        this.loadCategories();
    }
  }

  private initFormForEdit(cat: Category): void {
    const parentId = cat.parentCategory || null;

    this.categoryForm.patchValue({
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      parentCategory: parentId,
    });

    if (cat.attributes && cat.attributes.length > 0) {
      cat.attributes.forEach(attr => this.addAttribute(attr));
    }
  }

  get attributes(): FormArray<FormGroup<AttributeFormGroup>> {
    return this.categoryForm.get('attributes') as FormArray<FormGroup<AttributeFormGroup>>;
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (cats) => (this.categories = cats),
      error: (err) => console.error('Error al cargar categorías:', err),
    });
  }

  // --- (2) ACTUALIZACIÓN DEL MÉTODO PARA CREAR ATRIBUTOS ---
  private createAttributeGroup(attr: Partial<CategoryAttribute> = {}): FormGroup<AttributeFormGroup> {
    const valuesArray = this.fb.array<FormControl<string | null>>(
      (attr.values || []).map(v => new FormControl(v, Validators.required))
    );

    return this.fb.group<AttributeFormGroup>({
      name: new FormControl(attr.name || '', Validators.required),
      values: valuesArray,
      isVariant: new FormControl(attr.isVariant || false), // Añadido (default false)
      isFilter: new FormControl(attr.isFilter || false),   // Añadido (default false)
    });
  }

  addAttribute(attr?: Partial<CategoryAttribute>) {
    this.attributes.push(this.createAttributeGroup(attr));
  }

  removeAttribute(index: number) {
    this.attributes.removeAt(index);
  }

  onSave(): void {
    if (this.categoryForm.invalid) return;

    const { name, slug, description, parentCategory, attributes } = this.categoryForm.value;

    // --- (3) ACTUALIZACIÓN DEL PAYLOAD ---
    const formattedAttributes: CategoryAttribute[] = (attributes || [])
        .map(attr => ({
          name: attr.name as string,
          values: (attr.values as string[]).filter(v => !!v),
          isVariant: attr.isVariant as boolean, // Añadido
          isFilter: attr.isFilter as boolean,   // Añadido
        }));

    const payload: Partial<Category> = {
      name: name!,
      slug: slug || undefined,
      description: description || undefined,
      parentCategory: parentCategory || null,
      attributes: formattedAttributes,
    };

    if (this.isEditMode && !payload.slug) {
        delete payload.slug;
    }

    const operation = this.isEditMode
      ? this.categoryService.updateCategory(this.data.category!._id, payload)
      : this.categoryService.createCategory(payload);

    operation.subscribe({
      next: (savedCategory) => this.dialogRef.close(savedCategory),
      error: (err) => console.error('Error al guardar categoría:', err),
    });
  }

  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  addValue(attrIndex: number, event: any): void {
    const input = event.input;
    const value = event.value?.trim();

    if (value) {
      const valuesArray = this.getValuesArray(attrIndex);
      valuesArray.push(new FormControl(value, Validators.required));
    }

    if (input) input.value = '';
  }

  removeValue(attrIndex: number, valueIndex: number): void {
    const valuesArray = this.getValuesArray(attrIndex);
    valuesArray.removeAt(valueIndex);
  }

  getValuesArray(attrIndex: number): FormArray<FormControl<string | null>> {
    return this.attributes.at(attrIndex).get('values') as FormArray<FormControl<string | null>>;
  }
}
