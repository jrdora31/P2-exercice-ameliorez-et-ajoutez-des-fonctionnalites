import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should store and read a token', () => {
    service.saveToken('token');

    expect(service.getToken()).toBe('token');
    expect(service.isAuthenticated()).toBe(true);
  });

  it('should remove the token on logout', () => {
    service.saveToken('token');

    service.logout();

    expect(service.getToken()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });
});
