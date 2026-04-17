/// <reference types="jest" />

import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Student } from '../../core/models/Student';
import { AuthService } from '../../core/service/auth.service';
import { StudentService } from '../../core/service/student.service';
import { StudentFormComponent } from './student-form.component';

describe('StudentFormComponent', () => {
  let fixture: ComponentFixture<StudentFormComponent>;
  let component: StudentFormComponent;
  let router: Router;
  let navigateSpy: jest.SpiedFunction<Router['navigate']>;

  const student: Student = {
    id: 4,
    firstName: 'Alan',
    lastName: 'Turing',
    age: 23
  };

  const studentService = {
    create: jest.fn(),
    update: jest.fn(),
    getById: jest.fn()
  };

  const authService = {
    logout: jest.fn()
  };

  const createComponent = () => {
    fixture = TestBed.createComponent(StudentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  const fillValidForm = (age: number | null = 20) => {
    component.studentForm.setValue({
      firstName: 'Ada',
      lastName: 'Lovelace',
      age
    });
  };

  beforeEach(() => {
    studentService.create.mockReset();
    studentService.update.mockReset();
    studentService.getById.mockReset();
    authService.logout.mockReset();
  });

  const configureComponent = async (id?: string) => {
    await TestBed.configureTestingModule({
      imports: [StudentFormComponent],
      providers: [
        provideRouter([]),
        { provide: StudentService, useValue: studentService },
        { provide: AuthService, useValue: authService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap(id ? { id } : {})
            }
          }
        }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);
  };

  afterEach(() => {
    navigateSpy?.mockRestore();
  });

  it('should create in creation mode by default', async () => {
    await configureComponent();

    createComponent();

    expect(component).toBeTruthy();
    expect(component.isEditMode).toBe(false);
    expect(component.pageTitle).toBe('Ajouter un étudiant');
  });

  it('should expose form controls through the getter', async () => {
    await configureComponent();

    createComponent();

    expect(component.form).toBe(component.studentForm.controls);
  });

  it('should load a student in edit mode', async () => {
    studentService.getById.mockReturnValue(of(student));
    await configureComponent('4');

    createComponent();

    expect(component.isEditMode).toBe(true);
    expect(component.studentId).toBe(4);
    expect(component.student).toEqual(student);
    expect(component.pageTitle).toBe('Modifier un étudiant');
    expect(component.studentForm.value).toEqual({
      firstName: 'Alan',
      lastName: 'Turing',
      age: 23
    });
  });

  it('should show an error when route id is invalid', async () => {
    await configureComponent('abc');

    createComponent();

    expect(studentService.getById).not.toHaveBeenCalled();
    expect(component.serverError).toBe('Identifiant invalide.');
  });

  it('should not submit when form is invalid', async () => {
    await configureComponent();

    createComponent();
    component.onSubmit();

    expect(component.submitted).toBe(true);
    expect(component.saving).toBe(false);
    expect(studentService.create).not.toHaveBeenCalled();
    expect(studentService.update).not.toHaveBeenCalled();
  });

  it('should create a student and navigate to the list on success', async () => {
    studentService.create.mockReturnValue(of(student));
    await configureComponent();

    createComponent();
    fillValidForm(null);
    component.onSubmit();

    expect(studentService.create).toHaveBeenCalledWith({
      firstName: 'Ada',
      lastName: 'Lovelace',
      age: null
    });
    expect(component.saving).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith(['/students']);
  });

  it('should show parsed error message when creation fails', async () => {
    studentService.create.mockReturnValue(
      throwError(() => ({ error: '{"message":"Création impossible."}' }))
    );
    await configureComponent();

    createComponent();
    fillValidForm();
    component.onSubmit();

    expect(component.saving).toBe(false);
    expect(component.serverError).toBe('Création impossible.');
  });

  it('should return a raw string when creation error is not json', async () => {
    studentService.create.mockReturnValue(
      throwError(() => ({ error: 'Enregistrement refuse.' }))
    );
    await configureComponent();

    createComponent();
    fillValidForm();
    component.onSubmit();

    expect(component.saving).toBe(false);
    expect(component.serverError).toBe('Enregistrement refuse.');
  });

  it('should update a student in edit mode', async () => {
    studentService.getById.mockReturnValue(of(student));
    studentService.update.mockReturnValue(of(student));
    await configureComponent('4');

    createComponent();
    fillValidForm(30);
    component.onSubmit();

    expect(studentService.update).toHaveBeenCalledWith(4, {
      firstName: 'Ada',
      lastName: 'Lovelace',
      age: 30
    });
    expect(navigateSpy).toHaveBeenCalledWith(['/students']);
  });

  it('should convert an invalid age value to null before saving', async () => {
    studentService.create.mockReturnValue(of(student));
    await configureComponent();

    createComponent();
    component.studentForm.setValue({
      firstName: 'Ada',
      lastName: 'Lovelace',
      age: 'abc'
    });
    component.onSubmit();

    expect(studentService.create).toHaveBeenCalledWith({
      firstName: 'Ada',
      lastName: 'Lovelace',
      age: null
    });
  });

  it('should show the fallback message when loading a student fails unexpectedly', async () => {
    studentService.getById.mockReturnValue(throwError(() => new Error('boom')));
    await configureComponent('4');

    createComponent();

    expect(component.loading).toBe(false);
    expect(component.serverError).toBe('Impossible de charger cet étudiant.');
  });

  it('should display an object message when update fails', async () => {
    studentService.getById.mockReturnValue(of(student));
    studentService.update.mockReturnValue(
      throwError(() => ({ error: { message: 'Mise a jour refusee.' } }))
    );
    await configureComponent('4');

    createComponent();
    fillValidForm(30);
    component.onSubmit();

    expect(component.saving).toBe(false);
    expect(component.serverError).toBe('Mise a jour refusee.');
  });

  it('should restore empty defaults on reset in creation mode', async () => {
    await configureComponent();

    createComponent();
    fillValidForm(19);
    component.submitted = true;
    component.serverError = 'Erreur';

    component.onReset();

    expect(component.submitted).toBe(false);
    expect(component.serverError).toBe('');
    expect(component.studentForm.value).toEqual({
      firstName: '',
      lastName: '',
      age: null
    });
  });

  it('should restore the loaded student on reset in edit mode', async () => {
    studentService.getById.mockReturnValue(of(student));
    await configureComponent('4');

    createComponent();
    fillValidForm(31);
    component.onReset();

    expect(component.studentForm.value).toEqual({
      firstName: 'Alan',
      lastName: 'Turing',
      age: 23
    });
  });

  it('should navigate to the list when cancel is used in creation mode', async () => {
    await configureComponent();

    createComponent();
    component.cancel();

    expect(navigateSpy).toHaveBeenCalledWith(['/students']);
  });

  it('should navigate to the detail page when cancel is used in edit mode', async () => {
    studentService.getById.mockReturnValue(of(student));
    await configureComponent('4');

    createComponent();
    component.cancel();

    expect(navigateSpy).toHaveBeenCalledWith(['/students', 4]);
  });

  it('should log out and navigate to login', async () => {
    await configureComponent();

    createComponent();
    component.logout();

    expect(authService.logout).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });
});
