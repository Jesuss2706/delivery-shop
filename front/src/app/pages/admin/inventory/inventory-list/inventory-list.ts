import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { InventoryService, InventoryItem } from '../../../../services/inventory.service';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inventory-list.html',
  styleUrls: ['./inventory-list.css']
})
export class InventoryListComponent implements OnInit {
  inventoryItems: InventoryItem[] = [];
  allInventoryItems: InventoryItem[] = [];
  categories: any[] = [];
  selectedCategory: number | null = null;
  loading = true;
  showDeleteModal = false;
  itemToDelete: InventoryItem | null = null;
  toastMessage = '';
  toastType: 'success' | 'error' | '' = '';
  showToast = false;

  constructor(
    private inventoryService: InventoryService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadInventory();
  }

  loadInventory(): void {
    this.loading = true;
    this.inventoryService.getAvailableInventoryPLSQL().subscribe({
      next: (items: InventoryItem[]) => {
        this.allInventoryItems = items;
        this.inventoryItems = items;
        this.loadCategories();
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error al cargar inventario', err);
        this.showToastMessage('Error al cargar el inventario', 'error');
        this.loading = false;
      }
    });
  }
  loadCategories(): void {
    const uniqueCategories = new Map<number, any>();
    this.allInventoryItems.forEach(item => {
      if (item.product.productType && !uniqueCategories.has(item.product.productType.typeCode)) {
        uniqueCategories.set(item.product.productType.typeCode, item.product.productType);
      }
    });
    this.categories = Array.from(uniqueCategories.values());
  }
  applyFilter(category: number | null): void {
    this.selectedCategory = category;
    if (category === null) {
      this.inventoryItems = this.allInventoryItems;
    } else {
      this.inventoryItems = this.allInventoryItems.filter(item =>
        item.product.productType?.typeCode === category
      );
    }
  }
  resetFilters(): void {
    this.selectedCategory = null;
    this.inventoryItems = this.allInventoryItems;
  }
  onFilterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const value = target.value;
    this.applyFilter(value === '' ? null : +value);
  }

  editInventoryItem(item: InventoryItem): void {
    this.router.navigate(['/admin/inventory/edit', item.invCode]);
  }

  confirmDelete(item: InventoryItem): void {
    this.itemToDelete = item;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.itemToDelete = null;
  }

  deleteInventoryItem(): void {
    if (!this.itemToDelete) return;
    this.showToastMessage('Funcionalidad de eliminación pendiente de implementar', 'error');
    this.showDeleteModal = false;
    this.itemToDelete = null;
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

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getStockStatus(stock: number): { text: string; class: string } {
    if (stock === 0) {
      return { text: 'Agotado', class: 'stock-out' };
    } else if (stock <= 5) {
      return { text: 'Bajo', class: 'stock-low' };
    } else if (stock <= 15) {
      return { text: 'Medio', class: 'stock-medium' };
    } else {
      return { text: 'Alto', class: 'stock-high' };
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/dashboard']);
  }
}