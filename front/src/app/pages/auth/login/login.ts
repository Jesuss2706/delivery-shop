import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() switchToRegister = new EventEmitter<void>();

  credentials = {
    username: '',
    password: '',
  };

  isLoading = false;
  errorMessage = '';
  showPassword = false;
  returnUrl: string = '/store';
  isModal: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/store';
    this.isModal = this.close.observed;

    // Si ya está logueado, redirigir directamente
    if (this.authService.isLoggedIn() && !this.isModal) {
      this.router.navigate([this.returnUrl]);
    }
  }

  onSubmit(): void {
  if (!this.credentials.username || !this.credentials.password) {
    this.errorMessage = 'Por favor completa todos los campos';
    return;
  }

  this.errorMessage = '';
  this.isLoading = true;

  this.authService.login(this.credentials.username, this.credentials.password).subscribe({
    next: (response) => {
      console.log('Login exitoso');
      this.authService.debugTokenInfo();
      this.isLoading = false;
      
      
      if (this.isModal) {
        this.close.emit();
      }


      const role = this.authService.getUserRole();
      
   
      if (role === 'ADMIN') {
        this.router.navigate(['/admin/dashboard']);
      } else {
        this.router.navigate([this.returnUrl]);
      }
    },
    error: (error) => {
      console.error('Error en login:', error);
      this.errorMessage = error.message || 'Usuario o contraseña incorrectos';
      this.isLoading = false;
    },
  });
}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  goToRegister(): void {
    if (this.isModal) {
      this.switchToRegister.emit();
    } else {
      this.router.navigate(['/register']);
    }
  }

  closeModal(): void {
    this.close.emit();
  }

  clearError(): void {
    this.errorMessage = '';
  }
}