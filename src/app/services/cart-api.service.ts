import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CartApiService {

  private readonly apiUrl = `${environment.apiUrl}/cart`;

  constructor(private http: HttpClient) {}

  private withSession(sessionId: string) {
    return {
      headers: new HttpHeaders({
        'x-session-id': sessionId
      })
    };
  }

  getCart(sessionId: string) {
    return this.http.get(`${this.apiUrl}`, this.withSession(sessionId));
  }

  addItem(dto: { productId: string; sku: string; quantity: number }, sessionId: string) {
    return this.http.post(`${this.apiUrl}/add`, dto, this.withSession(sessionId));
  }

  updateQty(productId: string, sku: string, quantity: number, sessionId: string) {
    return this.http.patch(
      `${this.apiUrl}/${productId}/${sku}`,
      { quantity },
      this.withSession(sessionId)
    );
  }

  remove(productId: string, sku: string, sessionId: string) {
    return this.http.delete(
      `${this.apiUrl}/${productId}/${sku}`,
      this.withSession(sessionId)
    );
  }

  clear(sessionId: string) {
    return this.http.delete(`${this.apiUrl}/clear`, this.withSession(sessionId));
  }
}
