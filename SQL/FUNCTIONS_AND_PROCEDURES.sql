-- ==========================================================
-- PAQUETES - FUNCIONES Y PROCEDIMIENTOS
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
-- DROPS
-- =======================

DROP PACKAGE GESTION_PRODUCTO;
DROP PACKAGE GESTION_INVENTARIO;
DROP PACKAGE GESTION_USUARIO;
DROP PACKAGE GESTION_CARRITO;
DROP PACKAGE GESTION_COMPRAS;

DROP PACKAGE BODY GESTION_PRODUCTO;
DROP PACKAGE BODY GESTION_INVENTARIO;
DROP PACKAGE BODY GESTION_USUARIO;
DROP PACKAGE BODY GESTION_CARRITO;
DROP PACKAGE BODY GESTION_COMPRAS;



-- =======================
-- PAQUETE DE PRODUCTOS
-- =======================
-- PAQUETE 


CREATE OR REPLACE PACKAGE GESTION_PRODUCTO AS

    -- Crear un nuevo producto
    PROCEDURE crear_producto(
        v_proName   PRODUCT.proName%TYPE,
        v_proImg    PRODUCT.proImg%TYPE,
        v_proPrice  PRODUCT.proPrice%TYPE,
        v_proType   PRODUCT.proType%TYPE,
        v_descript  PRODUCT.descript%TYPE,
        v_proMark   PRODUCT.proMark%TYPE,
        v_status    PRODUCT.proStatus%TYPE DEFAULT 'A'
    );

    -- Modificar un producto existente
    PROCEDURE modificar_producto(
        v_proCode   PRODUCT.proCode%TYPE,
        v_proName   PRODUCT.proName%TYPE,
        v_proImg    PRODUCT.proImg%TYPE,
        v_proPrice  PRODUCT.proPrice%TYPE,
        v_proType   PRODUCT.proType%TYPE,
        v_descript  PRODUCT.descript%TYPE,
        v_proMark   PRODUCT.proMark%TYPE,
        v_status    PRODUCT.proStatus%TYPE
    );

    -- Eliminar un producto y su inventario asociado
    PROCEDURE eliminar_producto(v_proCode PRODUCT.proCode%TYPE);

    -- Consultar un producto
    FUNCTION consultar_producto(v_proCode PRODUCT.proCode%TYPE)
    RETURN PRODUCT%ROWTYPE;

    -- Listar todos los productos
    PROCEDURE listar_productos;
    
    -- Colección de productos activos
    TYPE t_lista_productos IS TABLE OF PRODUCT%ROWTYPE;

    -- Cargar productos activos en una colección
    PROCEDURE cargar_productos_activos(
        p_lista OUT t_lista_productos
    );

END GESTION_PRODUCTO;

-- CUERPO

CREATE OR REPLACE PACKAGE BODY GESTION_PRODUCTO AS

    -- Crear un nuevo producto
    PROCEDURE crear_producto(
        v_proName   PRODUCT.proName%TYPE,
        v_proImg    PRODUCT.proImg%TYPE,
        v_proPrice  PRODUCT.proPrice%TYPE,
        v_proType   PRODUCT.proType%TYPE,
        v_descript  PRODUCT.descript%TYPE,
        v_proMark   PRODUCT.proMark%TYPE,
        v_status    PRODUCT.proStatus%TYPE DEFAULT 'A'
    ) IS
    BEGIN
        INSERT INTO PRODUCT (proName, proImg, proPrice, proType, descript, proMark, proStatus)
        VALUES (v_proName, v_proImg, v_proPrice, v_proType, v_descript, v_proMark, v_status);
    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            RAISE_APPLICATION_ERROR(-20101, 'El producto ya existe.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20102, 'Error al crear el producto: ' || SQLERRM);
    END crear_producto;

    -- Modificar un producto existente
    PROCEDURE modificar_producto(
        v_proCode   PRODUCT.proCode%TYPE,
        v_proName   PRODUCT.proName%TYPE,
        v_proImg    PRODUCT.proImg%TYPE,
        v_proPrice  PRODUCT.proPrice%TYPE,
        v_proType   PRODUCT.proType%TYPE,
        v_descript  PRODUCT.descript%TYPE,
        v_proMark   PRODUCT.proMark%TYPE,
        v_status    PRODUCT.proStatus%TYPE
    ) IS
        v_count NUMBER;
    BEGIN
        SELECT COUNT(*) INTO v_count FROM PRODUCT WHERE proCode = v_proCode;

        IF v_count = 0 THEN
            RAISE_APPLICATION_ERROR(-20103, 'No existe un producto con el código indicado.');
        END IF;

        UPDATE PRODUCT
        SET proName   = v_proName,
            proImg    = v_proImg,
            proPrice  = v_proPrice,
            proType   = v_proType,
            descript  = v_descript,
            proMark   = v_proMark,
            proStatus = v_status
        WHERE proCode = v_proCode;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20104, 'Error al modificar el producto: ' || SQLERRM);
    END modificar_producto;

    -- Eliminar un producto (borrado lógico) y su inventario asociado
    PROCEDURE eliminar_producto(v_proCode PRODUCT.proCode%TYPE) IS
        v_count NUMBER;
    BEGIN
        SELECT COUNT(*) INTO v_count FROM PRODUCT WHERE proCode = v_proCode AND proStatus = 'A';

        IF v_count = 0 THEN
            RAISE_APPLICATION_ERROR(-20105, 'No existe un producto activo con el código indicado.');
        END IF;

        UPDATE INVENTORY
        SET invStatus = 'I' 
        WHERE proCode = v_proCode;

        UPDATE PRODUCT
        SET proStatus = 'I'
        WHERE proCode = v_proCode;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20106, 'Error al desactivar el producto y su inventario: ' || SQLERRM);
    END eliminar_producto;

    -- Consultar un producto
    FUNCTION consultar_producto(v_proCode PRODUCT.proCode%TYPE)
    RETURN PRODUCT%ROWTYPE IS
        v_producto PRODUCT%ROWTYPE;
    BEGIN
        SELECT * INTO v_producto FROM PRODUCT WHERE proCode = v_proCode;
        RETURN v_producto;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20107, 'Producto no encontrado.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20108, 'Error al consultar producto: ' || SQLERRM);
    END consultar_producto;

    -- Listar productos
    PROCEDURE listar_productos IS
        CURSOR c_productos IS SELECT * FROM PRODUCT ORDER BY proCode;
        v_producto PRODUCT%ROWTYPE;
    BEGIN
        OPEN c_productos;
        LOOP
            FETCH c_productos INTO v_producto;
            EXIT WHEN c_productos%NOTFOUND;
            DBMS_OUTPUT.PUT_LINE(
                'Código: ' || v_producto.proCode ||
                ', Nombre: ' || v_producto.proName ||
                ', Precio: ' || v_producto.proPrice ||
                ', Tipo: ' || v_producto.proType ||
                ', Marca: ' || v_producto.proMark ||
                ', Estado: ' || v_producto.proStatus
            );
        END LOOP;
        CLOSE c_productos;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20109, 'Error al listar productos: ' || SQLERRM);
    END listar_productos;
    
    
    -- Procedimiento que carga todos los productos activos en una colección
    PROCEDURE cargar_productos_activos(
        p_lista OUT t_lista_productos
    ) IS
    BEGIN
        SELECT *
        BULK COLLECT INTO p_lista
        FROM PRODUCT
        WHERE proStatus = 'A'
        ORDER BY proPrice DESC;

        DBMS_OUTPUT.PUT_LINE('Productos cargados en la colección: ' || p_lista.COUNT);
    EXCEPTION
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(
                -20110,
                'Error al cargar productos activos en la colección: ' || SQLERRM
            );
    END cargar_productos_activos;


