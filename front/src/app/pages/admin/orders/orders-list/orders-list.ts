import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CheckoutService, OrderSummaryDTO, OrderDetailDTO } from '../../../../services/checkout.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders-list.html',
  styleUrls: ['./orders-list.css']
})
export class OrdersListComponent implements OnInit {
  // Estados del componente
  loading: boolean = false;
  loadingDetails: boolean = false;
  
  // Datos de órdenes
  allOrders: OrderSummaryDTO[] = [];
  filteredOrders: OrderSummaryDTO[] = [];
  selectedOrder: OrderDetailDTO | null = null;
  
  // Filtros y paginación
  filterStatus: string = 'all';
  searchTerm: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalOrders: number = 0;
  
  // Estados disponibles para actualización
  availableStates: string[] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  
  // Modal y selección
  showOrderDetail: boolean = false;
  orderToUpdate: number | null = null;
  newOrderState: string = '';
  updatingOrder: boolean = false;
  
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
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/']);
      return;
    }
    this.loadAllOrders();
  }

  loadAllOrders(): void {
    this.loading = true;
    
    this.checkoutService.getAllOrders().subscribe({
      next: (orders: OrderSummaryDTO[]) => {
        this.allOrders = orders;
        this.filteredOrders = orders;
        this.totalOrders = orders.length;
        this.loading = false;
        console.log('✅ Órdenes cargadas:', orders.length);
      },
      error: (err) => {
        console.error('❌ Error cargando órdenes:', err);
        this.showToast('Error al cargar las órdenes', 'error');
        this.loading = false;
      }
    });
  }

  // Filtros y búsqueda
  applyFilters(): void {
    let filtered = this.allOrders;

    // Filtrar por estado
    if (this.filterStatus !== 'all') {
      filtered = filtered.filter(order => 
        order.ordState.toLowerCase() === this.filterStatus.toLowerCase()
      );
    }

    // Filtrar por término de búsqueda
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.ordID.toString().includes(term) ||
        order.paymentType.toLowerCase().includes(term) ||
        this.formatPrice(order.total).toLowerCase().includes(term)
      );
    }

    this.filteredOrders = filtered;
    this.totalOrders = filtered.length;
    this.currentPage = 1; // Reset a primera página al filtrar
  }

  // Paginación
  get paginatedOrders(): OrderSummaryDTO[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredOrders.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.totalOrders / this.itemsPerPage);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  
openStatusModal(order: OrderSummaryDTO | OrderDetailDTO): void {
  this.orderToUpdate = order.ordID;
  this.newOrderState = order.ordState;
}

  closeStatusModal(): void {
    this.orderToUpdate = null;
    this.newOrderState = '';
    this.updatingOrder = false;
  }

  updateOrderStatus(): void {
    if (!this.orderToUpdate || !this.newOrderState) return;

    this.updatingOrder = true;

    this.checkoutService.updateOrderStatus(this.orderToUpdate, this.newOrderState).subscribe({
      next: () => {
        this.showToast('Estado de orden actualizado exitosamente', 'success');
        
        // Actualizar la orden localmente
        const orderIndex = this.allOrders.findIndex(o => o.ordID === this.orderToUpdate);
        if (orderIndex !== -1) {
          this.allOrders[orderIndex].ordState = this.newOrderState;
        }
        
        // Si la orden seleccionada está abierta, actualizarla también
        if (this.selectedOrder && this.selectedOrder.ordID === this.orderToUpdate) {
          this.selectedOrder.ordState = this.newOrderState;
        }
        
        this.applyFilters(); // Re-aplicar filtros
        this.closeStatusModal();
      },
      error: (err) => {
        console.error('❌ Error actualizando estado:', err);
        
        // Manejar diferentes tipos de errores
        let errorMessage = 'Error al actualizar el estado de la orden';
        
        if (err.error?.errors?.state) {
          errorMessage = err.error.errors.state;
        } else if (err.error?.message) {
          errorMessage = err.error.message;
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        this.showToast(errorMessage, 'error');
        this.updatingOrder = false;
      }
    });
  }

  // Ver detalle de orden
  viewOrderDetail(ordID: number): void {
    this.loadingDetails = true;
    this.showOrderDetail = true;

    this.checkoutService.getOrderDetail(ordID).subscribe({
      next: (orderDetail: OrderDetailDTO) => {
        this.selectedOrder = orderDetail;
        this.loadingDetails = false;
      },
      error: (err) => {
        console.error('❌ Error cargando detalle de orden:', err);
        this.showToast('Error al cargar los detalles de la orden', 'error');
        this.loadingDetails = false;
        this.closeOrderDetail();
      }
    });
  }

  closeOrderDetail(): void {
    this.showOrderDetail = false;
    this.selectedOrder = null;
    this.loadingDetails = false;
  }

  // Métodos auxiliares
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  canUpdateToState(currentState: string, newState: string): boolean {
    // Lógica de transiciones permitidas
    const allowedTransitions: { [key: string]: string[] } = {
      'Pending': ['Processing', 'Cancelled'],
      'Processing': ['Shipped', 'Cancelled'],
      'Shipped': ['Delivered'],
      'Delivered': [], 
      'Cancelled': [] 
    };
    
    return allowedTransitions[currentState]?.includes(newState) || false;
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

  // Navegación
  goToDashboard(): void {
    this.router.navigate(['/admin/dashboard']);
  }
}