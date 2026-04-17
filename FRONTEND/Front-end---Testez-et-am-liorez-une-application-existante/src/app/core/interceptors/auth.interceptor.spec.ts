/// <reference types="jest" />

import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../service/auth.service';

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting()
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpTestingController.verify();
    localStorage.clear();
  });

  it('should add the authorization header on student requests', () => {
    authService.saveToken('token');

    httpClient.get('/api/students').subscribe();

    const request = httpTestingController.expectOne('/api/students');
    expect(request.request.headers.get('Authorization')).toBe('Bearer token');
    request.flush([]);
  });

  it('should not add the authorization header on login requests', () => {
    authService.saveToken('token');

    httpClient.post('/api/login', {}).subscribe();

    const request = httpTestingController.expectOne('/api/login');
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({});
  });

  it('should clear the token and redirect on 401', () => {
    const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);
    authService.saveToken('token');

    httpClient.get('/api/students').subscribe({
      error: () => undefined
    });

    const request = httpTestingController.expectOne('/api/students');
    request.flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(authService.getToken()).toBeNull();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });
});
