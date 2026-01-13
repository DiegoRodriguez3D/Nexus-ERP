import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    ToastModule
  ],
  providers: [MessageService],
  template: `
    <div class="login-container">
      <p-toast></p-toast>
      <div class="login-card-wrapper">
        <p-card header="Nexus ERP Login" styleClass="text-center">
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="flex flex-column gap-4">
            <div class="field">
              <span class="p-float-label">
                <input pInputText id="email" formControlName="email" class="w-full" />
                <label htmlFor="email">Email</label>
              </span>
            </div>
            <div class="field">
              <span class="p-float-label">
                <p-password id="password" formControlName="password" [feedback]="false" styleClass="w-full" [inputStyle]="{'width':'100%'}"></p-password>
                <label htmlFor="password">Password</label>
              </span>
            </div>
            <p-button label="Sign In" type="submit" [loading]="loading" styleClass="w-full"></p-button>
          </form>
        </p-card>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background-color: var(--surface-ground);
    }
    .login-card-wrapper {
      width: 100%;
      max-width: 400px;
      padding: 1rem;
    }
    .field {
      margin-bottom: 1.5rem;
    }
    :host ::ng-deep .p-password input {
      width: 100%;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true;
      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.loading = false;
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Invalid credentials' });
          console.error(err);
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
