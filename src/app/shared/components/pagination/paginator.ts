import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-paginator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './paginator.html',
})
export class PaginatorComponent {
  @Input() page = 1;
  @Input() totalPages = 1;

  @Output() pageChange = new EventEmitter<number>();

  goPrevious() {
    if (this.page > 1) {
      this.page--;
      this.pageChange.emit(this.page);
    }
  }

  goNext() {
    if (this.page < this.totalPages) {
      this.page++;
      this.pageChange.emit(this.page);
    }
  }
}
