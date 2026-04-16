import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UserService } from './user.service';
import { Register } from '../models/Register';
import { Login } from '../models/Login';

describe('UserService', () => {
  let service: UserService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(UserService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should register a user', () => {
    const payload: Register = {
      firstName: 'John',
      lastName: 'Doe',
      login: 'john',
      password: 'password'
    };

    service.register(payload).subscribe((response: void) => {
      expect(response).toBeUndefined();
    });

    const request = httpTestingController.expectOne('/api/register');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush(null);
  });

  it('should login a user and request a text response', () => {
    const payload: Login = {
      login: 'john',
      password: 'password'
    };

    service.login(payload).subscribe((response: string) => {
      expect(response).toBe('jwt-token');
    });

    const request = httpTestingController.expectOne('/api/login');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    expect(request.request.responseType).toBe('text');
    request.flush('jwt-token');
  });
});
