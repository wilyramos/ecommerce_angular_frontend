import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { RegisterDto } from '../../shared/models/auth.model';
import { environment } from '../../../environments/environment';
import { User } from '../../shared/models/user.model';
import type { Observable } from 'rxjs';
import type { LoginDto, AuthResponse } from '../../shared/models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class Auth {

  private http = inject(HttpClient);
  // CORRECCIÓN: Apuntamos a la URL base de la API. El endpoint específico se añade en cada método.
  private readonly apiUrl = environment.apiUrl;

  constructor() { }

  register(payload: RegisterDto): Observable<User> {
    // La URL correcta según tu backend es '.../users'
    return this.http.post<User>(`${this.apiUrl}/users`, payload);
  }

  login(payload: LoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, payload);
  }
}
