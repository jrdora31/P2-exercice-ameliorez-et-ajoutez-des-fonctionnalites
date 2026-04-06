import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../service/auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();
  const isStudentRequest = request.url.startsWith('/api/students');
  const isPublicRequest = request.url.startsWith('/api/login') || request.url.startsWith('/api/register');

  const updatedRequest = token && isStudentRequest
    ? request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })
    : request;

  return next(updatedRequest).pipe(
    catchError((error) => {
      if (error.status === 401 && !isPublicRequest) {
        authService.logout();
        void router.navigate(['/login']);
      }

      return throwError(() => error);
    })
  );
};
