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
import { Category } from '../../../../shared/models/category.model';
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

    // siempre inicia con una variante vacía
    this.addVariant();
  }

  // ========= Getters =========
  get variants(): FormArray {
    return this.form.get('variants') as FormArray;
  }

  getAttributesArray(variantIndex: number): FormArray {
    return this.variants.at(variantIndex).get('attributes') as FormArray;
  }

  getVariantImages(variantIndex: number): FormControl {
    return this.variants.at(variantIndex).get('images') as FormControl;
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
  }

  removeVariant(index: number): void {
    this.variants.removeAt(index);
    this.filesToUpload.delete(index);
  }

  addAttribute(variantIndex: number): void {
    const attributesArray = this.getAttributesArray(variantIndex);
    const attrGroup = this.fb.group({
      key: ['', Validators.required],
      value: ['', Validators.required],
    });
    attributesArray.push(attrGroup);
  }

  removeAttribute(variantIndex: number, attrIndex: number): void {
    this.getAttributesArray(variantIndex).removeAt(attrIndex);
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
        const formValue = this.form.getRawValue();

        const payload: ProductBase = {
          ...formValue,
          variants: formValue.variants.map((variant: any, index: number) => {
            const newFilesCount = this.filesToUpload.get(index)?.length || 0;
            const newUrlsForVariant = uploadedUrls.slice(urlIdx, urlIdx + newFilesCount);
            urlIdx += newFilesCount;

            return {
              ...variant,
              images: [...newUrlsForVariant],
            };
          }),
        };

        return this.productService.createProduct(payload);
      })
    ).subscribe({
      next: (result) => {
        console.log('✅ Producto creado:', result);
        this.dialogRef.close(true);
      },
      error: (err) => console.error('❌ Error al crear producto:', err),
    });
  }

  close(): void {
    this.dialogRef.close(false);
  }
}
