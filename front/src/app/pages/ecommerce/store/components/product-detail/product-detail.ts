import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { InventoryService, InventoryItem } from '../../../../../services/inventory.service';
import { CartService, CartItemDTO } from '../../../../../services/cart.service';
import { AuthService } from '../../../../../services/auth.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-detail.html',
  styleUrls: ['./product-detail.css']
})
export class ProductDetailComponent implements OnInit {
  product: InventoryItem | null = null;
  publicProductData: any = null;
  loading: boolean = true;
  error: boolean = false;
  quantity: number = 1;
  selectedImage: string = '';
  addingToCart: boolean = false;
  
  // Sistema de Toast local
  toast = {
    show: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'warning'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private inventoryService: InventoryService,
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');
   
    if (productId) {
      this.loadProductDetail(+productId);
    } else {
      this.error = true;
      this.loading = false;
    }
  }

  loadProductDetail(productId: number): void {
    this.inventoryService.getInventoryItemPLSQL(productId).subscribe({
      next: (data: InventoryItem) => {
        this.product = data;
        this.selectedImage = data.product?.proImg || 'assets/placeholder-product.jpg';
       
        this.publicProductData = {
          nombre: data.product?.proName || 'Producto sin nombre',
          descripcion: data.product?.descript || 'Sin descripción disponible',
          marca: data.product?.proMark || 'Sin marca',
          tipo: data.product?.productType?.typeName || 'Sin categoría',
          precioVenta: data.sellingPrice || 0,
          stockDisponible: data.invStock || 0,
          proveedor: data.provider?.provName || 'Sin proveedor'
        };
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error cargando detalle del producto', err);
        this.error = true;
        this.loading = false;
      }
    });
  }

  formatPrice(price: number): string {
    return `$${price.toLocaleString('es-CO')}`;
  }

  increaseQuantity(): void {
    if (this.product && this.product.invStock && this.quantity < this.product.invStock) {
      this.quantity++;
    } else {
      this.showToast(`Stock máximo: ${this.product?.invStock || 0} unidades`, 'warning');
    }
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(): void {
    if (!this.product || !this.product.product?.proCode) {
      console.error('❌ Producto no válido');
      this.showToast('Error: producto no válido', 'error');
      return;
    }

    // Verificar autenticación
    if (!this.authService.isLoggedIn()) {
      this.showToast('Debes iniciar sesión para agregar productos al carrito', 'error');
      this.router.navigate(['/auth/login']);
      return;
    }

    const currentUserId = this.authService.getUserId();
    
    if (!currentUserId) {
      console.error('❌ No se pudo obtener el ID del usuario');
      this.showToast('Error: Usuario no identificado', 'error');
      return;
    }

    // VALIDAR STOCK DISPONIBLE
    const stockDisponible = this.product.invStock || 0;
    
    if (stockDisponible <= 0) {
      this.showToast('Producto sin stock disponible', 'warning');
      return;
    }

    if (this.quantity > stockDisponible) {
      this.showToast(`Solo hay ${stockDisponible} unidades disponibles`, 'warning');
      this.quantity = stockDisponible; // Ajustar cantidad al máximo disponible
      return;
    }

    this.addingToCart = true;

    const cartItem: CartItemDTO = {
      userID: currentUserId,
      proCode: this.product.product.proCode,
      quantity: this.quantity
    };

    console.log('🛒 Agregando al carrito:', cartItem);

    this.cartService.addToCart(cartItem).subscribe({
      next: (response) => {
        console.log('✅ Producto agregado al carrito:', response);
        this.showToast(
          `¡${this.quantity} ${this.quantity === 1 ? 'unidad' : 'unidades'} de ${this.publicProductData.nombre} agregada(s) al carrito!`, 
          'success'
        );
        this.addingToCart = false;
      },
      error: (error) => {
        console.error('❌ Error al agregar producto al carrito:', error);
        
        // Manejar diferentes tipos de errores
        if (error.status === 400 && error.error?.message?.includes('stock')) {
          this.showToast('No hay suficiente stock disponible', 'warning');
        } else {
          this.showToast('Error al agregar producto al carrito', 'error');
        }
        
        this.addingToCart = false;
      }
    });
  }

  buyNow(): void {
    if (!this.product) {
      return;
    }

    // Verificar autenticación
    if (!this.authService.isLoggedIn()) {
      this.showToast('Debes iniciar sesión para comprar', 'error');
      this.router.navigate(['/auth/login']);
      return;
    }

    const currentUserId = this.authService.getUserId();
    
    if (!currentUserId) {
      this.showToast('Error: Usuario no identificado', 'error');
      return;
    }

    // VALIDAR STOCK DISPONIBLE
    const stockDisponible = this.product.invStock || 0;
    
    if (stockDisponible <= 0) {
      this.showToast('Producto sin stock disponible', 'warning');
      return;
    }

    if (this.quantity > stockDisponible) {
      this.showToast(`Solo hay ${stockDisponible} unidades disponibles`, 'warning');
      this.quantity = stockDisponible;
      return;
    }

    this.addingToCart = true;

    const cartItem: CartItemDTO = {
      userID: currentUserId,
      proCode: this.product.product.proCode,
      quantity: this.quantity
    };

    console.log('🛒 Comprar ahora - Agregando al carrito:', cartItem);

    // Agregar al carrito y luego redirigir
    this.cartService.addToCart(cartItem).subscribe({
      next: (response) => {
        console.log('✅ Producto agregado, redirigiendo al carrito...');
        this.showToast('Producto agregado, redirigiendo al carrito...', 'success');
        this.addingToCart = false;
        
        // Redirigir al carrito después de un breve delay para que el usuario vea el toast
        setTimeout(() => {
          this.router.navigate(['/store/cart']);
        }, 800);
      },
      error: (error) => {
        console.error('❌ Error al agregar producto:', error);
        
        if (error.status === 400 && error.error?.message?.includes('stock')) {
          this.showToast('No hay suficiente stock disponible', 'warning');
        } else {
          this.showToast('Error al procesar la compra', 'error');
        }
        
        this.addingToCart = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/store']);
  }

  changeImage(imageUrl: string): void {
    this.selectedImage = imageUrl;
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
}