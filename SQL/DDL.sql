-- ==========================================================
-- DDL
-- ==========================================================
/*
    NOMBRES: 
            - VALERIA MUÑOZ GUERRERO
            - NICOLE BURBANO SOLARTE
            - JUAN CAMILO HENAO VILLEGAS
            - JUAN PABLO COLLAZOS SAMBONI
            - JESUS EDUARDO LASSO MUÑOZ
*/

-- =====================================================
-- ================ DROP TABLAS ========================
-- =====================================================
DROP TABLE INVMOVEMENT CASCADE CONSTRAINTS;
DROP TABLE BILL CASCADE CONSTRAINTS;
DROP TABLE ORDER_DETAIL CASCADE CONSTRAINTS;
DROP TABLE "ORDER" CASCADE CONSTRAINTS;
DROP TABLE CLIENT_DETAIL CASCADE CONSTRAINTS;
DROP TABLE USERS CASCADE CONSTRAINTS;
DROP TABLE INVENTORY CASCADE CONSTRAINTS;
DROP TABLE PRODUCT CASCADE CONSTRAINTS;
DROP TABLE PRODUCTTYPE CASCADE CONSTRAINTS;
DROP TABLE PROVIDER CASCADE CONSTRAINTS;
DROP TABLE CITIES CASCADE CONSTRAINTS;
DROP TABLE DEPARTMENTS CASCADE CONSTRAINTS;
DROP TABLE CART CASCADE CONSTRAINTS;

-- =====================================================
-- ================ CREATE TABLAS BASE =================
-- =====================================================

CREATE TABLE PRODUCTTYPE (
    typeCode NUMBER GENERATED ALWAYS AS IDENTITY,
    typeName VARCHAR2(100) NOT NULL,
    CONSTRAINT pk_PRODUCTTYPE PRIMARY KEY(typeCode)
);

CREATE TABLE PRODUCT (
    proCode NUMBER GENERATED ALWAYS AS IDENTITY,
    proName VARCHAR2(100) NOT NULL,
    proImg VARCHAR2(500),
    proPrice NUMBER(15,2) NOT NULL,
    proType NUMBER NOT NULL,
    descript VARCHAR2(1000),
    proMark VARCHAR2(100) NOT NULL, 
    proStatus CHAR(1) DEFAULT 'A' CHECK (proStatus IN ('A','I')),
    CONSTRAINT pk_Product PRIMARY KEY (proCode),
    CONSTRAINT fk_Product_ProType FOREIGN KEY (proType) REFERENCES PRODUCTTYPE(typeCode),
    CONSTRAINT ckc_ProPrice CHECK (proPrice > 0)
);

CREATE TABLE PROVIDER(
    provID NUMBER GENERATED ALWAYS AS IDENTITY,
    provEmail VARCHAR2(80) NOT NULL,
    provName VARCHAR2(80) NOT NULL,
    provPhone VARCHAR(10) NOT NULL,
    CONSTRAINT pk_provider PRIMARY KEY (provID),
    CONSTRAINT uq_Provider_Email UNIQUE (provEmail)
);

CREATE TABLE INVENTORY(
    invCode NUMBER GENERATED ALWAYS AS IDENTITY,
    proCode NUMBER NOT NULL,
    invStock NUMBER NOT NULL,
    sellingPrice NUMBER(15,2) NOT NULL,
    invDate DATE NOT NULL,
    invProv NUMBER NOT NULL,
    invStatus CHAR(1) DEFAULT 'A' CHECK (invStatus IN ('A','I')),
    CONSTRAINT pk_Inventory PRIMARY KEY (invCode),
    CONSTRAINT fk_Inv_Product FOREIGN KEY (proCode) REFERENCES PRODUCT(proCode),
    CONSTRAINT fk_InvProv FOREIGN KEY (invProv) REFERENCES PROVIDER(provID),
    CONSTRAINT ckc_InvStock CHECK (invStock >= 0),
    CONSTRAINT ckc_SellingPrice CHECK (sellingPrice > 0)
);


CREATE TABLE DEPARTMENTS(
    depID NUMBER GENERATED ALWAYS AS IDENTITY,
    depName VARCHAR2(100) NOT NULL,
    CONSTRAINT pk_departments PRIMARY KEY (depID),
    CONSTRAINT uq_department_name UNIQUE (depName)
);

CREATE TABLE CITIES(
    cityID NUMBER GENERATED ALWAYS AS IDENTITY,
    cityName VARCHAR2(100) NOT NULL,
    depID NUMBER NOT NULL,
    CONSTRAINT pk_cities PRIMARY KEY (cityID),
    CONSTRAINT fk_city_department FOREIGN KEY (depID) REFERENCES DEPARTMENTS(depID)
);

CREATE TABLE USERS (
    userID NUMBER GENERATED ALWAYS AS IDENTITY,
    userName VARCHAR2(30) NOT NULL,
    userPassword VARCHAR2(255) NOT NULL,
    userEmail VARCHAR2(80) NOT NULL,
    userRole VARCHAR2(20) DEFAULT 'CLIENT' CHECK (userRole IN ('ADMIN', 'CLIENT')),
    userPhone VARCHAR2(20),
    created_at DATE DEFAULT SYSDATE,
    status CHAR(1) DEFAULT 'A' CHECK (status IN ('A','I')),
    CONSTRAINT pk_User PRIMARY KEY (userID),
    CONSTRAINT uq_User_UserName UNIQUE (userName),
    CONSTRAINT uq_User_Email UNIQUE (userEmail)
);

