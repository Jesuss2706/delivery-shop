import { Routes } from '@angular/router';
import { Principal } from './pages/ecommerce/principal/principal';
import { Login } from './pages/auth/login/login';
import { Register } from './pages/auth/register/register';
import { StoreLayoutComponent } from './pages/ecommerce/store-layout/store-layout';
import { ProductDetailComponent } from './pages/ecommerce/store/components/product-detail/product-detail';
import { StoreComponent } from './pages/ecommerce/store/store';
import { AdminLayoutComponent } from './pages/admin/layout/layout';
import { Dashboard } from './pages/admin/dashboard/dashboard';
import { AuthGuard } from './guards/auth.guard';
import { CartComponent } from './pages/ecommerce/cart/cart';
import { CheckoutComponent } from './pages/ecommerce/checkout/checkout';
import { OrderComponent } from './pages/ecommerce/order/order';
import { AboutUsComponent } from './pages/ecommerce/about-us/about-us';
import { UserUpdate } from './pages/ecommerce/user-update/user-update';

export const routes: Routes = [
  { path: '', component: Principal },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  {
    path: 'store',
    component: StoreLayoutComponent,
    children: [
      { path: '', component: StoreComponent },
      { path: 'product/:id', component: ProductDetailComponent },
      { path: 'cart', component: CartComponent },
      { path: 'checkout', component: CheckoutComponent },
      { path: 'order', component: OrderComponent },
      { path: 'order/:orderId', component: OrderComponent },
      { path: 'about-us', component: AboutUsComponent},
      { path: 'profile', component: UserUpdate }
    ],
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard], 
    data: { roles: ['ADMIN'] }, 
    children: [
      { path: 'dashboard', component: Dashboard },
      {
        path: 'products/create',
        loadComponent: () =>
          import('./pages/admin/products/create-product/create-product').then(
            (m) => m.CreateProductComponent
          ),
      },
      {
        path: 'products/list',
        loadComponent: () =>
          import('./pages/admin/products/product-list/product-list').then(
            (m) => m.ProductListComponent
          ),
      },
      {
        path: 'products/edit/:id',
        loadComponent: () =>
          import('./pages/admin/products/edit-product/edit-product').then(
            (m) => m.EditProductComponent
          ),
      },
      {
        path: 'inventory/list',
        loadComponent: () =>
          import('./pages/admin/inventory/inventory-list/inventory-list').then(
            (m) => m.InventoryListComponent
          ),
      },
      {
        path: 'inventory/edit/:id',
        loadComponent: () =>
          import('./pages/admin/inventory/edit-inventory/edit-inventory').then(
            (m) => m.EditInventoryComponent
          ),
      },
      {
        path: 'inventory/create',
        loadComponent: () =>
          import('./pages/admin/inventory/register-inventory/register-inventory').then(
            (m) => m.RegisterInventoryComponent
          ),
      },
      { 
        path: 'inventory/movements',
        loadComponent: () =>
          import('./pages/admin/inventory/inv-movement/inv-movement').then(
            (m) => m.InvMovementComponent
          ),
      },
      {
        path: 'orders/list',
        loadComponent: () =>
          import('./pages/admin/orders/orders-list/orders-list').then(
            (m) => m.OrdersListComponent
          ),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: '' }
];