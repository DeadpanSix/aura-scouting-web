import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormGroup,
  FormControl
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ModelSubmissionService } from '../../../core/services/model-submission/model-submission.service';

interface ModelForm {
  photo: FormControl<File | null>;
  name: FormControl<string>;
  age: FormControl<number | null>;
  height: FormControl<number | null>;
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

export class ModelSubmissionFormComponent implements OnInit, OnDestroy {
  form!: FormGroup<ModelForm>;

  selectedFile: File | null = null;
  previewUrl: string | null = null;

  private cdr = inject(ChangeDetectorRef);

  private objectUrl: string | null = null;

  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private modelSubmissionService: ModelSubmissionService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group<ModelForm>({
      photo: this.fb.control<File | null>(null, []),
      name: this.fb.nonNullable.control('', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]),
      age: this.fb.control<number | null>(null, [
        Validators.required,
        Validators.min(12),
        Validators.max(100)
      ]),
      height: this.fb.control<number | null>(null, [
        Validators.required,
        Validators.min(100),
        Validators.max(250)
      ]),
      email: this.fb.nonNullable.control('', [
        Validators.required,
        Validators.email,
        Validators.maxLength(150)
      ]),
      social_network: this.fb.nonNullable.control('', [
        Validators.required,
        Validators.maxLength(150)
      ]),
      about_me: this.fb.nonNullable.control('', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(500)
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
      this.clearPreview();
      this.form.controls.photo.setValue(null);
      this.form.controls.photo.markAsTouched();
      return;
    }

    this.errorMessage = '';
    this.selectedFile = file;

    this.form.controls.photo.setValue(file);
    this.form.controls.photo.markAsDirty();
    this.form.controls.photo.markAsTouched();
    this.form.controls.photo.updateValueAndValidity({ emitEvent: true });

    this.setPreview(file);
  }

  private setPreview(file: File): void {
    this.clearPreview();


    this.objectUrl = URL.createObjectURL(file);
    this.previewUrl = this.objectUrl;
  }

  removeImage(event: Event): void {
    event.stopPropagation();
    this.clearPreview();
    this.selectedFile = null;
  }

  private clearPreview(): void {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
    }
    this.objectUrl = null;
    this.previewUrl = null;

    this.form.controls.photo.setValue(null);
    this.form.controls.photo.updateValueAndValidity();
  }

  submit(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage = 'Please fill all required fields correctly.';
      return;
    }

    if (!this.selectedFile) {
      this.loading = false;
      this.errorMessage = 'Please select a photo.';
      console.log('no pto');
      return;
    }

    this.loading = true;

    const formData = new FormData();
    const values = this.form.getRawValue();

    Object.entries(values).forEach(([key, value]) => {
      if (key !== 'photo' && value !== null) {
        formData.append(key, String(value));
      }
    });

    formData.append('photo', this.selectedFile);

    this.modelSubmissionService.postModel(formData).subscribe({
      next: () => {
        this.successMessage = 'Application submitted successfully!';
        this.form.reset();
        this.form.markAsPristine();
        this.form.markAsUntouched();
        this.clearPreview();
        this.selectedFile = null;
      },

      error: (error) => {
        this.loading = false;
        this.errorMessage = 'Submission failed. Please try again.';
        this.cdr.detectChanges();
      },

      complete: () => {
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.clearPreview();
  }
}
