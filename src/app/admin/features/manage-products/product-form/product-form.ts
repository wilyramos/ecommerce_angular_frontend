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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'; // ✅ import snackbar
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { Product } from '../../../../shared/models/product.model';
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
    MatSnackBarModule, // ✅ módulo agregado
  ],
  templateUrl: './product-form.html',
})
export class ProductFormComponent implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  filesToUpload: Map<number, File[]> = new Map();

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { product?: Product; categories: Category[]; brands: Brand[] },
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ProductFormComponent>,
    private productService: AdminProduct,
    private snackBar: MatSnackBar // ✅ inyección del snackbar
  ) { }

  ngOnInit(): void {
    this.isEditMode = !!this.data.product;

    this.form = this.fb.group({
      name: [this.data.product?.name || '', Validators.required],
      shortDescription: [this.data.product?.shortDescription || ''],
      category: [this.data.product?.category || '', Validators.required],
      brand: [this.data.product?.brand || ''],
      isActive: [this.data.product?.isActive ?? true],
      variants: this.fb.array([]),
    });

    if (this.isEditMode && this.data.product?.variants?.length) {
      this.data.product.variants.forEach((variant) => this.addVariant(variant));
    } else {
      this.addVariant();
    }
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
  addVariant(variant?: any): void {
    const variantGroup = this.fb.group({
      sku: [variant?.sku || '', Validators.required],
      price: [variant?.price || 0, [Validators.required, Validators.min(0)]],
      stock: [variant?.stock || 0, [Validators.required, Validators.min(0)]],
      images: this.fb.control(variant?.images || []),
      attributes: this.fb.array([]),
    });

    this.variants.push(variantGroup);
    const currentIndex = this.variants.length - 1;

    if (variant?.attributes?.length) {
      variant.attributes.forEach((attr: any) =>
        this.addAttribute(currentIndex, attr)
      );
    }
  }

  removeVariant(index: number): void {
    this.variants.removeAt(index);
    this.filesToUpload.delete(index);
  }

  addAttribute(variantIndex: number, attribute?: any): void {
    const attributesArray = this.getAttributesArray(variantIndex);
    const attrGroup = this.fb.group({
      key: [attribute?.key || '', Validators.required],
      value: [attribute?.value || '', Validators.required],
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

    if (imageUrl.startsWith('blob:')) {
      const filesForVariant = this.filesToUpload.get(variantIndex) || [];
      const fileIndexToRemove = currentImages.filter(url => url.startsWith('blob:')).indexOf(imageUrl);

      if (fileIndexToRemove !== -1 && filesForVariant.length > fileIndexToRemove) {
        filesForVariant.splice(fileIndexToRemove, 1);
        this.filesToUpload.set(variantIndex, filesForVariant);
      }
    }

    currentImages.splice(imageIndex, 1);
    imagesControl.setValue(currentImages);
  }

  // ========= Lógica de Guardado =========
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
        // Adaptamos la respuesta del backend
        const uploadedUrls = Array.isArray(uploadResult)
          ? uploadResult.map((file: any) => file.url)
          : uploadResult.urls ?? [];

        let urlIdx = 0;

        const formValue = this.form.getRawValue();
        const payload: Product = {
          ...formValue,
          variants: formValue.variants.map((variant: any, index: number) => {
            const newFilesCount = this.filesToUpload.get(index)?.length || 0;
            const newUrlsForVariant = uploadedUrls.slice(urlIdx, urlIdx + newFilesCount);
            urlIdx += newFilesCount;

            const existingUrls = variant.images.filter(
              (url: string) => !url.startsWith('blob:')
            );

            return {
              ...variant,
              images: [...existingUrls, ...newUrlsForVariant],
            };
          }),
        };

        if (this.isEditMode && this.data.product?._id) {
          return this.productService.updateProduct(this.data.product._id, payload);
        } else {
          return this.productService.createProduct(payload);
        }
      })
    ).subscribe({
      next: (result) => {
        console.log(this.isEditMode ? '✅ Producto actualizado:' : '✅ Producto creado:', result);
        this.dialogRef.close(true);
      },
      error: (err) => console.error('❌ Error en el proceso de guardado:', err),
    });

  }

  close(): void {
    this.dialogRef.close(false);
  }
}
