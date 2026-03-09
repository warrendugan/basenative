import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputComponent } from '@basenative/forms';

@Component({
  selector: 'section[lead-form]',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, InputComponent],
  templateUrl: './lead-form.html',
  styleUrl: './lead-form.css',
})
export class LeadFormComponent {
  readonly page = {
    title: 'Create New Lead',
    subtitle: 'Add a new customer lead to track their electrical service needs.',
    sections: {
      contact: 'Contact Information',
      address: 'Address',
      service: 'Service Details',
    },
    fields: {
      firstName: {
        label: 'First Name',
        placeholder: 'John',
      },
      lastName: {
        label: 'Last Name',
        placeholder: 'Smith',
      },
      phone: {
        label: 'Phone',
        placeholder: '(555) 123-4567',
      },
      email: {
        label: 'Email',
        placeholder: 'john@example.com',
      },
      address: {
        label: 'Street Address',
        placeholder: '123 Main St',
      },
      city: {
        label: 'City',
        placeholder: 'Springfield',
      },
      state: {
        label: 'State',
        placeholder: 'Select State',
      },
      zip: {
        label: 'ZIP Code',
        placeholder: '62701',
      },
      serviceType: {
        label: 'Service Type',
        placeholder: 'Select Service Type',
      },
      notes: {
        label: 'Notes',
        placeholder: 'Add any additional notes about this lead...',
      },
    },
    actions: {
      cancel: 'Cancel',
      submit: 'Create Lead',
    },
    errors: {
      required: (label: string) => `${label} is required`,
      minlength: (label: string, length: number) => `${label} must be at least ${length} characters`,
      email: 'Please enter a valid email address',
      pattern: (label: string) => `${label} format is invalid`,
      maxlength: (label: string, length: number) => `${label} must not exceed ${length} characters`,
    },
  } as const;

  form: FormGroup;
  submitted = signal(false);

  serviceTypes = [
    { value: 'panel-upgrade', label: 'Panel Upgrade' },
    { value: 'ev-charger', label: 'EV Charger' },
    { value: 'solar', label: 'Solar' },
    { value: 'battery-storage', label: 'Battery Storage' },
    { value: 'whole-home-rewire', label: 'Whole Home Rewire' },
  ];

  states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
  ] as const;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.form = this.createForm();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern(/^\(?[0-9]{3}\)?[-. ]?[0-9]{3}[-. ]?[0-9]{4}$/)]],
      email: ['', [Validators.required, Validators.email]],
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zip: ['', [Validators.required, Validators.pattern(/^\d{5}(-\d{4})?$/)]],
      serviceType: ['', Validators.required],
      notes: ['', Validators.maxLength(500)],
    });
  }

  onSubmit(): void {
    this.submitted.set(true);

    if (this.form.valid) {
      const formData = this.form.value;
      console.log('Form submitted:', formData);
      // TODO: Send to API
      this.router.navigate(['/leads']);
    }
  }

  onCancel(): void {
    this.router.navigate(['/leads']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.submitted()));
  }

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field || !field.errors) return '';

    const fieldKey = fieldName as keyof typeof this.page.fields;
    const label = this.page.fields[fieldKey]?.label || fieldName;

    if (field.hasError('required')) {
      return this.page.errors.required(label);
    }
    if (field.hasError('minlength')) {
      const minLength = field.getError('minlength')?.requiredLength;
      return this.page.errors.minlength(label, minLength);
    }
    if (field.hasError('email')) {
      return this.page.errors.email;
    }
    if (field.hasError('pattern')) {
      return this.page.errors.pattern(label);
    }
    if (field.hasError('maxlength')) {
      const maxLength = field.getError('maxlength')?.requiredLength;
      return this.page.errors.maxlength(label, maxLength);
    }

    return 'Invalid input';
  }
}
