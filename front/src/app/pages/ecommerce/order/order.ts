import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CheckoutService, OrderSummaryDTO, OrderDetailDTO } from '../../../services/checkout.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order.html',
  styleUrls: ['./order.css']
})
export class OrderComponent implements OnInit {
  // Estados del componente
  loading: boolean = false;
  
  // Datos del usuario
  userID: number | null = null;
  
  // Datos de órdenes
  orders: OrderSummaryDTO[] = [];
  orderDetails: Map<number, OrderDetailDTO> = new Map();
  loadingDetails: Set<number> = new Set();
  expandedOrders: Set<number> = new Set();
  
  // Filtros y búsqueda
  filterStatus: string = 'all';
  searchTerm: string = '';
  
  // Modal de cancelación
  showCancelModal: boolean = false;
  orderToCancel: number | null = null;
  cancelReason: string = '';
  cancelling: boolean = false;
  
  // Sistema de Toast
  toast = {
    show: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'warning'
  };

  constructor(
    private checkoutService: CheckoutService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('🔍 OrderComponent iniciado');
    
    if (!this.authService.isLoggedIn()) {
      console.log('❌ Usuario no autenticado, redirigiendo a login');
      this.router.navigate(['/login']);
      return;
    }

    this.userID = this.authService.getUserId();
    console.log('👤 UserID obtenido:', this.userID);
    
    this.loadOrderHistory();
  }

  loadOrderHistory(): void {
    if (!this.userID) {
      console.error('❌ No hay userID para cargar historial');
      return;
    }

    console.log('🔄 Cargando historial para userID:', this.userID);
    this.loading = true;
    
    this.checkoutService.getOrderHistory(this.userID).subscribe({
      next: (orders: OrderSummaryDTO[]) => {
        console.log('✅ Historial cargado:', orders);
        this.orders = orders;
        this.loading = false;
        
        if (orders.length === 0) {
          console.log('📭 No hay órdenes para mostrar');
          this.showToast('No tienes órdenes realizadas');
        }
      },
      error: (err) => {
        console.error('❌ Error cargando historial de órdenes:', err);
        this.showToast('Error al cargar el historial de órdenes', 'error');
        this.loading = false;
      }
    });
  }


  openCancelModal(ordID: number): void {
    this.orderToCancel = ordID;
    this.cancelReason = '';
    this.cancelling = false;
    this.showCancelModal = true;
  }

  closeCancelModal(): void {
    this.showCancelModal = false;
    this.orderToCancel = null;
    this.cancelReason = '';
    this.cancelling = false;
  }

  confirmCancel(): void {
    if (!this.cancelReason.trim()) {
      this.showToast('Debes ingresar una razón para cancelar la orden', 'warning');
      return;
    }

    if (!this.orderToCancel) {
      this.showToast('No se encontró la orden a cancelar', 'error');
      return;
    }

    const ordID = this.orderToCancel;
    const reason = this.cancelReason.trim();
    
    console.log(`🔄 Cancelando orden #${ordID} con razón:`, reason);


    this.cancelling = true;


    this.checkoutService.cancelOrder(ordID, reason).subscribe({
      next: () => {
        console.log('✅ Orden cancelada exitosamente');
        this.cancelling = false;
        

        this.closeCancelModal();
        
        this.showToast('Orden cancelada exitosamente', 'success');
        
        this.loadOrderHistory();
        

        this.orderDetails.delete(ordID);
        this.expandedOrders.delete(ordID);
      },
      error: (err) => {
        console.error('❌ Error cancelando orden:', err);
        this.cancelling = false;

        let errorMessage = 'Error al cancelar la orden';
        
        if (err.error?.errors?.reason) {
          errorMessage = err.error.errors.reason;
        } else if (err.error?.message) {
          errorMessage = err.error.message;
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        this.showToast(errorMessage, 'error');
      }
    });
  }


  toggleOrderDetail(ordID: number): void {
    if (this.isOrderExpanded(ordID)) {
      this.expandedOrders.delete(ordID);
    } else {
      this.expandedOrders.add(ordID);
      if (!this.orderDetails.has(ordID) && !this.loadingDetails.has(ordID)) {
        this.loadOrderDetail(ordID);
      }
    }
  }

  loadOrderDetail(ordID: number): void {
    this.loadingDetails.add(ordID);
    
    this.checkoutService.getOrderDetail(ordID).subscribe({
      next: (orderDetail: OrderDetailDTO) => {
        this.orderDetails.set(ordID, orderDetail);
        this.loadingDetails.delete(ordID);
      },
      error: (err) => {
        console.error('Error cargando detalle de orden:', err);
        this.loadingDetails.delete(ordID);
        this.showToast('Error al cargar los detalles de la orden', 'error');
      }
    });
  }

  isOrderExpanded(ordID: number): boolean {
    return this.expandedOrders.has(ordID);
  }

  isLoadingDetail(ordID: number): boolean {
    return this.loadingDetails.has(ordID);
  }

  getOrderDetail(ordID: number): OrderDetailDTO | null {
    return this.orderDetails.get(ordID) || null;
  }

  get filteredOrders(): OrderSummaryDTO[] {
    let filtered = this.orders;

    if (this.filterStatus !== 'all') {
      filtered = filtered.filter(order => 
        order.ordState.toLowerCase() === this.filterStatus.toLowerCase()
      );
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.ordID.toString().includes(term) ||
        order.paymentType.toLowerCase().includes(term)
      );
    }

    return filtered;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  }

  formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
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

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'Pending': 'status-pending',
      'Processing': 'status-processing',
      'Shipped': 'status-shipped',
      'Delivered': 'status-delivered',
      'Cancelled': 'status-cancelled'
    };
    return classes[status] || 'status-pending';
  }

  canCancelOrder(order: OrderSummaryDTO): boolean {
    return order.ordState === 'Pending' || order.ordState === 'Processing';
  }

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

  goToStore(): void {
    this.router.navigate(['/store']);
  }
}