import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class TokenService {
  constructor() { }

  saveToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem("auth_token", token);
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      console.log('Retrieving token from localStorage');
      return localStorage.getItem("auth_token");
    }
    return null;
  }

  removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("auth_token");
    }
  }
}