CREATE TABLE CLIENT_DETAIL (
    userID NUMBER NOT NULL,
    firstName VARCHAR2(25) NOT NULL,
    secondName VARCHAR2(25),
    firstLastName VARCHAR2(25) NOT NULL,
    secondLastName VARCHAR2(25),
    address VARCHAR2(100) NOT NULL,
    descAddress VARCHAR2(200),
    cityID NUMBER NOT NULL,
    depID NUMBER NOT NULL,
    CONSTRAINT pk_ClientDetail PRIMARY KEY (userID),
    CONSTRAINT fk_ClientDetail_User FOREIGN KEY (userID) REFERENCES USERS(userID),
    CONSTRAINT fk_ClientDetail_City FOREIGN KEY (cityID) REFERENCES CITIES(cityID),
    CONSTRAINT fk_ClientDetail_Dep FOREIGN KEY (depID) REFERENCES DEPARTMENTS(depID)
);


CREATE TABLE "ORDER" (
    ordID NUMBER GENERATED ALWAYS AS IDENTITY,
    ordState VARCHAR2(30) NOT NULL,
    ordDate DATE NOT NULL,
    userID NUMBER NOT NULL,
    CONSTRAINT pk_Order PRIMARY KEY (ordID),
    CONSTRAINT fk_Order_User FOREIGN KEY (userID) REFERENCES USERS(userID),
    CONSTRAINT ckc_OrdState CHECK (ordState IN ('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'))
);

CREATE TABLE ORDER_DETAIL (
    ordID NUMBER NOT NULL,
    proCode NUMBER NOT NULL,
    quantity NUMBER NOT NULL,
    unitPrice NUMBER(15,2) NOT NULL,
    CONSTRAINT pk_OrderDetail PRIMARY KEY (ordID, proCode),
    CONSTRAINT fk_ODetail_Order FOREIGN KEY (ordID) REFERENCES "ORDER"(ordID),
    CONSTRAINT fk_ODetail_Product FOREIGN KEY (proCode) REFERENCES PRODUCT(proCode),
    CONSTRAINT ckc_Quantity CHECK (quantity > 0),
    CONSTRAINT ckc_UnitPrice CHECK (unitPrice > 0)
);

CREATE TABLE BILL(
    billCode NUMBER GENERATED ALWAYS AS IDENTITY,
    invCode NUMBER NOT NULL,
    ordID NUMBER NOT NULL,
    paymentType VARCHAR2(40) NOT NULL,
    billDate DATE NOT NULL,
    totalBill NUMBER(15,2) NOT NULL,
    CONSTRAINT pk_Bill PRIMARY KEY(billCode),
    CONSTRAINT fk_Bill_Inventory FOREIGN KEY (invCode) REFERENCES INVENTORY(invCode),
    CONSTRAINT fk_Bill_Order FOREIGN KEY (ordID) REFERENCES "ORDER"(ordID),
    CONSTRAINT ckc_TotalBill CHECK (totalBill > 0),
    CONSTRAINT ckc_PaymentType CHECK (paymentType IN ('EFECTIVO', 'TARJETA', 'TRANSFERENCIA'))
);

CREATE TABLE INVMOVEMENT (
    invMovID NUMBER GENERATED ALWAYS AS IDENTITY,
    invCode NUMBER NOT NULL,
    movType VARCHAR2(20) NOT NULL,
    movDate DATE DEFAULT SYSDATE NOT NULL,
    quantity NUMBER NOT NULL,
    prevStock NUMBER,
    newStock NUMBER,
    reason VARCHAR2(200),
    ordID NUMBER,
    userID NUMBER,
    CONSTRAINT pk_InvMovement PRIMARY KEY (invMovID),
    CONSTRAINT fk_IM_Inventory_MOV FOREIGN KEY (invCode) REFERENCES INVENTORY(invCode),
    CONSTRAINT fk_IM_Order_MOV FOREIGN KEY (ordID) REFERENCES "ORDER"(ordID),
    CONSTRAINT fk_IM_User_MOV FOREIGN KEY (userID) REFERENCES USERS(userID),
    CONSTRAINT ckc_MovType_MOV CHECK (movType IN ('ENTRADA', 'SALIDA', 'DEVOLUCION', 'AJUSTE')),
    CONSTRAINT ckc_Quantity_MOV CHECK (quantity > 0)
);
CREATE TABLE CART (
    cartID NUMBER GENERATED ALWAYS AS IDENTITY,
    userID NUMBER NOT NULL,
    proCode NUMBER NOT NULL,
    quantity NUMBER NOT NULL,
    addedDate DATE DEFAULT SYSDATE,
    CONSTRAINT pk_Cart PRIMARY KEY (cartID),
    CONSTRAINT fk_Cart_User FOREIGN KEY (userID) REFERENCES USERS(userID),
    CONSTRAINT fk_Cart_Product FOREIGN KEY (proCode) REFERENCES PRODUCT(proCode),
    CONSTRAINT ckc_Cart_Quantity CHECK (quantity > 0),
    CONSTRAINT uq_Cart_User_Product UNIQUE (userID, proCode)
);
