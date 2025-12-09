-- ==========================================================
-- INDICES, DICCIONARIO Y PRUEBAS
-- ==========================================================
/*
    NOMBRES: 
            - VALERIA MUÑOZ GUERRERO
            - NICOLE BURBANO SOLARTE
            - JUAN CAMILO HENAO VILLEGAS
            - JUAN PABLO COLLAZOS SAMBONI
            - JESUS EDUARDO LASSO MUÑOZ
*/

-- =======================
-- INDICES
-- =======================

CREATE INDEX idx_product_type ON PRODUCT(proType);

CREATE INDEX idx_upper_proName ON PRODUCT(UPPER(proName));

CREATE INDEX idx_cart_user ON CART(userID);

-- =======================
-- DICCIONARIO DE DATOS
-- =======================

-- 1. TABLAS CREADAS POR EL USUARIO
SELECT table_name
FROM user_tables
ORDER BY table_name;

-- 2. COLUMNAS DE CADA TABLA
SELECT table_name,
       column_name,
       data_type,
       data_length,
       nullable,
       data_default
FROM user_tab_columns
ORDER BY table_name, column_id;

-- 3. RESTRICCIONES (PK, FK, UNIQUE, CHECK)
SELECT constraint_name,
       constraint_type,
       table_name,
       status
FROM user_constraints
ORDER BY table_name, constraint_type;

-- 3.1 COLUMNAS ASSOCIADAS A CADA RESTRICCIÓN
SELECT constraint_name,
       table_name,
       column_name,
       position
FROM user_cons_columns
ORDER BY table_name, constraint_name, position;

-- 4. ÍNDICES CREADOS
SELECT index_name,
       table_name,
       index_type,
       uniqueness,
       status
FROM user_indexes
ORDER BY table_name;

-- 4.1 COLUMNAS DE CADA ÍNDICE
SELECT index_name,
       table_name,
       column_name,
       column_position
FROM user_ind_columns
ORDER BY index_name, column_position;

-- 5. TRIGGERS DEFINIDOS EN EL ESQUEMA
SELECT trigger_name,
       table_name,
       status,
       trigger_type,
       triggering_event
FROM user_triggers
ORDER BY table_name, trigger_name;

-- 5.1 CÓDIGO DE LOS TRIGGERS (SI SE REQUIERE MOSTRAR)
SELECT name,
       type,
       line,
       text
FROM user_source
WHERE type = 'TRIGGER'
ORDER BY name, line;

-- 6. SECUENCIAS DEL USUARIO
SELECT sequence_name,
       last_number
FROM user_sequences
ORDER BY sequence_name;

-- 7. PAQUETES CREADOS
SELECT object_name AS package_name,
       status
FROM user_objects
WHERE object_type = 'PACKAGE'
ORDER BY object_name;

-- 7.1 CÓDIGO DE LOS PAQUETES (SI SE NECESITA EN EL INFORME)
SELECT name,
       type,
       line,
       text
FROM user_source
WHERE type IN ('PACKAGE', 'PACKAGE BODY')
ORDER BY name, type, line;

-- 8. VISTAS CREADAS POR EL USUARIO (si aplica)
SELECT view_name
FROM user_views
ORDER BY view_name;


-- =======================
-- BLOQUES DE PRUEBA
-- =======================

-- PRUEBA GESTION_PRODUCTO
SET VERIFY OFF
SET ECHO OFF
SET SERVEROUTPUT ON
DECLARE
    v_prod PRODUCT%ROWTYPE;
    v_lista GESTION_PRODUCTO.t_lista_productos;
