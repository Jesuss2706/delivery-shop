import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CheckoutService, CheckoutRequest, CheckoutResponse, OrderDetailDTO } from '../../../services/checkout.service';
import { CartService, CartResponse } from '../../../services/cart.service';
import { AuthService } from '../../../services/auth.service';

interface User {
  id: number;
  username: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  createdAt: string;
  clientDetail?: {
    id: number;
    firstName: string;
    secondName?: string;
    firstLastName: string;
    secondLastName?: string;
    address: string;
    descAddress?: string;
    city?: {
      cityID: number;
      cityName: string;
      department: {
        depID: number;
        depName: string;
      };
    };
    department?: {
      depID: number;
      depName: string;
    };
  };
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.css']
})
export class CheckoutComponent implements OnInit {
  // Información del usuario
  userID: number | null = null;
  currentUser: User | null = null;
  
  // Datos del carrito
  cartItems: any[] = [];
  totalAmount: number = 0;
  itemCount: number = 0;
  
  // Información de checkout
  paymentMethod: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' = 'TARJETA';
  checkoutProcessing: boolean = false;
  
  // Factura temporal
  temporaryInvoice: CheckoutResponse | null = null;
  orderDetails: OrderDetailDTO | null = null;
  
  // Estados de la UI
  loading: boolean = false;
  showInvoice: boolean = false;
  
  // Sistema de Toast
  toast = {
    show: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'warning'
  };

  // Información de envío (precargada desde el perfil del usuario)
  shippingInfo = {
    fullName: '',
    address: '',
    city: '',
    department: '',
    phone: '',
    notes: ''
  };

  constructor(
    private checkoutService: CheckoutService,
    private cartService: CartService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.userID = this.authService.getUserId();
    this.loadUserDataFromLocalStorage();
    this.loadCartData();
  }

  loadUserDataFromLocalStorage(): void {
    try {
      const userData = localStorage.getItem('user_data');
      
      if (!userData) {
        this.showToast('Error: No se encontraron datos del usuario', 'error');
        return;
      }

      this.currentUser = JSON.parse(userData);
      this.loadShippingInfoFromUser(this.currentUser!);
      console.log('✅ Datos de usuario cargados desde localStorage:', this.currentUser);
      
    } catch (error) {
      console.error('Error cargando datos del usuario desde localStorage:', error);
      this.showToast('Error al cargar información del usuario', 'error');
    }
  }

  loadShippingInfoFromUser(user: User): void {
    if (user.clientDetail) {
      const client = user.clientDetail;
      
      // Construir nombre completo
      this.shippingInfo.fullName = 
        `${client.firstName} ${client.secondName || ''} ${client.firstLastName} ${client.secondLastName || ''}`.trim();
      
      // Dirección completa
      this.shippingInfo.address = client.address;
      if (client.descAddress) {
        this.shippingInfo.address += `, ${client.descAddress}`;
      }
      
      // Ciudad y departamento
      this.shippingInfo.city = client.city?.cityName || '';
      this.shippingInfo.department = client.department?.depName || '';
      
      // Teléfono
      this.shippingInfo.phone = user.phone;
    } else {
      // Fallback si no hay clientDetail
      this.shippingInfo.fullName = user.username;
      this.shippingInfo.phone = user.phone;
    }

    console.log('📍 Información de envío cargada:', this.shippingInfo);
  }

  loadCartData(): void {
    if (!this.userID) return;

    this.loading = true;
    this.cartService.getCartByUser(this.userID).subscribe({
      next: (response: CartResponse) => {
        this.cartItems = response.items || [];
        this.totalAmount = response.total;
        this.itemCount = response.itemCount;
        this.loading = false;

        if (this.cartItems.length === 0) {
          this.showToast('El carrito está vacío', 'warning');
          this.router.navigate(['/cart']);
        }
      },
      error: (err) => {
        console.error('Error cargando carrito:', err);
        this.showToast('Error al cargar el carrito', 'error');
        this.loading = false;
      }
    });
  }

