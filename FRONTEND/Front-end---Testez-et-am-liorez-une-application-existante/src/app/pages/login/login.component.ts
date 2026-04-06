import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MaterialModule } from '../../shared/material.module';
import { UserService } from '../../core/service/user.service';
import { Login } from '../../core/models/Login';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  private userService = inject(UserService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  loginForm: FormGroup = new FormGroup({});
  submitted = false;
  token = '';
  serverError = '';
  loading = false;

  ngOnInit(): void {
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
    this.token = '';
    this.loading = true;

    if (this.loginForm.invalid) {
      this.loading = false;
      return;
    }

    const loginUser: Login = {
      login: this.loginForm.get('login')?.value,
      password: this.loginForm.get('password')?.value
    };

    this.userService.login(loginUser)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (token: string) => {
          this.loading = false;
          this.token = token;
        },
        error: (error: any) => {
          this.loading = false;
          console.log('status:', error.status);
          console.log('raw error:', error.error);

        if (typeof error.error === 'string') {
            try {
              this.serverError = JSON.parse(error.error).message;
            } 
            catch {
              this.serverError = error.error;
            }
          }   
        else
          this.serverError = error?.error?.message ?? 'Erreur de connexion';
        }
      });
  }

  onReset(): void {
    this.submitted = false;
    this.serverError = '';
    this.token = '';
    this.loginForm.reset();
    this.loading = false;
  }
}
