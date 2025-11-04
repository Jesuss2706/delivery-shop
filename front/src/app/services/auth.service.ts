import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

// Interfaces
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface RegisterRequest {
  user: {
    username: string;
    password: string;
    email: string;
    phone: string;
    role?: string;
  };
  clientDetail: {
    firstName: string;
    secondName: string;
    secondLastName: string;
    firstLastName: string;
    address: string;
    descAddress: string;
    city: {
      cityID: number;
    };
    department: {
      depID: number;
    };
  };
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  phone: string;
  createdAt: string;
  status: string;
  clientDetail?: any;
}

export interface DecodedToken {
  sub: string;
  role: string;
  iat: number;
  exp: number;
  userId?: number;
  email?: string;
  phone?: string;
  id?: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;
  private readonly AUTH_ENDPOINT = `${this.API_URL}/auth`;
  private readonly USERS_ENDPOINT = `${this.API_URL}/users`;

  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_data';

  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  private isAuthenticatedSubject: BehaviorSubject<boolean>;
  public isAuthenticated: Observable<boolean>;

  constructor(private http: HttpClient, private router: Router) {
    const storedUser = this.getUserFromStorage();
    this.currentUserSubject = new BehaviorSubject<User | null>(storedUser);
    this.currentUser = this.currentUserSubject.asObservable();

    this.isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
    this.isAuthenticated = this.isAuthenticatedSubject.asObservable();
  }

  // ============================================================
  // =====================  AUTENTICACIÓN  ======================
  // ============================================================

  /**
   * Inicia sesión con username y password
   */
  /**
   * Inicia sesión con username y password
   */
  login(username: string, password: string): Observable<{ token: string; user?: User }> {
    return this.http
      .post<{ token: string; user?: User }>(`${this.AUTH_ENDPOINT}/login`, { username, password })
      .pipe(
        tap((response) => {
          if (response && response.token) {
            this.saveToken(response.token);
            this.isAuthenticatedSubject.next(true);

            const decoded = this.decodeToken(response.token);
            console.log('🔍 Token decodificado:', decoded);

            // Si el backend devuelve el usuario completo, usarlo
            if (response.user) {
              console.log('✅ Usuario recibido del backend:', response.user);
              this.setUser(response.user);
            } else {
              // Si no, obtener los datos completos del usuario
              this.getUserData(decoded.sub).subscribe({
                next: (user) => {
                  console.log('✅ Usuario obtenido después del login:', user);
                  this.setUser(user);
                },
                error: (err) => {
                  console.error('❌ Error obteniendo datos del usuario:', err);
                  // Crear usuario temporal como fallback
                  const basicUser: User = {
                    id: this.extractUserIdFromToken(decoded) || 0,
                    username: decoded.sub,
                    email: decoded.email || '',
                    role: decoded.role,
                    phone: decoded.phone || '',
                    createdAt: new Date().toISOString(),
                    status: 'ACTIVE',
                  };
                  console.log('🔄 Usuario temporal creado:', basicUser);
                  this.setUser(basicUser);
                },
              });
            }
          }
        }),
        catchError(this.handleError)
      );
  }
  // Agrega este método para debug
  debugTokenInfo(): void {
    const token = this.getToken();
    if (!token) {
      console.log('❌ No hay token disponible');
      return;
    }

    try {
      const decoded = this.decodeToken(token);
      console.log('=== DEBUG TOKEN INFO ===');
      console.log('Token completo:', token);
      console.log('Token decodificado:', decoded);
      console.log('Subject (sub):', decoded.sub);
      console.log('Role:', decoded.role);
      console.log('UserID from token:', this.extractUserIdFromToken(decoded));
      console.log('Todas las propiedades:', Object.keys(decoded));
      console.log('========================');
    } catch (error) {
      console.error('Error decodificando token para debug:', error);
    }
  }

  private extractUserIdFromToken(decoded: DecodedToken): number | null {
    // Probar diferentes posibles nombres para el ID en el token
    return (
      decoded.userId ||
      decoded.id ||
      (decoded.sub && !isNaN(Number(decoded.sub)) ? Number(decoded.sub) : null)
    );
  }

