import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService, ProductType, Product } from '../../../../services/product.service';

@Component({
  selector: 'app-create-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-product.html',
  styleUrls: ['./create-product.css'],
})
export class CreateProductComponent implements OnInit {
  productForm!: FormGroup;
  productTypes: ProductType[] = [];
  previewImage = '';
  toastMessage = '';
  toastType: 'success' | 'error' | '' = '';
  showToast = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  loadingTypes = true;
  submitted = false;

  constructor(private fb: FormBuilder, private productService: ProductService) { }

  ngOnInit(): void {
    this.productForm = this.fb.group({

      proCode: [
        '',
        [
          Validators.pattern(/^\d*$/),
        ],
      ],
      proName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÜüÑñ0-9][A-Za-zÁÉÍÓÚáéíóúÜüÑñ0-9 ]*$/),
        ],
      ],
      proImg: [
        '',
        [
          Validators.required,
          Validators.pattern(/^https?:\/\/.+$/),
        ],
      ],
      proPrice: [
        '',
        [
          Validators.required,
          Validators.min(1),
          Validators.max(20000000),
        ],
      ],
      proMark: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(30),
          Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÜüÑñ0-9][A-Za-zÁÉÍÓÚáéíóúÜüÑñ0-9 ]*$/),
        ],
      ],
      descript: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(100),
          // descripción completa: inicia con carácter válido y permite puntuación común
          Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÜüÑñ0-9][A-Za-zÁÉÍÓÚáéíóúÜüÑñ0-9\s\.,;:¿\?¡!\(\)\-]*$/),
        ],
      ],
      typeCode: ['', Validators.required],
      status: ['A', Validators.required],
    });

    this.productService.getProductTypes().subscribe({
      next: (types: ProductType[]) => {
        this.productTypes = types;
        this.loadingTypes = false;
      },
      error: (err: any) => {
        console.error('Error al cargar tipos de producto', err);
        this.loadingTypes = false;
      },
    });

    this.productForm.get('proImg')?.valueChanges.subscribe((url: string) => {
      this.previewImage = url;
    });
  }

  // permite solo números pero deja pasar teclas de control (backspace, flechas, ctrl/cmd, tab)
  onlyNumbers(event: KeyboardEvent) {
    const key = event.key;
    const isControlKey =
      key === 'Backspace' ||
      key === 'ArrowLeft' ||
      key === 'ArrowRight' ||
      key === 'Delete' ||
      key === 'Tab' ||
      key === 'Home' ||
      key === 'End' ||
      (event.ctrlKey || event.metaKey);

    if (isControlKey) return;
    if (!/^\d$/.test(key)) {
      event.preventDefault();
    }
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.productForm.invalid) {
      this.showToastMessage('Por favor completa todos los campos correctamente.', 'error');
      return;
    }

    const productData = this.productForm.value;
    // si typeCode en productTypes es number, convertir; si es string, no usar Number.
    const selectedType = this.productTypes.find((t) => String(t.typeCode) === String(productData.typeCode));

    if (!selectedType) {
      this.errorMessage = 'Tipo de producto inválido.';
      return;
    }

    // evita NaN si proCode no fue llenado: solo incluirlo si es válido
    const proCodeNumber = productData.proCode ? Number(productData.proCode) : undefined;

    const newProduct: Product = {
      ...(proCodeNumber !== undefined ? { proCode: proCodeNumber } : {}),
      proName: productData.proName.trim(),
      descript: productData.descript.trim(),
      proImg: productData.proImg.trim(),
      proMark: productData.proMark.trim(),
      proPrice: Number(productData.proPrice),
      productType: selectedType,
      status: productData.status,
    } as Product;

    this.productService.createProduct(newProduct).subscribe({
      next: () => {
        this.showToastMessage('Producto creado correctamente.', 'success');
        this.productForm.reset();
        this.previewImage = '';
        this.submitted = false;
      },
      error: (err: any) => {
        const backendError =
          typeof err.error === 'string'
            ? err.error
            : err?.error?.message || 'Error al crear el producto.';
        this.showToastMessage(backendError, 'error');
      },
    });
  }

  // helper para mensajes de error en la plantilla
  getErrorMessage(controlName: string): string | null {
    const control = this.productForm.get(controlName);
    if (!control || !control.errors) return null;
    if (control.errors['required']) return 'Este campo es obligatorio.';
    if (control.errors['minlength']) return `Mínimo ${control.errors['minlength'].requiredLength} caracteres.`;
    if (control.errors['maxlength']) return `Máximo ${control.errors['maxlength'].requiredLength} caracteres.`;
    if (control.errors['pattern']) return 'Contiene caracteres no permitidos.';
    if (control.errors['min']) return `Valor mínimo ${control.errors['min'].min}.`;
    if (control.errors['max']) return `Valor máximo ${control.errors['max'].max}.`;
    return 'Campo inválido.';
  }

  showToastMessage(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 3000);
  }
}
