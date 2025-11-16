package com.core.core.services;

import com.core.core.modules.Product;

import java.util.List;

public interface ProductService {

    //Funciones normales con JPA
    List<Product> getProducts();
    Product getProduct(Long code);
    Product createProduct(Product product);
    Product updateProduct(Long code, Product product);
    boolean deleteProduct(Long code);

    //query
    List<Product> buscarProductosPorNombre(String prefix);

    //Funciones utilizando el paquete PL/SQL
    void crearProductoProcedure(Product product);
    void modificarProductoProcedure(Long code, Product product);
    void eliminarProductoProcedure(Long code);
    Product consultarProductoFunction(Long code);
    List<Product> listarProductosProcedure();
}
