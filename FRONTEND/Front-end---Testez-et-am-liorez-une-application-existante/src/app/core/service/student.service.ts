import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Student } from '../models/Student';
import { StudentRequest } from '../models/StudentRequest';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  constructor(private httpClient: HttpClient) {}

  getAll(): Observable<Student[]> {
    return this.httpClient.get<Student[]>('/api/students');
  }

  getById(id: number): Observable<Student> {
    return this.httpClient.get<Student>(`/api/students/${id}`);
  }

  create(student: StudentRequest): Observable<Student> {
    return this.httpClient.post<Student>('/api/students', student);
  }

  update(id: number, student: StudentRequest): Observable<Student> {
    return this.httpClient.put<Student>(`/api/students/${id}`, student);
  }

  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`/api/students/${id}`);
  }
}
