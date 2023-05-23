import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(private formBuilder: FormBuilder, private router: Router) {}

  ngOnInit(): void {
    this.createLoginForm();
  }

  createLoginForm(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/)]]
    });
  }

  login(): void {
    if (this.loginForm.valid) {
      // Perform authentication logic here
      const username = this.loginForm.value.username;
      const password = this.loginForm.value.password;
      
      if (username === 'admin' && password === 'Admin@1234') {
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMSIsImlhdCI6MTYyMjE2MTIyOX0';
        sessionStorage.setItem('token', token);
        this.router.navigate(['/user-management']);
      } else {
        alert('Invalid username or password.');
      }
    } else {
      alert('Please fill in all required fields correctly.');
    }
  }
}
