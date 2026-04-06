import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MaterialModule } from '../../shared/material.module';
import { UserService } from '../../core/service/user.service';
import { Login } from '../../core/models/Login';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/service/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, MaterialModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  private userService = inject(UserService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  private authService = inject(AuthService);

  loginForm: FormGroup = new FormGroup({});
  submitted = false;
  serverError = '';
  loading = false;

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      void this.router.navigate(['/students']);
      return;
    }

    this.loginForm = this.formBuilder.group({
      login: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  get form() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    this.serverError = '';

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;

    const loginUser: Login = {
      login: this.loginForm.get('login')?.value,
      password: this.loginForm.get('password')?.value
    };

    this.userService.login(loginUser)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (token: string) => {
          this.authService.saveToken(token);
          this.loading = false;
          void this.router.navigate(['/students']);
        },
        error: (error: unknown) => {
          this.loading = false;
          this.serverError = this.getErrorMessage(error, 'Connexion impossible.');
        }
      });
  }

  onReset(): void {
    this.submitted = false;
    this.serverError = '';
    this.loginForm.reset();
    this.loading = false;
  }

  private getErrorMessage(error: unknown, fallbackMessage: string): string {
    if (error && typeof error === 'object' && 'error' in error) {
      const serverError = (error as { error: unknown }).error;

      if (typeof serverError === 'string') {
        try {
          const parsedError = JSON.parse(serverError) as { message?: string };
          if (parsedError.message) {
            return parsedError.message;
          }
        } catch {
          return serverError;
        }

        return serverError;
      }

      if (serverError && typeof serverError === 'object' && 'message' in serverError) {
        const message = (serverError as { message?: unknown }).message;
        if (typeof message === 'string' && message.trim()) {
          return message;
        }
      }
    }

    return fallbackMessage;
  }
}
