import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CitiesDepartmentService,
  City,
  Department,
} from '../../../services/cities-department.service';
import { AuthService } from '../../../services/auth.service';
import { UserService, User, UpdateUserRequest, ClientDetail } from '../../../services/user.service';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-update',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  providers: [CitiesDepartmentService, UserService],
  templateUrl: './user-update.html',
  styleUrls: ['./user-update.css'],
})
export class UserUpdate implements OnInit, OnDestroy {
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  private toastTimeout: any = null;
  
  // Formulario principal
  userForm = {
    primerNombre: '',
    segundoNombre: '',
    primerApellido: '',
    segundoApellido: '',
    correo: '',
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

  // Formulario de cambio de contraseña
  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  showPasswordForm = false;
  
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
  isChangingPassword = false;
  errorMessage = '';
  successMessage = '';
  userData: User | null = null;

  fieldErrors: { [key: string]: string } = {};
  passwordErrors: { [key: string]: string } = {};

  constructor(
    private locationService: CitiesDepartmentService,
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadDepartments();
  }

  loadUserData(): void {
    // Primero intentar obtener del UserService
    this.userData = this.userService.getCurrentUser();
    
    // Si no hay datos en UserService, intentar obtener del AuthService
    if (!this.userData) {
      this.userData = this.authService.getCurrentUser();
    }
    
    if (!this.userData) {
      this.showToastMessage('No se encontraron datos de usuario', 'error');
      this.router.navigate(['/']);
      return;
    }

    this.populateForm();
  }

  populateForm(): void {
    if (!this.userData || !this.userData.clientDetail) return;

    const detail = this.userData.clientDetail;
    
    this.userForm.primerNombre = detail.firstName;
    this.userForm.segundoNombre = detail.secondName || '';
    this.userForm.primerApellido = detail.firstLastName;
    this.userForm.segundoApellido = detail.secondLastName || '';
    this.userForm.correo = this.userData.email;
    this.userForm.username = this.userData.username;
    this.userForm.telefono = this.userData.phone;
    this.userForm.complementoDireccion = detail.descAddress || '';
    this.userForm.departamento = detail.department.depID.toString();
    this.userForm.ciudad = detail.city.cityID.toString();

    // Parsear dirección
    this.parseAddress(detail.address);
  }

  parseAddress(address: string): void {
    if (!address) return;
    
    const parts = address.split('#');
    
    if (parts.length >= 2) {
      this.userForm.numeroCruce = parts[1].trim();
      
      const firstPart = parts[0].trim();
      const words = firstPart.split(' ');
      
      if (words.length >= 2) {
        this.userForm.tipoDireccion = words[0].toLowerCase();
        
        const suffixes = ['sur', 'este', 'norte', 'oeste'];
        let numero = '';
        let sufijo = '';
        
        for (let i = 1; i < words.length; i++) {
          const word = words[i].toLowerCase();
          if (suffixes.includes(word)) {
            sufijo = word;
          } else {
            numero += words[i];
          }
        }
        
        this.userForm.numeroDireccion = numero;
        this.userForm.sufijoDireccion = sufijo;
      }
    }
  }

  loadDepartments(): void {
    this.isLoadingDepartments = true;
    this.errorMessage = '';

    this.locationService.getDepartments().subscribe({
      next: (data) => {
        this.departments = data;
        this.isLoadingDepartments = false;
        
        if (this.userForm.departamento) {
          this.loadCitiesForDepartment(Number(this.userForm.departamento));
        }
      },
      error: (err) => {
        console.error('Error al cargar departamentos:', err);
        this.errorMessage = 'No se pudieron cargar los departamentos';
        this.isLoadingDepartments = false;
      },
    });
  }

  loadCitiesForDepartment(departmentId: number): void {
    this.isLoadingCities = true;
    
    this.locationService.getCitiesByDepartment(departmentId).subscribe({
      next: (data) => {
        this.cities = data;
        this.isLoadingCities = false;
      },
      error: (err) => {
        console.error('Error al cargar ciudades:', err);
        this.errorMessage = 'No se pudieron cargar las ciudades';
        this.isLoadingCities = false;
      },
    });
  }

  onDepartmentChange(): void {
    this.userForm.ciudad = '';
    this.cities = [];

    if (!this.userForm.departamento) {
      return;
    }

    const departmentId = Number(this.userForm.departamento);
    this.loadCitiesForDepartment(departmentId);
  }

  // ========== VALIDACIONES FORMULARIO PRINCIPAL ==========
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
      'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER',
      'EXEC', 'UNION', 'WHERE', 'SCRIPT', 'EVAL', 'EXECUTE', 'COMMAND',
      'SYSTEM', 'OR', 'AND', 'FROM', 'TABLE', 'DATABASE', 'TRUNCATE',
      'JOIN', 'HAVING', 'GROUP BY', 'ORDER BY', 'LIMIT', 'OFFSET',
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
      this.fieldErrors[fieldName] = 'Solo se permiten letras, sin espacios ni caracteres especiales';
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

  validateForm(): boolean {
    const requiredFields = [
      'primerNombre',
      'primerApellido',
      'correo',
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

  // ========== VALIDACIONES CONTRASEÑA ==========
  validatePasswordField(fieldName: string, value: string): void {
    switch (fieldName) {
      case 'currentPassword':
        this.validateCurrentPassword(value);
        break;
      case 'newPassword':
        this.validateNewPassword(value);
        break;
      case 'confirmPassword':
        this.validateConfirmPassword(value);
        break;
    }
  }

  validateCurrentPassword(value: string): void {
    if (!value) {
      this.passwordErrors['currentPassword'] = 'La contraseña actual es obligatoria';
    } else {
      delete this.passwordErrors['currentPassword'];
    }
  }

  validateNewPassword(value: string): void {
  if (!value) {
    this.passwordErrors['newPassword'] = 'La nueva contraseña es obligatoria';
    return;
  }

  // Expresión regular corregida - más permisiva con caracteres especiales
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

  if (this.hasDangerousKeywords(value)) {
    this.passwordErrors['newPassword'] = 'La contraseña contiene palabras no permitidas';
  } else if (value.length < 8) {
    this.passwordErrors['newPassword'] = 'Mínimo 8 caracteres';
  } else if (!/(?=.*[a-z])/.test(value)) {
    this.passwordErrors['newPassword'] = 'Debe contener al menos una minúscula';
  } else if (!/(?=.*[A-Z])/.test(value)) {
    this.passwordErrors['newPassword'] = 'Debe contener al menos una mayúscula';
  } else if (!/(?=.*\d)/.test(value)) {
    this.passwordErrors['newPassword'] = 'Debe contener al menos un número';
  } else if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(value)) {
    this.passwordErrors['newPassword'] = 'Debe contener al menos un carácter especial';
  } else {
    delete this.passwordErrors['newPassword'];
  }

  // Validar confirmación si ya hay valor
  if (this.passwordForm.confirmPassword) {
    this.validateConfirmPassword(this.passwordForm.confirmPassword);
  }
}

  validateConfirmPassword(value: string): void {
    if (!value) {
      this.passwordErrors['confirmPassword'] = 'Confirma tu nueva contraseña';
      return;
    }

    if (value !== this.passwordForm.newPassword) {
      this.passwordErrors['confirmPassword'] = 'Las contraseñas no coinciden';
    } else {
      delete this.passwordErrors['confirmPassword'];
    }
  }

  validatePasswordForm(): boolean {
    // Validar todos los campos
    this.validateCurrentPassword(this.passwordForm.currentPassword);
    this.validateNewPassword(this.passwordForm.newPassword);
    this.validateConfirmPassword(this.passwordForm.confirmPassword);

    if (Object.keys(this.passwordErrors).length > 0) {
      return false;
    }

    return true;
  }

  // ========== MÉTODOS PRINCIPALES ==========
  getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      primerNombre: 'Primer nombre',
      primerApellido: 'Primer apellido',
      correo: 'Correo electrónico',
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

  togglePasswordForm(): void {
    this.showPasswordForm = !this.showPasswordForm;
    if (!this.showPasswordForm) {
      this.resetPasswordForm();
    }
  }

  resetPasswordForm(): void {
    this.passwordForm = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    this.passwordErrors = {};
  }

  onSubmit(): void {
  this.errorMessage = '';
  this.successMessage = '';

  if (!this.validateForm()) {
    return;
  }

  this.isSubmitting = true;

  // Estructura CORRECTA que espera el backend (UpdateUserRequest plano)
  const updateData: UpdateUserRequest = {
    id: this.userData?.id,
    username: this.userData?.username || '', // Mantener el username original
    email: this.userForm.correo,
    phone: this.userForm.telefono,
    role: this.userData?.role || 'CLIENT',
    clientDetail: {
      id: this.userData?.clientDetail?.id,
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

  console.log('🔍 Datos a enviar al servidor:', JSON.stringify(updateData, null, 2));
  console.log('🔍 UserData actual:', this.userData);

  this.userService.updateCurrentUser(updateData).subscribe({
    next: (updatedUser) => {
      console.log('✅ Respuesta del servidor:', updatedUser);
      this.isSubmitting = false;
      
      // Actualizar datos en ambos servicios
      this.userData = updatedUser;
      this.userService.updateLocalStorage(updatedUser);
      this.authService.updateUserData(updatedUser as any);
      
      this.showToastMessage('¡Información actualizada exitosamente!', 'success');
      
      // Redirigir después de 1.5 segundos
      setTimeout(() => {
        this.router.navigate(['/store']);
      }, 1500);
    },
    error: (error) => {
      console.error('❌ Error al actualizar usuario:', error);
      this.isSubmitting = false;
      this.showToastMessage(
        error.message || 'Error al actualizar la información. Por favor, intenta nuevamente.',
        'error'
      );
    },
  });
}

  onChangePassword(): void {
    if (!this.validatePasswordForm()) {
      this.showToastMessage('Por favor corrige los errores en el formulario de contraseña', 'error');
      return;
    }

    this.isChangingPassword = true;
    this.errorMessage = '';

    // Estructura completa que incluye contraseña + todos los datos del usuario
    const updateDataWithPassword: UpdateUserRequest = {
      id: this.userData?.id,
      username: this.userData?.username || '',
      email: this.userForm.correo,
      phone: this.userForm.telefono,
      role: this.userData?.role || 'CLIENT',
      clientDetail: {
        id: this.userData?.clientDetail?.id,
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
      currentPassword: this.passwordForm.currentPassword,
      newPassword: this.passwordForm.newPassword,
    };

    console.log('🔍 Cambio de contraseña con datos completos:', JSON.stringify(updateDataWithPassword, null, 2));

    this.userService.updateCurrentUser(updateDataWithPassword).subscribe({
      next: (updatedUser) => {
        console.log('✅ Contraseña y datos actualizados:', updatedUser);
        this.isChangingPassword = false;
        
        // Actualizar datos en ambos servicios
        this.userData = updatedUser;
        this.userService.updateLocalStorage(updatedUser);
        this.authService.updateUserData(updatedUser as any);
        
        this.showToastMessage('¡Contraseña y datos actualizados exitosamente!', 'success');
        this.togglePasswordForm();
        this.resetPasswordForm();
        
        // Redirigir después de 1.5 segundos
        setTimeout(() => {
          this.router.navigate(['/store']);
        }, 1500);
      },
      error: (error) => {
        this.isChangingPassword = false;
        this.showToastMessage(
          error.message || 'Error al actualizar. Por favor, intenta nuevamente.',
          'error'
        );
      },
    });
  }

  showToastMessage(message: string, type: 'success' | 'error'): void {
    // Limpiar el timeout anterior si existe
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }

    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;

    this.toastTimeout = setTimeout(() => {
      this.showToast = false;
      this.toastTimeout = null;
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

  hasError(fieldName: string): boolean {
    return !!this.fieldErrors[fieldName];
  }

  getError(fieldName: string): string {
    return this.fieldErrors[fieldName] || '';
  }

  hasPasswordError(fieldName: string): boolean {
    return !!this.passwordErrors[fieldName];
  }

  getPasswordError(fieldName: string): string {
    return this.passwordErrors[fieldName] || '';
  }

  hasFieldErrors(): boolean {
    return Object.keys(this.fieldErrors).length > 0;
  }

  hasPasswordErrors(): boolean {
    return Object.keys(this.passwordErrors).length > 0;
  }

  goBack(): void {
    this.router.navigate(['/store']);
  }

  ngOnDestroy(): void {
    // Limpiar el timeout del toast si existe
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
  }
}