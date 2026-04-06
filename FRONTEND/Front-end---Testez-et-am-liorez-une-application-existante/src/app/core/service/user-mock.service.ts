import {Register} from '../models/Register';
import {Observable, of} from 'rxjs';
import { Login } from '../models/Login';


export class UserMockService {

  register(user: Register): Observable<void> {
    return of(void 0);
  }

  login(credentials: Login): Observable<string> {
    return of('token');
  }
}
