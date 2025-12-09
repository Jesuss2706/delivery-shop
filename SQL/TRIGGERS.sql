-- ==========================================================
-- TRIGGERS
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
-- TRIGGERS NORMALES
-- =======================

-- Trigger para validar stock antes de insertar en ORDER_DETAIL
CREATE OR REPLACE TRIGGER trg_validate_stock
BEFORE INSERT ON ORDER_DETAIL
FOR EACH ROW
DECLARE
    v_stock_disponible NUMBER;
BEGIN
    -- Verificar stock disponible
    SELECT NVL(SUM(invStock), 0)
    INTO v_stock_disponible
    FROM INVENTORY
    WHERE proCode = :NEW.proCode AND invStatus = 'A';

    IF v_stock_disponible < :NEW.quantity THEN
        RAISE_APPLICATION_ERROR(
            -20401,
            'Stock insuficiente para el producto ' || :NEW.proCode ||
            '. Disponible: ' || v_stock_disponible ||
            ', Solicitado: ' || :NEW.quantity
        );
    END IF;
END;


-- Trigger para actualizar la fecha de modificación en CART
CREATE OR REPLACE TRIGGER trg_cart_update_date
BEFORE UPDATE ON CART
FOR EACH ROW
BEGIN
    :NEW.addedDate := SYSDATE;
END;

-- =======================
-- TRIGGERS INSTEAD OF
-- =======================

-- VISTA
CREATE OR REPLACE VIEW vw_usuario_detalle AS
SELECT u.userID, u.userName, u.userEmail, u.userPhone, c.firstName,
    c.secondName, c.firstLastName, c.secondLastName,
    c.address, c.descAddress, c.cityID, c.depID
FROM USERS u
INNER JOIN CLIENT_DETAIL c ON u.userID = c.userID;

-- TRIGGER
CREATE OR REPLACE TRIGGER trg_update_vw_usuario_detalle
INSTEAD OF UPDATE ON vw_usuario_detalle
FOR EACH ROW
BEGIN
    -- Actualizar tabla USERS
    UPDATE USERS
    SET userEmail = :NEW.userEmail,
        userPhone = :NEW.userPhone
    WHERE userID = :OLD.userID;

    -- Actualizar tabla CLIENT_DETAIL
    UPDATE CLIENT_DETAIL
    SET firstName      = :NEW.firstName,
        secondName     = :NEW.secondName,
        firstLastName  = :NEW.firstLastName,
        secondLastName = :NEW.secondLastName,
        address        = :NEW.address,
        descAddress    = :NEW.descAddress,
        cityID         = :NEW.cityID,
        depID          = :NEW.depID
    WHERE userID = :OLD.userID;
END;

-- VISTA
CREATE OR REPLACE VIEW vw_order_full AS
SELECT 
    o.ordID, o.ordState, o.ordDate, u.userID, u.userName,
    u.userEmail, cd.firstName, cd.firstLastName,
    (
        SELECT SUM(od.quantity * od.unitPrice)
        FROM ORDER_DETAIL od
        WHERE od.ordID = o.ordID
    ) AS orderTotal
FROM "ORDER" o
INNER JOIN USERS u ON o.userID = u.userID
INNER JOIN CLIENT_DETAIL cd ON u.userID = cd.userID;


-- TRIGGER
CREATE OR REPLACE TRIGGER trg_cancel_order_vw
INSTEAD OF DELETE ON vw_order_full
FOR EACH ROW
BEGIN
    -- Cambiar estado de la orden en la tabla real
    UPDATE "ORDER"
    SET ordState = 'Cancelled'
    WHERE ordID = :OLD.ordID;

    DBMS_OUTPUT.PUT_LINE('Orden ' || :OLD.ordID || ' cancelada desde la vista.');
END;

-- =======================
-- TRIGGERS COMPUESTOS
-- =======================

CREATE OR REPLACE TRIGGER trg_inv_movement_compound
FOR UPDATE OF invStock ON INVENTORY
COMPOUND TRIGGER

    -- Variables a nivel statement (solo una vez por operación)
    v_user VARCHAR2(50);

    BEFORE STATEMENT IS
    BEGIN
        v_user := USER;
        DBMS_OUTPUT.PUT_LINE('Iniciando actualización de inventario por: ' || v_user);
    END BEFORE STATEMENT;

    BEFORE EACH ROW IS
    BEGIN
        DBMS_OUTPUT.PUT_LINE(
            'Antes del cambio → invCode=' || :OLD.invCode ||
            ' stock OLD=' || :OLD.invStock ||
            ' stock NEW=' || :NEW.invStock
        );
    END BEFORE EACH ROW;

    AFTER EACH ROW IS
        v_movType VARCHAR2(20);
        v_quantity NUMBER;
    BEGIN
        IF :NEW.invStock > :OLD.invStock THEN
            v_movType := 'ENTRADA';
            v_quantity := :NEW.invStock - :OLD.invStock;

            INSERT INTO INVMOVEMENT(
                invCode, movType, quantity, prevStock, newStock, reason
            ) VALUES (
                :NEW.invCode, v_movType, v_quantity, :OLD.invStock, :NEW.invStock,
                'Movimiento automático'
            );

        ELSIF :NEW.invStock < :OLD.invStock THEN
            v_movType := 'SALIDA';
            v_quantity := :OLD.invStock - :NEW.invStock;

            INSERT INTO INVMOVEMENT(
                invCode, movType, quantity, prevStock, newStock, reason
            ) VALUES (
                :NEW.invCode, v_movType, v_quantity, :OLD.invStock, :NEW.invStock,
                'Movimiento automático'
            );

        ELSE
            NULL;  -- no hay movimiento real
        END IF;
    END AFTER EACH ROW;


    AFTER STATEMENT IS
    BEGIN
        DBMS_OUTPUT.PUT_LINE('Actualización finalizada correctamente.');
    END AFTER STATEMENT;

END trg_inv_movement_compound;



COMMIT;
