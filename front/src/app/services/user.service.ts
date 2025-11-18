import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface City {
  cityID: number;
  cityName?: string;
  department?: Department;
}

export interface Department {
  depID: number;
  depName?: string;
}

export interface ClientDetail {
  id?: number;
  firstName: string;
  secondName?: string;
  firstLastName: string;
  secondLastName?: string;
  address: string;
  descAddress?: string;
  city: City;
  department: Department;
}

export interface User {
  id: number;
  username: string;
  password?: string;
  email: string;
  role: string;
  phone: string;
  createdAt?: string;
  status?: string;
  clientDetail?: ClientDetail;
}

export interface RegisterRequest {
  user: {
    username: string;
    password: string;
    email: string;
    phone: string;
    role: string;
  };
  clientDetail: ClientDetail;
}

export interface UpdateUserRequest {
  id?: number;
  username: string;
  email: string;
  phone: string;
  role: string;
  status?: string;
  clientDetail: ClientDetail;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;    

  constructor(
  private http: HttpClient, 
  private authService: AuthService  // Agrega esta inyección
) {}

  /**
   * Obtiene todos los usuarios
   */
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtiene todos los usuarios activos
   */
  getAllActiveUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/active`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtiene un usuario por ID
   */
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtiene un usuario por username
   */
  getUserByUsername(username: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/username/${username}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Crea un usuario administrador
   */
  createUserAdmin(user: User): Observable<User> {
    const headers = this.getHeaders();
    return this.http.post<User>(`${this.apiUrl}/adm`, user, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Crea un cliente (usuario + detalle de cliente) - PARA REGISTRO
   */
  createClient(clientData: RegisterRequest): Observable<User> {
    const headers = this.getHeaders();
    return this.http.post<User>(this.apiUrl, clientData, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Actualiza un usuario existente
   */
  updateUser(id: number, userData: UpdateUserRequest): Observable<User> {
    const headers = this.getHeaders();
    return this.http.put<User>(`${this.apiUrl}/${id}`, userData, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Actualiza el cliente actual (desde localStorage)
   */
  // En UserService - modifica el método updateCurrentUser:

// En user.service.ts - modifica updateCurrentUser
// En user.service.ts - modifica updateCurrentUser

updateCurrentUser(userData: UpdateUserRequest): Observable<User> {
  const currentUser = this.getCurrentUser();
  
  if (!currentUser || !currentUser.id) {
    return throwError(() => new Error('No hay usuario autenticado'));
  }

  return this.updateUser(currentUser.id, userData).pipe(
    // Después de actualizar, forzar una recarga de los datos completos
    switchMap((updatedUser) => {
      console.log('✅ Usuario actualizado, recargando datos completos...');
      
      // Forzar una recarga desde el backend para obtener datos frescos
      return this.getUserById(currentUser.id!).pipe(
        tap((freshUser) => {
          console.log('✅ Datos frescos del usuario:', freshUser);
          this.updateLocalStorage(freshUser);
          
          const authUser = {
            ...freshUser,
            createdAt: freshUser.createdAt ?? '',
          } as any;
          this.authService.updateUserData(authUser);
        }),
        map((freshUser) => freshUser)
      );
    }),
    catchError((error) => {
      console.error('❌ Error en updateCurrentUser:', error);
      return throwError(() => error);
    })
  );
}



  /**
   * Elimina un usuario (cambio de estado)
   */
  deleteUser(id: number): Observable<void> {
    const headers = this.getHeaders();
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtiene el usuario actual desde localStorage
   */
  getCurrentUser(): User | null {
    const userDataStr = localStorage.getItem('user_data');
    
    if (!userDataStr) {
      return null;
    }

    try {
      return JSON.parse(userDataStr);
    } catch (error) {
      console.error('Error al parsear user_data:', error);
      return null;
    }
  }

  /**
   * Actualiza el usuario en localStorage
   */
  updateLocalStorage(user: User): void {
    try {
      localStorage.setItem('user_data', JSON.stringify(user));
    } catch (error) {
      console.error('Error al actualizar localStorage:', error);
    }
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  /**
   * Obtiene los headers con el token de autenticación
   */
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  /**
   * Manejo centralizado de errores
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'Ha ocurrido un error';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      if (error.status === 404) {
        errorMessage = error.error?.message || 'Usuario no encontrado';
      } else if (error.status === 400) {
        errorMessage = error.error?.error || 'Datos inválidos';
      } else if (error.status === 401) {
        errorMessage = 'No autorizado';
      } else if (error.status === 403) {
        errorMessage = 'Acceso prohibido';
      } else if (error.status === 500) {
        errorMessage = 'Error interno del servidor';
      } else {
        errorMessage = error.error?.message || `Error ${error.status}: ${error.statusText}`;
      }
    }

    console.error('Error en UserService:', error);
    return throwError(() => new Error(errorMessage));
  }
}