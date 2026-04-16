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

  it('should get a student by id', () => {
    const student: Student = {
      id: 3,
      firstName: 'Grace',
      lastName: 'Hopper',
      age: 25
    };

    service.getById(student.id).subscribe((response: Student) => {
      expect(response).toEqual(student);
    });

    const request = httpTestingController.expectOne('/api/students/3');
    expect(request.request.method).toBe('GET');
    request.flush(student);
  });

  it('should update a student', () => {
    const payload: StudentRequest = {
      firstName: 'Grace',
      lastName: 'Hopper',
      age: 26
    };

    const updatedStudent: Student = {
      id: 3,
      ...payload
    };

    service.update(3, payload).subscribe((response: Student) => {
      expect(response).toEqual(updatedStudent);
    });

    const request = httpTestingController.expectOne('/api/students/3');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(payload);
    request.flush(updatedStudent);
  });

  it('should delete a student', () => {
    service.delete(3).subscribe((response: void) => {
      expect(response).toBeUndefined();
    });

    const request = httpTestingController.expectOne('/api/students/3');
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
  });
});
