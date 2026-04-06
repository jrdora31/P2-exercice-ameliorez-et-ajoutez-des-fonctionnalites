import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MaterialModule } from '../../shared/material.module';
import { Student } from '../../core/models/Student';
import { StudentRequest } from '../../core/models/StudentRequest';
import { StudentService } from '../../core/service/student.service';
import { AuthService } from '../../core/service/auth.service';

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [CommonModule, MaterialModule, RouterLink],
  templateUrl: './student-form.component.html',
  styleUrl: './student-form.component.css'
})
export class StudentFormComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private studentService = inject(StudentService);
  private authService = inject(AuthService);

  studentForm: FormGroup = new FormGroup({});
  student: Student | null = null;
  studentId: number | null = null;
  submitted = false;
  loading = false;
  saving = false;
  serverError = '';
  isEditMode = false;

  get pageTitle(): string {
    return this.isEditMode ? 'Modifier un étudiant' : 'Ajouter un étudiant';
  }

  ngOnInit(): void {
    this.studentForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      age: [null, Validators.min(0)]
    });

    const idParam = this.route.snapshot.paramMap.get('id');

    if (!idParam) {
      return;
    }

    const parsedId = Number(idParam);

    if (Number.isNaN(parsedId)) {
      this.serverError = 'Identifiant invalide.';
      return;
    }

    this.isEditMode = true;
    this.studentId = parsedId;
    this.loadStudent(parsedId);
  }

  get form() {
    return this.studentForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    this.serverError = '';

    if (this.studentForm.invalid) {
      return;
    }

    const payload: StudentRequest = {
      firstName: this.studentForm.get('firstName')?.value,
      lastName: this.studentForm.get('lastName')?.value,
      age: this.getAgeValue()
    };

    this.saving = true;

    const request = this.isEditMode && this.studentId !== null
      ? this.studentService.update(this.studentId, payload)
      : this.studentService.create(payload);

    request
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.saving = false;
          void this.router.navigate(['/students']);
        },
        error: (error: unknown) => {
          this.serverError = this.getErrorMessage(error, "Impossible d'enregistrer cet étudiant.");
          this.saving = false;
        }
      });
  }

  onReset(): void {
    this.submitted = false;
    this.serverError = '';

    if (this.student) {
      this.fillForm(this.student);
      return;
    }

    this.studentForm.reset({
      firstName: '',
      lastName: '',
      age: null
    });
  }

  cancel(): void {
    if (this.isEditMode && this.studentId !== null) {
      void this.router.navigate(['/students', this.studentId]);
      return;
    }

    void this.router.navigate(['/students']);
  }

  logout(): void {
    this.authService.logout();
    void this.router.navigate(['/login']);
  }

  private loadStudent(studentId: number): void {
    this.loading = true;
    this.serverError = '';

    this.studentService.getById(studentId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (student: Student) => {
          this.student = student;
          this.fillForm(student);
          this.loading = false;
        },
        error: (error: unknown) => {
          this.serverError = this.getErrorMessage(error, 'Impossible de charger cet étudiant.');
          this.loading = false;
        }
      });
  }

  private fillForm(student: Student): void {
    this.studentForm.patchValue({
      firstName: student.firstName,
      lastName: student.lastName,
      age: student.age
    });
  }

  private getAgeValue(): number | null {
    const ageValue = this.studentForm.get('age')?.value;

    if (ageValue === null || ageValue === undefined || ageValue === '') {
      return null;
    }

    const parsedAge = Number(ageValue);
    return Number.isNaN(parsedAge) ? null : parsedAge;
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
