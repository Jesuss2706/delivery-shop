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
    type: 'success' as 'success' | 'error' // 'success' | 'error'
  };

  constructor(
    private inventoryService: InventoryService, 
    private router: Router,
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
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

  loadInventory(): void {
    console.log('📦 Cargando inventario...');
    this.inventoryService.getAvailableInventory().subscribe({
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

    const userId = this.authService.getUserId();
    if (!userId) {
      this.showToast('Error: No se pudo identificar al usuario', 'error');
      return;
    }

    // Mostrar loading para este producto específico
    this.loadingAddToCart[item.invCode!] = true;

    // Crear el CartItemDTO
    const cartItemDTO: CartItemDTO = {
      userID: userId,
      proCode: item.product.proCode,
      quantity: 1
    };

    console.log('📤 Enviando CartItemDTO:', cartItemDTO);

    // Llamar al servicio del carrito
    this.cartService.addToCart(cartItemDTO).subscribe({
      next: (cartResponse) => {
        console.log('✅ Producto agregado al carrito:', cartResponse);
        this.showToast(`¡${item.product.proName} agregado al carrito! 🛒`, 'success');
        this.loadingAddToCart[item.invCode!] = false;
      },
      error: (error) => {
        console.error('❌ Error agregando al carrito:', error);
        this.showToast('Error al agregar el producto al carrito', 'error');
        this.loadingAddToCart[item.invCode!] = false;
      }
    });
  }

  // Método para mostrar toast
  showToast(message: string, type: 'success' | 'error' = 'success'): void {
    this.toast = {
      show: true,
      message,
      type
    };

    // Ocultar automáticamente después de 3 segundos
    setTimeout(() => {
      this.toast.show = false;
    }, 3000);
  }

  // Método para cerrar manualmente el toast
  closeToast(): void {
    this.toast.show = false;
  }

  // Método para verificar si un producto está cargando
  isLoadingProduct(invCode: number): boolean {
    return this.loadingAddToCart[invCode] === true;
  }
}