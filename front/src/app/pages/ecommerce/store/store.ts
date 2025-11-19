import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { InventoryService, InventoryItem } from '../../../services/inventory.service';
import { CartService, CartItemDTO } from '../../../services/cart.service';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-store',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './store.html',
  styleUrls: ['./store.css'],
})
export class StoreComponent implements OnInit, OnDestroy {
  inventoryItems: InventoryItem[] = [];
  filteredItems: InventoryItem[] = [];
  private filterSubscription?: Subscription;
  private inventoryLoaded = false;
  private pendingFilter: number | null = null;

  // Variables para feedback - AHORA CON TOAST
  loadingAddToCart: { [key: number]: boolean } = {};
  toast = {
    show: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'warning'
  };

  // Variables para control de roles
  isAdmin: boolean = false;
  currentUser: any = null;

  constructor(
    private inventoryService: InventoryService, 
    private router: Router,
    private cartService: CartService,
    public authService: AuthService 
  ) {}

  ngOnInit(): void {
    this.loadUserRole(); // Cargar el rol del usuario
    this.loadInventory();
    
    this.filterSubscription = this.inventoryService.typeCodeFilter$.subscribe(
      (typeCode: number | null) => {
        console.log('🔄 StoreComponent recibió filtro:', typeCode);
        
        if (this.inventoryLoaded) {
          this.applyFilter(typeCode);
        } else {
          console.log('⏳ Inventario no cargado, guardando filtro pendiente:', typeCode);
          this.pendingFilter = typeCode;
        }
      }
    );
  }

  ngOnDestroy(): void {
    console.log('🗑️ StoreComponent destruido');
    this.filterSubscription?.unsubscribe();
  }

  loadUserRole(): void {
    // Método 1: Desde localStorage
    const userData = localStorage.getItem('user_data');
    if (userData) {
      this.currentUser = JSON.parse(userData);
      this.isAdmin = this.currentUser?.role === 'ADMIN';
    }

    
    console.log('👤 Usuario es ADMIN:', this.isAdmin);
  }

  loadInventory(): void {
    console.log('📦 Cargando inventario...');
    this.inventoryService.getAvailableInventoryPLSQL().subscribe({
      next: (data: InventoryItem[]) => {
        console.log('✅ Inventario cargado:', data.length, 'items');
        this.inventoryItems = data;
        this.filteredItems = data;
        this.inventoryLoaded = true;

        if (this.pendingFilter !== null) {
          console.log('🎯 Aplicando filtro pendiente:', this.pendingFilter);
          setTimeout(() => {
            this.applyFilter(this.pendingFilter);
            this.pendingFilter = null;
          }, 100);
        }
      },
      error: (err: any) => {
        console.error('❌ Error cargando inventario', err);
        this.showToast('Error al cargar los productos', 'error');
      },
    });
  }

  applyFilter(typeCode: number | null): void {
    console.log('🎯 Aplicando filtro:', typeCode);
    console.log('📊 Total items disponibles:', this.inventoryItems.length);

    if (typeCode === null) {
      this.filteredItems = this.inventoryItems;
      console.log('📋 Mostrando TODOS los productos:', this.filteredItems.length);
    } else {
      this.filteredItems = this.inventoryItems.filter((item) => {
        const matchesType = item.product.productType.typeCode === typeCode;
        return matchesType;
      });
      console.log('📋 Productos FILTRADOS por tipo', typeCode + ':', this.filteredItems.length);
    }
  }

  filterByType(typeCode: number | null): void {
    this.applyFilter(typeCode);
  }

  formatPrice(price: number): string {
    return `$${price.toLocaleString('es-CO')}`;
  }

  viewProductDetail(invCode: number): void {
    this.router.navigate(['/store/product', invCode]);
  }

  addToCart(event: Event, item: InventoryItem): void {
    event.stopPropagation();
    console.log('🛒 Agregando al carrito:', item.product.proName);

    // Verificar si el usuario está autenticado
    if (!this.authService.isLoggedIn()) {
      this.showToast('Debes iniciar sesión para agregar productos al carrito', 'error');
      this.router.navigate(['/auth/login']);
      return;
    }

    // Verificar si es ADMIN (doble seguridad)
    if (this.isAdmin) {
      this.showToast('Los administradores no pueden realizar compras', 'warning');
      return;
    }

    const userId = this.authService.getUserId();
    if (!userId) {
      this.showToast('Error: No se pudo identificar al usuario', 'error');
      return;
    }

    // VALIDAR STOCK DISPONIBLE
    if (!item.invStock || item.invStock <= 0) {
      this.showToast('Producto sin stock disponible', 'warning');
      return;
    }

    // Mostrar loading para este producto específico
    this.loadingAddToCart[item.invCode!] = true;

    // Crear el CartItemDTO con cantidad 1
    const cartItemDTO: CartItemDTO = {
      userID: userId,
      proCode: item.product.proCode,
      quantity: 1
    };

    console.log('📤 Enviando CartItemDTO:', cartItemDTO);

    // Llamar al servicio del carrito
    this.cartService.addToCartPLSQL(cartItemDTO).subscribe({
      next: (cartResponse) => {
        console.log('✅ Producto agregado al carrito:', cartResponse);
        this.showToast(cartResponse.message || `¡${item.product.proName} agregado al carrito! 🛒`, 'success');
        this.loadingAddToCart[item.invCode!] = false;
      },
      error: (error) => {
        console.error('❌ Error agregando al carrito:', error);
        
        // Manejar error de stock insuficiente
        if (error.status === 400 && error.error?.message?.includes('stock')) {
          this.showToast('No hay suficiente stock disponible', 'warning');
        } else {
          this.showToast('Error al agregar el producto al carrito', 'error');
        }
        
        this.loadingAddToCart[item.invCode!] = false;
      }
    });
  }

  // Método para mostrar toast
  showToast(message: string, type: 'success' | 'error' | 'warning' = 'success'): void {
    this.toast = {
      show: true,
      message,
      type
    };

    // Ocultar automáticamente después de 5 segundos
    setTimeout(() => {
      this.toast.show = false;
    }, 5000);
  }

  // Método para cerrar manualmente el toast
  closeToast(): void {
    this.toast.show = false;
  }

  // Método para verificar si un producto está cargando
  isLoadingProduct(invCode: number): boolean {
    return this.loadingAddToCart[invCode] === true;
  }

  // Método helper para verificar si es cliente (opcional)
  isClient(): boolean {
    return !this.isAdmin && this.authService.isLoggedIn();
  }
}