  processCheckout(): void {
    if (!this.userID) {
      this.showToast('Usuario no autenticado', 'error');
      return;
    }

    if (this.cartItems.length === 0) {
      this.showToast('El carrito está vacío', 'warning');
      return;
    }

    // Validar información de envío básica
    if (!this.shippingInfo.fullName.trim() || !this.shippingInfo.address.trim()) {
      this.showToast('Por favor completa la información de envío', 'warning');
      return;
    }

    const checkoutRequest: CheckoutRequest = {
      userID: this.userID,
      paymentType: this.paymentMethod
    };

    this.checkoutProcessing = true;

    console.log('🛒 Procesando checkout:', checkoutRequest);

    this.checkoutService.processCheckout(checkoutRequest).subscribe({
      next: (response: CheckoutResponse) => {
        this.temporaryInvoice = response;
        this.showInvoice = true;
        this.checkoutProcessing = false;
        
        // Limpiar el carrito después de una compra exitosa
        this.clearCartAfterPurchase();
        
        this.showToast('¡Compra realizada con éxito!', 'success');
        console.log('✅ Checkout completado:', response);
      },
      error: (err) => {
        console.error('Error procesando compra:', err);
        this.checkoutProcessing = false;
        this.showToast('Error al procesar la compra: ' + err.message, 'error');
      }
    });
  }

  clearCartAfterPurchase(): void {
    if (!this.userID) return;

    this.cartService.clearCart(this.userID).subscribe({
      next: () => {
        console.log('🛒 Carrito limpiado después de la compra');
      },
      error: (err) => {
        console.error('Error limpiando carrito:', err);
      }
    });
  }

  confirmPurchase(): void {
    if (this.temporaryInvoice) {
      this.showToast('¡Gracias por tu compra! La orden #' + this.temporaryInvoice.ordID + ' ha sido confirmada.', 'success');
      
      // Redirigir a la página de historial de órdenes después de 3 segundos
      setTimeout(() => {
        this.router.navigate(['/store/order']);
      }, 3000);
    }
  }

  continueShopping(): void {
    this.router.navigate(['/store']);
  }

  viewOrderDetails(): void {
    if (this.temporaryInvoice) {
      this.router.navigate(['/orders', this.temporaryInvoice.ordID]);
    }
  }

  goBackToCart(): void {
    this.router.navigate(['/store/cart']);
  }

  editShippingInfo(): void {
    this.router.navigate(['/profile/edit']);
  }

  // Métodos auxiliares
  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  }

  getPaymentMethodText(method: string): string {
    const methods: { [key: string]: string } = {
      'EFECTIVO': 'Pago en Efectivo',
      'TARJETA': 'Tarjeta de Crédito/Débito',
      'TRANSFERENCIA': 'Transferencia Bancaria'
    };
    return methods[method] || method;
  }

  getOrderStatusText(status: string): string {
    const statuses: { [key: string]: string } = {
      'Pending': 'Pendiente',
      'Processing': 'Procesando',
      'Shipped': 'Enviado',
      'Delivered': 'Entregado',
      'Cancelled': 'Cancelado'
    };
    return statuses[status] || status;
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
    }, 5000);
  }

  closeToast(): void {
    this.toast.show = false;
  }

  // Validación de formulario
  isFormValid(): boolean {
    return this.shippingInfo.fullName.trim().length > 0 &&
           this.shippingInfo.address.trim().length > 0 &&
           this.shippingInfo.phone.trim().length > 0;
  }

  // Obtener dirección completa formateada
  getFormattedAddress(): string {
    let address = this.shippingInfo.address;
    if (this.shippingInfo.city) {
      address += `, ${this.shippingInfo.city}`;
    }
    if (this.shippingInfo.department) {
      address += `, ${this.shippingInfo.department}`;
    }
    return address;
  }

  // Verificar si hay información de cliente completa
  hasCompleteClientInfo(): boolean {
    return !!(this.currentUser?.clientDetail);
  }
}