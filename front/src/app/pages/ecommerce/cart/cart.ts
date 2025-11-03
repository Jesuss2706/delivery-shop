import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService, Cart, CartResponse, CartItemDTO } from '../../../services/cart.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.html',
  styleUrls: ['./cart.css']
})
export class CartComponent implements OnInit {
  cartItems: Cart[] = [];
  totalAmount: number = 0;
  itemCount: number = 0;
  loading: boolean = false;
  
  // Sistema de Toast
  toast = {
    show: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'warning'
  };

  // Sistema de Modal de Confirmación
  modal = {
    show: false,
    title: '',
    message: '',
    type: 'delete' as 'delete' | 'clear' | 'info',
    action: () => {},
    itemName: ''
  };

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.loadCart();
  }

  loadCart(): void {
    const userID = this.authService.getUserId();
    if (!userID) {
      this.showToast('Usuario no autenticado', 'error');
      return;
    }

    this.loading = true;

    this.cartService.getCartByUser(userID).subscribe({
      next: (response: CartResponse) => {
        this.cartItems = response.items;
        this.totalAmount = response.total;
        this.itemCount = response.itemCount;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando carrito:', err);
        if (err.status === 204) {
          this.cartItems = [];
          this.totalAmount = 0;
          this.itemCount = 0;
        } else {
          this.showToast('Error al cargar el carrito', 'error');
        }
        this.loading = false;
      }
    });
  }

  incrementQuantity(item: Cart): void {
    this.loading = true;
    this.cartService.updateCartQuantity(item.cartID, item.quantity + 1).subscribe({
      next: () => {
        this.showToast('Cantidad aumentada', 'success');
        this.loadCart();
      },
      error: (err) => {
        console.error('Error actualizando cantidad:', err);
        this.showToast('Error al actualizar cantidad', 'error');
        this.loading = false;
      }
    });
  }

  decrementQuantity(item: Cart): void {
    if (item.quantity <= 1) {
      this.showToast('La cantidad mínima es 1', 'warning');
      return;
    }

    this.loading = true;
    this.cartService.updateCartQuantity(item.cartID, item.quantity - 1).subscribe({
      next: () => {
        this.showToast('Cantidad reducida', 'success');
        this.loadCart();
      },
      error: (err) => {
        console.error('Error actualizando cantidad:', err);
        this.showToast('Error al actualizar cantidad', 'error');
        this.loading = false;
      }
    });
  }

  removeItem(item: Cart): void {
    this.showModal(
      'Eliminar producto',
      `¿Estás seguro de eliminar <strong>"${item.proCode.proName}"</strong> del carrito?`,
      'delete',
      () => {
        this.loading = true;
        this.cartService.removeFromCart(item.cartID).subscribe({
          next: () => {
            this.showToast('Producto eliminado del carrito', 'success');
            this.loadCart();
          },
          error: (err) => {
            console.error('Error eliminando producto:', err);
            this.showToast('Error al eliminar producto', 'error');
            this.loading = false;
          }
        });
      },
      item.proCode.proName
    );
  }

  clearCart(): void {
    if (this.cartItems.length === 0) {
      this.showToast('El carrito ya está vacío', 'warning');
      return;
    }

    this.showModal(
      'Vaciar carrito',
      '¿Estás seguro de vaciar todo el carrito? Se eliminarán todos los productos.',
      'clear',
      () => {
        const userID = this.authService.getUserId();
        if (!userID) return;

        this.loading = true;
        this.cartService.clearCart(userID).subscribe({
          next: () => {
            this.showToast('Carrito vaciado', 'success');
            this.loadCart();
          },
          error: (err) => {
            console.error('Error vaciando carrito:', err);
            this.showToast('Error al vaciar el carrito', 'error');
            this.loading = false;
          }
        });
      }
    );
  }

  proceedToCheckout(): void {
    if (this.cartItems.length === 0) {
      this.showToast('El carrito está vacío', 'warning');
      return;
    }

    const userID = this.authService.getUserId();
    if (!userID) return;

    this.cartService.checkCartAvailability(userID).subscribe({
      next: (response) => {
        if (response.available) {
          this.router.navigate(['/checkout']);
        } else {
          this.showToast(response.message, 'error');
        }
      },
      error: (err) => {
        console.error('Error verificando disponibilidad:', err);
        this.showToast('Error al verificar disponibilidad', 'error');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/store']);
  }

  // Métodos para Toast
  showToast(message: string, type: 'success' | 'error' | 'warning' = 'success'): void {
    this.toast = {
      show: true,
      message,
      type
    };

    setTimeout(() => {
      this.toast.show = false;
    }, 3000);
  }

  closeToast(): void {
    this.toast.show = false;
  }

  // Métodos para Modal
  showModal(
    title: string, 
    message: string, 
    type: 'delete' | 'clear' | 'info',
    action: () => void,
    itemName: string = ''
  ): void {
    this.modal = {
      show: true,
      title,
      message,
      type,
      action,
      itemName
    };
  }

  closeModal(): void {
    this.modal.show = false;
  }

  confirmAction(): void {
    this.modal.action();
    this.closeModal();
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  }
}