-- ==========================================================
-- DCL COMPLETO CORREGIDO PARA PDB
-- ==========================================================
/*
    NOMBRES: 
            - VALERIA MUÑOS GUERRERO
            - NICOLE BURBANO SOLARTE
            - JUAN CAMILO HENAO
            - JUAN PABLO COLLAZOS SAMBONI
            - JESUS EDUARDO LASSO MUÑOZ
*/


alter session set "_ORACLE_SCRIPT"=true;

-- ======= CREACIÓN DE ROLES LOCALES =======
CREATE ROLE rol_admin;
CREATE ROLE rol_cliente;

-- ======= PRIVILEGIOS DEL ROL ADMIN =======
-- Privilegios sobre tablas
GRANT SELECT, INSERT, UPDATE, DELETE, ALTER ON PRODUCTTYPE TO rol_admin;
GRANT SELECT, INSERT, UPDATE, DELETE, ALTER ON PRODUCT TO rol_admin;
GRANT SELECT, INSERT, UPDATE, DELETE, ALTER ON INVENTORY TO rol_admin;
GRANT SELECT, INSERT, UPDATE, DELETE, ALTER ON USERS TO rol_admin;
GRANT SELECT, INSERT, UPDATE, DELETE, ALTER ON PURCHASE TO rol_admin;
GRANT SELECT, INSERT, UPDATE, DELETE, ALTER ON PURCHASE_DETAIL TO rol_admin;
GRANT SELECT, INSERT, UPDATE, DELETE, ALTER ON PAY TO rol_admin;
GRANT SELECT, INSERT, UPDATE, DELETE, ALTER ON BILL TO rol_admin;

-- Privilegio para iniciar sesión
GRANT CREATE SESSION TO rol_admin;

-- ======= PRIVILEGIOS DEL ROL CLIENTE =======
GRANT SELECT ON PRODUCTTYPE TO rol_cliente;
GRANT SELECT ON PRODUCT TO rol_cliente;
GRANT SELECT ON INVENTORY TO rol_cliente;

GRANT INSERT, SELECT ON PURCHASE TO rol_cliente;
GRANT INSERT, SELECT ON PURCHASE_DETAIL TO rol_cliente;
GRANT INSERT, SELECT ON PAY TO rol_cliente;

GRANT CREATE SESSION TO rol_cliente;

-- ======= CREACIÓN DE USUARIOS LOCALES =======
-- Usuario administrador
CREATE USER admin_TechPads IDENTIFIED BY TechPads456;
GRANT rol_admin TO admin_TechPads;

-- Usuario cliente
CREATE USER cliente_TechPads IDENTIFIED BY TechPads123;
GRANT rol_cliente TO cliente_TechPads;
