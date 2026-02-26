import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormGroup,
  FormControl
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

interface ModelForm {
  name: FormControl<string>;
  age: FormControl<number>;
  height: FormControl<number>;
  email: FormControl<string>;
  social_network: FormControl<string>;
  about_me: FormControl<string>;
  cellphone: FormControl<string>;
}

@Component({
  selector: 'app-model-submission-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './model-submission-form.component.html',
  styleUrl: './model-submission-form.component.scss',
})

export class ModelSubmissionFormComponent implements OnInit {
form!: FormGroup<ModelForm>;
  selectedFile: File | null = null;

  loading = false;
  successMessage = '';
  errorMessage = '';

  private apiUrl = 'http://localhost:3000/api/model-submission';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.form = this.fb.nonNullable.group({
      name: this.fb.nonNullable.control('', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]),
      age: this.fb.nonNullable.control(0, [
        Validators.required,
        Validators.min(12),
        Validators.max(100)
      ]),
      height: this.fb.nonNullable.control(0, [
        Validators.required,
        Validators.min(100),
        Validators.max(250)
      ]),
      email: this.fb.nonNullable.control('', [
        Validators.required,
        Validators.email
      ]),
      social_network: this.fb.nonNullable.control('', [
        Validators.required,
        Validators.maxLength(150)
      ]),
      about_me: this.fb.nonNullable.control('', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(1000)
      ]),
      cellphone: this.fb.nonNullable.control('', [
        Validators.required,
        Validators.pattern(/^[0-9+\-\s()]{7,20}$/)
      ]),
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    const maxSize = 10 * 1024 * 1024; // 10MB

    if (file.size > maxSize) {
      this.errorMessage = 'File must be less than 10MB';
      return;
    }

    this.selectedFile = file;
  }

  submit(): void {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const formData = new FormData();
    const values = this.form.getRawValue();

    Object.entries(values).forEach(([key, value]) => {
      formData.append(key, String(value));
    });

    if (this.selectedFile) {
      formData.append('photo', this.selectedFile);
    }

    this.http.post(this.apiUrl, formData).subscribe({
      next: () => {
        this.successMessage = 'Application submitted successfully!';
        this.form.reset();
        this.selectedFile = null;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;

        if (error.error?.errors) {
          this.errorMessage = error.error.errors
            .map((e: any) => e.msg)
            .join(', ');
        } else {
          this.errorMessage = error.error?.message || 'Submission failed';
        }
      }
    });
  }
}