END GESTION_PRODUCTO;


-- =======================
-- PAQUETE DE INVENTARIO
-- =======================
CREATE OR REPLACE PACKAGE GESTION_INVENTARIO AS

    -- Registrar un nuevo lote
    PROCEDURE registrar_lote(
        v_proCode      IN INVENTORY.proCode%TYPE,
        v_invStock     IN INVENTORY.invStock%TYPE,
        v_sellingPrice IN INVENTORY.sellingPrice%TYPE,
        v_invDate      IN INVENTORY.invDate%TYPE,
        v_invProv      IN INVENTORY.invProv%TYPE
    );

    -- Modificar un registro del inventario
    PROCEDURE modificar_inventario(
        v_invCode      IN INVENTORY.invCode%TYPE,
        v_proCode      IN INVENTORY.proCode%TYPE,
        v_invStock     IN INVENTORY.invStock%TYPE,
        v_sellingPrice IN INVENTORY.sellingPrice%TYPE,
        v_invDate      IN INVENTORY.invDate%TYPE,
        v_invProv      IN INVENTORY.invProv%TYPE
    );

    -- Consultar un registro de inventario
    FUNCTION consultar_inventario(
        v_invCode IN INVENTORY.invCode%TYPE
    )
    RETURN INVENTORY%ROWTYPE;

    -- Verificar el stock total de un producto
    FUNCTION verificarStock(
        v_proCode IN INVENTORY.proCode%TYPE
    )
    RETURN NUMBER;
    
    -- Listar lotes de un producto usando cursor parametrizado
    PROCEDURE listar_lotes_producto(
        p_proCode IN INVENTORY.proCode%TYPE
    );

END GESTION_INVENTARIO;

-- BODY GESTION INVENTARIO

