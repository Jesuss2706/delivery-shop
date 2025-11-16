package com.core.core.controllers;

import com.core.core.modules.Product;
import com.core.core.services.ProductService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/product")
public class ProductController {

    @Autowired
    @Lazy
    private ProductService productService;

    //SECCION NORMAL

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        List<Product> products = productService.getProducts();
        if(products.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(products);
    }


    @GetMapping("/{code}")
    public ResponseEntity<?> getProduct(@PathVariable Long code) {
        Product product = productService.getProduct(code);
        if(product == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No se encontro el producto con el codigo: " + code);
        }
        return ResponseEntity.ok(product);
    }


    @PostMapping
    public ResponseEntity<?> createProduct(@Valid @RequestBody Product product, BindingResult result) {
        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(
                    result.getFieldErrors().stream()
                            .map(error -> "El campo '" + error.getField() + "' " + error.getDefaultMessage())
                            .toList()
            );
        }

        Product newProduct = productService.createProduct(product);

        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{code}")
                .buildAndExpand(newProduct.getProCode())
                .toUri();

        return ResponseEntity.created(location).body(newProduct);
    }


    @PutMapping("/{code}")
    public ResponseEntity<?> updateProduct(@PathVariable Long code, @Valid @RequestBody Product product, BindingResult result) {
        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(
                    result.getFieldErrors()
                            .stream()
                            .map(error -> "El campo '" + error.getField() + "' " + error.getDefaultMessage())
                            .toList()
            );
        }

        Product updProduct = productService.updateProduct(code, product);
        if (updProduct == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No se encontró el producto con el código: " + code);
        }
        return ResponseEntity.ok(updProduct);
    }


    @DeleteMapping("/{code}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long code) {
        boolean deleted = productService.deleteProduct(code);

        if(!deleted) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No se encontro el producto con el codigo: " + code);
        }
        return ResponseEntity.noContent().build();
    }

    //QUERY
    @GetMapping("/search")
    public ResponseEntity<List<Product>> searchByName(@RequestParam String prefix) {
        List<Product> products = productService.buscarProductosPorNombre(prefix);
        if(products.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(products);
    }

    //SECCION CON PL/SQL

    @PostMapping("/plsql")
    public ResponseEntity<?> createProductPlSQL(@Valid @RequestBody Product product, BindingResult result) {
        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(
                    result.getFieldErrors()
                            .stream()
                            .map(error -> "El campo '" + error.getField() + "' " + error.getDefaultMessage())
                            .toList()
            );
        }

        try {
            productService.crearProductoProcedure(product);
            return ResponseEntity.status(HttpStatus.CREATED).body(product);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al crear producto (PL/SQL): " + e.getMessage());
        }
    }


    @PutMapping("/plsql/{code}")
    public ResponseEntity<?> updateProductPLSQL(@PathVariable Long code, @Valid @RequestBody Product product, BindingResult result) {
        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(
                    result.getFieldErrors()
                            .stream()
                            .map(error -> "El campo '" + error.getField() + "' " + error.getDefaultMessage())
                            .toList()
            );
        }

        try {
            productService.modificarProductoProcedure(code, product);
            return ResponseEntity.ok("Producto actualizado correctamente mediante PL/SQL.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al actualizar producto (PL/SQL): " + e.getMessage());
        }
    }


    @DeleteMapping("/plsql/{code}")
    public ResponseEntity<?> deleteProductPLSQL(@PathVariable Long code) {
        try {
            productService.eliminarProductoProcedure(code);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al eliminar producto (PL/SQL): " + e.getMessage());
        }
    }

    @GetMapping("/plsql/{code}")
    public ResponseEntity<?> getProductPLSQL(@PathVariable Long code) {
        try {
            Product product = productService.consultarProductoFunction(code);
            if (product == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("No se encontró el producto con código (PL/SQL): " + code);
            }
            return ResponseEntity.ok(product);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al consultar producto (PL/SQL): " + e.getMessage());
        }
    }

    @GetMapping("/plsql")
    public ResponseEntity<?> listProductsPLSQL() {
        try {
            List<Product> products = productService.listarProductosProcedure();
            if (products.isEmpty()) {
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al listar productos (PL/SQL): " + e.getMessage());
        }
    }
}
