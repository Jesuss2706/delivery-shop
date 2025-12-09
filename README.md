# Delivery Shop

Delivery Shop es una aplicación web de compras que permite a los usuarios explorar productos, agregarlos al carrito y realizar pedidos en línea de forma rápida y sencilla.  
El proyecto está desarrollado con Spring Boot para el backend y Angular para el frontend.

---

## Características principales

- Autenticación de usuarios (login / registro)
- Gestión de productos y categorías
- Carrito de compras dinámico
- Proceso de compra con resumen de pedido
- Gestión de pedidos y entregas
- Panel administrativo para gestión de usuarios y productos
- Arquitectura cliente-servidor (Angular + Spring Boot)

---

## Estructura del proyecto

```
delivery-shop/
├── backend/                # Proyecto Spring Boot (API REST)
│   ├── src/main/java/...   # Código fuente Java
│   ├── src/main/resources/ # Configuración (application.properties)
│   └── pom.xml             # Dependencias Maven
│
└── frontend/               # Proyecto Angular (Interfaz de usuario)
    ├── src/                # Componentes, servicios y vistas
    ├── angular.json        # Configuración del proyecto
    └── package.json        # Dependencias del frontend
```

---

## Requisitos previos

Asegúrate de tener instalado lo siguiente:

- Java 17+
- Maven 3.8+
- Node.js 18+ y npm
- Angular CLI (`npm install -g @angular/cli`)
- Un gestor de base de datos (Oracle)

---

## Instalación y ejecución

### 1. Clonar el repositorio
```
git clone https://github.com/Jesuss2706/delivery-shop.git
cd delivery-shop
```

### 2. Configurar el Backend (Spring Boot)

1. Entra en la carpeta `backend/`
2. Edita el archivo `src/main/resources/application.properties` con tus credenciales de base de datos:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/delivery_shop
   spring.datasource.username=tu_usuario
   spring.datasource.password=tu_contraseña
   ```
3. Ejecuta el proyecto:
   ```bash
   mvn spring-boot:run
   ```
   El backend estará disponible en:  
   http://localhost:8080

---

### 3. Configurar el Frontend (Angular)

1. Entra en la carpeta `frontend/`
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Ejecuta la aplicación Angular:
   ```bash
   ng serve
   ```
   El frontend estará disponible en:  
   http://localhost:4200

---

## Comunicación entre frontend y backend

El frontend se conecta al backend mediante las API REST expuestas por Spring Boot.  
En el código Angular, asegúrate de tener la URL correcta configurada en el archivo de entorno (`src/environments/environment.ts`):

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/techPads/store/v1'
};
```

---

## Autores

- Juan Camilo Henao Villegas  
- Jesus Eduardo Muñoz Lasso  
- Nicole Burbano Solarte  
- Valeria Muñoz Guerrero  
- Juan Pablo Collazos Samboni  
