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
  currentPassword?: string;
  newPassword?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;    

  constructor(
  private http: HttpClient, 
  private authService: AuthService  
) {}

  /**
   * Obtiene todos los usuarios usando PL/SQL
   */
  getAllUsersPLSQL(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/plsql`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtiene todos los usuarios
   */
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtiene todos los usuarios activos usando PL/SQL
   */
  getAllActiveUsersPLSQL(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/plsql/active`).pipe(
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
   * Obtiene un usuario por ID usando PL/SQL
   */
  getUserByIdPLSQL(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/plsql/${id}`).pipe(
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
   * Obtiene un usuario por username usando PL/SQL
   */
  getUserByUsernamePLSQL(username: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/plsql/username/${username}`).pipe(
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
   * Crea un usuario administrador usando PL/SQL
   */
  createUserAdminPLSQL(user: User): Observable<User> {
    const headers = this.getHeaders();
    return this.http.post<User>(`${this.apiUrl}/plsql/adm`, user, { headers }).pipe(
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
   * Crea un cliente (usuario + detalle de cliente) - PARA REGISTRO usando PL/SQL
   */
  createClientPLSQL(clientData: RegisterRequest): Observable<User> {
    const headers = this.getHeaders();
    return this.http.post<User>(`${this.apiUrl}/plsql`, clientData, { headers }).pipe(
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
   * Actualiza un usuario existente usando PL/SQL
   */
  updateUserPLSQL(id: number, userData: UpdateUserRequest): Observable<User> {
    const headers = this.getHeaders();
    return this.http.put<User>(`${this.apiUrl}/plsql/${id}`, userData, { headers }).pipe(
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

updateCurrentUser(userData: UpdateUserRequest): Observable<User> {
  const currentUser = this.getCurrentUser();
  
  if (!currentUser || !currentUser.id) {
    return throwError(() => new Error('No hay usuario autenticado'));
  }

  const headers = this.getHeaders();
  
  // Transformar a la estructura que espera /cli/{id}
  const clientPayload: any = {
    user: {
      username: userData.username,
      email: userData.email,
      phone: userData.phone,
      role: userData.role,
    },
    clientDetail: userData.clientDetail,
  };

  // Si se incluye cambio de contraseña, agregarlo al payload
  if (userData.currentPassword && userData.newPassword) {
    clientPayload.currentPassword = userData.currentPassword;
    clientPayload.newPassword = userData.newPassword;
  }
  
  console.log('🔍 Payload enviado a /cli/{id}:', JSON.stringify(clientPayload, null, 2));
  
  return this.http.put<User>(`${this.apiUrl}/cli/${currentUser.id}`, clientPayload, { headers }).pipe(
    switchMap((updatedUser) => {
      console.log('✅ Usuario actualizado desde servidor:', updatedUser);
      console.log('🔄 Recargando datos frescos desde BD por ID...');
      
      // Después de actualizar, recarga desde BD por ID (más confiable si cambió el username)
      return this.authService.refreshUserDataById();
    }),
    tap((freshUser) => {
      console.log('✅ Datos frescos del usuario obtenidos:', freshUser);
    }),
    catchError((error) => {
      console.error('❌ Error en updateCurrentUser:', error);
      return throwError(() => error);
    })
  );
}



  /**
   * Elimina un usuario (cambio de estado) usando PL/SQL
   */
  deleteUserPLSQL(id: number): Observable<void> {
    const headers = this.getHeaders();
    return this.http.delete<void>(`${this.apiUrl}/plsql/${id}`, { headers }).pipe(
      catchError(this.handleError)
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
      console.log('💾 localStorage actualizado:', user);
      console.log('💾 Verificando localStorage:', localStorage.getItem('user_data'));
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
   * Cambia la contraseña del usuario actual usando PL/SQL
   */
  changePasswordPLSQL(changePasswordData: ChangePasswordRequest): Observable<any> {
    const currentUser = this.getCurrentUser();
    
    if (!currentUser || !currentUser.id) {
      return throwError(() => new Error('No hay usuario autenticado'));
    }

    const headers = this.getHeaders();
    
    return this.http.post(
      `${this.apiUrl}/plsql/${currentUser.id}/change-password`,
      changePasswordData,
      { headers }
    ).pipe(
      tap(() => {
        console.log('✅ Contraseña cambiada exitosamente (PL/SQL)');
      }),
      catchError((error) => {
        console.error('❌ Error al cambiar contraseña:', error);
        let errorMessage = 'Error al cambiar la contraseña';
        
        if (error.status === 401) {
          errorMessage = 'Contraseña actual incorrecta';
        } else if (error.status === 400) {
          errorMessage = error.error?.message || 'Datos inválidos';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Cambia la contraseña del usuario actual
   */
  changePassword(changePasswordData: ChangePasswordRequest): Observable<any> {
    const currentUser = this.getCurrentUser();
    
    if (!currentUser || !currentUser.id) {
      return throwError(() => new Error('No hay usuario autenticado'));
    }

    const headers = this.getHeaders();
    
    return this.http.post(
      `${this.apiUrl}/${currentUser.id}/change-password`,
      changePasswordData,
      { headers }
    ).pipe(
      tap(() => {
        console.log('✅ Contraseña cambiada exitosamente');
      }),
      catchError((error) => {
        console.error('❌ Error al cambiar contraseña:', error);
        let errorMessage = 'Error al cambiar la contraseña';
        
        if (error.status === 401) {
          errorMessage = 'Contraseña actual incorrecta';
        } else if (error.status === 400) {
          errorMessage = error.error?.message || 'Datos inválidos';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
        
        return throwError(() => new Error(errorMessage));
      })
    );
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