  /**
   * Registra un nuevo usuario
   */
  register(userData: RegisterRequest): Observable<User> {
    const clientData = {
      user: {
        username: userData.user.username,
        password: userData.user.password,
        email: userData.user.email,
        phone: userData.user.phone,
        role: userData.user.role || 'USER',
      },
      clientDetail: {
        firstName: userData.clientDetail.firstName,
        secondName: userData.clientDetail.secondName,
        firstLastName: userData.clientDetail.firstLastName,
        secondLastName: userData.clientDetail.secondLastName,
        address: userData.clientDetail.address,
        descAddress: userData.clientDetail.descAddress,
        city: {
          cityID: userData.clientDetail.city.cityID,
        },
        department: {
          depID: userData.clientDetail.department.depID,
        },
      },
    };

    console.log('Enviando datos al backend:', clientData);

    return this.http.post<User>(`${this.USERS_ENDPOINT}/cli`, clientData).pipe(
      tap((user) => {
        console.log('Usuario registrado exitosamente:', user);
        this.setUser(user);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Cierra la sesión del usuario
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem('temp_username');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/']);
    console.log('Sesión cerrada');
  }

  // ============================================================
  // =====================  TOKEN / JWT  ========================
  // ============================================================

  saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  hasValidToken(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const decoded = this.decodeToken(token);
      const now = Date.now() / 1000;
      return decoded.exp > now;
    } catch {
      return false;
    }
  }

  decodeToken(token: string): DecodedToken {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Error decodificando token:', error);
      throw error;
    }
  }

  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const decoded = this.decodeToken(token);
      return decoded.role;
    } catch {
      return null;
    }
  }
  getUserId(): number | null {
    const user = this.getCurrentUser();
    if (user && user.id) {
      console.log('✅ ID de usuario obtenido:', user.id);
      return user.id;
    }

    // Fallback: buscar en localStorage directamente
    const userStr = localStorage.getItem(this.USER_KEY);
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        console.log('✅ ID de usuario obtenido desde localStorage:', userData.id);
        return userData.id || null;
      } catch (error) {
        console.error('❌ Error parseando user data:', error);
      }
    }

    console.log('❌ No se pudo obtener el ID del usuario');
    return null;
  }

  getUsernameFromToken(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const decoded = this.decodeToken(token);
      return decoded.sub;
    } catch {
      return null;
    }
  }

  // ============================================================
  // =====================  USUARIO  ============================
  // ============================================================

  getUserData(username: string): Observable<User> {
  console.log('🔍 Obteniendo datos del usuario:', username);
  console.log('🔗 URL:', `${this.USERS_ENDPOINT}/username/${username}`);
  
  return this.http.get<User>(`${this.USERS_ENDPOINT}/username/${username}`, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }).pipe(
    tap((user) => {
      console.log('✅ Datos completos del usuario obtenidos:', user);
      this.setUser(user);
    }),
    catchError((error) => {
      console.error('❌ Error obteniendo datos del usuario:', error);
      console.error('❌ Error status:', error.status);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error details:', error.error);
      return throwError(() => error);
    })
  );
}

  refreshUserData(): Observable<User> {
    const username = this.getUsernameFromToken();
    if (!username) {
      return throwError(() => new Error('No hay usuario autenticado'));
    }
    return this.getUserData(username);
  }

  private setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private getUserFromStorage(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  // ============================================================
  // =====================  VALIDACIONES  =======================
  // ============================================================

  isAdmin(): boolean {
    return this.getUserRole() === 'ADMIN';
  }

  isLoggedIn(): boolean {
    return this.hasValidToken();
  }

  // ============================================================
  // =====================  ERRORES  ============================
  // ============================================================

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ha ocurrido un error desconocido';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 401:
          errorMessage = 'Usuario o contraseña incorrectos';
          break;
        case 403:
          errorMessage = 'No tienes permiso para realizar esta acción';
          break;
        case 404:
          errorMessage = 'Usuario no encontrado';
          break;
        case 409:
          errorMessage = 'El usuario ya existe';
          break;
        case 500:
          errorMessage = 'Error interno del servidor';
          break;
        default:
          errorMessage = error.error?.message || `Error ${error.status}: ${error.message}`;
      }
    }

    console.error('Error en AuthService:', error);
    return throwError(() => new Error(errorMessage));
  }
}
