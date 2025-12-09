import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductService, Product } from '../../../../services/product.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-list.html',
  styleUrls: ['./product-list.css']
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  allProducts: Product[] = [];
  categories: any[] = [];
  selectedCategory: number | null = null;
  loading = true;
  showDeleteModal = false;
  productToDelete: Product | null = null;
  toastMessage = '';
  toastType: 'success' | 'error' | '' = '';
  showToast = false;

  constructor(
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getProducts().subscribe({
      next: (products: Product[]) => {
        this.allProducts = products;
        this.products = products;
        this.loadCategories();
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error al cargar productos', err);
        this.showToastMessage('Error al cargar los productos', 'error');
        this.loading = false;
      }
    });
  }

  loadCategories(): void {
    const uniqueCategories = new Map<number, any>();
    this.allProducts.forEach(product => {
      if (product.productType && !uniqueCategories.has(product.productType.typeCode)) {
        uniqueCategories.set(product.productType.typeCode, product.productType);
      }
    });
    this.categories = Array.from(uniqueCategories.values());
  }

  applyFilter(category: number | null): void {
    this.selectedCategory = category;
    if (category === null) {
      this.products = this.allProducts;
    } else {
      this.products = this.allProducts.filter(product => 
        product.productType?.typeCode === category
      );
    }
  }

  resetFilters(): void {
    this.selectedCategory = null;
    this.products = this.allProducts;
  }

  onFilterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const value = target.value;
    this.applyFilter(value === '' ? null : +value);
  }

  editProduct(product: Product): void {
    this.router.navigate(['/admin/products/edit', product.proCode]);
  }

  confirmDelete(product: Product): void {
    this.productToDelete = product;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.productToDelete = null;
  }

  deleteProduct(): void {
    if (!this.productToDelete) return;

    const productData = {
      ...this.productToDelete,
      status: 'I'
    };
 console.log('Datos a enviar:', productData);
    this.productService.updateProduct(this.productToDelete.proCode, productData).subscribe({
      next: () => {
        this.showToastMessage('Producto desactivado correctamente', 'success');
        const index = this.products.findIndex(p => p.proCode === this.productToDelete?.proCode);
        if (index !== -1) {
          this.products[index].status = 'I';
        }
        this.showDeleteModal = false;
        this.productToDelete = null;
      },
      error: (err: any) => {
        const errorMsg = err?.error?.message || 'Error al desactivar el producto';
        this.showToastMessage(errorMsg, 'error');
        this.showDeleteModal = false;
        this.productToDelete = null;
      }
    });
  }

  // Método para activar producto
  activateProduct(product: Product): void {
    const productData = {
      ...product,
      status: 'A'
    };

    this.productService.updateProduct(product.proCode, productData).subscribe({
      next: () => {
        this.showToastMessage('Producto activado correctamente', 'success');
        const index = this.products.findIndex(p => p.proCode === product.proCode);
        if (index !== -1) {
          this.products[index].status = 'A';
        }
      },
      error: (err: any) => {
        const errorMsg = err?.error?.message || 'Error al activar el producto';
        this.showToastMessage(errorMsg, 'error');
      }
    });
  }

  showToastMessage(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 3000);
  }

  formatPrice(price: number): string {
    return `$${price.toLocaleString('es-CO')}`;
  }

  goBack(): void {
    this.router.navigate(['/admin/dashboard']);
  }
}