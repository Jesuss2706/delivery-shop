import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InvMovementService, InvMovement } from '../../../../services/invmovement.service';

@Component({
  selector: 'app-inv-movement',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inv-movement.html',
  styleUrls: ['./inv-movement.css']
})
export class InvMovementComponent implements OnInit {
  movements: InvMovement[] = [];
  filteredMovements: InvMovement[] = [];
  loading = true;
  
  // Filtros
  selectedInventory: number | null = null;
  selectedType: string | null = null;
  selectedStartDate: string = '';
  selectedEndDate: string = '';
  
  // Estados de UI
  showFilters = false;
  toastMessage = '';
  toastType: 'success' | 'error' | '' = '';
  showToast = false;

  // Opciones de filtros (actualizadas según backend)
  movementTypes = [
    { value: 'ENTRADA', label: 'Entrada' },
    { value: 'SALIDA', label: 'Salida' },
    { value: 'DEVOLUCION', label: 'Devolución' },
    { value: 'AJUSTE', label: 'Ajuste' }
  ];

  // Propiedades computadas para el resumen
  get totalMovements(): number {
    return this.filteredMovements.length;
  }

  get entradaCount(): number {
    return this.filteredMovements.filter(m => m.movType === 'ENTRADA').length;
  }

  get salidaCount(): number {
    return this.filteredMovements.filter(m => m.movType === 'SALIDA').length;
  }

  get devolucionCount(): number {
    return this.filteredMovements.filter(m => m.movType === 'DEVOLUCION').length;
  }

  get ajusteCount(): number {
    return this.filteredMovements.filter(m => m.movType === 'AJUSTE').length;
  }

  // Propiedades computadas para cantidades totales
  get totalEntradas(): number {
    return this.invMovementService.getTotalQuantityByType(this.filteredMovements, 'ENTRADA');
  }

  get totalSalidas(): number {
    return this.invMovementService.getTotalQuantityByType(this.filteredMovements, 'SALIDA');
  }

  constructor(
    public invMovementService: InvMovementService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMovements();
  }

  /**
   * Cargar todos los movimientos activos
   */
  loadMovements(): void {
    this.loading = true;
    this.invMovementService.getActiveMovements().subscribe({
      next: (movements: InvMovement[]) => {
        this.movements = movements;
        this.filteredMovements = movements;
        this.loading = false;
        console.log('Movimientos cargados:', movements.length);
      },
      error: (err: any) => {
        console.error('Error al cargar movimientos', err);
        this.showToastMessage('Error al cargar los movimientos', 'error');
        this.loading = false;
      }
    });
  }

  /**
   * Aplicar filtros localmente (frontend)
   */
  applyFilters(): void {
    let filtered = [...this.movements];

    // Filtrar por inventario (invCode)
    if (this.selectedInventory) {
      filtered = filtered.filter(movement => 
        movement.invCode === this.selectedInventory
      );
    }

    // Filtrar por tipo de movimiento
    if (this.selectedType) {
      filtered = filtered.filter(movement => 
        movement.movType === this.selectedType
      );
    }

    // Filtrar por rango de fechas
    if (this.selectedStartDate && this.selectedEndDate) {
      filtered = filtered.filter(movement => {
        const movDate = new Date(movement.movDate);
        const startDate = new Date(this.selectedStartDate);
        const endDate = new Date(this.selectedEndDate);
        return movDate >= startDate && movDate <= endDate;
      });
    }

    this.filteredMovements = filtered;
    
    if (filtered.length === 0) {
      this.showToastMessage('No se encontraron movimientos con los filtros aplicados', 'error');
    } else {
      this.showToastMessage(`${filtered.length} movimientos encontrados`, 'success');
    }
  }

  /**
   * Aplicar filtros usando el servicio backend (opcional - más eficiente)
   */
  applyFiltersWithBackend(): void {
    this.loading = true;

    // Si hay filtros específicos, usar endpoints del backend
    if (this.selectedInventory && this.selectedType) {
      // Filtrar por inventario y tipo
      this.invMovementService.getMovementsByInventoryAndType(
        this.selectedInventory, 
        this.selectedType
      ).subscribe({
        next: (movements) => this.handleFilteredMovements(movements),
        error: (err) => this.handleFilterError(err)
      });
    } else if (this.selectedInventory && this.selectedStartDate && this.selectedEndDate) {
      // Filtrar por inventario y fecha
      this.invMovementService.getMovementsByInventoryAndDateRange(
        this.selectedInventory,
        this.selectedStartDate,
        this.selectedEndDate
      ).subscribe({
        next: (movements) => this.handleFilteredMovements(movements),
        error: (err) => this.handleFilterError(err)
      });
    } else if (this.selectedInventory) {
      // Filtrar solo por inventario
      this.invMovementService.getMovementsByInventory(this.selectedInventory).subscribe({
        next: (movements) => this.handleFilteredMovements(movements),
        error: (err) => this.handleFilterError(err)
      });
    } else if (this.selectedType) {
      // Filtrar solo por tipo
      this.invMovementService.getMovementsByType(this.selectedType).subscribe({
        next: (movements) => this.handleFilteredMovements(movements),
        error: (err) => this.handleFilterError(err)
      });
    } else if (this.selectedStartDate && this.selectedEndDate) {
      // Filtrar solo por fecha
      this.invMovementService.getMovementsByDateRange(
        this.selectedStartDate,
        this.selectedEndDate
      ).subscribe({
        next: (movements) => this.handleFilteredMovements(movements),
        error: (err) => this.handleFilterError(err)
      });
    } else {
      // Sin filtros, cargar todos
      this.loadMovements();
    }
  }