CREATE OR REPLACE PACKAGE BODY GESTION_INVENTARIO AS

    -- Registrar un nuevo lote en el inventario
    PROCEDURE registrar_lote(
        v_proCode      IN INVENTORY.proCode%TYPE,
        v_invStock     IN INVENTORY.invStock%TYPE,
        v_sellingPrice IN INVENTORY.sellingPrice%TYPE,
        v_invDate      IN INVENTORY.invDate%TYPE,
        v_invProv      IN INVENTORY.invProv%TYPE
    ) IS
    BEGIN
        INSERT INTO INVENTORY (proCode, invStock, sellingPrice, invDate, invProv)
        VALUES (v_proCode, v_invStock, v_sellingPrice, v_invDate, v_invProv);

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            RAISE_APPLICATION_ERROR(-20201, 'El código de inventario ya existe.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20202, 'Error al registrar el lote: ' || SQLERRM);
    END registrar_lote;

    -- Modificar un registro del inventario
    PROCEDURE modificar_inventario(
        v_invCode      IN INVENTORY.invCode%TYPE,
        v_proCode      IN INVENTORY.proCode%TYPE,
        v_invStock     IN INVENTORY.invStock%TYPE,
        v_sellingPrice IN INVENTORY.sellingPrice%TYPE,
        v_invDate      IN INVENTORY.invDate%TYPE,
        v_invProv      IN INVENTORY.invProv%TYPE
    ) IS
        v_count NUMBER;
    BEGIN
        SELECT COUNT(*) INTO v_count
        FROM INVENTORY
        WHERE invCode = v_invCode;

        IF v_count = 0 THEN
            RAISE_APPLICATION_ERROR(-20203, 'No existe un lote con ese código.');
        END IF;

        UPDATE INVENTORY
        SET proCode      = v_proCode,
            invStock     = v_invStock,
            sellingPrice = v_sellingPrice,
            invDate      = v_invDate,
            invProv      = v_invProv
        WHERE invCode = v_invCode;

    EXCEPTION
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20204, 'Error al modificar el inventario: ' || SQLERRM);
    END modificar_inventario;

    -- Consultar un registro de inventario
    FUNCTION consultar_inventario(
        v_invCode IN INVENTORY.invCode%TYPE
    )
    RETURN INVENTORY%ROWTYPE IS
        v_inventario INVENTORY%ROWTYPE;
    BEGIN
        SELECT *
        INTO v_inventario
        FROM INVENTORY
        WHERE invCode = v_invCode;

        RETURN v_inventario;

    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20205, 'Inventario no encontrado.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20206, 'Error al consultar inventario: ' || SQLERRM);
    END consultar_inventario;

    -- Verificar el stock total de un producto
    FUNCTION verificarStock(
        v_proCode IN INVENTORY.proCode%TYPE
    )
    RETURN NUMBER IS
        v_total NUMBER := 0;
    BEGIN
        SELECT NVL(SUM(invStock), 0)
        INTO v_total
        FROM INVENTORY
        WHERE proCode = v_proCode;

        RETURN v_total;

    EXCEPTION
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20207, 'Error al verificar el stock: ' || SQLERRM);
    END verificarStock;


    PROCEDURE listar_lotes_producto(
        p_proCode IN INVENTORY.proCode%TYPE
    ) IS
    
        -- Cursor parametrizado
        CURSOR c_lotes(v_codigo INVENTORY.proCode%TYPE) IS
            SELECT invCode, invStock, sellingPrice, invDate, invProv
            FROM INVENTORY
            WHERE proCode = v_codigo
            ORDER BY invDate DESC;

        v_invCode      INVENTORY.invCode%TYPE;
        v_invStock     INVENTORY.invStock%TYPE;
        v_sellingPrice INVENTORY.sellingPrice%TYPE;
        v_invDate      INVENTORY.invDate%TYPE;
        v_invProv      INVENTORY.invProv%TYPE;

    BEGIN
        OPEN c_lotes(p_proCode);

        LOOP
            FETCH c_lotes INTO 
                v_invCode, v_invStock, v_sellingPrice, v_invDate, v_invProv;
            EXIT WHEN c_lotes%NOTFOUND;

            DBMS_OUTPUT.PUT_LINE(
                'Lote ' || v_invCode ||
                ' | Stock: ' || v_invStock ||
                ' | Precio Venta: ' || v_sellingPrice ||
                ' | Fecha: ' || TO_CHAR(v_invDate, 'YYYY-MM-DD') ||
                ' | Proveedor: ' || v_invProv
            );
        END LOOP;

        CLOSE c_lotes;

    EXCEPTION
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(
                 -20208, 
                 'Error al listar los lotes del producto: ' || SQLERRM
            );
    END listar_lotes_producto;


END GESTION_INVENTARIO;

-- =======================
-- PAQUETE DE USUARIO
-- =======================
CREATE OR REPLACE PACKAGE GESTION_USUARIO AS

    -- Procedimiento para registrar un usuario y sus detalles de cliente
    PROCEDURE REGISTRAR_USUARIO(
      p_userName      IN USERS.userName%TYPE,
      p_userPassword  IN USERS.userPassword%TYPE,
      p_userEmail     IN USERS.userEmail%TYPE,
      p_userPhone     IN USERS.userPhone%TYPE,
      p_firstName     IN CLIENT_DETAIL.firstName%TYPE,
      p_secondName    IN CLIENT_DETAIL.secondName%TYPE,
      p_firstLastName IN CLIENT_DETAIL.firstLastName%TYPE,
      p_secondLastName IN CLIENT_DETAIL.secondLastName%TYPE,
      p_address       IN CLIENT_DETAIL.address%TYPE,
      p_descAddress   IN CLIENT_DETAIL.descAddress%TYPE,
      p_cityID        IN CLIENT_DETAIL.cityID%TYPE,
      p_depID         IN CLIENT_DETAIL.depID%TYPE
    );
  
    -- Procedimiento para modificar usuario
    PROCEDURE MODIFICAR_USUARIO(
      p_userID        IN USERS.userID%TYPE,
      p_userPhone     IN USERS.userPhone%TYPE,
      p_userEmail     IN USERS.userEmail%TYPE,
      p_userPassword  IN USERS.userPassword%TYPE,
      p_firstName     IN CLIENT_DETAIL.firstName%TYPE,
      p_secondName    IN CLIENT_DETAIL.secondName%TYPE,
      p_firstLastName IN CLIENT_DETAIL.firstLastName%TYPE,
      p_secondLastName IN CLIENT_DETAIL.secondLastName%TYPE,
      p_address       IN CLIENT_DETAIL.address%TYPE,
      p_descAddress   IN CLIENT_DETAIL.descAddress%TYPE,
      p_cityID        IN CLIENT_DETAIL.cityID%TYPE,
      p_depID         IN CLIENT_DETAIL.depID%TYPE
    );

    -- Procedimiento consultar usuario
    PROCEDURE CONSULTAR_USUARIO(
      p_userID        IN  USERS.userID%TYPE,
      o_userName      OUT USERS.userName%TYPE,
      o_userEmail     OUT USERS.userEmail%TYPE,
      o_userPassword  OUT USERS.userPassword%TYPE,
      o_userPhone     OUT USERS.userPhone%TYPE,
      o_firstName     OUT CLIENT_DETAIL.firstName%TYPE,
      o_secondName    OUT CLIENT_DETAIL.secondName%TYPE,
      o_firstLastName OUT CLIENT_DETAIL.firstLastName%TYPE,
      o_secondLastName OUT CLIENT_DETAIL.secondLastName%TYPE,
      o_address       OUT CLIENT_DETAIL.address%TYPE,
      o_descAddress   OUT CLIENT_DETAIL.descAddress%TYPE,
      o_cityID        OUT CLIENT_DETAIL.cityID%TYPE,
      o_depID         OUT CLIENT_DETAIL.depID%TYPE
    );

