import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CitiesDepartmentService,
  City,
  Department,
} from '../../../services/cities-department.service';
import { AuthService, RegisterRequest } from '../../../services/auth.service';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  providers: [CitiesDepartmentService],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
})
export class Register implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() switchToLogin = new EventEmitter<void>();
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  userForm = {
    primerNombre: '',
    segundoNombre: '',
    primerApellido: '',
    segundoApellido: '',
    correo: '',
    password: '',
    username: '',
    telefono: '',
    tipoDireccion: '',
    numeroDireccion: '',
    complementoDireccion: '',
    numeroCruce: '',
    sufijoDireccion: '',
    departamento: '',
    ciudad: '',
  };

  // Opciones para el formulario de dirección
  tiposDireccion = [
    { value: 'calle', label: 'Calle' },
    { value: 'carrera', label: 'Carrera' },
    { value: 'transversal', label: 'Transversal' },
    { value: 'diagonal', label: 'Diagonal' },
    { value: 'avenida', label: 'Avenida' },
    { value: 'autopista', label: 'Autopista' },
    { value: 'bulevar', label: 'Bulevar' },
  ];

  sufijosDireccion = [
    { value: '', label: 'Sin sufijo' },
    { value: 'sur', label: 'Sur' },
    { value: 'este', label: 'Este' },
    { value: 'norte', label: 'Norte' },
    { value: 'oeste', label: 'Oeste' },
  ];

  departments: Department[] = [];
  cities: City[] = [];
  isLoadingDepartments = false;
  isLoadingCities = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  fieldErrors: { [key: string]: string } = {};
  hasFieldErrors(): boolean {
    return Object.keys(this.fieldErrors).length > 0;
  }
  constructor(
    private locationService: CitiesDepartmentService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.isLoadingDepartments = true;
    this.errorMessage = '';

    this.locationService.getDepartments().subscribe({
      next: (data) => {
        this.departments = data;
        this.isLoadingDepartments = false;
      },
      error: (err) => {
        console.error('Error al cargar departamentos:', err);
        this.errorMessage = 'No se pudieron cargar los departamentos';
        this.isLoadingDepartments = false;
      },
    });
  }

  onDepartmentChange(): void {
    this.userForm.ciudad = '';
    this.cities = [];

    if (!this.userForm.departamento) {
      return;
    }

    this.isLoadingCities = true;
    this.errorMessage = '';

    const departmentId = Number(this.userForm.departamento);

    this.locationService.getCitiesByDepartment(departmentId).subscribe({
      next: (data) => {
        this.cities = data;
        this.isLoadingCities = false;
      },
      error: (err) => {
        console.error('Error al cargar ciudades:', err);
        this.errorMessage = 'No se pudieron cargar las ciudades del departamento';
        this.isLoadingCities = false;
      },
    });
  }

  // ========== VALIDACIONES EN TIEMPO REAL ==========

  validateField(fieldName: string, value: string): void {
    switch (fieldName) {
      case 'primerNombre':
      case 'segundoNombre':
      case 'primerApellido':
      case 'segundoApellido':
        this.validateName(fieldName, value);
        break;
      case 'correo':
        this.validateEmail(value);
        break;
      case 'password':
        this.validatePassword(value);
        break;
      case 'username':
        this.validateUsername(value);
        break;
      case 'telefono':
        this.validatePhone(value);
        break;
      case 'numeroDireccion':
        this.validateAddressNumber(fieldName, value);
        break;
      case 'numeroCruce':
        this.validateCrossNumber(fieldName, value);
        break;
      case 'complementoDireccion':
        this.validateComplement(fieldName, value);
        break;
    }
  }
  private hasDangerousKeywords(text: string): boolean {
    const dangerousKeywords = [
      'SELECT',
      'INSERT',
      'UPDATE',
      'DELETE',
      'DROP',
      'CREATE',
      'ALTER',
      'EXEC',
      'UNION',
      'WHERE',
      'SCRIPT',
      'EVAL',
      'EXECUTE',
      'COMMAND',
      'SYSTEM',
      'OR',
      'AND',
      'FROM',
      'TABLE',
      'DATABASE',
      'TRUNCATE',
      'JOIN',
      'HAVING',
      'GROUP BY',
      'ORDER BY',
      'LIMIT',
      'OFFSET',
    ];

    const textUpper = text.toUpperCase();
    return dangerousKeywords.some(
      (keyword) =>
        textUpper === keyword ||
        textUpper.includes(` ${keyword} `) ||
        textUpper.startsWith(`${keyword} `) ||
        textUpper.endsWith(` ${keyword}`)
    );
  }
  validateAddressNumber(fieldName: string, value: string): void {
    if (!value) {
      this.fieldErrors[fieldName] = 'Este campo es obligatorio';
      return;
    }

    // Permitir números, letras y máximo 5 caracteres
    const addressRegex = /^[A-Za-z0-9]{1,5}$/;

    if (this.hasDangerousKeywords(value)) {
      this.fieldErrors[fieldName] = 'El texto contiene palabras no permitidas';
    } else if (!addressRegex.test(value)) {
      this.fieldErrors[fieldName] = 'Máximo 5 caracteres (solo letras y números)';
    } else {
      delete this.fieldErrors[fieldName];
    }
  }
  validateCrossNumber(fieldName: string, value: string): void {
    if (!value) {
      this.fieldErrors[fieldName] = 'Este campo es obligatorio';
      return;
    }

    // Permitir números, letras, guiones y máximo 5 caracteres
    const crossRegex = /^[A-Za-z0-9\-]{1,5}$/;

    if (this.hasDangerousKeywords(value)) {
      this.fieldErrors[fieldName] = 'El texto contiene palabras no permitidas';
    } else if (!crossRegex.test(value)) {
      this.fieldErrors[fieldName] = 'Máximo 5 caracteres (letras, números y guiones)';
    } else {
      delete this.fieldErrors[fieldName];
    }
  }
  validateComplement(fieldName: string, value: string): void {
    if (!value) {
      delete this.fieldErrors[fieldName];
      return;
    }

    const complementRegex = /^[A-Za-z0-9\-\s#]{1,50}$/;

    if (this.hasDangerousKeywords(value)) {
      this.fieldErrors[fieldName] = 'El texto contiene palabras no permitidas';
    } else if (!complementRegex.test(value)) {
      this.fieldErrors[fieldName] = 'Máximo 50 caracteres (letras, números, guiones y #)';
    } else {
      delete this.fieldErrors[fieldName];
    }
  }
  validateName(fieldName: string, value: string): void {
    if (!value) {
      if (fieldName === 'primerNombre' || fieldName === 'primerApellido') {
        this.fieldErrors[fieldName] = 'Este campo es obligatorio';
      } else {
        delete this.fieldErrors[fieldName];
      }
      return;
    }

    const nameRegex = /^[A-Za-zÁáÉéÍíÓóÚúÑñ]+$/;

    if (this.hasDangerousKeywords(value)) {
      this.fieldErrors[fieldName] = 'El texto contiene palabras no permitidas';
    } else if (!nameRegex.test(value)) {
      this.fieldErrors[fieldName] =
        'Solo se permiten letras, sin espacios ni caracteres especiales';
    } else if (value.length < 4) {
      this.fieldErrors[fieldName] = 'Mínimo 4 caracteres';
    } else if (value.length > 20) {
      this.fieldErrors[fieldName] = 'Máximo 20 caracteres';
    } else {
      delete this.fieldErrors[fieldName];
    }
  }

  validateEmail(email: string): void {
    if (!email) {
      this.fieldErrors['correo'] = 'El correo es obligatorio';
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(email)) {
      this.fieldErrors['correo'] = 'Formato de correo inválido';
    } else {
      delete this.fieldErrors['correo'];
    }
  }

  validatePassword(password: string): void {
    if (!password) {
      this.fieldErrors['password'] = 'La contraseña es obligatoria';
      return;
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    if (password.length < 8) {
      this.fieldErrors['password'] = 'Mínimo 8 caracteres';
    } else if (!hasUpperCase) {
      this.fieldErrors['password'] = 'Debe tener al menos una mayúscula';
    } else if (!hasLowerCase) {
      this.fieldErrors['password'] = 'Debe tener al menos una minúscula';
    } else if (!hasNumber) {
      this.fieldErrors['password'] = 'Debe tener al menos un número';
    } else if (!hasSpecialChar) {
      this.fieldErrors['password'] = 'Debe tener al menos un carácter especial';
    } else {
      delete this.fieldErrors['password'];
    }
  }

  validateUsername(username: string): void {
    if (!username) {
      this.fieldErrors['username'] = 'El username es obligatorio';
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9_]+$/;

    if (this.hasDangerousKeywords(username)) {
      this.fieldErrors['username'] = 'El texto contiene palabras no permitidas';
    } else if (username.length < 4) {
      this.fieldErrors['username'] = 'Mínimo 4 caracteres';
    } else if (username.length > 16) {
      this.fieldErrors['username'] = 'Máximo 16 caracteres';
    } else if (!usernameRegex.test(username)) {
      this.fieldErrors['username'] = 'Solo letras, números y guiones bajos';
    } else {
      delete this.fieldErrors['username'];
    }
  }

  validatePhone(phone: string): void {
    if (!phone) {
      this.fieldErrors['telefono'] = 'El teléfono es obligatorio';
      return;
    }

    const phoneRegex = /^3[0-9]{9}$/;

    if (!phoneRegex.test(phone)) {
      this.fieldErrors['telefono'] = 'Debe empezar con 3 y tener 10 dígitos';
    } else {
      delete this.fieldErrors['telefono'];
    }
  }

  validateNumber(fieldName: string, value: string): void {
    if (!value) {
      this.fieldErrors[fieldName] = 'Este campo es obligatorio';
      return;
    }

    const numberRegex = /^\d+$/;

    if (!numberRegex.test(value)) {
      this.fieldErrors[fieldName] = 'Solo se permiten números';
    } else {
      delete this.fieldErrors[fieldName];
    }
  }

  // ========== VALIDACIÓN FINAL DEL FORMULARIO ==========

  validateForm(): boolean {
    const requiredFields = [
      'primerNombre',
      'primerApellido',
      'correo',
      'password',
      'username',
      'telefono',
      'departamento',
      'ciudad',
      'tipoDireccion',
      'numeroDireccion',
      'numeroCruce',
    ];

    for (const field of requiredFields) {
      if (!this.userForm[field as keyof typeof this.userForm]) {
        this.errorMessage = `El campo ${this.getFieldLabel(field)} es obligatorio`;
        return false;
      }
    }

    if (Object.keys(this.fieldErrors).length > 0) {
      this.errorMessage = 'Por favor corrige los errores en el formulario';
      return false;
    }

    return true;
  }

  getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      primerNombre: 'Primer nombre',
      primerApellido: 'Primer apellido',
      correo: 'Correo electrónico',
      password: 'Contraseña',
      username: 'Nombre de usuario',
      telefono: 'Teléfono',
      departamento: 'Departamento',
      ciudad: 'Ciudad',
      tipoDireccion: 'Tipo de dirección',
      numeroDireccion: 'Número de dirección',
      numeroCruce: 'Número de cruce',
    };
    return labels[fieldName] || fieldName;
  }

  // ========== ENVÍO DEL FORMULARIO ==========

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.validateForm()) {
      return;
    }

    this.isSubmitting = true;

    const registerData: RegisterRequest = {
      user: {
        username: this.userForm.username,
        password: this.userForm.password,
        email: this.userForm.correo,
        phone: this.userForm.telefono,
        role: 'USER',
      },
      clientDetail: {
        firstName: this.userForm.primerNombre,
        secondName: this.userForm.segundoNombre || '',
        firstLastName: this.userForm.primerApellido,
        secondLastName: this.userForm.segundoApellido || '',
        address: this.buildMainAddress(),
        descAddress: this.userForm.complementoDireccion || '',
        city: {
          cityID: Number(this.userForm.ciudad),
        },
        department: {
          depID: Number(this.userForm.departamento),
        },
      },
    };

    console.log('Datos a enviar:', registerData);

    this.authService.register(registerData).subscribe({
      next: (user: any) => {
        this.isSubmitting = false;
        this.showToastMessage('¡Registro exitoso! Tu cuenta ha sido creada.', 'success');

        // Cerrar modal después de 2 segundos
        setTimeout(() => {
          this.close.emit();
          this.router.navigate(['/']);
        }, 2000);
      },
      error: (error: any) => {
        console.error('Error al registrar usuario:', error);
        this.isSubmitting = false;
        // Try multiple error message locations
        const errorMessage = 
          error.error?.message || 
          error.error?.error || 
          error.message || 
          'Error al registrar el usuario. Por favor, intenta nuevamente.';
        this.showToastMessage(errorMessage, 'error');
      },
    });
  }
  showToastMessage(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;

   
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }
  closeToast(): void {
    this.showToast = false;
  }
  buildMainAddress(): string {
    if (
      !this.userForm.tipoDireccion ||
      !this.userForm.numeroDireccion ||
      !this.userForm.numeroCruce
    ) {
      return '';
    }

    let direccion = `${this.capitalizeFirst(
      this.userForm.tipoDireccion
    )} ${this.userForm.numeroDireccion.toUpperCase()}`;

    if (this.userForm.sufijoDireccion) {
      direccion += ` ${this.capitalizeFirst(this.userForm.sufijoDireccion)}`;
    }

    direccion += ` # ${this.userForm.numeroCruce.toUpperCase()}`;

    return direccion;
  }

  capitalizeFirst(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  private autoLogin(): void {
    this.authService.login(this.userForm.username, this.userForm.password).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.close.emit();
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Error en login automático:', error);
        this.isSubmitting = false;
        this.successMessage = 'Usuario registrado. Por favor inicia sesión.';
        setTimeout(() => {
          this.switchToLogin.emit();
        }, 2000);
      },
    });
  }

  goToLogin(): void {
    this.switchToLogin.emit();
  }

  hasError(fieldName: string): boolean {
    return !!this.fieldErrors[fieldName];
  }

  getError(fieldName: string): string {
    return this.fieldErrors[fieldName] || '';
  }
}
