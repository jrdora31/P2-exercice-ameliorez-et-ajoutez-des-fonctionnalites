import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Student } from '../../core/models/Student';
import { AuthService } from '../../core/service/auth.service';
import { StudentService } from '../../core/service/student.service';
import { StudentDetailComponent } from './student-detail.component';

describe('StudentDetailComponent', () => {
  let fixture: ComponentFixture<StudentDetailComponent>;
  let component: StudentDetailComponent;
  let router: Router;
  let navigateSpy: jest.SpiedFunction<Router['navigate']>;
  let confirmSpy: jest.SpiedFunction<typeof window.confirm>;

  const student: Student = {
    id: 7,
    firstName: 'Grace',
    lastName: 'Hopper',
    age: 24
  };

  const studentService = {
    getById: jest.fn(),
    delete: jest.fn()
  };

  const authService = {
    logout: jest.fn()
  };

  const createComponent = () => {
    fixture = TestBed.createComponent(StudentDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  beforeEach(() => {
    studentService.getById.mockReset();
    studentService.delete.mockReset();
    authService.logout.mockReset();
  });

  const configureComponent = async (id = '7') => {
    await TestBed.configureTestingModule({
      imports: [StudentDetailComponent],
      providers: [
        provideRouter([]),
        { provide: StudentService, useValue: studentService },
        { provide: AuthService, useValue: authService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id })
            }
          }
        }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);
    confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
  };

  afterEach(() => {
    navigateSpy?.mockRestore();
    confirmSpy?.mockRestore();
  });

  it('should create', async () => {
    studentService.getById.mockReturnValue(of(student));
    await configureComponent();

    createComponent();

    expect(component).toBeTruthy();
  });

  it('should show an error when route id is invalid', async () => {
    await configureComponent('abc');

    createComponent();

    expect(studentService.getById).not.toHaveBeenCalled();
    expect(component.error).toBe('Identifiant invalide.');
    expect(component.student).toBeNull();
  });

  it('should load the student when route id is valid', async () => {
    studentService.getById.mockReturnValue(of(student));
    await configureComponent();

    createComponent();

    expect(studentService.getById).toHaveBeenCalledWith(7);
    expect(component.loading).toBe(false);
    expect(component.student).toEqual(student);
    expect(component.error).toBe('');
  });

  it('should display parsed server message when loading fails', async () => {
    studentService.getById.mockReturnValue(
      throwError(() => ({ error: '{"message":"Étudiant introuvable."}' }))
    );
    await configureComponent();

    createComponent();

    expect(component.loading).toBe(false);
    expect(component.error).toBe('Étudiant introuvable.');
  });

  it('should fall back to the default message when loading error shape is unknown', async () => {
    studentService.getById.mockReturnValue(throwError(() => new Error('boom')));
    await configureComponent();

    createComponent();

    expect(component.loading).toBe(false);
    expect(component.error).toBe('Impossible de charger cet étudiant.');
  });

  it('should not delete when no student is loaded', async () => {
    studentService.getById.mockReturnValue(of(student));
    await configureComponent('abc');

    createComponent();
    component.deleteStudent();

    expect(studentService.delete).not.toHaveBeenCalled();
  });

  it('should not delete when confirmation is cancelled', async () => {
    studentService.getById.mockReturnValue(of(student));
    await configureComponent();
    confirmSpy.mockReturnValue(false);

    createComponent();
    component.deleteStudent();

    expect(studentService.delete).not.toHaveBeenCalled();
  });

  it('should delete the student and navigate to the list on success', async () => {
    studentService.getById.mockReturnValue(of(student));
    studentService.delete.mockReturnValue(of(void 0));
    await configureComponent();

    createComponent();
    component.deleteStudent();

    expect(studentService.delete).toHaveBeenCalledWith(7);
    expect(navigateSpy).toHaveBeenCalledWith(['/students']);
  });

  it('should display raw error message when deletion fails', async () => {
    studentService.getById.mockReturnValue(of(student));
    studentService.delete.mockReturnValue(
      throwError(() => ({ error: 'Suppression refusée.' }))
    );
    await configureComponent();

    createComponent();
    component.deleteStudent();

    expect(component.error).toBe('Suppression refusée.');
  });

  it('should display object error message when deletion fails with an error object', async () => {
    studentService.getById.mockReturnValue(of(student));
    studentService.delete.mockReturnValue(
      throwError(() => ({ error: { message: 'Suppression bloquee.' } }))
    );
    await configureComponent();

    createComponent();
    component.deleteStudent();

    expect(component.error).toBe('Suppression bloquee.');
  });

  it('should return the raw json string when deletion error has no message', async () => {
    studentService.getById.mockReturnValue(of(student));
    studentService.delete.mockReturnValue(
      throwError(() => ({ error: '{}' }))
    );
    await configureComponent();

    createComponent();
    component.deleteStudent();

    expect(component.error).toBe('{}');
  });

  it('should log out and navigate to login', async () => {
    studentService.getById.mockReturnValue(of(student));
    await configureComponent();

    createComponent();
    component.logout();

    expect(authService.logout).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });
});
