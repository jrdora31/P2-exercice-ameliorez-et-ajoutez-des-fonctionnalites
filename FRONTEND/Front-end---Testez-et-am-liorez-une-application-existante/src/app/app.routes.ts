import { Routes } from '@angular/router';
import { RegisterComponent } from './pages/register/register.component';
import { LoginComponent } from './pages/login/login.component';
import { StudentsListComponent } from './pages/students-list/students-list.component';
import { StudentDetailComponent } from './pages/student-detail/student-detail.component';
import { StudentFormComponent } from './pages/student-form/student-form.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'students'
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'students',
    canActivate: [authGuard],
    component: StudentsListComponent
  },
  {
    path: 'students/new',
    canActivate: [authGuard],
    component: StudentFormComponent
  },
  {
    path: 'students/:id',
    canActivate: [authGuard],
    component: StudentDetailComponent
  },
  {
    path: 'students/:id/edit',
    canActivate: [authGuard],
    component: StudentFormComponent
  },
  {
    path: '**',
    redirectTo: 'students'
  }
];
