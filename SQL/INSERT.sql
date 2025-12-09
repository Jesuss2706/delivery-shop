-- ==========================================================
-- INSERTS DE DATOS
-- ==========================================================
/*
    NOMBRES: 
            - VALERIA MUÑOZ GUERRERO
            - NICOLE BURBANO SOLARTE
            - JUAN CAMILO HENAO
            - JUAN PABLO COLLAZOS SAMBONI
            - JESUS EDUARDO LASSO MUÑOZ
*/

-- ===============================
-- 1. PRODUCTTYPE
-- ===============================
INSERT INTO PRODUCTTYPE (typeName) VALUES ('Smartphones');
INSERT INTO PRODUCTTYPE (typeName) VALUES ('Laptops');
INSERT INTO PRODUCTTYPE (typeName) VALUES ('Accesorios');
INSERT INTO PRODUCTTYPE (typeName) VALUES ('Componentes');
INSERT INTO PRODUCTTYPE (typeName) VALUES ('Monitores');
INSERT INTO PRODUCTTYPE (typeName) VALUES ('Audio');
INSERT INTO PRODUCTTYPE (typeName) VALUES ('Gaming');
INSERT INTO PRODUCTTYPE (typeName) VALUES ('Redes');
INSERT INTO PRODUCTTYPE (typeName) VALUES ('Almacenamiento');
INSERT INTO PRODUCTTYPE (typeName) VALUES ('Tarjeta Gráfica');
INSERT INTO PRODUCTTYPE (typeName) VALUES ('Otros');


-- ===============================
-- 2. PRODUCT
-- ===============================
INSERT INTO PRODUCT (proName, proImg, proPrice, proType, descript, proMark) 
VALUES ('iPhone 15 Pro', 'https://http2.mlstatic.com/D_Q_NP_940859-MLA93082493742_092025-O.webp', 6500000, 1, 'Smartphone Apple con chip A17 Pro', 'Apple');

INSERT INTO PRODUCT (proName, proImg, proPrice, proType, descript, proMark) 
VALUES ('Samsung Galaxy S24 Ultra', 'https://www.clevercel.co/cdn/shop/files/Portadas_SamsungS24Yltra.webp?v=1757092941', 5800000, 1, 'Pantalla AMOLED 6.8", 200MP cámara', 'Samsung');

