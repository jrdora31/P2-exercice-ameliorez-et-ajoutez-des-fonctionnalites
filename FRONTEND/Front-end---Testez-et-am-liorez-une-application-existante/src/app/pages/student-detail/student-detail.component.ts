import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MaterialModule } from '../../shared/material.module';
import { Student } from '../../core/models/Student';
import { StudentService } from '../../core/service/student.service';
import { AuthService } from '../../core/service/auth.service';

@Component({
  selector: 'app-student-detail',
  standalone: true,
  imports: [CommonModule, MaterialModule, RouterLink],
  templateUrl: './student-detail.component.html',
  styleUrl: './student-detail.component.css'
})
export class StudentDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private studentService = inject(StudentService);
  private authService = inject(AuthService);

  student: Student | null = null;
  loading = false;
  error = '';

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const studentId = Number(idParam);

    if (!idParam || Number.isNaN(studentId)) {
      this.error = 'Identifiant invalide.';
      return;
    }

    this.loadStudent(studentId);
  }

  deleteStudent(): void {
    if (!this.student) {
      return;
    }

    if (!window.confirm(`Supprimer ${this.student.firstName} ${this.student.lastName} ?`)) {
      return;
    }

    this.studentService.delete(this.student.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          void this.router.navigate(['/students']);
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

  private loadStudent(studentId: number): void {
    this.loading = true;
    this.error = '';

    this.studentService.getById(studentId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (student: Student) => {
          this.student = student;
          this.loading = false;
        },
        error: (error: unknown) => {
          this.error = this.getErrorMessage(error, 'Impossible de charger cet étudiant.');
          this.loading = false;
        }
      });
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
