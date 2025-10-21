import { Component, Inject, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Brand } from '../../../../shared/models/brand.model'; // Usar el modelo correcto
import { AdminBrandService } from '../admin-brand';

@Component({
  selector: 'app-brand-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './brand-form.html',
})
export class BrandFormComponent {
  private fb = inject(FormBuilder);
  private brandService = inject(AdminBrandService);
  public dialogRef = inject(MatDialogRef<BrandFormComponent>);

  isEditMode = false;
  brandForm = this.fb.group({
    name: ['', Validators.required],
    logo: ['', Validators.required],
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data: { brand?: Brand }) {
    this.isEditMode = !!this.data?.brand;
    if (this.isEditMode) {
      this.brandForm.patchValue(this.data.brand!);
    }
  }

  onSave(): void {
    if (this.brandForm.invalid) {
      return;
    }

    const formValue = this.brandForm.value as Partial<Brand>;
    const operation = this.isEditMode
      ? this.brandService.updateBrand(this.data.brand!._id, formValue)
      : this.brandService.createBrand(formValue);

    operation.subscribe((savedBrand) => {
      this.dialogRef.close(savedBrand);
    });
  }
}
