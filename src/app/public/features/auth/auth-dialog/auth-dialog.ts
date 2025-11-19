import { Component, ViewEncapsulation, inject } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TokenService } from '../../../../core/services/token';

// Servicio y modelos
import { Auth } from '../../../../core/services/auth';
import type { AuthResponse, LoginDto, RegisterDto } from '../../../../shared/models/auth.model';

@Component({
  selector: 'app-auth-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
  ],
  templateUrl: './auth-dialog.html',
  encapsulation: ViewEncapsulation.None,
})
export class AuthDialog {
  private fb = inject(FormBuilder);
  public dialogRef = inject(MatDialogRef<AuthDialog>);
  private authService = inject(Auth);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private tokenService = inject(TokenService);

  // Initial email for demo purposes
  public demoEmail = '1@correo.com';
  public demoPassword = 'password';


  public isLoading = false;
  public errorMessage: string | null = null;

  // Formularios
  loginForm = this.fb.group({
    email: [this.demoEmail, [Validators.required, Validators.email]],
    password: [this.demoPassword, [Validators.required]],
  });

  registerForm = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  // 🔍 Método reutilizable para saber si un campo es inválido y fue tocado/modificado
  isInvalidField(form: FormGroup, field: string): boolean {
    const control = form.get(field);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  onLogin(): void {
    if (this.loginForm.invalid || this.isLoading) return;

    this.isLoading = true;
    this.errorMessage = null;

    const loginData: LoginDto = this.loginForm.getRawValue() as LoginDto;

    this.authService.login(loginData).subscribe({
      next: (response: AuthResponse) => {
        this.isLoading = false;
        this.dialogRef.close(response.user);
        this.tokenService.saveToken(response.access_token); // ya lo haces en el service, opcional aquí

        this.showToast(`Login exitoso!`);

        // Redirigir según rol
        const role = response.user.role;
        if (role === 'admin') this.router.navigate(['/admin']);
        else if (role === 'vendor') this.router.navigate(['/products']);
        else this.router.navigate(['/products']);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        const msg = err.status === 401
          ? 'Credenciales incorrectas. Por favor, inténtalo de nuevo.'
          : 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.';
        this.errorMessage = msg;
        this.showToast(msg);
      },
    });
  }


  onRegister(): void {
    if (this.registerForm.invalid || this.isLoading) return;

    this.isLoading = true;
    this.errorMessage = null;

    const registerData: RegisterDto = this.registerForm.getRawValue();

    this.authService.register(registerData).subscribe({
      next: (newUser) => {
        this.isLoading = false;
        this.dialogRef.close(true);
        this.router.navigate(['/profile']);
        this.showToast(`Registro exitoso!`);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.errorMessage =
          err.status === 409
            ? err.error.message
            : 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.';
      },
    });
  }

  private showToast(message: string, action = 'Cerrar', duration = 3000) {
    this.snackBar.open(message, action, {
      duration,        // Duración en ms
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }
}