INSERT INTO PRODUCT (proName, proImg, proPrice, proType, descript, proMark) 
VALUES ('Laptop ASUS ROG Strix G16', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHtY0y_MZQL-5A0lYJ4f3zfwwEGgyj3fkSLA&s', 7200000, 2, 'Intel i9, RTX 4070, 16GB RAM', 'ASUS');

INSERT INTO PRODUCT (proName, proImg, proPrice, proType, descript, proMark) 
VALUES ('HP Pavilion 15', 'https://i5.walmartimages.com/seo/HP-Pavilion-15-6-FHD-Gaming-Laptop-Intel-Core-i5-10300H-8GB-RAM-NVIDIA-GeForce-GTX-1650-4GB-250GB-SSD-Windows-10-Home-Black-15-dk1056wm_8b269d16-6343-40c0-832f-e4d394ad8b75.9a1d5beb1ed0c4b7815d8657536428f9.jpeg', 3900000, 2, 'AMD Ryzen 7, 16GB RAM, SSD 512GB', 'HP');

INSERT INTO PRODUCT (proName, proImg, proPrice, proType, descript, proMark) 
VALUES ('Mouse Logitech G502 Hero', 'https://www.alkosto.com/medias/097855141996-001-750Wx750H?context=bWFzdGVyfGltYWdlc3w2MjMxN3xpbWFnZS9qcGVnfGFXMWhaMlZ6TDJnd1l5OW9ZMlV2T1RBMk5qQXdNVFUyTXpZM09DNXFjR2N8NDY3ZTBkNWMxYmFiNzYxMTliNWFmN2Y4Y2U4MGYwZjgzMmU2NjIxZTg4ODg4NzcwNDdkZGEyNmE4YjA5MjE1NQ', 250000, 3, 'Mouse gamer programable 11 botones', 'Logitech');

INSERT INTO PRODUCT (proName, proImg, proPrice, proType, descript, proMark) 
VALUES ('Teclado Mecánico Redragon Kumara', 'https://cdnx.jumpseller.com/tienda-gamer-medellin/image/15973402/71sFaDtowqL._AC_SL1500_.jpg?1679019012', 220000, 3, 'Teclado mecánico RGB switches blue', 'Redragon');

INSERT INTO PRODUCT (proName, proImg, proPrice, proType, descript, proMark) 
VALUES ('Disco SSD Kingston 1TB NVMe', 'https://www.avantechsystem.com/wp-content/uploads/2024/09/ktc-product-ssd-snv2s-1000g-3-zm-lg.jpg', 310000, 9, 'Unidad de estado sólido NVMe PCIe 4.0', 'Kingston');

INSERT INTO PRODUCT (proName, proImg, proPrice, proType, descript, proMark) 
VALUES ('Monitor LG Ultragear 27"', 'https://http2.mlstatic.com/D_NQ_NP_928453-MLA95660807764_102025-O.webp', 1250000, 5, '144Hz, 1ms, QHD IPS', 'LG');

INSERT INTO PRODUCT (proName, proImg, proPrice, proType, descript, proMark) 
VALUES ('Audífonos Sony WH-1000XM5', 'https://http2.mlstatic.com/D_NQ_NP_706804-MLA96088010499_102025-O.webp', 1890000, 6, 'Cancelación activa de ruido', 'Sony');

INSERT INTO PRODUCT (proName, proImg, proPrice, proType, descript, proMark) 
VALUES ('Router TP-Link Archer AX3000', 'https://static.wixstatic.com/media/92289e_3deffad6c6854ba691559618c511e887~mv2.png/v1/fill/w_504,h_504,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/92289e_3deffad6c6854ba691559618c511e887~mv2.png', 430000, 8, 'Wi-Fi 6, Dual Band, Alta velocidad', 'TP-Link');

-- ===============================
-- 3. PROVIDER
-- ===============================
INSERT INTO PROVIDER (provEmail, provName, provPhone) VALUES ('ventas@apple.com', 'Apple Distribution', '3155550001');
INSERT INTO PROVIDER (provEmail, provName, provPhone) VALUES ('distribucion@samsung.com', 'Samsung Colombia', '3205550002');
INSERT INTO PROVIDER (provEmail, provName, provPhone) VALUES ('ventas@asus.com', 'ASUS LATAM', '3105550003');
INSERT INTO PROVIDER (provEmail, provName, provPhone) VALUES ('distribuidor@hp.com', 'HP Official Partner', '3005550004');
INSERT INTO PROVIDER (provEmail, provName, provPhone) VALUES ('soporte@logitech.com', 'Logitech Tech', '3115550005');
INSERT INTO PROVIDER (provEmail, provName, provPhone) VALUES ('ventas@redragon.com', 'Redragon Colombia', '3125550006');
INSERT INTO PROVIDER (provEmail, provName, provPhone) VALUES ('ventas@kingston.com', 'Kingston Distributor', '3135550007');
INSERT INTO PROVIDER (provEmail, provName, provPhone) VALUES ('ventas@lg.com', 'LG Electronics', '3145550008');
INSERT INTO PROVIDER (provEmail, provName, provPhone) VALUES ('ventas@sony.com', 'Sony Audio LATAM', '3165550009');
INSERT INTO PROVIDER (provEmail, provName, provPhone) VALUES ('distribucion@tplink.com', 'TP-Link Distribuidor', '3175550010');

-- ===============================
-- 4. INVENTORY
-- ===============================
INSERT INTO INVENTORY (proCode, invStock, sellingPrice, invDate, invProv) 
VALUES (1, 15, 6700000, SYSDATE, 1);

INSERT INTO INVENTORY (proCode, invStock, sellingPrice, invDate, invProv) 
VALUES (2, 20, 5900000, SYSDATE, 2);

INSERT INTO INVENTORY (proCode, invStock, sellingPrice, invDate, invProv) 
VALUES (3, 10, 7500000, SYSDATE, 3);

INSERT INTO INVENTORY (proCode, invStock, sellingPrice, invDate, invProv) 
VALUES (4, 12, 4000000, SYSDATE, 4);

INSERT INTO INVENTORY (proCode, invStock, sellingPrice, invDate, invProv) 
VALUES (5, 50, 270000, SYSDATE, 5);

INSERT INTO INVENTORY (proCode, invStock, sellingPrice, invDate, invProv) 
VALUES (6, 40, 230000, SYSDATE, 6);

INSERT INTO INVENTORY (proCode, invStock, sellingPrice, invDate, invProv) 
VALUES (7, 25, 330000, SYSDATE, 7);

INSERT INTO INVENTORY (proCode, invStock, sellingPrice, invDate, invProv) 
VALUES (8, 18, 1300000, SYSDATE, 8);

INSERT INTO INVENTORY (proCode, invStock, sellingPrice, invDate, invProv) 
VALUES (9, 15, 1950000, SYSDATE, 9);

INSERT INTO INVENTORY (proCode, invStock, sellingPrice, invDate, invProv) 
VALUES (10, 30, 450000, SYSDATE, 10);


-- ===============================
-- 5. DEPARTMENTS
-- ===============================
INSERT INTO DEPARTMENTS (depName) VALUES ('Cundinamarca');
INSERT INTO DEPARTMENTS (depName) VALUES ('Antioquia');
INSERT INTO DEPARTMENTS (depName) VALUES ('Valle del Cauca');
INSERT INTO DEPARTMENTS (depName) VALUES ('Atlántico');
INSERT INTO DEPARTMENTS (depName) VALUES ('Risaralda');
INSERT INTO DEPARTMENTS (depName) VALUES ('Santander');
INSERT INTO DEPARTMENTS (depName) VALUES ('Caldas');
INSERT INTO DEPARTMENTS (depName) VALUES ('Huila');
INSERT INTO DEPARTMENTS (depName) VALUES ('Boyacá');
INSERT INTO DEPARTMENTS (depName) VALUES ('Bogotá D.C.');
INSERT INTO DEPARTMENTS (depName) VALUES ('Cauca');

-- ===============================
-- 6. CITIES
-- ===============================
-- Cundinamarca (depID = 1)
INSERT INTO CITIES (cityName, depID) VALUES ('Soacha', 1);
INSERT INTO CITIES (cityName, depID) VALUES ('Zipaquirá', 1);
INSERT INTO CITIES (cityName, depID) VALUES ('Chía', 1);

-- Antioquia (depID = 2)
INSERT INTO CITIES (cityName, depID) VALUES ('Medellín', 2);
INSERT INTO CITIES (cityName, depID) VALUES ('Bello', 2);
INSERT INTO CITIES (cityName, depID) VALUES ('Envigado', 2);

-- Valle del Cauca (depID = 3)
INSERT INTO CITIES (cityName, depID) VALUES ('Cali', 3);
INSERT INTO CITIES (cityName, depID) VALUES ('Palmira', 3);
INSERT INTO CITIES (cityName, depID) VALUES ('Buenaventura', 3);

-- Atlántico (depID = 4)
INSERT INTO CITIES (cityName, depID) VALUES ('Barranquilla', 4);
INSERT INTO CITIES (cityName, depID) VALUES ('Soledad', 4);
INSERT INTO CITIES (cityName, depID) VALUES ('Malambo', 4);

-- Risaralda (depID = 5)
INSERT INTO CITIES (cityName, depID) VALUES ('Pereira', 5);
INSERT INTO CITIES (cityName, depID) VALUES ('Dosquebradas', 5);
INSERT INTO CITIES (cityName, depID) VALUES ('Santa Rosa de Cabal', 5);

-- Santander (depID = 6)
INSERT INTO CITIES (cityName, depID) VALUES ('Bucaramanga', 6);
INSERT INTO CITIES (cityName, depID) VALUES ('Floridablanca', 6);
INSERT INTO CITIES (cityName, depID) VALUES ('Girón', 6);

-- Caldas (depID = 7)
INSERT INTO CITIES (cityName, depID) VALUES ('Manizales', 7);
INSERT INTO CITIES (cityName, depID) VALUES ('Villamaría', 7);
INSERT INTO CITIES (cityName, depID) VALUES ('Chinchiná', 7);

-- Huila (depID = 8)
INSERT INTO CITIES (cityName, depID) VALUES ('Neiva', 8);
INSERT INTO CITIES (cityName, depID) VALUES ('Pitalito', 8);
INSERT INTO CITIES (cityName, depID) VALUES ('Garzón', 8);

-- Boyacá (depID = 9)
INSERT INTO CITIES (cityName, depID) VALUES ('Tunja', 9);
INSERT INTO CITIES (cityName, depID) VALUES ('Duitama', 9);
INSERT INTO CITIES (cityName, depID) VALUES ('Sogamoso', 9);

-- Bogotá D.C. (depID = 10)
INSERT INTO CITIES (cityName, depID) VALUES ('Bogotá', 10);

-- Cauca (depID = 11)
INSERT INTO CITIES (cityName, depID) VALUES ('Popayán', 11);
INSERT INTO CITIES (cityName, depID) VALUES ('Santander de Quilichao', 11);
INSERT INTO CITIES (cityName, depID) VALUES ('Puerto Tejada', 11);


-- ===============================
-- 7. USERS
-- ===============================
INSERT INTO USERS (userName, userPassword, userEmail, userRole, userPhone) VALUES ('admin', 'admin123', 'admin@techstore.com', 'ADMIN', '3001112233');
INSERT INTO USERS (userName, userPassword, userEmail, userRole, userPhone) VALUES ('juanperez', '1234', 'juanperez@mail.com', 'CLIENT', '3012223344');
INSERT INTO USERS (userName, userPassword, userEmail, userRole, userPhone) VALUES ('mariagomez', '1234', 'mariagomez@mail.com', 'CLIENT', '3023334455');
INSERT INTO USERS (userName, userPassword, userEmail, userRole, userPhone) VALUES ('carlossoto', '1234', 'carlossoto@mail.com', 'CLIENT', '3034445566');
INSERT INTO USERS (userName, userPassword, userEmail, userRole, userPhone) VALUES ('lauradiaz', '1234', 'lauradiaz@mail.com', 'CLIENT', '3045556677');
INSERT INTO USERS (userName, userPassword, userEmail, userRole, userPhone) VALUES ('andresrojas', '1234', 'andresrojas@mail.com', 'CLIENT', '3056667788');
INSERT INTO USERS (userName, userPassword, userEmail, userRole, userPhone) VALUES ('camilaramos', '1234', 'camilaramos@mail.com', 'CLIENT', '3067778899');
INSERT INTO USERS (userName, userPassword, userEmail, userRole, userPhone) VALUES ('pedromartinez', '1234', 'pedromartinez@mail.com', 'CLIENT', '3078889900');
INSERT INTO USERS (userName, userPassword, userEmail, userRole, userPhone) VALUES ('sofiacortes', '1234', 'sofiacortes@mail.com', 'CLIENT', '3089990011');
INSERT INTO USERS (userName, userPassword, userEmail, userRole, userPhone) VALUES ('javierlopez', '1234', 'javierlopez@mail.com', 'CLIENT', '3090001122');

-- ===============================
-- 8. CLIENT_DETAIL
-- ===============================
INSERT INTO CLIENT_DETAIL VALUES (2, 'Juan', 'Carlos', 'Pérez', 'Rojas', 'Cra 45 #23-10', 'Apto 301', 1, 1);
INSERT INTO CLIENT_DETAIL VALUES (3, 'María', 'Elena', 'Gómez', 'López', 'Cl 20 #10-15', NULL, 2, 2);
INSERT INTO CLIENT_DETAIL VALUES (4, 'Carlos', NULL, 'Soto', 'Ramírez', 'Av 5 #50-20', 'Casa 2', 3, 3);
INSERT INTO CLIENT_DETAIL VALUES (5, 'Laura', 'Isabel', 'Díaz', 'Vargas', 'Cl 8 #22-40', NULL, 4, 4);
INSERT INTO CLIENT_DETAIL VALUES (6, 'Andrés', 'Felipe', 'Rojas', 'Martínez', 'Cra 12 #30-18', NULL, 5, 5);
INSERT INTO CLIENT_DETAIL VALUES (7, 'Camila', 'Andrea', 'Ramos', 'Suárez', 'Cl 100 #15-20', 'Apto 502', 6, 6);
INSERT INTO CLIENT_DETAIL VALUES (8, 'Pedro', 'José', 'Martínez', 'Moreno', 'Av 3 #45-18', NULL, 7, 7);
INSERT INTO CLIENT_DETAIL VALUES (9, 'Sofía', 'Alejandra', 'Cortés', 'Vega', 'Cl 55 #22-11', NULL, 8, 8);
INSERT INTO CLIENT_DETAIL VALUES (10, 'Javier', 'Eduardo', 'López', 'Torres', 'Cl 60 #5-30', NULL, 9, 9);
INSERT INTO CLIENT_DETAIL VALUES (1, 'Administrador', NULL, 'General', NULL, 'Sede Principal', NULL, 1, 1);

-- ===============================
-- 9. ORDER
-- ===============================
INSERT INTO "ORDER" (ordState, ordDate, userID) VALUES ('Pending', SYSDATE, 2);
INSERT INTO "ORDER" (ordState, ordDate, userID) VALUES ('Processing', SYSDATE, 3);
INSERT INTO "ORDER" (ordState, ordDate, userID) VALUES ('Shipped', SYSDATE, 4);
INSERT INTO "ORDER" (ordState, ordDate, userID) VALUES ('Delivered', SYSDATE, 5);
INSERT INTO "ORDER" (ordState, ordDate, userID) VALUES ('Cancelled', SYSDATE, 6);
INSERT INTO "ORDER" (ordState, ordDate, userID) VALUES ('Pending', SYSDATE, 7);
INSERT INTO "ORDER" (ordState, ordDate, userID) VALUES ('Processing', SYSDATE, 8);
INSERT INTO "ORDER" (ordState, ordDate, userID) VALUES ('Delivered', SYSDATE, 9);
INSERT INTO "ORDER" (ordState, ordDate, userID) VALUES ('Pending', SYSDATE, 10);
INSERT INTO "ORDER" (ordState, ordDate, userID) VALUES ('Shipped', SYSDATE, 3);

-- ===============================
-- 10. ORDER_DETAIL
-- ===============================
INSERT INTO ORDER_DETAIL VALUES (1, 1, 1, 6500000);
INSERT INTO ORDER_DETAIL VALUES (1, 5, 2, 250000);
INSERT INTO ORDER_DETAIL VALUES (2, 2, 1, 5800000);
INSERT INTO ORDER_DETAIL VALUES (3, 3, 1, 7200000);
INSERT INTO ORDER_DETAIL VALUES (4, 4, 1, 3900000);
INSERT INTO ORDER_DETAIL VALUES (5, 7, 2, 310000);
INSERT INTO ORDER_DETAIL VALUES (6, 8, 1, 1250000);
INSERT INTO ORDER_DETAIL VALUES (7, 9, 1, 1890000);
INSERT INTO ORDER_DETAIL VALUES (8, 10, 1, 430000);
INSERT INTO ORDER_DETAIL VALUES (9, 6, 3, 220000);

-- ===============================
-- 11. BILL
-- ===============================
INSERT INTO BILL (invCode, ordID, paymentType, billDate, totalBill) VALUES (1, 1, 'TARJETA', SYSDATE, 7000000);
INSERT INTO BILL (invCode, ordID, paymentType, billDate, totalBill) VALUES (2, 2, 'TRANSFERENCIA', SYSDATE, 5800000);
INSERT INTO BILL (invCode, ordID, paymentType, billDate, totalBill) VALUES (3, 3, 'EFECTIVO', SYSDATE, 7200000);
INSERT INTO BILL (invCode, ordID, paymentType, billDate, totalBill) VALUES (4, 4, 'TARJETA', SYSDATE, 3900000);
INSERT INTO BILL (invCode, ordID, paymentType, billDate, totalBill) VALUES (5, 5, 'TRANSFERENCIA', SYSDATE, 620000);
INSERT INTO BILL (invCode, ordID, paymentType, billDate, totalBill) VALUES (6, 6, 'TARJETA', SYSDATE, 1250000);
INSERT INTO BILL (invCode, ordID, paymentType, billDate, totalBill) VALUES (7, 7, 'EFECTIVO', SYSDATE, 1890000);
INSERT INTO BILL (invCode, ordID, paymentType, billDate, totalBill) VALUES (8, 8, 'TRANSFERENCIA', SYSDATE, 430000);
INSERT INTO BILL (invCode, ordID, paymentType, billDate, totalBill) VALUES (9, 9, 'TARJETA', SYSDATE, 660000);
INSERT INTO BILL (invCode, ordID, paymentType, billDate, totalBill) VALUES (10, 10, 'EFECTIVO', SYSDATE, 5900000);

-- ===============================
-- 11. CART
-- ===============================

INSERT INTO CART (userID, proCode, quantity)
VALUES (2, 1, 2);

INSERT INTO CART (userID, proCode, quantity)
VALUES (3, 5, 1);

INSERT INTO CART (userID, proCode, quantity)
VALUES (4, 3, 1);

INSERT INTO CART (userID, proCode, quantity)
VALUES (5, 9, 2);

INSERT INTO CART (userID, proCode, quantity)
VALUES (6, 7, 1);
