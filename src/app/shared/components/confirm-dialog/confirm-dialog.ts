import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';


@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatButtonModule],
  template: `
    <div class="p-6 bg-white rounded-lg shadow-md">
      <h2 class="text-lg font-semibold text-neutral-800 mb-4">{{ data.title }}</h2>
      <p class="text-neutral-600 mb-6">{{ data.message }}</p>

      <div class="flex justify-end gap-3">
        <button mat-stroked-button (click)="onCancel()">Cancelar</button>
        <button mat-flat-button color="warn" (click)="onConfirm()">Eliminar</button>
      </div>
    </div>
  `
})
export class ConfirmDialog {

  constructor(
    private dialogRef: MatDialogRef<ConfirmDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string; message: string }
  ) { }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

}
