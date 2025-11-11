import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sheet',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sheet.html',
})
export class SheetComponent {
  @Input() open = false;
  @Output() close = new EventEmitter<void>();

  isVisible = false;

  ngOnChanges() {
    if (this.open) {
      this.isVisible = true;
    }
  }

  closeSheet() {
    this.open = false;
    setTimeout(() => {
      this.isVisible = false;
      this.close.emit();
    }, 300);
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).id === 'sheet-backdrop') this.closeSheet();
  }
}
