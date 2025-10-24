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

// Modelos y Servicios
import { ProductBase, type PopulatedProduct } from '../../../../shared/models/product.model';
import { Category, CategoryAttribute } from '../../../../shared/models/category.model';
import { Brand } from '../../../../shared/models/brand.model';
import { AdminProduct } from '../admin-product';

// --- NUEVOS MÓDULOS DE MATERIAL ---
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


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
    MatCardModule,
    MatExpansionModule,
    MatDividerModule,
    // --- MÓDULOS AÑADIDOS ---
    MatTooltipModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './product-form.html',
})
export class ProductFormComponent implements OnInit {
  form!: FormGroup;
  filesToUpload: Map<number, File[]> = new Map();
  selectedCategory: Category | undefined;
  isSaving = false;
  isEditMode = false;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      categories: Category[];
      brands: Brand[];
      product?: PopulatedProduct
    },
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ProductFormComponent>,
    private productService: AdminProduct,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    console.log('Datos recibidos en ProductFormComponent:', this.data);
    this.form = this.fb.group({
      name: ['', Validators.required],
      shortDescription: [''],
      category: ['', Validators.required],
      brand: [''],
      isActive: [true],
      filterAttributes: this.fb.array([]),
      variants: this.fb.array([]),
    });

    this.addVariant();

    this.form.get('category')?.valueChanges.subscribe((categoryId) => {
      this.selectedCategory = this.data.categories.find(
        (cat) => cat._id === categoryId
      );
      this.updateAllVariantsAttributes(this.selectedCategory);
      this.setFilterAttributes(this.selectedCategory);
    });

    if (this.data.product) {
      this.isEditMode = true;
      this.patchFormForEdit(this.data.product);
    }
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
        key: [{ value: attr.name, disabled: true }],
        value: [''],  // ahora es opcional
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

      const formValue = this.form.getRawValue();
      let urlIdx = 0;

      const payload: ProductBase = {
        ...formValue,
        filterAttributes: this.filterValidAttributes(formValue.filterAttributes),

        variants: (formValue.variants || []).map((variant: any, index: number) => {
          const newFilesCount = this.filesToUpload.get(index)?.length || 0;
          const newUrlsForVariant = uploadedUrls.slice(urlIdx, urlIdx + newFilesCount);
          urlIdx += newFilesCount;

          // 🔹 Tomar solo URLs válidas (strings que comiencen con http o https)
          const existingUrls = (variant.images || []).filter(
            (url: string) => typeof url === 'string' && /^https?:\/\//.test(url)
          );

          return {
            ...variant,
            images: [...existingUrls, ...newUrlsForVariant],
            attributes: this.filterValidAttributes(variant.attributes),
          };
        }),
      };

      return this.isEditMode && this.data.product?._id
        ? this.productService.updateProduct(this.data.product._id, payload)
        : this.productService.createProduct(payload);
    })
  ).subscribe({
    next: () => {
      this.snackBar.open(
        this.isEditMode ? 'Producto actualizado correctamente.' : 'Producto creado correctamente.',
        'Cerrar',
        { duration: 3000, panelClass: ['bg-green-600', 'text-white'] }
      );
      this.dialogRef.close(true);
    },
    error: (err) => {
      this.snackBar.open('Error al crear producto. Revisa la consola.', 'Cerrar', {
        duration: 3000,
        panelClass: ['bg-red-600', 'text-white'],
      });
      console.error('Error al crear producto:', err);
    },
  });
}


  close(): void {
    this.dialogRef.close(false);
  }

  get filterAttributes(): FormArray {
    return this.form.get('filterAttributes') as FormArray;
  }

  private setFilterAttributes(category: Category | undefined): void {
    const attributes = category?.attributes?.filter(attr => attr.isFilter) || [];
    const filterAttributesArray = this.filterAttributes;

    // clear existing
    while (filterAttributesArray.length !== 0) {
      filterAttributesArray.removeAt(0);
    }

    // add new
    attributes.forEach(attr => {
      const attrGroup = this.fb.group({
        key: [{ value: attr.name, disabled: true }],
        value: [''],
        possibleValues: [attr.values || []],
      });
      filterAttributesArray.push(attrGroup);
    });
  }


  private filterValidAttributes(attrs: any[]): any[] {
    return (attrs || [])
      .filter(attr => attr && typeof attr.value === 'string' && attr.value.trim() !== '')
      .map(attr => ({
        key: attr.key,
        value: attr.value,
      }));
  }

  private patchFormForEdit(product: PopulatedProduct): void {
    this.form.patchValue({
      name: product.name,
      shortDescription: product.shortDescription,
      category: product.category?._id || '',
      brand: product.brand?._id || '',
      isActive: product.isActive,
    });

    this.selectedCategory = this.data.categories.find(cat => cat._id === product.category?._id);
    this.setFilterAttributes(this.selectedCategory);

    const filterAttrsArray = this.filterAttributes;
    while (filterAttrsArray.length !== 0) filterAttrsArray.removeAt(0);
    (product.filterAttributes || []).forEach(attr => {
      const group = this.fb.group({
        key: [{ value: attr.key, disabled: true }],
        value: [attr.value],
        possibleValues: [this.selectedCategory?.attributes?.find(a => a.name === attr.key)?.values || []],
      });
      filterAttrsArray.push(group);
    });

    // 🔹 Variantes
    const variantsArray = this.variants;
    while (variantsArray.length !== 0) variantsArray.removeAt(0);
    (product.variants || []).forEach(variant => {
      const variantGroup = this.fb.group({
        sku: [variant.sku, Validators.required],
        price: [variant.price, [Validators.required, Validators.min(0)]],
        stock: [variant.stock, [Validators.required, Validators.min(0)]],
        images: this.fb.control(variant.images || []),
        attributes: this.fb.array([]),
      });

      const attributesArray = variantGroup.get('attributes') as FormArray;
      (variant.attributes || []).forEach(attr => {
        const catAttr = this.selectedCategory?.attributes?.find(a => a.name === attr.key);
        attributesArray.push(this.fb.group({
          key: [{ value: attr.key, disabled: true }],
          value: [attr.value],
          possibleValues: [catAttr?.values || []],
        }));
      });

      variantsArray.push(variantGroup);
    });
  }

}
