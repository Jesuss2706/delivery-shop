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

  constructor(private fb: FormBuilder, private productService: ProductService) {}

  ngOnInit(): void {
    this.productForm = this.fb.group({
      proName: ['', [Validators.required, Validators.minLength(2)]],
      proImg: ['', [Validators.required]],
      proPrice: ['', [Validators.required, Validators.min(1)]],
      proMark: ['', [Validators.required, Validators.minLength(2)]],
      descript: ['', [Validators.required, Validators.minLength(5)]],
      typeCode: ['', Validators.required],
      status: ['A', Validators.required]
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

  
  onlyNumbers(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
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
    const selectedType = this.productTypes.find((t) => t.typeCode === Number(productData.typeCode));

    if (!selectedType) {
      this.errorMessage = 'Tipo de producto inválido.';
      return;
    }

    const newProduct: Product = {
      proCode: Number(productData.proCode),
      proName: productData.proName,
      descript: productData.descript,
      proImg: productData.proImg,
      proMark: productData.proMark,
      proPrice: productData.proPrice,
      productType: selectedType,
      status: productData.status
    };

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

  showToastMessage(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 3000);
  }
}
