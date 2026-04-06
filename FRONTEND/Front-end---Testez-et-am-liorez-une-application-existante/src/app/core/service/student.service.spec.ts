import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { StudentService } from './student.service';
import { Student } from '../models/Student';
import { StudentRequest } from '../models/StudentRequest';

describe('StudentService', () => {
  let service: StudentService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(StudentService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should get all students', () => {
    const students: Student[] = [
      { id: 1, firstName: 'Ada', lastName: 'Lovelace', age: 20 }
    ];

    service.getAll().subscribe((response: Student[]) => {
      expect(response).toEqual(students);
    });

    const request = httpTestingController.expectOne('/api/students');
    expect(request.request.method).toBe('GET');
    request.flush(students);
  });

  it('should create a student', () => {
    const payload: StudentRequest = {
      firstName: 'Alan',
      lastName: 'Turing',
      age: 22
    };

    const createdStudent: Student = {
      id: 2,
      ...payload
    };

    service.create(payload).subscribe((response: Student) => {
      expect(response).toEqual(createdStudent);
    });

    const request = httpTestingController.expectOne('/api/students');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush(createdStudent);
  });
});
