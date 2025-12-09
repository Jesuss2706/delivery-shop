import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InventoryService, InventoryItem } from '../../../../services/inventory.service';
import { ProviderService, Provider } from '../../../../services/provider.service';
import { forbiddenWordsValidator } from '../../../../validators/forbidden-words.validator';

@Component({
  selector: 'app-edit-inventory',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-inventory.html',
  styleUrls: ['./edit-inventory.css'],
})
export class EditInventoryComponent implements OnInit {
  inventoryItem!: InventoryItem;
  inventoryForm!: FormGroup;
  loading = true;
  submitted = false;
  showToast = false;
  errorMessage = '';
  toastMessage = '';
  toastType: 'success' | 'error' | '' = '';
  inventoryCode: number | null = null;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private fb: FormBuilder,
    private inventoryService: InventoryService,
    private providerService: ProviderService
  ) {}

  // Validador personalizado para fecha (no mayor a 1 año)
  private dateNotOlderThanOneYear(): (control: AbstractControl) => ValidationErrors | null {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const inputDate = new Date(control.value);
      const today = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(today.getFullYear() - 1);

      if (inputDate < oneYearAgo) {
        return { dateOlderThanOneYear: true };
      }

      return null;
    };
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.inventoryCode = Number(id);
        this.loadInventoryData(this.inventoryCode);
      }
    });

    this.inventoryForm = this.fb.group({
      invStock: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d+$/),
          Validators.min(0),
          Validators.max(200)
        ]
      ],
      sellingPrice: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d+(\.\d{1,2})?$/),
          Validators.min(0),
          Validators.max(20000000)
        ]
      ],
      invDate: [
        '',
        [
          Validators.required,
          this.dateNotOlderThanOneYear()
        ]
      ],
      provId: [{ value: '', disabled: true }],
      provName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(30),
          Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/),
          forbiddenWordsValidator()
        ]
      ],
      provEmail: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern(/^[\w\.-]+@[\w\.-]+\.[a-zA-Z]{2,}$/),
          forbiddenWordsValidator()
        ]
      ],
      provPhone: [
        '',
        [
          Validators.required,
          Validators.pattern(/^3\d{9}$/) 
        ]
      ],
    });
  }

  getMargin(): number | null {
    const sellingPrice = this.inventoryForm.get('sellingPrice')?.value;
    const basePrice = this.inventoryItem?.product?.proPrice;
    if (!sellingPrice || !basePrice || basePrice === 0) return null;
    return ((sellingPrice - basePrice) / basePrice) * 100;
  }

  loadInventoryData(invCode: number): void {
    this.loading = true;
    this.inventoryService.getInventoryItemPLSQL(invCode).subscribe({
      next: (data: InventoryItem) => {
        console.log('📥 Inventario cargado:', data);

        this.inventoryItem = {
          ...data,
          status: data.status || 'A',
          product: data.product
            ? { ...data.product, status: data.product.status || 'A' }
            : data.product,
          provider: data.provider,
        };

        this.inventoryForm.patchValue({
          invStock: data.invStock,
          sellingPrice: data.sellingPrice,
          invDate: data.invDate?.substring(0, 10) ?? '',
          provId: data.provider?.provId ?? '',
          provName: data.provider?.provName ?? '',
          provEmail: data.provider?.provEmail ?? '',
          provPhone: data.provider?.provPhone ?? '',
        });
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error al cargar el inventario', err);
        this.errorMessage = 'No se pudo cargar la información del inventario.';
        this.showToastMessage('Inventario no encontrado', 'error');
        this.loading = false;
        setTimeout(() => {
          this.router.navigate(['/admin/inventory']);
        }, 2000);
      },
    });
  }

  onlyNumbers(event: KeyboardEvent): void {
    const charCode = event.which ? event.which : event.keyCode;
    // Permitir teclas de control (backspace, tab, flechas)
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.inventoryForm.invalid) {
      this.showToastMessage('Por favor completa todos los campos correctamente.', 'error');
      return;
    }

    // Verificar palabras prohibidas antes de enviar
    const containsForbidden = Object.keys(this.inventoryForm.controls).some((key) => {
      const ctrl = this.inventoryForm.get(key);
      return ctrl?.errors?.['forbiddenWord'];
    });

    if (containsForbidden) {
      this.showToastMessage('Se detectaron palabras o símbolos no permitidos.', 'error');
      return;
    }

    if (!this.inventoryCode) {
      this.showToastMessage('Código de inventario no válido', 'error');
      return;
    }

    const invCode = this.inventoryCode;
    const providerId = this.inventoryItem.provider?.provId;

    const updatedInventory: any = {
      invStock: Number(this.inventoryForm.get('invStock')?.value),
      sellingPrice: Number(this.inventoryForm.get('sellingPrice')?.value),
      invDate: this.inventoryForm.get('invDate')?.value,
      status: this.inventoryItem.status || 'A',
      product: this.inventoryItem.product
        ? {
            proCode: this.inventoryItem.product.proCode,
            proName: this.inventoryItem.product.proName,
            proImg: this.inventoryItem.product.proImg,
            proPrice: this.inventoryItem.product.proPrice,
            descript: this.inventoryItem.product.descript,
            proMark: this.inventoryItem.product.proMark,
            status: this.inventoryItem.product.status || 'A',
            productType: this.inventoryItem.product.productType,
          }
        : null,
      provider: this.inventoryItem.provider
        ? {
            provId: this.inventoryItem.provider.provId,
            provName: this.inventoryForm.get('provName')?.value,
            provEmail: this.inventoryForm.get('provEmail')?.value,
            provPhone: this.inventoryForm.get('provPhone')?.value,
          }
        : null,
    };


    this.inventoryService.updateInventoryItem(invCode, updatedInventory).subscribe({
      next: (response) => {
        console.log('✅ Inventario actualizado:', response);

        if (providerId && this.hasProviderChanged()) {
          const updatedProvider: Provider = {
            provId: providerId,
            provName: this.inventoryForm.get('provName')?.value,
            provEmail: this.inventoryForm.get('provEmail')?.value,
            provPhone: this.inventoryForm.get('provPhone')?.value,
          };

          console.log('📦 Actualizando proveedor:', updatedProvider);

          this.providerService.updateProvider(providerId, updatedProvider).subscribe({
            next: () => {
              this.showToastMessage('Inventario y proveedor actualizados correctamente', 'success');
              setTimeout(() => this.router.navigate(['/admin/inventory/list']), 1500);
            },
            error: (err: any) => {
              const errorMsg =
                typeof err.error === 'string' ? err.error : 'Error al actualizar el proveedor';
              this.showToastMessage(errorMsg, 'error');
            },
          });
        } else {
          this.showToastMessage('Inventario actualizado correctamente', 'success');
          setTimeout(() => this.router.navigate(['/admin/inventory/list']), 1500);
        }
      },
      error: (err: any) => {

        let errorMessage = 'Error al actualizar el inventario.';

        if (Array.isArray(err.error)) {
          errorMessage = err.error.join(', ');
        } else if (typeof err.error === 'string') {
          errorMessage = err.error;
        } else if (err.error?.message) {
          errorMessage = err.error.message;
        }

        this.showToastMessage(errorMessage, 'error');
      },
    });
  }

  private hasProviderChanged(): boolean {
    const currentProvider = this.inventoryItem.provider;
    if (!currentProvider) return false;

    return (
      this.inventoryForm.get('provName')?.value !== currentProvider.provName ||
      this.inventoryForm.get('provEmail')?.value !== currentProvider.provEmail ||
      this.inventoryForm.get('provPhone')?.value !== currentProvider.provPhone
    );
  }

  showToastMessage(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 3000);
  }

  goBack(): void {
    this.router.navigate(['/admin/inventory/list']);
  }
}