BEGIN
    DBMS_OUTPUT.PUT_LINE('===== PRUEBA GESTION_PRODUCTO =====');

    -- 1. Crear producto
    GESTION_PRODUCTO.crear_producto(
        'Producto Test',
        NULL,
        150000,
        1,
        'Descripcion test',
        'MarcaTest',
        'A'
    );
    DBMS_OUTPUT.PUT_LINE(' - Producto creado');

    -- 2. Consultar producto recién creado
    SELECT * INTO v_prod
    FROM PRODUCT
    WHERE proName = 'Producto Test';

    DBMS_OUTPUT.PUT_LINE(' - Consultado: ' || v_prod.proName);

    -- 3. Modificar producto
    GESTION_PRODUCTO.modificar_producto(
        v_prod.proCode,
        'Producto Test Mod',
        NULL,
        160000,
        1,
        'Descripcion Modificada',
        'MarcaMod',
        'A'
    );
    DBMS_OUTPUT.PUT_LINE(' - Producto modificado');

    -- 4. Listar productos
    DBMS_OUTPUT.PUT_LINE('--- LISTANDO PRODUCTOS ---');
    GESTION_PRODUCTO.listar_productos;

    -- 5. Cargar productos activos en colección
    GESTION_PRODUCTO.cargar_productos_activos(v_lista);
    DBMS_OUTPUT.PUT_LINE(' - Productos activos cargados: ' || v_lista.COUNT);

    -- 6. Eliminar producto (borrado lógico)
    
    INSERT INTO INVENTORY (proCode, invStock, sellingPrice, invDate, invProv) 
    VALUES (v_prod.proCode, 15, 6700000, SYSDATE, 1);
    
    GESTION_PRODUCTO.eliminar_producto(v_prod.proCode);
    DBMS_OUTPUT.PUT_LINE(' - Producto eliminado (borrado lógico)');
END;



-- PRUEBA GESTION_INVENTARIO
-- PRUEBA GESTION_INVENTARIO
SET VERIFY OFF
SET ECHO OFF
SET SERVEROUTPUT ON
DECLARE
    v_inv INVENTORY%ROWTYPE;
    v_stock NUMBER;
    v_newInvCode NUMBER;
BEGIN
    DBMS_OUTPUT.PUT_LINE('===== PRUEBA GESTION_INVENTARIO =====');

    -- 1. Registrar lote (NO hay invCode porque es IDENTITY)
    GESTION_INVENTARIO.registrar_lote(
        1,         -- proCode
        20,        -- invStock
        120000,    -- sellingPrice
        SYSDATE,   -- invDate
        1          -- invProv
    );
    DBMS_OUTPUT.PUT_LINE(' - Lote registrado correctamente');

    -- 2. Obtener el último invCode generado
    SELECT MAX(invCode) INTO v_newInvCode FROM INVENTORY;
    DBMS_OUTPUT.PUT_LINE(' - Nuevo invCode generado: ' || v_newInvCode);

    -- 3. Consultar inventario
    v_inv := GESTION_INVENTARIO.consultar_inventario(v_newInvCode);
    DBMS_OUTPUT.PUT_LINE(' - Consultado lote: ' || v_inv.invCode);

    -- 4. Modificar inventario
    GESTION_INVENTARIO.modificar_inventario(
        v_newInvCode,
        1,          -- proCode
        15,         -- invStock
        110000,     -- sellingPrice
        SYSDATE,    -- invDate
        1           -- invProv
    );
    DBMS_OUTPUT.PUT_LINE(' - Lote modificado');

    -- 5. Verificar stock total del producto
    v_stock := GESTION_INVENTARIO.verificarStock(1);
    DBMS_OUTPUT.PUT_LINE(' - Stock total del producto 1: ' || v_stock);

    -- 6. Probar cursor parametrizado (listar lotes del producto)
    DBMS_OUTPUT.PUT_LINE('===== LISTA DE LOTES DEL PRODUCTO 1 =====');
    GESTION_INVENTARIO.listar_lotes_producto(1);

END;


-- PRUEBA GESTION_USUARIO
SET VERIFY OFF
SET ECHO OFF
SET SERVEROUTPUT ON

