// frontend/src/app/shared/components/pagination/pagination.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-pagination',
  template: `
    <div class="flex gap-2 justify-center mt-4">
      <button (click)="prev()" [disabled]="page <= 1">Anterior</button>
      <span>Página {{ page }} de {{ totalPages }}</span>
      <button (click)="next()" [disabled]="page >= totalPages">Siguiente</button>
    </div>
  `,
})
export class PaginationComponent {
  @Input() page = 1;
  @Input() totalPages = 1;
  @Output() pageChange = new EventEmitter<number>();

  prev() {
    if (this.page > 1) this.pageChange.emit(this.page - 1);
  }

  next() {
    if (this.page < this.totalPages) this.pageChange.emit(this.page + 1);
  }
}