END GESTION_USUARIO;

-- BODY GESTION DE USUARIO

CREATE OR REPLACE PACKAGE BODY GESTION_USUARIO AS

    PROCEDURE REGISTRAR_USUARIO(
      p_userName      IN USERS.userName%TYPE,
      p_userPassword  IN USERS.userPassword%TYPE,
      p_userEmail     IN USERS.userEmail%TYPE,
      p_userPhone     IN USERS.userPhone%TYPE,
      p_firstName     IN CLIENT_DETAIL.firstName%TYPE,
      p_secondName    IN CLIENT_DETAIL.secondName%TYPE,
      p_firstLastName IN CLIENT_DETAIL.firstLastName%TYPE,
      p_secondLastName IN CLIENT_DETAIL.secondLastName%TYPE,
      p_address       IN CLIENT_DETAIL.address%TYPE,
      p_descAddress   IN CLIENT_DETAIL.descAddress%TYPE,
      p_cityID        IN CLIENT_DETAIL.cityID%TYPE,
      p_depID         IN CLIENT_DETAIL.depID%TYPE
    )
    IS
      v_userID USERS.userID%TYPE;
    BEGIN
      INSERT INTO USERS(userName, userPassword, userEmail, userPhone)
      VALUES (p_userName, p_userPassword, p_userEmail, p_userPhone)
      RETURNING userID INTO v_userID;

      INSERT INTO CLIENT_DETAIL(
        userID, firstName, secondName, firstLastName, secondLastName,
        address, descAddress, cityID, depID
      )
      VALUES (
        v_userID, p_firstName, p_secondName, p_firstLastName, p_secondLastName,
        p_address, p_descAddress, p_cityID, p_depID
      );

      COMMIT;

    EXCEPTION
      WHEN DUP_VAL_ON_INDEX THEN
        ROLLBACK;
        RAISE_APPLICATION_ERROR(-20301, 'El nombre de usuario o correo ya existe.');
      WHEN OTHERS THEN
        ROLLBACK;
        RAISE_APPLICATION_ERROR(-20302, 'Error registrando usuario: ' || SQLERRM);
    END REGISTRAR_USUARIO;


    PROCEDURE MODIFICAR_USUARIO(
      p_userID        IN USERS.userID%TYPE,
      p_userPhone     IN USERS.userPhone%TYPE,
      p_userEmail     IN USERS.userEmail%TYPE,
      p_userPassword  IN USERS.userPassword%TYPE,
      p_firstName     IN CLIENT_DETAIL.firstName%TYPE,
      p_secondName    IN CLIENT_DETAIL.secondName%TYPE,
      p_firstLastName IN CLIENT_DETAIL.firstLastName%TYPE,
      p_secondLastName IN CLIENT_DETAIL.secondLastName%TYPE,
      p_address       IN CLIENT_DETAIL.address%TYPE,
      p_descAddress   IN CLIENT_DETAIL.descAddress%TYPE,
      p_cityID        IN CLIENT_DETAIL.cityID%TYPE,
      p_depID         IN CLIENT_DETAIL.depID%TYPE
    )
    IS
      v_count NUMBER;
    BEGIN
      SELECT COUNT(*) INTO v_count
      FROM USERS
      WHERE userID = p_userID;

      IF v_count = 0 THEN
        RAISE_APPLICATION_ERROR(-20303, 'El usuario no existe.');
      END IF;

      UPDATE USERS
      SET userPhone = p_userPhone,
          userEmail = p_userEmail,
          userPassword = p_userPassword
      WHERE userID = p_userID;

      UPDATE CLIENT_DETAIL
      SET firstName      = p_firstName,
          secondName     = p_secondName,
          firstLastName  = p_firstLastName,
          secondLastName = p_secondLastName,
          address        = p_address,
          descAddress    = p_descAddress,
          cityID         = p_cityID,
          depID          = p_depID
      WHERE userID = p_userID;

      COMMIT;

    EXCEPTION
      WHEN OTHERS THEN
        ROLLBACK;
        RAISE_APPLICATION_ERROR(-20304, 'Error modificando usuario: ' || SQLERRM);
    END MODIFICAR_USUARIO;


    PROCEDURE CONSULTAR_USUARIO(
      p_userID        IN  USERS.userID%TYPE,
      o_userName      OUT USERS.userName%TYPE,
      o_userEmail     OUT USERS.userEmail%TYPE,
      o_userPassword  OUT USERS.userPassword%TYPE,
      o_userPhone     OUT USERS.userPhone%TYPE,
      o_firstName     OUT CLIENT_DETAIL.firstName%TYPE,
      o_secondName    OUT CLIENT_DETAIL.secondName%TYPE,
      o_firstLastName OUT CLIENT_DETAIL.firstLastName%TYPE,
      o_secondLastName OUT CLIENT_DETAIL.secondLastName%TYPE,
      o_address       OUT CLIENT_DETAIL.address%TYPE,
      o_descAddress   OUT CLIENT_DETAIL.descAddress%TYPE,
      o_cityID        OUT CLIENT_DETAIL.cityID%TYPE,
      o_depID         OUT CLIENT_DETAIL.depID%TYPE
    )
    IS
    BEGIN
      SELECT 
        u.userName, u.userEmail, u.userPassword, u.userPhone,
        c.firstName, c.secondName, c.firstLastName, c.secondLastName,
        c.address, c.descAddress, c.cityID, c.depID
      INTO
        o_userName, o_userEmail, o_userPassword, o_userPhone,
        o_firstName, o_secondName, o_firstLastName, o_secondLastName,
        o_address, o_descAddress, o_cityID, o_depID
      FROM USERS u
      INNER JOIN CLIENT_DETAIL c ON u.userID = c.userID
      WHERE u.userID = p_userID;

    EXCEPTION
      WHEN NO_DATA_FOUND THEN
        RAISE_APPLICATION_ERROR(-20305, 'No existe un usuario con el ID proporcionado.');
      WHEN OTHERS THEN
        RAISE_APPLICATION_ERROR(-20306, 'Error consultando usuario: ' || SQLERRM);
    END CONSULTAR_USUARIO;