  /**
   * Manejar movimientos filtrados
   */
  private handleFilteredMovements(movements: InvMovement[]): void {
    this.filteredMovements = movements;
    this.loading = false;
    
    if (movements.length === 0) {
      this.showToastMessage('No se encontraron movimientos', 'error');
    } else {
      this.showToastMessage(`${movements.length} movimientos encontrados`, 'success');
    }
  }

  /**
   * Manejar errores de filtrado
   */
  private handleFilterError(err: any): void {
    console.error('Error al aplicar filtros', err);
    this.showToastMessage('Error al aplicar filtros', 'error');
    this.loading = false;
  }

  /**
   * Limpiar todos los filtros
   */
  clearFilters(): void {
    this.selectedInventory = null;
    this.selectedType = null;
    this.selectedStartDate = '';
    this.selectedEndDate = '';
    this.filteredMovements = [...this.movements];
    this.showFilters = false;
    this.showToastMessage('Filtros limpiados', 'success');
  }

  /**
   * Toggle panel de filtros
   */
  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  /**
   * Ver detalle del movimiento
   */
  viewMovementDetail(movement: InvMovement): void {
    console.log('Ver detalle del movimiento:', movement);
    this.showToastMessage(`Viendo detalle del movimiento ${movement.invMovID}`, 'success');
    // Puedes navegar a una página de detalles si la tienes:
    // this.router.navigate(['/admin/movements', movement.invMovID]);
  }

  /**
   * Mostrar mensaje toast
   */
  showToastMessage(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 3000);
  }

  /**
   * Formatear fecha
   */
  formatDate(dateString: string): string {
    return this.invMovementService.formatMovementDate(dateString);
  }

  /**
   * Formatear fecha completa con hora
   */
  formatDateTime(dateString: string): string {
    return this.invMovementService.formatMovementDateTime(dateString);
  }

  /**
   * Formatear cantidad con signo
   */
  formatQuantity(quantity: number, movType: string): string {
    const sign = movType === 'ENTRADA' || movType === 'DEVOLUCION' ? '+' : '-';
    return `${sign}${quantity}`;
  }

  /**
   * Obtener clase CSS para la cantidad según tipo
   */
  getQuantityClass(movType: string): string {
    return movType === 'ENTRADA' || movType === 'DEVOLUCION' 
      ? 'quantity-positive' 
      : 'quantity-negative';
  }

  /**
   * Obtener texto del tipo de movimiento
   */
  getMovementTypeText(movType: string): string {
    return this.invMovementService.getMovementTypeText(movType);
  }

  /**
   * Obtener clase CSS del tipo de movimiento
   */
  getMovementTypeClass(movType: string): string {
    const typeClassMap: { [key: string]: string } = {
      'ENTRADA': 'type-entrada',
      'SALIDA': 'type-salida',
      'DEVOLUCION': 'type-devolucion',
      'AJUSTE': 'type-ajuste'
    };
    return typeClassMap[movType] || 'type-default';
  }

  /**
   * Formatear precio
   */
  formatPrice(price: number): string {
    return this.invMovementService.formatPrice(price);
  }

  /**
   * Obtener imagen del producto o placeholder
   */
  getProductImage(movement: InvMovement): string {
    return movement.proImg || 'assets/images/no-image.png';
  }

  /**
   * Verificar si el movimiento tiene razón
   */
  hasReason(movement: InvMovement): boolean {
    return !!movement.reason && movement.reason.trim() !== '';
  }

  /**
   * Filtrar por producto
   */
  filterByProduct(proCode: number): void {
    this.filteredMovements = this.invMovementService.filterByProduct(
      this.movements, 
      proCode
    );
    this.showToastMessage(`Filtrando por producto ${proCode}`, 'success');
  }

  /**
   * Filtrar por proveedor
   */
  filterByProvider(provId: number): void {
    this.filteredMovements = this.invMovementService.filterByProvider(
      this.movements,
      provId
    );
    this.showToastMessage(`Filtrando por proveedor ${provId}`, 'success');
  }

  /**
   * Obtener movimientos recientes (últimos 7 días)
   */
  showRecentMovements(): void {
    this.filteredMovements = this.invMovementService.getRecentMovements(
      this.movements,
      7
    );
    this.showToastMessage('Mostrando movimientos de los últimos 7 días', 'success');
  }

  
  goBack(): void {
    this.router.navigate(['/admin/dashboard']);
  }

  /**
   * Refrescar datos
   */
  refresh(): void {
    this.clearFilters();
    this.loadMovements();
  }
}