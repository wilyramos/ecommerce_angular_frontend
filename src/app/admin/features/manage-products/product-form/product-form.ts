import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  ReactiveFormsModule,
  Validators,
  FormControl,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { of, switchMap } from 'rxjs';

import { ProductBase } from '../../../../shared/models/product.model';
import { Category, CategoryAttribute } from '../../../../shared/models/category.model';
import { Brand } from '../../../../shared/models/brand.model';
import { AdminProduct } from '../admin-product';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatInputModule,
    MatDialogModule,
    MatSlideToggleModule,
    MatSnackBarModule,
  ],
  templateUrl: './product-form.html',
})
export class ProductFormComponent implements OnInit {
  form!: FormGroup;
  filesToUpload: Map<number, File[]> = new Map();
  selectedCategory: Category | undefined;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { categories: Category[]; brands: Brand[] },
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ProductFormComponent>,
    private productService: AdminProduct,
    private snackBar: MatSnackBar
  ) { }


  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      shortDescription: [''],
      category: ['', Validators.required],
      brand: [''],
      isActive: [true],
      variants: this.fb.array([]),
    });

    // Agregar una variante inicial
    this.addVariant();

    // Escuchar cambios de categoría para actualizar atributos de todas las variantes
    this.form.get('category')?.valueChanges.subscribe((categoryId) => {
      this.selectedCategory = this.data.categories.find(cat => cat._id === categoryId);
      if (this.selectedCategory) {
        // Llamamos a la función unificada
        this.updateAllVariantsAttributes(this.selectedCategory);
      } else {
        // Limpiar atributos si no hay categoría seleccionada
        this.updateAllVariantsAttributes(undefined);
      }
    });
  }


  // ========= Getters =========
  get variants(): FormArray {
    return this.form.get('variants') as FormArray;
  }

  // Obtenemos el FormArray de atributos de una variante específica
  getAttributesArray(variantIndex: number): FormArray {
    return this.variants.at(variantIndex).get('attributes') as FormArray;
  }

  getVariantImages(variantIndex: number): FormControl {
    return this.variants.at(variantIndex).get('images') as FormControl;
  }

  // Se elimina 'handleCategoryChange' ya que la lógica se centraliza en el valueChanges

  /**
   * Actualiza los atributos de TODAS las variantes basándose en la categoría seleccionada.
   * @param category Categoría seleccionada o undefined.
   */
  updateAllVariantsAttributes(category: Category | undefined): void {
    const attributes = category?.attributes || [];
    this.variants.controls.forEach((variantControl, index) => {
      this.setVariantAttributes(index, attributes);
    });
  }


  /**
   * Rellena el FormArray de atributos para una variante.
   * La **clave** del atributo ahora se llama `key` para coincidir con el Backend DTO.
   * @param variantIndex Índice de la variante a actualizar.
   * @param categoryAttributes Atributos definidos en la categoría.
   */
  private setVariantAttributes(variantIndex: number, categoryAttributes: CategoryAttribute[]): void {
    const attributesArray = this.getAttributesArray(variantIndex);

    // 1. Limpiar el FormArray existente
    while (attributesArray.length !== 0) {
      attributesArray.removeAt(0);
    }

    // 2. Rellenar el FormArray con los atributos de la categoría
    categoryAttributes.forEach(attr => {
      // Creamos un FormGroup para cada atributo
      const attrGroup = this.fb.group({
        // Renombrado de 'name' a 'key'
        key: [{ value: attr.name, disabled: true }],
        value: ['', Validators.required],
        // Mantenemos 'possibleValues' para el template
        possibleValues: [attr.values || []],
      });
      attributesArray.push(attrGroup);
    });
  }


  // ========= Métodos de Variantes =========
  addVariant(): void {
    const variantGroup = this.fb.group({
      sku: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      images: this.fb.control([]),
      attributes: this.fb.array([]),
    });

    this.variants.push(variantGroup);

    // Si ya hay una categoría seleccionada, aplicar sus atributos a la nueva variante
    if (this.selectedCategory) {
      this.setVariantAttributes(this.variants.length - 1, this.selectedCategory.attributes || []);
    }
  }

  removeVariant(index: number): void {
    this.variants.removeAt(index);
    this.filesToUpload.delete(index);
  }

  onFileSelected(event: Event, variantIndex: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const newFiles = Array.from(input.files);
      const currentFiles = this.filesToUpload.get(variantIndex) || [];
      this.filesToUpload.set(variantIndex, [...currentFiles, ...newFiles]);

      const imagesControl = this.getVariantImages(variantIndex);
      const newImageUrls = newFiles.map((file) => URL.createObjectURL(file));
      imagesControl.setValue([...imagesControl.value, ...newImageUrls]);

      input.value = '';
    }
  }

  removeImage(variantIndex: number, imageIndex: number, imageUrl: string): void {
    const imagesControl = this.getVariantImages(variantIndex);
    const currentImages = imagesControl.value as string[];
    currentImages.splice(imageIndex, 1);
    imagesControl.setValue(currentImages);

    const filesForVariant = this.filesToUpload.get(variantIndex) || [];
    if (imageUrl.startsWith('blob:') && filesForVariant.length > imageIndex) {
      filesForVariant.splice(imageIndex, 1);
      this.filesToUpload.set(variantIndex, filesForVariant);
    }
  }

  // ========= Guardar producto =========
  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snackBar.open('Por favor completa todos los campos obligatorios.', 'Cerrar', {
        duration: 3000,
        panelClass: ['bg-red-600', 'text-white'],
      });
      return;
    }

    const allFilesToUpload: File[] = Array.from(this.filesToUpload.values()).flat();

    const upload$ = allFilesToUpload.length > 0
      ? this.productService.uploadImages(allFilesToUpload)
      : of({ urls: [] });

    upload$.pipe(
      switchMap((uploadResult: any) => {
        const uploadedUrls = Array.isArray(uploadResult)
          ? uploadResult.map((file: any) => file.url)
          : uploadResult.urls ?? [];

        let urlIdx = 0;
        // Usar getRawValue es CRUCIAL para obtener los campos deshabilitados (como 'key')
        const formValue = this.form.getRawValue();

        const payload: ProductBase = {
          ...formValue,
          variants: formValue.variants.map((variant: any, index: number) => {
            const newFilesCount = this.filesToUpload.get(index)?.length || 0;
            const newUrlsForVariant = uploadedUrls.slice(urlIdx, urlIdx + newFilesCount);
            urlIdx += newFilesCount;

            // El backend espera 'key' y 'value'. Como usamos getRawValue, 'key' ya está presente.
            const attributesPayload = variant.attributes.map((attr: any) => ({
              key: attr.key, // Aquí usamos 'key'
              value: attr.value,
            }));

            return {
              ...variant,
              images: [...newUrlsForVariant],
              attributes: attributesPayload,
            };
          }),
        };

        return this.productService.createProduct(payload);
      })
    ).subscribe({
      next: (result) => {
        this.snackBar.open('✅ Producto creado correctamente.', 'Cerrar', {
          duration: 3000,
          panelClass: ['bg-green-600', 'text-white'],
        });
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.snackBar.open('❌ Error al crear producto. Revisa la consola.', 'Cerrar', {
          duration: 3000,
          panelClass: ['bg-red-600', 'text-white'],
        });
        console.error('❌ Error al crear producto:', err);
      },
    });
  }

  close(): void {
    this.dialogRef.close(false);
  }
}