END GESTION_USUARIO;

-- =======================
-- PAQUETE DE CARRITO
-- =======================
CREATE OR REPLACE PACKAGE GESTION_CARRITO AS

    -- Agregar producto al carrito
    PROCEDURE agregar_al_carrito(
        p_userID   IN CART.userID%TYPE,
        p_proCode  IN CART.proCode%TYPE,
        p_quantity IN CART.quantity%TYPE
    );

    -- Actualizar cantidad de un producto en el carrito
    PROCEDURE actualizar_cantidad(
        p_cartID   IN CART.cartID%TYPE,
        p_quantity IN CART.quantity%TYPE
    );

    -- Eliminar producto del carrito
    PROCEDURE eliminar_del_carrito(
        p_cartID IN CART.cartID%TYPE
    );

    -- Limpiar todo el carrito de un usuario
    PROCEDURE limpiar_carrito(
        p_userID IN CART.userID%TYPE
    );

    -- Consultar carrito de un usuario
    PROCEDURE consultar_carrito(
        p_userID IN CART.userID%TYPE
    );

    -- Calcular total del carrito
    FUNCTION calcular_total_carrito(
        p_userID IN CART.userID%TYPE
    ) RETURN NUMBER;

    -- Verificar disponibilidad de stock para el carrito
    FUNCTION verificar_disponibilidad_carrito(
        p_userID IN CART.userID%TYPE
    ) RETURN BOOLEAN;

END GESTION_CARRITO;