DECLARE
    v_name        USERS.userName%TYPE;
    v_email       USERS.userEmail%TYPE;
    v_password    USERS.userPassword%TYPE;
    v_phone       USERS.userPhone%TYPE;

    v_fn   CLIENT_DETAIL.firstName%TYPE;
    v_sn   CLIENT_DETAIL.secondName%TYPE;
    v_ln1  CLIENT_DETAIL.firstLastName%TYPE;
    v_ln2  CLIENT_DETAIL.secondLastName%TYPE;

    v_addr CLIENT_DETAIL.address%TYPE;
    v_desc CLIENT_DETAIL.descAddress%TYPE;

    v_city NUMBER;
    v_dep  NUMBER;

    v_userID NUMBER;
BEGIN
    DBMS_OUTPUT.PUT_LINE('===== PRUEBA GESTION_USUARIO =====');

    -- 1. Registrar usuario
    GESTION_USUARIO.REGISTRAR_USUARIO(
        p_userName      => 'usuarioTest',
        p_userPassword  => '1234',
        p_userEmail     => 'mailtest@mail.com',
        p_userPhone     => '3110002222',
        p_firstName     => 'Carlos',
        p_secondName    => 'Andres',
        p_firstLastName => 'Pérez',
        p_secondLastName=> 'López',
        p_address       => 'Calle Test 123',
        p_descAddress   => NULL,
        p_cityID        => 1,
        p_depID         => 1
    );

    DBMS_OUTPUT.PUT_LINE(' - Usuario registrado');

    SELECT userID INTO v_userID
    FROM USERS
    WHERE userName = 'usuarioTest';

    DBMS_OUTPUT.PUT_LINE(' - ID obtenido: ' || v_userID);


    -- 3. Modificar usuario (incluye contraseña ahora)
    GESTION_USUARIO.MODIFICAR_USUARIO(
        p_userID        => v_userID,
        p_userPhone     => '3208889999',
        p_userEmail     => 'correoNuevo@mail.com',
        p_userPassword  => '9876',
        p_firstName     => 'CarlosMod',
        p_secondName    => 'AndresMod',
        p_firstLastName => 'PérezMod',
        p_secondLastName=> 'LópezMod',
        p_address       => 'DireccionMod',
        p_descAddress   => 'DetalleMod',
        p_cityID        => 1,
        p_depID         => 1
    );

    DBMS_OUTPUT.PUT_LINE(' - Usuario modificado');


    -- 4. Consultar usuario (incluye contraseña)
    GESTION_USUARIO.CONSULTAR_USUARIO(
        p_userID        => v_userID,
        o_userName      => v_name,
        o_userEmail     => v_email,
        o_userPassword  => v_password,
        o_userPhone     => v_phone,
        o_firstName     => v_fn,
        o_secondName    => v_sn,
        o_firstLastName => v_ln1,
        o_secondLastName=> v_ln2,
        o_address       => v_addr,
        o_descAddress   => v_desc,
        o_cityID        => v_city,
        o_depID         => v_dep
    );

    -- 5. Mostrar todos los datos por consola
    DBMS_OUTPUT.PUT_LINE('===== DATOS CONSULTADOS =====');
    DBMS_OUTPUT.PUT_LINE('Usuario:            ' || v_name);
    DBMS_OUTPUT.PUT_LINE('Email:              ' || v_email);
    DBMS_OUTPUT.PUT_LINE('Contraseña:         ' || v_password);
    DBMS_OUTPUT.PUT_LINE('Teléfono:           ' || v_phone);
    DBMS_OUTPUT.PUT_LINE('Primer nombre:      ' || v_fn);
    DBMS_OUTPUT.PUT_LINE('Segundo nombre:     ' || v_sn);
    DBMS_OUTPUT.PUT_LINE('Primer apellido:    ' || v_ln1);
    DBMS_OUTPUT.PUT_LINE('Segundo apellido:   ' || v_ln2);
    DBMS_OUTPUT.PUT_LINE('Dirección:          ' || v_addr);
    DBMS_OUTPUT.PUT_LINE('Detalle dirección:  ' || NVL(v_desc, '(sin detalle)'));
    DBMS_OUTPUT.PUT_LINE('Ciudad (ID):        ' || v_city);
    DBMS_OUTPUT.PUT_LINE('Departamento (ID):  ' || v_dep);

