import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService, ProductType, Product } from '../../../../services/product.service';

@Component({
  selector: 'app-edit-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-product.html',
  styleUrls: ['./edit-product.css'],
})
export class EditProductComponent implements OnInit {
  productForm!: FormGroup;
  productTypes: ProductType[] = [];
  previewImage = '';
  toastMessage = '';
  toastType: 'success' | 'error' | '' = '';
  showToast = false;
  loadingTypes = true;
  loadingProduct = false;
  submitted = false;
  productLoaded = false;
  productCode: number | null = null;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // === VALIDACIONES ===
    this.productForm = this.fb.group({
      proCode: [{ value: '', disabled: true }],
      proName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(30),
          Validators.pattern(/^(?!\s*$)[A-Za-z0-9\s]+$/),
        ],
      ],
      descript: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(50),
          Validators.pattern(/^[A-Za-z0-9\sáéíóúÁÉÍÓÚñÑ.,()]+$/)
        ],
      ],
      proMark: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(20),
          Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/),
        ],
      ],
      proPrice: [
        '',
        [
          Validators.required,
          Validators.min(1),
          Validators.max(20000000),
          Validators.pattern(/^\d{1,8}$/),
        ],
      ],
      proImg: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^(https?:\/\/)?([\w\-])+(\.[\w\-]+)+([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/
          ),
        ],
      ],
      typeCode: ['', Validators.required],
      status: ['A', Validators.required],
    });

    // === CARGAR TIPOS DE PRODUCTO ===
    this.productService.getProductTypes().subscribe({
      next: (types: ProductType[]) => {
        this.productTypes = types;
        this.loadingTypes = false;
      },
      error: (err: any) => {
        console.error('Error al cargar tipos de producto', err);
        this.showToastMessage('Error al cargar tipos de producto', 'error');
        this.loadingTypes = false;
      },
    });

    // === CARGAR PRODUCTO POR ID ===
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.productCode = Number(id);
        this.loadProductData(this.productCode);
      }
    });

    // === VISTA PREVIA DE IMAGEN ===
    this.productForm.get('proImg')?.valueChanges.subscribe((url: string) => {
      this.previewImage = url;
    });
  }

  // === CARGAR PRODUCTO EXISTENTE ===
  loadProductData(proCode: number): void {
    this.loadingProduct = true;
    this.productService.getProductById(proCode).subscribe({
      next: (product: Product) => {
        this.productForm.patchValue({
          proCode: product.proCode,
          proName: product.proName,
          proImg: product.proImg,
          proPrice: product.proPrice,
          proMark: product.proMark,
          descript: product.descript,
          typeCode: product.productType?.typeCode || '',
          status: product.status || 'A',
        });

        this.previewImage = product.proImg || '';
        this.loadingProduct = false;
        this.productLoaded = true;
      },
      error: (err: any) => {
        console.error('Error al cargar el producto', err);
        this.showToastMessage('Producto no encontrado', 'error');
        this.loadingProduct = false;
        this.productLoaded = false;
        setTimeout(() => {
          this.router.navigate(['/admin/products/list']);
        }, 2000);
      },
    });
  }

  // === SOLO NÚMEROS ===
  onlyNumbers(event: KeyboardEvent): void {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  // === GUARDAR CAMBIOS ===
  onSubmit(): void {
    this.submitted = true;

    if (this.productForm.invalid) {
      this.showToastMessage('Por favor completa todos los campos correctamente.', 'error');
      return;
    }

    if (this.productCode === null) {
      this.showToastMessage('Error: Código de producto no válido', 'error');
      return;
    }

    const formValue = this.productForm.getRawValue();
    const selectedType = this.productTypes.find((t) => t.typeCode === Number(formValue.typeCode));

    if (!selectedType) {
      this.showToastMessage('Tipo de producto inválido.', 'error');
      return;
    }

    const productData: Product = {
      proCode: Number(formValue.proCode),
      proName: formValue.proName.trim(),
      descript: formValue.descript.trim(),
      proImg: formValue.proImg.trim(),
      proMark: formValue.proMark.trim(),
      proPrice: Number(formValue.proPrice),
      status: formValue.status,
      productType: selectedType,
    };

    this.productService.updateProduct(this.productCode, productData).subscribe({
      next: () => {
        this.showToastMessage('Producto actualizado correctamente.', 'success');
        setTimeout(() => {
          this.router.navigate(['/admin/products/list']);
        }, 1500);
      },
      error: (err: any) => {
        const backendError =
          typeof err.error === 'string'
            ? err.error
            : err?.error?.message || 'Error al actualizar el producto.';
        this.showToastMessage(backendError, 'error');
      },
    });
  }

  // === TOAST ===
  showToastMessage(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 3000);
  }

  goBack(): void {
    this.router.navigate(['/admin/products/list']);
  }
}
