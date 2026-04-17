/// <reference types="jest" />

import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../core/service/auth.service';
import { UserService } from '../../core/service/user.service';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let router: Router;
  let navigateSpy: jest.SpiedFunction<Router['navigate']>;

  const userService = {
    login: jest.fn()
  };

  const authService = {
    isAuthenticated: jest.fn().mockReturnValue(false),
    saveToken: jest.fn()
  };

  const createComponent = () => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  const fillValidForm = () => {
    component.loginForm.setValue({
      login: 'ada',
      password: 'password'
    });
  };

  beforeEach(async () => {
    userService.login.mockReset();
    authService.isAuthenticated.mockReset();
    authService.isAuthenticated.mockReturnValue(false);
    authService.saveToken.mockReset();

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        { provide: UserService, useValue: userService },
        { provide: AuthService, useValue: authService }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  afterEach(() => {
    navigateSpy.mockRestore();
  });

  it('should create', () => {
    createComponent();

    expect(component).toBeTruthy();
  });

  it('should expose form controls through the getter', () => {
    createComponent();

    expect(component.form).toBe(component.loginForm.controls);
  });

  it('should redirect to students when already authenticated', () => {
    authService.isAuthenticated.mockReturnValue(true);
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    component.ngOnInit();

    expect(navigateSpy).toHaveBeenCalledWith(['/students']);
    expect(component.loginForm.controls['login']).toBeUndefined();
  });

  it('should not submit when form is invalid', () => {
    createComponent();

    component.onSubmit();

    expect(component.submitted).toBe(true);
    expect(component.loading).toBe(false);
    expect(userService.login).not.toHaveBeenCalled();
  });

  it('should save token and navigate to students on success', () => {
    userService.login.mockReturnValue(of('jwt-token'));
    createComponent();
    fillValidForm();

    component.onSubmit();

    expect(userService.login).toHaveBeenCalledWith({
      login: 'ada',
      password: 'password'
    });
    expect(authService.saveToken).toHaveBeenCalledWith('jwt-token');
    expect(component.loading).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith(['/students']);
  });

  it('should display raw server message when api returns a string', () => {
    userService.login.mockReturnValue(
      throwError(() => ({ error: 'Connexion refusee.' }))
    );
    createComponent();
    fillValidForm();

    component.onSubmit();

    expect(component.loading).toBe(false);
    expect(component.serverError).toBe('Connexion refusee.');
  });

  it('should display server message when api returns an error object', () => {
    userService.login.mockReturnValue(
      throwError(() => ({ error: { message: 'Compte bloque.' } }))
    );
    createComponent();
    fillValidForm();

    component.onSubmit();

    expect(component.serverError).toBe('Compte bloque.');
  });

  it('should return the raw json string when parsed error has no message', () => {
    userService.login.mockReturnValue(
      throwError(() => ({ error: '{}' }))
    );
    createComponent();
    fillValidForm();

    component.onSubmit();

    expect(component.serverError).toBe('{}');
  });

  it('should fall back to a default message when error shape is unknown', () => {
    userService.login.mockReturnValue(throwError(() => new Error('boom')));
    createComponent();
    fillValidForm();

    component.onSubmit();

    expect(component.serverError).toBe('Connexion impossible.');
  });

  it('should reset form state and clear flags', () => {
    createComponent();
    fillValidForm();
    component.submitted = true;
    component.serverError = 'Erreur';
    component.loading = true;

    component.onReset();

    expect(component.submitted).toBe(false);
    expect(component.serverError).toBe('');
    expect(component.loading).toBe(false);
    expect(component.loginForm.value).toEqual({
      login: null,
      password: null
    });
  });
});
