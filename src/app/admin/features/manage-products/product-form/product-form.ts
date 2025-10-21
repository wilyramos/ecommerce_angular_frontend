import { Component, Inject, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Product } from '../../../../shared/models/product.model';
import { AdminProductService } from '../admin-product';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './product-form.html',
})
export class ProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(AdminProductService);
  public dialogRef = inject(MatDialogRef<ProductFormComponent>);

  productForm: FormGroup;
  isEditMode = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { product?: Product }) {
    this.isEditMode = !!this.data?.product;

    this.productForm = this.fb.group({
      name: ['', Validators.required],
      slug: ['', Validators.required],
      shortDescription: [''],
      category: ['', Validators.required],
      brand: [''],
      variants: this.fb.array([], Validators.required),
    });
  }

  ngOnInit(): void {
    if (this.isEditMode && this.data.product) {
      this.productForm.patchValue(this.data.product);
      this.data.product.variants.forEach((variant) => this.addVariant(variant));
    } else {
      this.addVariant();
    }
  }

  get variants(): FormArray {
    return this.productForm.get('variants') as FormArray;
  }

  newVariant(variantData?: any): FormGroup {
    return this.fb.group({
      sku: [variantData?.sku || '', Validators.required],
      price: [
        variantData?.price || 0,
        [Validators.required, Validators.min(0)],
      ],
      stock: [
        variantData?.stock || 0,
        [Validators.required, Validators.min(0)],
      ],
    });
  }

  addVariant(variantData?: any): void {
    this.variants.push(this.newVariant(variantData));
  }

  removeVariant(index: number): void {
    this.variants.removeAt(index);
  }

  onSave(): void {
    if (this.productForm.invalid) {
      return;
    }

    const formValue = this.productForm.value;
    const operation = this.isEditMode
      ? this.productService.updateProduct(this.data.product!._id, formValue)
      : this.productService.createProduct(formValue);

    operation.subscribe((savedProduct) => {
      this.dialogRef.close(savedProduct);
    });
  }
}