-- BODY DEL PAQUETE CARRITO
CREATE OR REPLACE PACKAGE BODY GESTION_CARRITO AS

    -- Agregar producto al carrito
    PROCEDURE agregar_al_carrito(
        p_userID   IN CART.userID%TYPE,
        p_proCode  IN CART.proCode%TYPE,
        p_quantity IN CART.quantity%TYPE
    ) IS
        v_stock_disponible NUMBER;
        v_cart_existente NUMBER;
        v_cantidad_actual NUMBER;
    BEGIN
        -- Verificar que el producto existe y está activo
        SELECT COUNT(*) INTO v_cart_existente
        FROM PRODUCT
        WHERE proCode = p_proCode AND proStatus = 'A';
        
        IF v_cart_existente = 0 THEN
            RAISE_APPLICATION_ERROR(-20401, 'El producto no existe o no está disponible.');
        END IF;

        -- Verificar stock disponible
        SELECT NVL(SUM(invStock), 0) INTO v_stock_disponible
        FROM INVENTORY
        WHERE proCode = p_proCode AND invStatus = 'A';

        IF v_stock_disponible < p_quantity THEN
            RAISE_APPLICATION_ERROR(-20402, 'Stock insuficiente. Disponible: ' || v_stock_disponible);
        END IF;

        -- Verificar si el producto ya está en el carrito
        BEGIN
            SELECT quantity INTO v_cantidad_actual
            FROM CART
            WHERE userID = p_userID AND proCode = p_proCode;

            -- Si existe, actualizar cantidad
            IF v_stock_disponible < (v_cantidad_actual + p_quantity) THEN
                RAISE_APPLICATION_ERROR(-20402, 'Stock insuficiente para la cantidad total. Disponible: ' || v_stock_disponible);
            END IF;

            UPDATE CART
            SET quantity = quantity + p_quantity,
                addedDate = SYSDATE
            WHERE userID = p_userID AND proCode = p_proCode;

        EXCEPTION
            WHEN NO_DATA_FOUND THEN
                -- Si no existe, insertar nuevo registro
                INSERT INTO CART (userID, proCode, quantity)
                VALUES (p_userID, p_proCode, p_quantity);
        END;

        COMMIT;
        DBMS_OUTPUT.PUT_LINE('Producto agregado al carrito exitosamente.');

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20403, 'Error al agregar al carrito: ' || SQLERRM);
    END agregar_al_carrito;

    -- Actualizar cantidad de un producto en el carrito
    PROCEDURE actualizar_cantidad(
        p_cartID   IN CART.cartID%TYPE,
        p_quantity IN CART.quantity%TYPE
    ) IS
        v_proCode NUMBER;
        v_stock_disponible NUMBER;
    BEGIN
        -- Obtener el código del producto
        SELECT proCode INTO v_proCode
        FROM CART
        WHERE cartID = p_cartID;

        -- Verificar stock disponible
        SELECT NVL(SUM(invStock), 0) INTO v_stock_disponible
        FROM INVENTORY
        WHERE proCode = v_proCode AND invStatus = 'A';

        IF v_stock_disponible < p_quantity THEN
            RAISE_APPLICATION_ERROR(-20404, 'Stock insuficiente. Disponible: ' || v_stock_disponible);
        END IF;

        UPDATE CART
        SET quantity = p_quantity,
            addedDate = SYSDATE
        WHERE cartID = p_cartID;

        COMMIT;
        DBMS_OUTPUT.PUT_LINE('Cantidad actualizada exitosamente.');

    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20405, 'Carrito no encontrado.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20406, 'Error al actualizar cantidad: ' || SQLERRM);
    END actualizar_cantidad;

    -- Eliminar producto del carrito
    PROCEDURE eliminar_del_carrito(
        p_cartID IN CART.cartID%TYPE
    ) IS
    BEGIN
        DELETE FROM CART WHERE cartID = p_cartID;

        IF SQL%ROWCOUNT = 0 THEN
            RAISE_APPLICATION_ERROR(-20407, 'Carrito no encontrado.');
        END IF;

        COMMIT;
        DBMS_OUTPUT.PUT_LINE('Producto eliminado del carrito.');

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20408, 'Error al eliminar del carrito: ' || SQLERRM);
    END eliminar_del_carrito;

    -- Limpiar todo el carrito de un usuario
    PROCEDURE limpiar_carrito(
        p_userID IN CART.userID%TYPE
    ) IS
    BEGIN
        DELETE FROM CART WHERE userID = p_userID;

        COMMIT;
        DBMS_OUTPUT.PUT_LINE('Carrito limpiado exitosamente.');

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20409, 'Error al limpiar carrito: ' || SQLERRM);
    END limpiar_carrito;

    -- Consultar carrito de un usuario
    PROCEDURE consultar_carrito(
        p_userID IN CART.userID%TYPE
    ) IS
        CURSOR c_carrito IS
            SELECT c.cartID, c.proCode, p.proName, p.proPrice, 
                   c.quantity, (p.proPrice * c.quantity) AS subtotal,
                   c.addedDate
            FROM CART c
            INNER JOIN PRODUCT p ON c.proCode = p.proCode
            WHERE c.userID = p_userID
            ORDER BY c.addedDate DESC;
        
        v_carrito c_carrito%ROWTYPE;
        v_total NUMBER := 0;
    BEGIN
        DBMS_OUTPUT.PUT_LINE('========== CARRITO DE COMPRAS ==========');
        OPEN c_carrito;
        LOOP
            FETCH c_carrito INTO v_carrito;
            EXIT WHEN c_carrito%NOTFOUND;
            
            DBMS_OUTPUT.PUT_LINE(
                'ID: ' || v_carrito.cartID ||
                ' | Producto: ' || v_carrito.proName ||
                ' | Precio: $' || v_carrito.proPrice ||
                ' | Cantidad: ' || v_carrito.quantity ||
                ' | Subtotal: $' || v_carrito.subtotal
            );
            v_total := v_total + v_carrito.subtotal;
        END LOOP;
        CLOSE c_carrito;
        
        DBMS_OUTPUT.PUT_LINE('========================================');
        DBMS_OUTPUT.PUT_LINE('TOTAL: $' || v_total);

    EXCEPTION
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20410, 'Error al consultar carrito: ' || SQLERRM);
    END consultar_carrito;

    -- Calcular total del carrito
    FUNCTION calcular_total_carrito(
        p_userID IN CART.userID%TYPE
    ) RETURN NUMBER IS
        v_total NUMBER := 0;
    BEGIN
        SELECT NVL(SUM(p.proPrice * c.quantity), 0)
        INTO v_total
        FROM CART c
        INNER JOIN PRODUCT p ON c.proCode = p.proCode
        WHERE c.userID = p_userID;

        RETURN v_total;

    EXCEPTION
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20411, 'Error al calcular total: ' || SQLERRM);
    END calcular_total_carrito;

    -- Verificar disponibilidad de stock para el carrito
    FUNCTION verificar_disponibilidad_carrito(
        p_userID IN CART.userID%TYPE
    ) RETURN BOOLEAN IS
        CURSOR c_items IS
            SELECT c.proCode, c.quantity
            FROM CART c
            WHERE c.userID = p_userID;
        
        v_stock_disponible NUMBER;
    BEGIN
        FOR item IN c_items LOOP
            SELECT NVL(SUM(invStock), 0)
            INTO v_stock_disponible
            FROM INVENTORY
            WHERE proCode = item.proCode AND invStatus = 'A';

            IF v_stock_disponible < item.quantity THEN
                RETURN FALSE;
            END IF;
        END LOOP;

        RETURN TRUE;

    EXCEPTION
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20412, 'Error al verificar disponibilidad: ' || SQLERRM);
    END verificar_disponibilidad_carrito;

END GESTION_CARRITO;


