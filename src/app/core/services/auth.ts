import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { RegisterDto } from '../../shared/models/auth.model';
import { environment } from '../../../environments/environment';
import { User } from '../../shared/models/user.model';
import { Observable, tap } from 'rxjs';
import type { LoginDto, AuthResponse } from '../../shared/models/auth.model';
import { TokenService } from './token';

@Injectable({
  providedIn: 'root'
})
export class Auth {

  private http = inject(HttpClient);
  // CORRECCIÓN: Apuntamos a la URL base de la API. El endpoint específico se añade en cada método.
  private readonly apiUrl = environment.apiUrl;
  private tokenService = inject(TokenService);

  constructor() { }

  register(payload: RegisterDto): Observable<User> {
    // La URL correcta según tu backend es '.../users'
    return this.http.post<User>(`${this.apiUrl}/users`, payload);
  }

   login(payload: LoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, payload).pipe(
      tap((res: AuthResponse) => {
        this.tokenService.saveToken(res.access_token);
      })
    );
  }

  logout(): void {
    this.tokenService.removeToken();
  }

  getToken(): string | null {
    return this.tokenService.getToken();
  }

}
