// src/app/..../auth-dialog.ts (tu componente)

import { Component, ViewEncapsulation, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common'; // Importa CommonModule para usar *ngIf
import { HttpErrorResponse } from '@angular/common/http';

// Importa tu servicio y modelos
import { Auth } from '../../../../core/services/auth';
import type { AuthResponse, LoginDto, RegisterDto } from '../../../../shared/models/auth.model';

@Component({
  selector: 'app-auth-dialog',
  standalone: true,
  imports: [
    CommonModule, // <-- Necesario para directivas como *ngIf
    RouterLink,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './auth-dialog.html',
  encapsulation: ViewEncapsulation.None,
})
export class AuthDialog {
  private fb = inject(FormBuilder);
  public dialogRef = inject(MatDialogRef<AuthDialog>);
  private authService = inject(Auth); // <-- 1. Inyecta el servicio

  // --- Estados para la UI ---
  public isLoading = false; // <-- 2. Para mostrar un spinner o deshabilitar el botón
  public errorMessage: string | null = null; // <-- Para mostrar mensajes de error

  // ... tu loginForm no cambia ...
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  registerForm = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]], // <-- Buena idea sincronizar validaciones con el backend
  });

  onRegister(): void {
    // Evita envíos múltiples si ya está cargando
    if (this.registerForm.invalid || this.isLoading) {
      return;
    }

    this.isLoading = true; // Inicia la carga
    this.errorMessage = null; // Resetea el error previo

    const registerData: RegisterDto = this.registerForm.getRawValue();

    // 3. Llama al servicio
    this.authService.register(registerData).subscribe({
      next: (newUser) => {
        // ÉXITO
        this.isLoading = false;
        console.log('Usuario registrado con éxito:', newUser);
        // Aquí podrías mostrar un mensaje de éxito (ej. con un Snackbar)
        // y luego cerrar el diálogo.
        this.dialogRef.close(true); // Envía 'true' para indicar que el registro fue exitoso
      },
      error: (err: HttpErrorResponse) => {
        // ERROR
        this.isLoading = false;
        console.error('Error en el registro:', err);

        // Tu backend envía un 409 (ConflictException), lo manejamos aquí
        if (err.status === 409) {
          this.errorMessage = err.error.message; // 'El correo electrónico ya está en uso'
        } else {
          // Para otros errores (ej. 500 Internal Server Error)
          this.errorMessage = 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.';
        }
      },
    });
  }

  onLogin(): void {
    if (this.loginForm.invalid || this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const loginData: LoginDto = this.loginForm.getRawValue() as LoginDto;

    this.authService.login(loginData).subscribe({
      next: (response: AuthResponse) => {
        this.isLoading = false;
        console.log('Login exitoso:', response);

        // **Paso Crucial**: Guardar el token para mantener la sesión.
        // La forma más común es en localStorage.
        localStorage.setItem('access_token', response.access_token);

        // Cierra el diálogo y opcionalmente devuelve los datos del usuario.
        this.dialogRef.close(response.user);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        console.error('Error en el login:', err);

        // El backend suele devolver 401 (Unauthorized) para credenciales incorrectas.
        if (err.status === 401) {
          this.errorMessage = 'El correo electrónico o la contraseña son incorrectos.';
        } else {
          this.errorMessage = 'Ocurrió un error inesperado. Inténtalo de nuevo.';
        }
      },
    });
  }
}
