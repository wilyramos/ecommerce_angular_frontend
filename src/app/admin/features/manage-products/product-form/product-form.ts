import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';

import { Product } from '../../../../shared/models/product.model';
import { Category } from '../../../../shared/models/category.model';
import { Brand } from '../../../../shared/models/brand.model';
import { AdminProduct } from '../admin-product';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';



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
    MatCheckboxModule,
    MatSlideToggleModule,
  ],
  templateUrl: './product-form.html',
})
export class ProductFormComponent implements OnInit {
  form!: FormGroup;
  isEditMode = false;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { product?: Product; categories: Category[]; brands: Brand[] },
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ProductFormComponent>,
    private productService: AdminProduct
  ) { }

  ngOnInit(): void {
    this.isEditMode = !!this.data.product;

    // ======= Inicializa el formulario principal =======
    this.form = this.fb.group({
      name: [this.data.product?.name || '', Validators.required],
      slug: [this.data.product?.slug || '', Validators.required],
      shortDescription: [this.data.product?.shortDescription || ''],
      longDescription: [this.data.product?.longDescription || ''],
      category: [this.data.product?.category || '', Validators.required],
      brand: [this.data.product?.brand || ''],
      isActive: [this.data.product?.isActive ?? true],
      tags: [this.data.product?.tags?.join(', ') || ''],
      variants: this.fb.array([]),
    });

    // ======= Inicializa variantes =======
    if (this.isEditMode && this.data.product?.variants?.length) {
      this.data.product.variants.forEach((variant) => this.addVariant(variant));
    } else {
      this.addVariant(); // al menos una por defecto
    }
  }

  // ========= Getters =========
  get variants(): FormArray {
    return this.form.get('variants') as FormArray;
  }

  // ========= Métodos de Variantes =========
  addVariant(variant?: any) {
    const variantGroup = this.fb.group({
      sku: [variant?.sku || '', Validators.required],
      price: [variant?.price || 0, [Validators.required, Validators.min(0)]],
      salePrice: [variant?.salePrice || 0],
      stock: [variant?.stock || 0, [Validators.required, Validators.min(0)]],
      images: [variant?.images?.join(', ') || ''],
      attributes: this.fb.array([]),
    });

    // ✅ Primero agregamos la variante al FormArray
    this.variants.push(variantGroup);

    // ✅ Luego agregamos los atributos (ya existe el índice)
    const currentIndex = this.variants.length - 1;
    if (variant?.attributes?.length) {
      variant.attributes.forEach((attr: any) =>
        this.addAttribute(currentIndex, attr)
      );
    }
  }

  removeVariant(index: number) {
    this.variants.removeAt(index);
  }

  // ========= Métodos de Atributos =========
  getAttributesArray(variantIndex: number): FormArray {
    return this.variants.at(variantIndex).get('attributes') as FormArray;
  }

  addAttribute(variantIndex: number, attribute?: any) {
    const attributesArray = this.getAttributesArray(variantIndex);
    const attrGroup = this.fb.group({
      key: [attribute?.key || '', Validators.required],
      value: [attribute?.value || '', Validators.required],
    });
    attributesArray.push(attrGroup);
  }

  removeAttribute(variantIndex: number, attrIndex: number) {
    this.getAttributesArray(variantIndex).removeAt(attrIndex);
  }

  // ========= Guardar =========
  onSave() {
    if (this.form.invalid) return;

    const formValue = this.form.value;

    // Prepara el payload compatible con el backend
    const payload: Product = {
      name: formValue.name,
      slug: formValue.slug,
      shortDescription: formValue.shortDescription || '',
      longDescription: formValue.longDescription || '',
      category: formValue.category,
      brand: formValue.brand || undefined,
      isActive: formValue.isActive,
      tags: formValue.tags
        ? formValue.tags.split(',').map((t: string) => t.trim())
        : [],
      variants: formValue.variants.map((v: any) => ({
        sku: v.sku,
        price: +v.price,
        salePrice: v.salePrice ? +v.salePrice : undefined,
        stock: +v.stock,
        images: v.images
          ? v.images.split(',').map((img: string) => img.trim())
          : [],
        attributes: v.attributes.map((attr: any) => ({
          key: attr.key,
          value: attr.value,
        })),
      })),
    };

    if (this.isEditMode && this.data.product?._id) {
      this.productService.updateProduct(this.data.product._id, payload).subscribe({
        next: (updated) => {
          console.log('✅ Producto actualizado:', updated);
          this.dialogRef.close(true);
        },
        error: (err) => console.error('❌ Error al actualizar producto:', err),
      });
    } else {
      this.productService.createProduct(payload).subscribe({
        next: (created) => {
          console.log('✅ Producto creado:', created);
          this.dialogRef.close(true);
        },
        error: (err) => console.error('❌ Error al crear producto:', err),
      });
    }
  }

  close() {
    this.dialogRef.close(false);
  }
}
