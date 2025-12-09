import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService, Cart, CartResponse, CartItemDTO } from '../../../services/cart.service';
import { AuthService } from '../../../services/auth.service';
import { InventoryService, InventoryItem } from '../../../services/inventory.service';
import { forkJoin } from 'rxjs';

// Interface extendida para incluir información de stock y precio de venta
interface CartItemWithStock extends Cart {
  availableStock?: number;
  sellingPrice?: number;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.html',
  styleUrls: ['./cart.css']
})
export class CartComponent implements OnInit, OnDestroy {
  cartItems: CartItemWithStock[] = [];
  totalAmount: number = 0;
  itemCount: number = 0;
  loading: boolean = false;
  
  // Sistema de Toast
  toast = {
    show: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'warning'
  };
  private toastTimeout: any = null;

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
    private inventoryService: InventoryService,
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
        this.totalAmount = response.total;
        this.itemCount = response.itemCount;
        
        // Si el carrito tiene items, cargar el stock de cada producto
        if (response.items && response.items.length > 0) {
          this.loadStockForCartItems(response.items);
        } else {
          this.cartItems = [];
          this.loading = false;
        }
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

  // Cargar el stock disponible para cada item del carrito
  loadStockForCartItems(items: Cart[]): void {
    // Obtener todo el inventario disponible
    this.inventoryService.getAvailableInventoryPLSQL().subscribe({
      next: (inventory: InventoryItem[]) => {
        // Mapear los items del carrito con su stock y precio de venta correspondiente
        this.cartItems = items.map(cartItem => {
          // Buscar el item del inventario que corresponde a este producto
          const inventoryItem = inventory.find(
            inv => inv.product.proCode === cartItem.proCode.proCode
          );
          
          return {
            ...cartItem,
            availableStock: inventoryItem?.invStock || 0,
            sellingPrice: inventoryItem?.sellingPrice || cartItem.proCode.proPrice
          };
        });
        
        // Recalcular el total con los precios de venta correctos
        this.recalculateCartTotal();
        
        console.log('🛒 Cart items con stock y precio de venta:', this.cartItems);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando inventario para stock:', err);
        // Si falla, mostrar los items sin información de stock, usar proPrice como fallback
        this.cartItems = items.map(item => ({ 
          ...item, 
          availableStock: 0,
          sellingPrice: item.proCode.proPrice
        }));
        // Recalcular el total con los precios base
        this.recalculateCartTotal();
        this.showToast('Advertencia: No se pudo cargar información de stock', 'warning');
        this.loading = false;
      }
    });
  }

  // Recalcular el total del carrito basado en sellingPrice
  recalculateCartTotal(): void {
    this.totalAmount = this.cartItems.reduce((total, item) => {
      const price = item.sellingPrice ?? item.proCode.proPrice;
      return total + (price * item.quantity);
    }, 0);
  }

  incrementQuantity(item: CartItemWithStock): void {
    // Validar stock disponible antes de incrementar
    const stockDisponible = item.availableStock || 0;
    
    if (item.quantity >= stockDisponible) {
      this.showToast(`Stock máximo alcanzado (${stockDisponible} disponibles)`, 'warning');
      return;
    }

    this.loading = true;
    this.cartService.updateCartQuantity(item.cartID, item.quantity + 1).subscribe({
      next: () => {
        this.showToast('Cantidad aumentada', 'success');
        this.loadCart();
      },
      error: (err) => {
        console.error('Error actualizando cantidad:', err);
        // Manejar error específico de stock insuficiente
        if (err.status === 400 && err.error?.message?.includes('stock')) {
          this.showToast('No hay suficiente stock disponible', 'warning');
        } else {
          this.showToast('Error al actualizar cantidad', 'error');
        }
        this.loading = false;
      }
    });
  }

  decrementQuantity(item: CartItemWithStock): void {
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

  removeItem(item: CartItemWithStock): void {
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


  const itemsWithoutStock = this.cartItems.filter(item => 
    item.availableStock !== undefined && item.quantity > item.availableStock
  );

  if (itemsWithoutStock.length > 0) {
    const productNames = itemsWithoutStock.map(item => item.proCode.proName).join(', ');
    this.showToast(`Advertencia: Los siguientes productos pueden no tener stock suficiente: ${productNames}. Puedes continuar pero la compra podría fallar.`, 'warning');
    

    if (confirm('¿Deseas continuar al checkout de todas formas?')) {
      this.router.navigate(['/checkout']);
    }
    return;
  }


  this.router.navigate(['/store/checkout']);
}

  goBack(): void {
    this.router.navigate(['/store']);
  }

  // Métodos para Toast
  showToast(message: string, type: 'success' | 'error' | 'warning' = 'success'): void {
    // Limpiar el timeout anterior si existe
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }

    this.toast = {
      show: true,
      message,
      type
    };

    // Ocultar automáticamente después de 3 segundos
    this.toastTimeout = setTimeout(() => {
      this.toast.show = false;
      this.toastTimeout = null;
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

  ngOnDestroy(): void {
    // Limpiar el timeout del toast si existe
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
  }
}