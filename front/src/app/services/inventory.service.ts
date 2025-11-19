import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface ProductType {
  typeCode: number;
  typeName: string;
}

export interface Provider {
  provId: number;
  provEmail: string;
  provName: string;
  provPhone: string;
}

export interface Product {
  proCode: number;
  proName: string;
  proImg: string;
  proPrice: number;
  descript: string;
  proMark: string;
  status: string; // 'A' = activo, 'I' = inactivo
  productType: ProductType;
}

export interface InventoryItem {
  invCode?: number;
  invStock: number;
  sellingPrice: number;
  invDate: string;
  status: string; // 'A' = activo, 'I' = inactivo
  product: Product;
  provider?: Provider;
}

@Injectable({
  providedIn: 'root'  
})
export class InventoryService {
  private apiUrl = environment.apiUrl;
  
  // ✅ Subject para filtros - siempre emitirá cambios
  private typeCodeFilterSubject = new Subject<number | null>();
  typeCodeFilter$ = this.typeCodeFilterSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ============ MÉTODOS CON PL/SQL ==============

  getAllInventoryPLSQL(): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>(`${this.apiUrl}/inventory/plsql`);
  }

  getAvailableInventoryPLSQL(): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>(`${this.apiUrl}/inventory/plsql/active`);
  }

  getInventoryByTypePLSQL(typeCode: number): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>(`${this.apiUrl}/inventory/plsql/type/${typeCode}`);
  }

  getInventoryItemPLSQL(invCode: number): Observable<InventoryItem> {
    return this.http.get<InventoryItem>(`${this.apiUrl}/inventory/plsql/${invCode}`);
  }

  createInventoryItemPLSQL(inventoryData: InventoryItem): Observable<InventoryItem> {
    return this.http.post<InventoryItem>(`${this.apiUrl}/inventory/plsql`, inventoryData);
  }

  updateInventoryItemPLSQL(invCode: number, data: Partial<InventoryItem>): Observable<InventoryItem> {
    return this.http.put<InventoryItem>(`${this.apiUrl}/inventory/plsql/${invCode}`, data);
  }

  deleteInventoryItemPLSQL(invCode: number): Observable<InventoryItem> {
    return this.http.delete<InventoryItem>(`${this.apiUrl}/inventory/plsql/${invCode}`);
  }

  updateInventoryStatusPLSQL(invCode: number, status: string): Observable<InventoryItem> {
    return this.http.put<InventoryItem>(`${this.apiUrl}/inventory/plsql/${invCode}/status`, { status });
  }

  // ============ MÉTODOS JPA (FALLBACK) ==============

  // Obtener inventario disponible (filtrado en frontend)
  getAvailableInventory(): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>(`${this.apiUrl}/inventory`).pipe(
      map(items => this.filterActiveItems(items))
    );
  }

  // Obtener inventario por tipo de producto (filtrado en frontend)
  getInventoryByType(typeCode: number): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>(`${this.apiUrl}/inventory`).pipe(
      map(items => {
        const filteredByType = items.filter(item =>
          item.product.productType.typeCode === typeCode
        );
        return this.filterActiveItems(filteredByType);
      })
    );
  }

  // Filtro privado para items activos
  private filterActiveItems(items: InventoryItem[]): InventoryItem[] {
    return items.filter(item => {
      // Verificar que tanto el inventario como el producto estén activos
      const isActive = item.status === 'A' && item.product.status === 'A';
      const hasStock = item.invStock > 0;
      
      return isActive && hasStock;
    });
  }

  // Obtener item de inventario por código
  getInventoryItem(invCode: number): Observable<InventoryItem> {
    return this.http.get<InventoryItem>(`${this.apiUrl}/inventory/${invCode}`);
  }

  // Crear nuevo item de inventario
  createInventoryItem(inventoryData: InventoryItem): Observable<InventoryItem> {
    return this.http.post<InventoryItem>(`${this.apiUrl}/inventory`, inventoryData);
  }

  // Actualizar item de inventario
  updateInventoryItem(invCode: number, data: Partial<InventoryItem>): Observable<InventoryItem> {
    return this.http.put<InventoryItem>(`${this.apiUrl}/inventory/${invCode}`, data);
  }

  // Eliminar item de inventario (borrado lógico)
  deleteInventoryItem(invCode: number): Observable<InventoryItem> {
    return this.getInventoryItem(invCode).pipe(
      switchMap((inventory: InventoryItem) => {
        const updatedInventory = {
          ...inventory,
          status: 'I'
        };
        return this.http.put<InventoryItem>(`${this.apiUrl}/inventory/${invCode}`, updatedInventory);
      })
    );
  }

  // Método específico para actualizar status del inventario
  updateInventoryStatus(invCode: number, status: string): Observable<InventoryItem> {
    return this.getInventoryItem(invCode).pipe(
      switchMap((inventory: InventoryItem) => {
        const updatedInventory = {
          ...inventory,
          status: status
        };
        return this.http.put<InventoryItem>(`${this.apiUrl}/inventory/${invCode}`, updatedInventory);
      })
    );
  }

  // Obtener tipos de producto
  getProductTypes(): Observable<ProductType[]> {
    return this.http.get<ProductType[]>(`${this.apiUrl}/prodType`);
  }

  // Filtrar por tipo de producto
  filterByTypeCode(typeCode: number | null): void {
    console.log('🚀 InventoryService - Emitiendo filtro:', typeCode);
    this.typeCodeFilterSubject.next(typeCode);
  }

  
  isItemActive(item: InventoryItem): boolean {
    return item.status === 'A' && item.product.status === 'A';
  }

  isItemAvailable(item: InventoryItem): boolean {
    return this.isItemActive(item) && item.invStock > 0;
  }

  getStatusText(status: string): string {
    return status === 'A' ? 'Activo' : 'Inactivo';
  }
}