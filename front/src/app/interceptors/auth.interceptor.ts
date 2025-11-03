import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // URLs que NO requieren token
  const noAuthUrls = [
    '/auth/',
    '/register',
    '/public/',
    '/city/',
    '/department/'
  ];

  // URLs que SÍ requieren token
  const protectedUrls = [
    '/cart',
    '/users/', // excepto /users/username/ que manejamos aparte
    '/admin/',
    '/orders/'
  ];

  const isNoAuthRequest = noAuthUrls.some(url => req.url.includes(url));
  const isUserRequest = req.url.includes('/users/username/');
  
  // Es una petición protegida?
  const isProtectedRequest = protectedUrls.some(url => req.url.includes(url)) && 
                            !isUserRequest; // excepto la búsqueda por username

  let authReq = req;
  const token = authService.getToken();

  console.log('🔄 Interceptor ejecutado para:', req.url);
  console.log('   - Token disponible:', !!token);
  console.log('   - Es petición sin auth?:', isNoAuthRequest);
  console.log('   - Es petición de usuario?:', isUserRequest);
  console.log('   - Es petición protegida?:', isProtectedRequest);

  // Agregar token si hay token Y es una petición protegida
  if (token && isProtectedRequest) {
    console.log('✅ Agregando token a la petición protegida');
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  } else if (token && !isNoAuthRequest && !isUserRequest) {
    // Para cualquier otra petición que no sea explícitamente sin auth
    console.log('⚠️ Agregando token a petición no categorizada');
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  } else {
    console.log('🚫 No se agrega token');
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('❌ Error en interceptor:');
      console.error('   - Status:', error.status);
      console.error('   - URL:', error.url);
      console.error('   - Mensaje:', error.message);

      // Manejar error de CORS/red
      if (error.status === 0) {
        console.error('🎯 Error de CORS o conexión - Verifica:');
        console.error('   1. El servidor está corriendo?');
        console.error('   2. La URL es correcta?');
        console.error('   3. Configuración CORS en backend?');
      }

      // Manejar no autorizado
      if (error.status === 401 && !isNoAuthRequest && !isUserRequest) {
        console.error('🔐 Token inválido o expirado - Cerrando sesión');
        authService.logout();
        router.navigate(['/auth/login']);
      }

      return throwError(() => error);
    })
  );
};