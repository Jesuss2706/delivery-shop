import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, retry, delay } from 'rxjs/operators';
import { environment } from '../../environments/environment';

// Interfaces basadas en los DTOs del backend
export interface CheckoutRequest {
  userID: number;
  paymentType: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA';
}

export interface CheckoutResponse {
  ordID: number;
  ordState: string;
  ordDate: string;
  totalBill: number;
  paymentType: string;
  message: string;
  billCode: number;
}

export interface OrderSummaryDTO {
  ordID: number;
  ordState: string;
  ordDate: string;
  total: number;
  paymentType: string;
  itemCount: number;
}

export interface OrderItemDTO {
  proCode: number;
  proName: string;
  proImg: string;
  proMark: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface UserInfoDTO {
  id: number;
  username: string;
  email: string;
  phone: string;
  fullName: string;
  address: string;
  city: string;
  department: string;
}

export interface OrderDetailDTO {
  ordID: number;
  ordState: string;
  ordDate: string;
  total: number;
  paymentType: string;
  billCode: number;
  items: OrderItemDTO[];
  user: UserInfoDTO;
}

export interface CancelOrderRequest {
  reason: string;
}

export interface UpdateOrderStateRequest {
  state: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {
  private apiUrl = `${environment.apiUrl}/api/checkout`;

  constructor(private http: HttpClient) {}

  /**
   * Procesar una compra desde el carrito
   */
  processCheckout(checkoutRequest: CheckoutRequest): Observable<CheckoutResponse> {
    return this.http
      .post<CheckoutResponse>(`${this.apiUrl}/process`, checkoutRequest)
      .pipe(
        retry({ count: 3, delay: (error, retryCount) => {
          // Solo reintentar en errores de serialización de transacciones (5xx) o timeout
          if ((error.status >= 500 && error.status < 600) || error.status === 0) {
            console.warn(`Reintentando checkout (intento ${retryCount + 1}/3)...`);
            return of(null).pipe(delay(Math.pow(2, retryCount) * 500)); // Backoff exponencial
          }
          return throwError(() => error);
        }}),
        catchError(this.handleError)
      );
  }

  /**
   * Obtener historial de órdenes de un usuario
   */
  getOrderHistory(userID: number): Observable<OrderSummaryDTO[]> {
    return this.http
      .get<OrderSummaryDTO[]>(`${this.apiUrl}/orders/${userID}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtener detalle de una orden específica
   */
  getOrderDetail(ordID: number): Observable<OrderDetailDTO> {
    return this.http
      .get<OrderDetailDTO>(`${this.apiUrl}/order/${ordID}`)
      .pipe(catchError(this.handleError));
  }
  getAllOrders(): Observable<OrderSummaryDTO[]> {
    return this.http
      .get<OrderSummaryDTO[]>(`${this.apiUrl}/orders`)
      .pipe(catchError(this.handleError));
  }
  getAllOrdersWithFilters(state?: string): Observable<OrderSummaryDTO[]> {
    let params = new HttpParams();
    if (state && state !== 'all') {
      params = params.set('state', state);
    }

    return this.http
      .get<OrderSummaryDTO[]>(`${this.apiUrl}/admin/orders/filtered`, { params })
      .pipe(catchError(this.handleError));
  }
  updateOrderStatus(ordID: number, newState: string): Observable<any> {
    const updateRequest: UpdateOrderStateRequest = { state: newState };
    return this.http
      .put(`${this.apiUrl}/admin/order/${ordID}/status`, updateRequest)
      .pipe(catchError(this.handleError));
  }
  /**
   * Cancelar una orden
   */
  cancelOrder(ordID: number, reason: string): Observable<any> {
    const cancelRequest: CancelOrderRequest = { reason };
    return this.http
      .post(`${this.apiUrl}/cancel/${ordID}`, cancelRequest)
      .pipe(catchError(this.handleError));
  }

  /**
   * Cambiar estado de una orden (solo para administradores)
   */
  changeOrderStatus(ordID: number, newState: string): Observable<any> {
    const updateRequest: UpdateOrderStateRequest = { state: newState };
    return this.http
      .put(`${this.apiUrl}/order/${ordID}/status`, updateRequest)
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtener órdenes pendientes de un usuario
   */
  getPendingOrders(userID: number): Observable<OrderSummaryDTO[]> {
    return this.http
      .get<OrderSummaryDTO[]>(`${this.apiUrl}/pending/${userID}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Health check del servicio
   */
  healthCheck(): Observable<any> {
    return this.http.get(`${this.apiUrl}/health`).pipe(catchError(this.handleError));
  }

  /**
   * Manejo de errores HTTP
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ha ocurrido un error desconocido';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      if (error.error && error.error.error) {
        errorMessage = error.error.error;
      } else if (error.status === 0) {
        errorMessage = 'No se pudo conectar con el servidor. Por favor, verifica tu conexión.';
      } else if (error.status === 400) {
        // Verificar si es error de serialización de transacción
        if (errorMessage.includes('Error de transacción concurrente')) {
          errorMessage = 'La compra está siendo procesada. Por favor, intenta nuevamente en unos momentos.';
        } else {
          errorMessage = error.error?.message || 'Datos inválidos en la solicitud';
        }
      } else if (error.status === 408) {
        errorMessage = 'La solicitud tardó demasiado tiempo. Por favor, intenta nuevamente.';
      } else if (error.status >= 500) {
        errorMessage = 'El servidor está experimentando problemas. Por favor, intenta nuevamente en unos momentos.';
      } else {
        errorMessage = `Error ${error.status}: ${error.message}`;
      }
    }

    console.error('Error en CheckoutService:', error);
    console.error('Mensaje de error procesado:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
