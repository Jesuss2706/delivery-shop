import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { InventoryService, InventoryItem } from '../../../../../services/inventory.service';
import { CartService, CartItemDTO } from '../../../../../services/cart.service';

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
  
  // Sistema de Toast local (igual que en CartComponent)
  toast = {
    show: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'warning'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private inventoryService: InventoryService,
    private cartService: CartService
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
    this.inventoryService.getInventoryItem(productId).subscribe({
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
    }
  }

  decreaseQuantity(): void {
    if (this.product && this.product.invStock && this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(): void {
    if (this.product && this.product.product?.proCode) {
      this.addingToCart = true;

      const currentUserId = this.getCurrentUserId();
      
      if (!currentUserId) {
        console.error('❌ No se pudo obtener el ID del usuario');
        this.showToast('Error: Usuario no identificado', 'error');
        this.addingToCart = false;
        return;
      }

      const cartItem: CartItemDTO = {
        userID: currentUserId,
        proCode: this.product.product.proCode,
        quantity: this.quantity
      };

      console.log('🛒 Agregando al carrito:', cartItem);

      this.cartService.addToCart(cartItem).subscribe({
        next: (response) => {
          console.log('✅ Producto agregado al carrito:', response);
          this.showToast(`¡${this.quantity} ${this.quantity === 1 ? 'unidad' : 'unidades'} de ${this.publicProductData.nombre} agregada(s) al carrito!`, 'success');
          this.addingToCart = false;
        },
        error: (error) => {
          console.error('❌ Error al agregar producto al carrito:', error);
          this.showToast('Error al agregar producto al carrito', 'error');
          this.addingToCart = false;
        }
      });
    } else {
      console.error('❌ No se puede agregar al carrito: producto no válido');
      this.showToast('Error: producto no válido', 'error');
    }
  }

  buyNow(): void {
    if (this.product) {
      console.log('Comprar ahora:', {
        product: this.publicProductData,
        quantity: this.quantity
      });
      // Primero agregar al carrito y luego redirigir al checkout
      this.addToCart();
      // this.router.navigate(['/checkout']);
    }
  }

  goBack(): void {
    this.router.navigate(['/store']);
  }

  changeImage(imageUrl: string): void {
    this.selectedImage = imageUrl;
  }

  // Método para obtener el ID del usuario actual desde localStorage
  private getCurrentUserId(): number | null {
    try {
      const userData = localStorage.getItem('user_data');
      
      if (userData) {
        const user = JSON.parse(userData);
        console.log('👤 Usuario obtenido de localStorage:', user);
        
        // El ID está en la propiedad 'id' del objeto principal
        if (user && user.id) {
          return user.id;
        } else {
          console.error('❌ No se encontró la propiedad "id" en user_data:', user);
          return null;
        }
      } else {
        console.warn('⚠️ No se encontró user_data en localStorage');
        return null;
      }
    } catch (error) {
      console.error('❌ Error al obtener user_data del localStorage:', error);
      return null;
    }
  }

  // Métodos para Toast (igual que en CartComponent)
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