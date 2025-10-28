// File: frontend/src/app/core/services/auth-user.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../../shared/models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthUserService {
  private http = inject(HttpClient);

  getProfile(): Observable<User> {
    console.log('Fetching user profile from', `${environment.apiUrl}/auth/profile`);
    return this.http.get<User>(`${environment.apiUrl}/auth/profile`);

  }
}
