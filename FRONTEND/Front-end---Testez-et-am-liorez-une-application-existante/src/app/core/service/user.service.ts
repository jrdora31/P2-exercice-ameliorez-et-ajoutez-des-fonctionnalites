import { Injectable } from '@angular/core';
import { Register } from '../models/Register';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Login } from '../models/Login';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private httpClient: HttpClient) { }

  register(user: Register): Observable<void> {
    return this.httpClient.post<void>('/api/register', user);
  }

  login(credentials: Login): Observable<string> {
    return this.httpClient.post('/api/login', credentials, { responseType: 'text' });
  }
}
