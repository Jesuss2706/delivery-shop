import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

console.log('Environment:', environment);
console.log('API URL:', environment.apiUrl);

export interface City {
  id: number;
  name: string;
  departmentId?: number;
}

export interface Department {
  id: number;
  name: string;
}

interface DepartmentAPI {
  depID: number;
  depName: string;
}

interface CityAPI {
  cityID: number;
  cityName: string;
  depID?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CitiesDepartmentService {
  
  
  private readonly API_URL = environment.apiUrl;
  private readonly CITY_ENDPOINT = `${this.API_URL}/city`;
  private readonly DEPARTMENT_ENDPOINT = `${this.API_URL}/department`;

  constructor(private http: HttpClient) { 
    console.log('Environment actual:', environment);
    console.log('Production mode:', environment.production);
    console.log('API URL:', environment.apiUrl);
  }

  // ========== Métodos de Departamentos con PL/SQL ==========

  getDepartmentsPLSQL(): Observable<Department[]> {
    console.log('Llamando a (PL/SQL):', `${this.DEPARTMENT_ENDPOINT}/plsql`);
    return this.http.get<DepartmentAPI[]>(`${this.DEPARTMENT_ENDPOINT}/plsql`)
      .pipe(
        map(departments => departments.map(dept => ({
          id: dept.depID,
          name: dept.depName
        }))),
        catchError(this.handleError)
      );
  }

  getDepartmentByIdPLSQL(id: number): Observable<Department> {
    return this.http.get<DepartmentAPI>(`${this.DEPARTMENT_ENDPOINT}/plsql/${id}`)
      .pipe(
        map(dept => ({
          id: dept.depID,
          name: dept.depName
        })),
        catchError(this.handleError)
      );
  }

  // ========== Métodos de Departamentos (JPA - FALLBACK) ==========

  getDepartments(): Observable<Department[]> {
    console.log('Llamando a:', this.DEPARTMENT_ENDPOINT);
    return this.http.get<DepartmentAPI[]>(this.DEPARTMENT_ENDPOINT)
      .pipe(
        map(departments => departments.map(dept => ({
          id: dept.depID,
          name: dept.depName
        }))),
        catchError(this.handleError)
      );
  }

  getDepartmentById(id: number): Observable<Department> {
    return this.http.get<DepartmentAPI>(`${this.DEPARTMENT_ENDPOINT}/${id}`)
      .pipe(
        map(dept => ({
          id: dept.depID,
          name: dept.depName
        })),
        catchError(this.handleError)
      );
  }

  // ========== Métodos de Ciudades ==========
  // ========== Métodos de Ciudades con PL/SQL ==========

  /**
   * Obtiene todas las ciudades usando PL/SQL
   */
  getCitiesPLSQL(): Observable<City[]> {
    return this.http.get<CityAPI[]>(`${this.CITY_ENDPOINT}/plsql`)
      .pipe(
        map(cities => cities.map(city => ({
          id: city.cityID,
          name: city.cityName,
          departmentId: city.depID
        }))),
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene una ciudad por su ID usando PL/SQL
   */
  getCityByIdPLSQL(id: number): Observable<City> {
    return this.http.get<CityAPI>(`${this.CITY_ENDPOINT}/plsql/${id}`)
      .pipe(
        map(city => ({
          id: city.cityID,
          name: city.cityName,
          departmentId: city.depID
        })),
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene todas las ciudades de un departamento específico usando PL/SQL
   */
  getCitiesByDepartmentPLSQL(departmentId: number): Observable<City[]> {
    const url = `${this.CITY_ENDPOINT}/plsql/department/${departmentId}`;
    console.log('Llamando a (PL/SQL):', url);
    return this.http.get<CityAPI[]>(url)
      .pipe(
        map(cities => cities.map(city => ({
          id: city.cityID,
          name: city.cityName,
          departmentId: city.depID
        }))),
        catchError(this.handleError)
      );
  }

  // ========== Métodos de Ciudades (JPA - FALLBACK) ==========

  /**
   * Obtiene todas las ciudades
   */
  getCities(): Observable<City[]> {
    return this.http.get<CityAPI[]>(this.CITY_ENDPOINT)
      .pipe(
        map(cities => cities.map(city => ({
          id: city.cityID,
          name: city.cityName,
          departmentId: city.depID
        }))),
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene una ciudad por su ID
   */
  getCityById(id: number): Observable<City> {
    return this.http.get<CityAPI>(`${this.CITY_ENDPOINT}/${id}`)
      .pipe(
        map(city => ({
          id: city.cityID,
          name: city.cityName,
          departmentId: city.depID
        })),
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene todas las ciudades de un departamento específico
   */
  getCitiesByDepartment(departmentId: number): Observable<City[]> {
    const url = `${this.CITY_ENDPOINT}/department/${departmentId}`;
    console.log('Llamando a:', url);
    return this.http.get<CityAPI[]>(url)
      .pipe(
        map(cities => cities.map(city => ({
          id: city.cityID,
          name: city.cityName,
          departmentId: city.depID
        }))),
        catchError(this.handleError)
      );
  }

  // ========== Manejo de Errores ==========
  
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ha ocurrido un error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 204:
          errorMessage = 'No se encontraron resultados';
          break;
        case 404:
          errorMessage = error.error || 'Recurso no encontrado';
          break;
        case 400:
          errorMessage = 'Solicitud incorrecta - Verifica los datos enviados';
          break;
        case 500:
          errorMessage = 'Error interno del servidor';
          break;
        default:
          errorMessage = `Código de error: ${error.status}\nMensaje: ${error.message}`;
      }
    }
    
    console.error('Error completo:', error);
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}