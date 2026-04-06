import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../shared/material.module';
import { UserService } from '../../core/service/user.service';
import { Register } from '../../core/models/Register';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/service/auth.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, MaterialModule, RouterLink],
  templateUrl: './register.component.html',
  standalone: true,
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  private userService = inject(UserService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  private authService = inject(AuthService);
  registerForm: FormGroup = new FormGroup({});
  submitted = false;
  serverError = '';
  loading = false;

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      void this.router.navigate(['/students']);
      return;
    }

    this.registerForm = this.formBuilder.group(
      {
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        login: ['', Validators.required],
        password: ['', Validators.required]
      },
    );
  }

  get form() {
    return this.registerForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    this.serverError = '';

    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;

    const registerUser: Register = {
      firstName: this.registerForm.get('firstName')?.value,
      lastName: this.registerForm.get('lastName')?.value,
      login: this.registerForm.get('login')?.value,
      password: this.registerForm.get('password')?.value
    };
    this.userService.register(registerUser)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loading = false;
          void this.router.navigate(['/login']);
        },
        error: (error: unknown) => {
          this.loading = false;
          this.serverError = this.getErrorMessage(error, 'Inscription impossible.');
        }
      });
  }

  onReset(): void {
    this.submitted = false;
    this.serverError = '';
    this.registerForm.reset();
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