END;


-- PRUEBA GESTION_CARRITO
SET VERIFY OFF
SET ECHO OFF
SET SERVEROUTPUT ON
DECLARE
    v_total NUMBER;
    v_cartID NUMBER;
BEGIN
    DBMS_OUTPUT.PUT_LINE('===== PRUEBA GESTION_CARRITO =====');

    -- Limpiar carrito antes de empezar
    GESTION_CARRITO.limpiar_carrito(1);

    -- 1. Agregar productos al carrito
    GESTION_CARRITO.agregar_al_carrito(1, 1, 2);
    GESTION_CARRITO.agregar_al_carrito(1, 2, 1);
    DBMS_OUTPUT.PUT_LINE(' - Productos agregados');

    -- Obtener un cartID para actualizar/eliminar
    SELECT cartID INTO v_cartID
    FROM CART
    WHERE userID = 1 AND ROWNUM = 1;

    -- 2. Actualizar cantidad
    GESTION_CARRITO.actualizar_cantidad(v_cartID, 5);
    DBMS_OUTPUT.PUT_LINE(' - Cantidad actualizada');

    -- 3. Verificar disponibilidad
    IF GESTION_CARRITO.verificar_disponibilidad_carrito(1) THEN
        DBMS_OUTPUT.PUT_LINE(' - Stock suficiente');
    ELSE
        DBMS_OUTPUT.PUT_LINE(' NO HAY - Stock insuficiente');
    END IF;

    -- 4. Consultar carrito
    GESTION_CARRITO.consultar_carrito(1);

    -- 5. Calcular total
    v_total := GESTION_CARRITO.calcular_total_carrito(1);
    DBMS_OUTPUT.PUT_LINE(' - Total carrito: ' || v_total);

    -- 6. Eliminar un producto del carrito
    GESTION_CARRITO.eliminar_del_carrito(v_cartID);
    DBMS_OUTPUT.PUT_LINE(' - Item eliminado');

    -- 7. Limpiar carrito
    GESTION_CARRITO.limpiar_carrito(1);
    DBMS_OUTPUT.PUT_LINE(' - Carrito limpiado');

END;


-- PRUEBA GESTION_COMPRAS
SET VERIFY OFF
SET ECHO OFF
SET SERVEROUTPUT ON
DECLARE
    v_ordID NUMBER;
BEGIN
    DBMS_OUTPUT.PUT_LINE('===== PRUEBA GESTION_COMPRAS =====');

    -- Primero llenar el carrito del usuario 1
    GESTION_CARRITO.limpiar_carrito(1);
    GESTION_CARRITO.agregar_al_carrito(1, 1, 2);

    -- 1. Procesar compra
    GESTION_COMPRAS.procesar_compra(1, 'EFECTIVO', v_ordID);
    DBMS_OUTPUT.PUT_LINE('- Compra procesada. Orden: ' || v_ordID);

    -- 2. Consultar detalle
    GESTION_COMPRAS.consultar_detalle_orden(v_ordID);

    -- 3. Consultar historial
    GESTION_COMPRAS.consultar_ordenes_usuario(1);

    -- 4. Cambiar estado
    GESTION_COMPRAS.cambiar_estado_orden(v_ordID, 'Delivered');
    DBMS_OUTPUT.PUT_LINE('- Estado cambiado a Delivered');

    -- 5. Cancelar (debe fallar porque está Delivered)
    BEGIN
        GESTION_COMPRAS.cancelar_orden(v_ordID, 'Prueba cancelación');
    EXCEPTION
        WHEN OTHERS THEN
            DBMS_OUTPUT.PUT_LINE('- Cancelar falló (correcto): ' || SQLERRM);
    END;
END;

