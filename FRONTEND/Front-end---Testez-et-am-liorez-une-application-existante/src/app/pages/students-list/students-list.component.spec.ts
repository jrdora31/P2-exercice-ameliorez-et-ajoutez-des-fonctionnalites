import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Student } from '../../core/models/Student';
import { AuthService } from '../../core/service/auth.service';
import { StudentService } from '../../core/service/student.service';
import { StudentsListComponent } from './students-list.component';

describe('StudentsListComponent', () => {
  let fixture: ComponentFixture<StudentsListComponent>;
  let component: StudentsListComponent;
  let router: Router;
  let navigateSpy: jest.SpiedFunction<Router['navigate']>;
  let confirmSpy: jest.SpiedFunction<typeof window.confirm>;

  const students: Student[] = [
    { id: 1, firstName: 'Ada', lastName: 'Lovelace', age: 20 },
    { id: 2, firstName: 'Alan', lastName: 'Turing', age: 21 }
  ];

  const studentService = {
    getAll: jest.fn().mockReturnValue(of([])),
    delete: jest.fn()
  };

  const authService = {
    logout: jest.fn()
  };

  const createComponent = () => {
    fixture = TestBed.createComponent(StudentsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  beforeEach(async () => {
    studentService.getAll.mockReset();
    studentService.getAll.mockReturnValue(of([]));
    studentService.delete.mockReset();
    authService.logout.mockReset();

    await TestBed.configureTestingModule({
      imports: [StudentsListComponent],
      providers: [
        provideRouter([]),
        { provide: StudentService, useValue: studentService },
        { provide: AuthService, useValue: authService }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);
    confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
  });

  afterEach(() => {
    navigateSpy.mockRestore();
    confirmSpy.mockRestore();
  });

  it('should load students on init', () => {
    studentService.getAll.mockReturnValue(of(students));

    createComponent();

    expect(studentService.getAll).toHaveBeenCalled();
    expect(component.loading).toBe(false);
    expect(component.students).toEqual(students);
    expect(component.error).toBe('');
  });

  it('should set an error when loading fails', () => {
    studentService.getAll.mockReturnValue(throwError(() => new Error('boom')));

    createComponent();

    expect(component.loading).toBe(false);
    expect(component.students).toEqual([]);
    expect(component.error).toBe('Impossible de charger les étudiants.');
  });

  it('should display parsed server message when loading fails with json', () => {
    studentService.getAll.mockReturnValue(
      throwError(() => ({ error: '{"message":"Chargement refuse."}' }))
    );

    createComponent();

    expect(component.error).toBe('Chargement refuse.');
  });

  it('should not delete a student when confirmation is cancelled', () => {
    studentService.getAll.mockReturnValue(of(students));
    confirmSpy.mockReturnValue(false);
    createComponent();

    component.deleteStudent(students[0]);

    expect(studentService.delete).not.toHaveBeenCalled();
    expect(component.notice).toBe('');
    expect(component.students).toEqual(students);
  });

  it('should delete a student and update the list on success', () => {
    studentService.getAll.mockReturnValue(of(students));
    studentService.delete.mockReturnValue(of(void 0));
    createComponent();

    component.deleteStudent(students[0]);

    expect(studentService.delete).toHaveBeenCalledWith(1);
    expect(component.students).toEqual([students[1]]);
    expect(component.notice).toBe('Étudiant supprimé.');
    expect(component.error).toBe('');
  });

  it('should set an error when deletion fails', () => {
    studentService.getAll.mockReturnValue(of(students));
    studentService.delete.mockReturnValue(
      throwError(() => ({ error: 'Suppression impossible.' }))
    );
    createComponent();

    component.deleteStudent(students[0]);

    expect(component.error).toBe('Suppression impossible.');
    expect(component.notice).toBe('');
    expect(component.students).toEqual(students);
  });

  it('should display an object message when deletion fails with an error object', () => {
    studentService.getAll.mockReturnValue(of(students));
    studentService.delete.mockReturnValue(
      throwError(() => ({ error: { message: 'Suppression refusee.' } }))
    );
    createComponent();

    component.deleteStudent(students[0]);

    expect(component.error).toBe('Suppression refusee.');
  });

  it('should return the raw json string when deletion error has no message', () => {
    studentService.getAll.mockReturnValue(of(students));
    studentService.delete.mockReturnValue(
      throwError(() => ({ error: '{}' }))
    );
    createComponent();

    component.deleteStudent(students[0]);

    expect(component.error).toBe('{}');
  });

  it('should log out and navigate to login', () => {
    createComponent();

    component.logout();

    expect(authService.logout).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });
});
