import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { InventoryService, ProductType } from '../../../services/inventory.service';
import { AuthService } from '../../../services/auth.service';
import { CartService } from '../../../services/cart.service';

@Component({
  selector: 'app-store-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './store-layout.html',
  styleUrls: ['./store-layout.css'],
})
export class StoreLayoutComponent implements OnInit {
  menuOpen: boolean = false;
  categoriaExpandida: boolean = false;
  productTypes: ProductType[] = [];
  selectedTypeCode: number | null = null;
  isAdmin: boolean = false;
  cartItemCount: number = 0;

  constructor(
    public router: Router,
    public inventoryService: InventoryService,
    public authService: AuthService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.loadProductTypes();
    this.checkUserRole();
    this.loadCartCount();
  }

  // AGREGAR ESTE MÉTODO
  goToStore(): void {
    this.router.navigate(['/store']).then((success) => {
      if (success) {
        console.log('📍 Navegando a la tienda principal');
        this.menuOpen = false;
        // Opcional: resetear filtros si es necesario
        this.selectedTypeCode = null;
        this.inventoryService.filterByTypeCode(null);
      } else {
        console.error('❌ Error navegando a la tienda');
      }
    });
  }

  loadCartCount(): void {
    if (!this.authService.isLoggedIn()) {
      this.cartItemCount = 0;
      return;
    }

    const userID = this.authService.getUserId();
    if (userID) {
      this.cartService.getCartItemCount(userID).subscribe({
        next: (count: any) => (this.cartItemCount = count),
        error: (err: any) => console.error('Error cargando contador:', err),
      });
    }
  }

  goToCart(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.router.navigate(['/store/cart']);
    this.menuOpen = false;
  }

  goToOrders(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.router.navigate(['/store/order']);
    this.menuOpen = false;
  }

  loadProductTypes(): void {
    this.inventoryService.getProductTypes().subscribe({
      next: (data: any) => (this.productTypes = data),
      error: (err: any) => console.error('Error cargando tipos de producto', err),
    });
  }

  checkUserRole(): void {
    this.isAdmin = this.authService.isAdmin();
    console.log(' Usuario autenticado:', this.authService.isLoggedIn());
    console.log(' Es admin:', this.isAdmin);
    console.log(' Rol:', this.authService.getUserRole());
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  toggleCategoria(): void {
    this.categoriaExpandida = !this.categoriaExpandida;
  }

  filterByType(typeCode: number | null): void {
    console.log('🎯 StoreLayout - Filtrando por tipo:', typeCode);
    this.selectedTypeCode = typeCode;

    if (this.router.url === '/store') {
      console.log('📍 Ya en /store, aplicando filtro directo');
      this.inventoryService.filterByTypeCode(typeCode);
      this.menuOpen = false;
      return;
    }

    this.router.navigate(['/store']).then((success) => {
      if (success) {
        console.log('📍 Navegación a /store exitosa, aplicando filtro');
        setTimeout(() => {
          this.inventoryService.filterByTypeCode(typeCode);
          this.menuOpen = false;
        }, 150);
      } else {
        console.error('❌ Error en navegación');
      }
    });
  }

  goToAdmin(): void {
    this.router.navigate(['/admin/dashboard']);
    this.menuOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.isAdmin = false;
    this.router.navigate(['/']);
  }
}