-- =======================
-- PAQUETE DE COMPRAS
-- =======================
CREATE OR REPLACE PACKAGE GESTION_COMPRAS AS

    -- Procesar compra desde el carrito
    PROCEDURE procesar_compra(
        p_userID      IN USERS.userID%TYPE,
        p_paymentType IN BILL.paymentType%TYPE,
        p_ordID       OUT "ORDER".ordID%TYPE
    );

    -- Cancelar una orden
    PROCEDURE cancelar_orden(
        p_ordID  IN "ORDER".ordID%TYPE,
        p_reason IN VARCHAR2
    );

    -- Cambiar estado de la orden
    PROCEDURE cambiar_estado_orden(
        p_ordID    IN "ORDER".ordID%TYPE,
        p_newState IN "ORDER".ordState%TYPE
    );

    -- Consultar historial de órdenes de un usuario
    PROCEDURE consultar_ordenes_usuario(
        p_userID IN USERS.userID%TYPE
    );

    -- Consultar detalle de una orden
    PROCEDURE consultar_detalle_orden(
        p_ordID IN "ORDER".ordID%TYPE
    );

END GESTION_COMPRAS;


-- BODY DEL PAQUETE COMPRAS
CREATE OR REPLACE PACKAGE BODY GESTION_COMPRAS AS

    -- Procesar compra desde el carrito
    PROCEDURE procesar_compra(
        p_userID      IN USERS.userID%TYPE,
        p_paymentType IN BILL.paymentType%TYPE,
        p_ordID       OUT "ORDER".ordID%TYPE
    ) IS
        CURSOR c_cart_items IS
            SELECT c.proCode, c.quantity, p.proPrice
            FROM CART c
            INNER JOIN PRODUCT p ON c.proCode = p.proCode
            WHERE c.userID = p_userID;

        v_total NUMBER := 0;
        v_stock_disponible NUMBER;
        v_invCode NUMBER;
        v_stock_deducir NUMBER;
        v_stock_restante NUMBER;
    BEGIN
    
        SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
        
        -- Verificar que el carrito no esté vacío
        SELECT COUNT(*) INTO v_stock_disponible
        FROM CART
        WHERE userID = p_userID;

        IF v_stock_disponible = 0 THEN
            RAISE_APPLICATION_ERROR(-20501, 'El carrito está vacío.');
        END IF;

        -- Verificar disponibilidad de stock
        IF NOT GESTION_CARRITO.verificar_disponibilidad_carrito(p_userID) THEN
            RAISE_APPLICATION_ERROR(-20502, 'Stock insuficiente para uno o más productos.');
        END IF;

        -- Crear la orden
        INSERT INTO "ORDER" (ordState, ordDate, userID)
        VALUES ('Processing', SYSDATE, p_userID)
        RETURNING ordID INTO p_ordID;

        -- Procesar cada item del carrito
        FOR item IN c_cart_items LOOP
            -- Insertar detalle de orden
            INSERT INTO ORDER_DETAIL (ordID, proCode, quantity, unitPrice)
            VALUES (p_ordID, item.proCode, item.quantity, item.proPrice);

            -- Calcular total
            v_total := v_total + (item.quantity * item.proPrice);

            -- Deducir del inventario (FIFO - First In First Out)
            v_stock_restante := item.quantity;
            
            FOR inv IN (
                SELECT invCode, invStock
                FROM INVENTORY
                WHERE proCode = item.proCode AND invStatus = 'A' AND invStock > 0
                ORDER BY invDate ASC
            ) LOOP
                EXIT WHEN v_stock_restante = 0;

                IF inv.invStock >= v_stock_restante THEN
                    -- El lote tiene suficiente stock
                    UPDATE INVENTORY
                    SET invStock = invStock - v_stock_restante
                    WHERE invCode = inv.invCode;
                    
                    v_stock_restante := 0;
                ELSE
                    -- Usar todo el stock de este lote
                    UPDATE INVENTORY
                    SET invStock = 0
                    WHERE invCode = inv.invCode;
                    
                    v_stock_restante := v_stock_restante - inv.invStock;
                END IF;
            END LOOP;
        END LOOP;

        -- Obtener el primer invCode para la factura
        SELECT MIN(i.invCode) INTO v_invCode
        FROM INVENTORY i
        INNER JOIN ORDER_DETAIL od ON i.proCode = od.proCode
        WHERE od.ordID = p_ordID;

        -- Crear la factura
        INSERT INTO BILL (invCode, ordID, paymentType, billDate, totalBill)
        VALUES (v_invCode, p_ordID, p_paymentType, SYSDATE, v_total);

        -- Limpiar el carrito
        DELETE FROM CART WHERE userID = p_userID;

        COMMIT;
        DBMS_OUTPUT.PUT_LINE('Compra procesada exitosamente. Orden ID: ' || p_ordID);

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20503, 'Error al procesar la compra: ' || SQLERRM);
    END procesar_compra;

    -- Cancelar una orden
    PROCEDURE cancelar_orden(
        p_ordID  IN "ORDER".ordID%TYPE,
        p_reason IN VARCHAR2
    ) IS
        v_estado VARCHAR2(30);
        
        CURSOR c_order_items IS
            SELECT od.proCode, od.quantity
            FROM ORDER_DETAIL od
            WHERE od.ordID = p_ordID;
    BEGIN
        -- Verificar que la orden existe y puede cancelarse
        SELECT ordState INTO v_estado
        FROM "ORDER"
        WHERE ordID = p_ordID;

        IF v_estado IN ('Delivered', 'Cancelled') THEN
            RAISE_APPLICATION_ERROR(-20504, 'No se puede cancelar una orden entregada o ya cancelada.');
        END IF;

        -- Devolver stock al inventario
        FOR item IN c_order_items LOOP
            -- Actualizar el primer lote disponible (FIFO inverso)
            UPDATE INVENTORY
            SET invStock = invStock + item.quantity
            WHERE invCode = (
                SELECT MIN(invCode)
                FROM INVENTORY
                WHERE proCode = item.proCode AND invStatus = 'A'
            );

            -- Registrar movimiento de devolución
            INSERT INTO INVMOVEMENT (invCode, movType, quantity, reason, ordID)
            VALUES (
                (SELECT MIN(invCode) FROM INVENTORY WHERE proCode = item.proCode),
                'DEVOLUCION',
                item.quantity,
                'Cancelación de orden: ' || p_reason,
                p_ordID
            );
        END LOOP;

        -- Actualizar estado de la orden
        UPDATE "ORDER"
        SET ordState = 'Cancelled'
        WHERE ordID = p_ordID;

        COMMIT;
        DBMS_OUTPUT.PUT_LINE('Orden cancelada exitosamente.');

    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20505, 'Orden no encontrada.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20506, 'Error al cancelar orden: ' || SQLERRM);
    END cancelar_orden;

    -- Cambiar estado de la orden
    PROCEDURE cambiar_estado_orden(
        p_ordID    IN "ORDER".ordID%TYPE,
        p_newState IN "ORDER".ordState%TYPE
    ) IS
    BEGIN
        UPDATE "ORDER"
        SET ordState = p_newState
        WHERE ordID = p_ordID;

        IF SQL%ROWCOUNT = 0 THEN
            RAISE_APPLICATION_ERROR(-20507, 'Orden no encontrada.');
        END IF;

        COMMIT;
        DBMS_OUTPUT.PUT_LINE('Estado actualizado a: ' || p_newState);

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20508, 'Error al cambiar estado: ' || SQLERRM);
    END cambiar_estado_orden;

    -- Consultar historial de órdenes de un usuario
    PROCEDURE consultar_ordenes_usuario(
        p_userID IN USERS.userID%TYPE
    ) IS
        CURSOR c_ordenes IS
            SELECT o.ordID, o.ordState, o.ordDate, b.totalBill, b.paymentType
            FROM "ORDER" o
            LEFT JOIN BILL b ON o.ordID = b.ordID
            WHERE o.userID = p_userID
            ORDER BY o.ordDate DESC;
        
        v_orden c_ordenes%ROWTYPE;
    BEGIN
        DBMS_OUTPUT.PUT_LINE('========== HISTORIAL DE ÓRDENES ==========');
        OPEN c_ordenes;
        LOOP
            FETCH c_ordenes INTO v_orden;
            EXIT WHEN c_ordenes%NOTFOUND;
            
            DBMS_OUTPUT.PUT_LINE(
                'Orden: ' || v_orden.ordID ||
                ' | Estado: ' || v_orden.ordState ||
                ' | Fecha: ' || TO_CHAR(v_orden.ordDate, 'DD/MM/YYYY') ||
                ' | Total: $' || NVL(v_orden.totalBill, 0) ||
                ' | Pago: ' || NVL(v_orden.paymentType, 'N/A')
            );
        END LOOP;
        CLOSE c_ordenes;
        DBMS_OUTPUT.PUT_LINE('==========================================');

    EXCEPTION
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20509, 'Error al consultar órdenes: ' || SQLERRM);
    END consultar_ordenes_usuario;

    -- Consultar detalle de una orden
    PROCEDURE consultar_detalle_orden(
        p_ordID IN "ORDER".ordID%TYPE
    ) IS
        CURSOR c_detalle IS
            SELECT p.proName, od.quantity, od.unitPrice, 
                   (od.quantity * od.unitPrice) AS subtotal
            FROM ORDER_DETAIL od
            INNER JOIN PRODUCT p ON od.proCode = p.proCode
            WHERE od.ordID = p_ordID;
        
        v_detalle c_detalle%ROWTYPE;
        v_orden "ORDER"%ROWTYPE;
        v_total NUMBER := 0;
    BEGIN
        -- Obtener información de la orden
        SELECT * INTO v_orden
        FROM "ORDER"
        WHERE ordID = p_ordID;

        DBMS_OUTPUT.PUT_LINE('========== DETALLE DE ORDEN ==========');
        DBMS_OUTPUT.PUT_LINE('Orden ID: ' || v_orden.ordID);
        DBMS_OUTPUT.PUT_LINE('Estado: ' || v_orden.ordState);
        DBMS_OUTPUT.PUT_LINE('Fecha: ' || TO_CHAR(v_orden.ordDate, 'DD/MM/YYYY HH24:MI:SS'));
        DBMS_OUTPUT.PUT_LINE('--------------------------------------');

        OPEN c_detalle;
        LOOP
            FETCH c_detalle INTO v_detalle;
            EXIT WHEN c_detalle%NOTFOUND;
            
            DBMS_OUTPUT.PUT_LINE(
                'Producto: ' || v_detalle.proName ||
                ' | Cantidad: ' || v_detalle.quantity ||
                ' | Precio: $' || v_detalle.unitPrice ||
                ' | Subtotal: $' || v_detalle.subtotal
            );
            v_total := v_total + v_detalle.subtotal;
        END LOOP;
        CLOSE c_detalle;

        DBMS_OUTPUT.PUT_LINE('--------------------------------------');
        DBMS_OUTPUT.PUT_LINE('TOTAL: $' || v_total);
        DBMS_OUTPUT.PUT_LINE('======================================');

    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20510, 'Orden no encontrada.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20511, 'Error al consultar detalle: ' || SQLERRM);
    END consultar_detalle_orden;

END GESTION_COMPRAS;
