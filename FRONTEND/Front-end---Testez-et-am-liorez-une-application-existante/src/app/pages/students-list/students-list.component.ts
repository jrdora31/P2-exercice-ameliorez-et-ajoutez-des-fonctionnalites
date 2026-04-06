import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MaterialModule } from '../../shared/material.module';
import { Student } from '../../core/models/Student';
import { StudentService } from '../../core/service/student.service';
import { AuthService } from '../../core/service/auth.service';

@Component({
  selector: 'app-students-list',
  standalone: true,
  imports: [CommonModule, MaterialModule, RouterLink],
  templateUrl: './students-list.component.html',
  styleUrl: './students-list.component.css'
})
export class StudentsListComponent implements OnInit {
  private studentService = inject(StudentService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  readonly displayedColumns = ['firstName', 'lastName', 'age', 'actions'];

  students: Student[] = [];
  loading = false;
  error = '';
  notice = '';

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    this.loading = true;
    this.error = '';

    this.studentService.getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (students: Student[]) => {
          this.students = students;
          this.loading = false;
        },
        error: (error: unknown) => {
          this.error = this.getErrorMessage(error, 'Impossible de charger les étudiants.');
          this.loading = false;
        }
      });
  }

  deleteStudent(student: Student): void {
    this.notice = '';
    this.error = '';

    if (!window.confirm(`Supprimer ${student.firstName} ${student.lastName} ?`)) {
      return;
    }

    this.studentService.delete(student.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.students = this.students.filter((item) => item.id !== student.id);
          this.notice = 'Étudiant supprimé.';
        },
        error: (error: unknown) => {
          this.error = this.getErrorMessage(error, 'Impossible de supprimer cet étudiant.');
        }
      });
  }

  logout(): void {
    this.authService.logout();
    void this.router.navigate(['/login']);
  }

  private getErrorMessage(error: unknown, fallbackMessage: string): string {
    if (error && typeof error === 'object' && 'error' in error) {
      const serverError = (error as { error: unknown }).error;

      if (typeof serverError === 'string') {
        try {
          const parsedError = JSON.parse(serverError) as { message?: string };
          if (parsedError.message) {
            return parsedError.message;
          }
        } catch {
          return serverError;
        }

        return serverError;
      }

      if (serverError && typeof serverError === 'object' && 'message' in serverError) {
        const message = (serverError as { message?: unknown }).message;
        if (typeof message === 'string' && message.trim()) {
          return message;
        }
      }
    }

    return fallbackMessage;
  }
}
