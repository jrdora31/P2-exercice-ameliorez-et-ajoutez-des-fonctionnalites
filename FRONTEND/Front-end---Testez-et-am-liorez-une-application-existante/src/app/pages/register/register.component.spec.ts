/// <reference types="jest" />

import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../core/service/auth.service';
import { UserService } from '../../core/service/user.service';
import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  let fixture: ComponentFixture<RegisterComponent>;
  let component: RegisterComponent;
  let router: Router;
  let navigateSpy: jest.SpiedFunction<Router['navigate']>;

  const userService = {
    register: jest.fn()
  };

  const authService = {
    isAuthenticated: jest.fn().mockReturnValue(false)
  };

  const createComponent = () => {
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  const fillValidForm = () => {
    component.registerForm.setValue({
      firstName: 'Ada',
      lastName: 'Lovelace',
      login: 'ada',
      password: 'password'
    });
  };

  beforeEach(async () => {
    userService.register.mockReset();
    authService.isAuthenticated.mockReset();
    authService.isAuthenticated.mockReturnValue(false);

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
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

  it('should redirect to students when already authenticated', () => {
    authService.isAuthenticated.mockReturnValue(true);
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    component.ngOnInit();

    expect(navigateSpy).toHaveBeenCalledWith(['/students']);
    expect(component.registerForm.controls['firstName']).toBeUndefined();
  });

  it('should not submit when form is invalid', () => {
    createComponent();

    component.onSubmit();

    expect(component.submitted).toBe(true);
    expect(component.loading).toBe(false);
    expect(userService.register).not.toHaveBeenCalled();
  });

  it('should register a user and navigate to login on success', () => {
    userService.register.mockReturnValue(of(void 0));
    createComponent();
    fillValidForm();

    component.onSubmit();

    expect(component.loading).toBe(false);
    expect(userService.register).toHaveBeenCalledWith({
      firstName: 'Ada',
      lastName: 'Lovelace',
      login: 'ada',
      password: 'password'
    });
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('should display server message when api returns an error object', () => {
    userService.register.mockReturnValue(
      throwError(() => ({ error: { message: 'Compte deja existant.' } }))
    );
    createComponent();
    fillValidForm();

    component.onSubmit();

    expect(component.loading).toBe(false);
    expect(component.serverError).toBe('Compte deja existant.');
  });

  it('should display parsed server message when api returns a json string', () => {
    userService.register.mockReturnValue(
      throwError(() => ({ error: '{"message":"Identifiant deja utilise."}' }))
    );
    createComponent();
    fillValidForm();

    component.onSubmit();

    expect(component.serverError).toBe('Identifiant deja utilise.');
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
    expect(component.registerForm.value).toEqual({
      firstName: null,
      lastName: null,
      login: null,
      password: null
    });
  });
});
