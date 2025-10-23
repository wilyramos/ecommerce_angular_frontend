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

// Definición de la estructura del formulario de Atributo
interface AttributeFormGroup {
  name: FormControl<string | null>;
  // values es un FormArray de FormControl<string> para manejar los chips
  values: FormArray<FormControl<string | null>>;
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
    MatCheckboxModule,
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
  // Usamos Category[] como tipo para las categorías a seleccionar como padre
  categories: Category[] = [];

  // Definición de todo el formulario
  categoryForm = this.fb.group({
    name: ['', Validators.required],
    slug: [''], // El slug debería generarse/manejarse en el backend, pero lo dejamos opcional si fuera necesario editarlo
    description: [''], // Agregamos la descripción
    parentCategory: [null as string | null],
    attributes: this.fb.array<FormGroup<AttributeFormGroup>>([]),
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data: { category?: Category, allCategories?: Category[] }) {
    this.isEditMode = !!this.data?.category;

    // Usar la lista de categorías del componente padre (si se pasó)
    if (this.data.allCategories) {
        this.categories = this.data.allCategories;
    }

    if (this.isEditMode && this.data.category) {
      this.initFormForEdit(this.data.category);
    }
  }

  ngOnInit() {
    // Si no se pasaron las categorías desde el padre, cargarlas aquí.
    if (!this.data.allCategories) {
        this.loadCategories();
    }
  }

  /**
   * Inicializa el formulario en modo de edición con los datos existentes.
   */
  private initFormForEdit(cat: Category): void {
    // El parentCategory es un string (ObjectId) o null en el modelo del frontend
    const parentId = cat.parentCategory || null;

    this.categoryForm.patchValue({
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      parentCategory: parentId,
    });

    // Inicializar el FormArray de atributos
    if (cat.attributes && cat.attributes.length > 0) {
      cat.attributes.forEach(attr => this.addAttribute(attr));
    }
  }


  /** === GETTERS === **/
  get attributes(): FormArray<FormGroup<AttributeFormGroup>> {
    return this.categoryForm.get('attributes') as FormArray<FormGroup<AttributeFormGroup>>;
  }

  /** === Cargar categorías padre (solo si no se cargaron antes) === **/
  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (cats) => (this.categories = cats),
      error: (err) => console.error('Error al cargar categorías:', err),
    });
  }

  /** === Crear un FormGroup para un nuevo atributo === **/
  private createAttributeGroup(attr: Partial<CategoryAttribute> = {}): FormGroup<AttributeFormGroup> {
    const valuesArray = this.fb.array<FormControl<string | null>>(
      (attr.values || []).map(v => new FormControl(v, Validators.required))
    );

    return this.fb.group<AttributeFormGroup>({
      name: new FormControl(attr.name || '', Validators.required),
      // Mongoose no tiene 'required', así que quitamos ese campo
      values: valuesArray,
    });
  }

  /** === Agregar un nuevo atributo al FormArray === **/
  addAttribute(attr?: Partial<CategoryAttribute>) {
    this.attributes.push(this.createAttributeGroup(attr));
  }


  /** === Eliminar atributo === **/
  removeAttribute(index: number) {
    this.attributes.removeAt(index);
  }

  /** === Guardar o actualizar categoría === **/
  onSave(): void {
    // Quitamos los checks de required en atributos ya que no está en el backend
    if (this.categoryForm.invalid) return;

    const { name, slug, description, parentCategory, attributes } = this.categoryForm.value;

    // Formateamos los atributos a la estructura esperada por el backend (name, values: string[])
    const formattedAttributes: CategoryAttribute[] = (attributes || [])
        .map(attr => ({
          // No necesitamos el _id si estamos creando o actualizando, el backend lo maneja.
          name: attr.name as string,
          // Los valores vienen como un FormArray<FormControl<string>>, extraemos los values.
          values: (attr.values as string[]).filter(v => !!v),
        }));

    const payload: Partial<Category> = {
      name: name!,
      slug: slug || undefined, // Mongoose genera el slug, si no se proporciona, no lo enviamos
      description: description || undefined,
      parentCategory: parentCategory || null,
      attributes: formattedAttributes,
    };

    // Si estamos editando y el slug es null o vacío, lo eliminamos para que el backend lo ignore
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

  /** === Lógica para CHIPS (valores de atributo) === **/

  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  addValue(attrIndex: number, event: any): void {
    const input = event.input;
    const value = event.value?.trim();

    if (value) {
      const valuesArray = this.getValuesArray(attrIndex);
      // Agregamos un nuevo FormControl al FormArray de valores
      valuesArray.push(new FormControl(value, Validators.required));
    }

    if (input) input.value = '';
  }

  removeValue(attrIndex: number, valueIndex: number): void {
    const valuesArray = this.getValuesArray(attrIndex);
    valuesArray.removeAt(valueIndex);
  }

  // Helper para obtener el FormArray de valores de un atributo
  getValuesArray(attrIndex: number): FormArray<FormControl<string | null>> {
    return this.attributes.at(attrIndex).get('values') as FormArray<FormControl<string | null>>;
  }

}
