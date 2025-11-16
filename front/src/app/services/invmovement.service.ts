import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface InvMovement {
  invMovID: number;
  movType: string;
  movDate: string;
  quantity: number;
  prevStock: number | null;
  newStock: number | null;
  reason: string | null;
  
  // Datos de Inventory
  invCode: number;
  invStock: number;
  sellingPrice: number;
  invDate: string;
  status: string;
  
  // Datos de Product
  proCode: number;
  proName: string;
  proImg: string;
  
  // Datos de Provider
  provId: number;
  provName: string;
  
  // Datos de Order (opcional)
  ordId: number | null;
  
  // Datos de User (opcional)
  userId: number | null;
  userName: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class InvMovementService {
  private apiUrl = `${environment.apiUrl}/inv-movements`;

  private inventoryFilterSubject = new Subject<number | null>();
  private typeFilterSubject = new Subject<string | null>();
  private dateRangeFilterSubject = new Subject<{ startDate: string; endDate: string } | null>();

  // Observables para los filtros
  inventoryFilter$ = this.inventoryFilterSubject.asObservable();
  typeFilter$ = this.typeFilterSubject.asObservable();
  dateRangeFilter$ = this.dateRangeFilterSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ============ MÉTODOS PRINCIPALES ============

  /**
   * Obtener todos los movimientos
   */
  getAllMovements(): Observable<InvMovement[]> {
    return this.http.get<InvMovement[]>(this.apiUrl);
  }

  /**
   * Obtener movimientos activos (filtrado en frontend)
   */
  getActiveMovements(): Observable<InvMovement[]> {
    return this.getAllMovements().pipe(
      map((movements) => this.filterActiveMovements(movements))
    );
  }

  /**
   * Obtener movimiento por ID
   */
  getMovementById(id: number): Observable<InvMovement> {
    return this.http.get<InvMovement>(`${this.apiUrl}/${id}`);
  }

  /**
   * Buscar movimientos por código de inventario
   */
  getMovementsByInventory(invCode: number): Observable<InvMovement[]> {
    return this.http
      .get<InvMovement[]>(`${this.apiUrl}/inventory/${invCode}`)
      .pipe(map((movements) => this.filterActiveMovements(movements)));
  }

  /**
   * Buscar movimientos por tipo (ENTRADA, SALIDA, DEVOLUCION, AJUSTE)
   */
  getMovementsByType(movType: string): Observable<InvMovement[]> {
    return this.http
      .get<InvMovement[]>(`${this.apiUrl}/type/${movType}`)
      .pipe(map((movements) => this.filterActiveMovements(movements)));
  }

  /**
   * Buscar movimientos por orden
   */
  getMovementsByOrder(ordID: number): Observable<InvMovement[]> {
    return this.http
      .get<InvMovement[]>(`${this.apiUrl}/order/${ordID}`)
      .pipe(map((movements) => this.filterActiveMovements(movements)));
  }

  /**
   * Buscar movimientos por rango de fechas
   * @param startDate Formato: YYYY-MM-DD
   * @param endDate Formato: YYYY-MM-DD
   */
  getMovementsByDateRange(startDate: string, endDate: string): Observable<InvMovement[]> {
    return this.http
      .get<InvMovement[]>(`${this.apiUrl}/date-range`, {
        params: { startDate, endDate }
      })
      .pipe(map((movements) => this.filterActiveMovements(movements)));
  }

  /**
   * Buscar movimientos por inventario y tipo
   */
  getMovementsByInventoryAndType(invCode: number, movType: string): Observable<InvMovement[]> {
    return this.http
      .get<InvMovement[]>(`${this.apiUrl}/inventory/${invCode}/type/${movType}`)
      .pipe(map((movements) => this.filterActiveMovements(movements)));
  }

  /**
   * Buscar movimientos por inventario y rango de fechas
   */
  getMovementsByInventoryAndDateRange(
    invCode: number,
    startDate: string,
    endDate: string
  ): Observable<InvMovement[]> {
    return this.http
      .get<InvMovement[]>(`${this.apiUrl}/inventory/${invCode}/date-range`, {
        params: { startDate, endDate }
      })
      .pipe(map((movements) => this.filterActiveMovements(movements)));
  }

  /**
   * Obtener conteo total de movimientos
   */
  getMovementsCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count`);
  }

  /**
   * Verificar si existe un movimiento
   */
  checkMovementExists(id: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/exists/${id}`);
  }

  // ============ MÉTODOS DE FILTRADO ============

  /**
   * Filtro privado para movimientos activos
   */
  private filterActiveMovements(movements: InvMovement[]): InvMovement[] {
    return movements.filter((movement) => {
      // Filtrar por status del inventario
      if (!movement.status) return true;
      return movement.status === 'A';
    });
  }

  /**
   * Emitir filtro por inventario
   */
  filterByInventory(invCode: number | null): void {
    this.inventoryFilterSubject.next(invCode);
  }

  /**
   * Emitir filtro por tipo
   */
  filterByType(movType: string | null): void {
    this.typeFilterSubject.next(movType);
  }

  /**
   * Emitir filtro por rango de fechas
   */
  filterByDateRange(startDate: string, endDate: string): void {
    this.dateRangeFilterSubject.next({ startDate, endDate });
  }

  /**
   * Limpiar todos los filtros
   */
  clearFilters(): void {
    this.inventoryFilterSubject.next(null);
    this.typeFilterSubject.next(null);
    this.dateRangeFilterSubject.next(null);
  }

  // ============ MÉTODOS DE UTILIDAD ============

  /**
   * Verificar si un movimiento está activo
   */
  isMovementActive(movement: InvMovement): boolean {
    return !movement.status || movement.status === 'A';
  }

  /**
   * Obtener texto legible del tipo de movimiento
   */
  getMovementTypeText(movType: string): string {
    const typeMap: { [key: string]: string } = {
      ENTRADA: 'Entrada',
      SALIDA: 'Salida',
      AJUSTE: 'Ajuste',
      DEVOLUCION: 'Devolución',
    };
    return typeMap[movType] || movType;
  }

  /**
   * Obtener clase CSS según tipo de movimiento
   */
  getMovementTypeClass(movType: string): string {
    const classMap: { [key: string]: string } = {
      ENTRADA: 'badge-success',
      SALIDA: 'badge-danger',
      AJUSTE: 'badge-warning',
      DEVOLUCION: 'badge-info',
    };
    return classMap[movType] || 'badge-secondary';
  }

  /**
   * Obtener texto del status
   */
  getStatusText(status: string): string {
    return status === 'A' ? 'Activo' : 'Inactivo';
  }

  /**
   * Formatear fecha para mostrar
   */
  formatMovementDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }

  /**
   * Formatear fecha y hora
   */
  formatMovementDateTime(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Formatear precio
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  }

  /**
   * Calcular stock actual basado en movimientos
   */
  calculateCurrentStock(initialStock: number, movements: InvMovement[]): number {
    return movements.reduce((stock, movement) => {
      if (movement.movType === 'ENTRADA') {
        return stock + movement.quantity;
      } else if (movement.movType === 'SALIDA') {
        return stock - movement.quantity;
      }
      return stock;
    }, initialStock);
  }

  /**
   * Obtener resumen de movimientos por tipo
   */
  getMovementsSummaryByType(movements: InvMovement[]): { [key: string]: number } {
    const summary: { [key: string]: number } = {
      ENTRADA: 0,
      SALIDA: 0,
      DEVOLUCION: 0,
      AJUSTE: 0,
    };

    movements.forEach((movement) => {
      if (summary.hasOwnProperty(movement.movType)) {
        summary[movement.movType]++;
      }
    });

    return summary;
  }

  /**
   * Obtener total de cantidad por tipo
   */
  getTotalQuantityByType(movements: InvMovement[], movType: string): number {
    return movements
      .filter((m) => m.movType === movType)
      .reduce((total, m) => total + m.quantity, 0);
  }

  /**
   * Filtrar movimientos por producto
   */
  filterByProduct(movements: InvMovement[], proCode: number): InvMovement[] {
    return movements.filter((m) => m.proCode === proCode);
  }

  /**
   * Filtrar movimientos por proveedor
   */
  filterByProvider(movements: InvMovement[], provId: number): InvMovement[] {
    return movements.filter((m) => m.provId === provId);
  }

  /**
   * Obtener movimientos recientes (últimos N días)
   */
  getRecentMovements(movements: InvMovement[], days: number = 7): InvMovement[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return movements.filter((m) => {
      const movDate = new Date(m.movDate);
      return movDate >= cutoffDate;
    });
  }

  /**
   * Agrupar movimientos por fecha
   */
  groupMovementsByDate(movements: InvMovement[]): { [date: string]: InvMovement[] } {
    return movements.reduce((groups, movement) => {
      const date = this.formatMovementDate(movement.movDate);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(movement);
      return groups;
    }, {} as { [date: string]: InvMovement[] });
  }

  /**
   * Obtener movimientos con razón (devoluciones y ajustes)
   */
  getMovementsWithReason(movements: InvMovement[]): InvMovement[] {
    return movements.filter((m) => m.reason && m.reason.trim() !== '');
  }
}