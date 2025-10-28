import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-filter-sheet',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './filter-sheet.html',
})
export class FilterSheetComponent {
  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }
}
