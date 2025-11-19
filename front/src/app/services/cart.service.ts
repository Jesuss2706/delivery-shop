import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Product } from './product.service';

// Interface para el usuario que viene en el carrito (estructura del backend)
export interface UserInCart {
  id: number;
  username: string;
  email: string;
  role: string;
  phone: string;
  createdAt: string;
  status: string;
  clientDetail?: any; // Opcional, viene con los detalles del cliente
}

// Interface Cart actualizada según la respuesta REAL del backend
export interface Cart {
  cartID: number;
  user: UserInCart;  // El backend envía "user" (objeto completo), NO "userID"
  proCode: Product;  // Producto completo
  quantity: number;
  addedDate: Date | string; // Puede ser Date o string dependiendo del backend
}

export interface CartItemDTO {
  userID: number;
  proCode: number;
  quantity: number;
}

export interface CartResponse {
  items: Cart[];
  total: number;
  itemCount: number;
}

export interface CartTotalResponse {
  total: number;
}

export interface CartAvailabilityResponse {
  available: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ============= MÉTODOS JPA NORMALES =============

  // Obtener carrito de un usuario
  getCartByUser(userID: number): Observable<CartResponse> {
    return this.http.get<CartResponse>(`${this.apiUrl}/cart/user/${userID}`);
  }

  // Agregar producto al carrito
  addToCart(cartItem: CartItemDTO): Observable<Cart> {
    console.log('🛒 Enviando al carrito:', cartItem);
    return this.http.post<Cart>(`${this.apiUrl}/cart`, cartItem).pipe(
      tap(response => {
        console.log('✅ Respuesta de addToCart:', response);
      }),
      catchError(error => {
        console.error('❌ Error en addToCart:', error);
        return throwError(() => error);
      })
    );
  }

  // Actualizar cantidad de un producto en el carrito
  updateCartQuantity(cartID: number, quantity: number): Observable<Cart> {
    const params = new HttpParams().set('quantity', quantity.toString());
    return this.http.put<Cart>(`${this.apiUrl}/cart/${cartID}`, null, { params });
  }

  // Eliminar producto del carrito
  removeFromCart(cartID: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/cart/${cartID}`);
  }

  // Limpiar todo el carrito de un usuario
  clearCart(userID: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/cart/user/${userID}/clear`);
  }

  // Obtener total del carrito
  getCartTotal(userID: number): Observable<CartTotalResponse> {
    return this.http.get<CartTotalResponse>(`${this.apiUrl}/cart/user/${userID}/total`);
  }

  // ============= MÉTODOS CON PL/SQL =============

  // Agregar producto al carrito usando PL/SQL
  addToCartPLSQL(cartItem: CartItemDTO): Observable<{ message: string; success: boolean }> {
    return this.http.post<{ message: string; success: boolean }>(`${this.apiUrl}/cart/plsql`, cartItem);
  }

  // Actualizar cantidad usando PL/SQL
  updateCartQuantityPLSQL(cartID: number, quantity: number): Observable<{ message: string; success: boolean }> {
    const params = new HttpParams().set('quantity', quantity.toString());
    return this.http.put<{ message: string; success: boolean }>(`${this.apiUrl}/cart/plsql/${cartID}`, null, { params });
  }

  // Eliminar producto del carrito usando PL/SQL
  removeFromCartPLSQL(cartID: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/cart/plsql/${cartID}`);
  }

  // Limpiar carrito usando PL/SQL
  clearCartPLSQL(userID: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/cart/plsql/user/${userID}/clear`);
  }

  // Obtener total del carrito usando PL/SQL
  getCartTotalPLSQL(userID: number): Observable<CartTotalResponse> {
    return this.http.get<CartTotalResponse>(`${this.apiUrl}/cart/plsql/user/${userID}/total`);
  }

  // Verificar disponibilidad de stock del carrito
  checkCartAvailability(userID: number): Observable<CartAvailabilityResponse> {
    return this.http.get<CartAvailabilityResponse>(
      `${this.apiUrl}/cart/plsql/user/${userID}/check-availability`
    );
  }

  // ============= MÉTODOS AUXILIARES =============

  // Incrementar cantidad de un producto en el carrito
  incrementQuantity(cartID: number, currentQuantity: number): Observable<Cart> {
    return this.updateCartQuantity(cartID, currentQuantity + 1);
  }

  // Decrementar cantidad de un producto en el carrito
  decrementQuantity(cartID: number, currentQuantity: number): Observable<Cart> {
    if (currentQuantity > 1) {
      return this.updateCartQuantity(cartID, currentQuantity - 1);
    }
    throw new Error('La cantidad mínima es 1');
  }

  // Verificar si un producto está en el carrito
  isProductInCart(userID: number, proCode: number): Observable<boolean> {
    return new Observable<boolean>((observer) => {
      this.getCartByUser(userID).subscribe({
        next: (response) => {
          const found = response.items.some(item => item.proCode.proCode === proCode);
          observer.next(found);
          observer.complete();
        },
        error: (error) => {
          observer.next(false);
          observer.complete();
        }
      });
    });
  }

  // Agregar cantidad exacta al carrito
  addExactQuantityToCart(userID: number, productCode: number, exactQuantity: number): void {
    const cartItem: CartItemDTO = {
      userID: userID,
      proCode: productCode,
      quantity: exactQuantity 
    };

    this.addToCart(cartItem).subscribe({
      next: (response: any) => {
        console.log('✅ Producto agregado con cantidad exacta:', response);
      },
      error: (error: any) => {
        console.error('❌ Error al agregar producto:', error);
      }
    });
  }

  // Obtener cantidad de items en el carrito
  getCartItemCount(userID: number): Observable<number> {
    return new Observable<number>((observer) => {
      this.getCartByUser(userID).subscribe({
        next: (response) => {
          observer.next(response.itemCount);
          observer.complete();
        },
        error: () => {
          observer.next(0);
          observer.complete();
        }
      });
    });
  }
}