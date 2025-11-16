package com.core.core.services;

import com.core.core.modules.Product;
import com.core.core.repository.ProductRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.ParameterMode;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.StoredProcedureQuery;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;

    public ProductServiceImpl(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @PersistenceContext
    private EntityManager entityManager;

    // Metodos normales con JPA
    @Override
    public List<Product> getProducts() {
        return productRepository.findAll();
    }

    @Override
    public Product getProduct(Long code) {
        return productRepository.findById(code)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con código: " + code));
    }

    @Override
    public Product createProduct(Product product) {
        if (product.getProCode() != null && productRepository.existsById(product.getProCode())) {
            throw new RuntimeException("Ya existe un producto con el código " + product.getProCode());
        }

        return productRepository.save(product);
    }

    @Override
    public Product updateProduct(Long code, Product product) {
    Product existingProduct = productRepository.findById(code).orElse(null);
    if (existingProduct != null) {
        existingProduct.setProName(product.getProName());
        existingProduct.setProImg(product.getProImg());
        existingProduct.setProPrice(product.getProPrice());
        existingProduct.setDescript(product.getDescript());
        existingProduct.setProMark(product.getProMark());
        existingProduct.setStatus(product.getStatus()); 
        existingProduct.setProductType(product.getProductType());
        return productRepository.save(existingProduct);
    }
    return null;
}

    @Override
    public boolean deleteProduct(Long code) {
        Optional<Product> existing = productRepository.findById(code);
        if (existing.isPresent()) {
            productRepository.deleteById(code);
            return true;
        }
        return false;
    }

    //query
    @Override
    public List<Product> buscarProductosPorNombre(String prefix){
        return productRepository.searchByName(prefix);
    }

    // Metodos utilizando PL/SQL
    @Override
    public void crearProductoProcedure(Product product) {
        productRepository.crearProducto(
                product.getProName(),
                product.getProImg(),
                product.getProPrice(),
                product.getProductType().getTypeCode(),
                product.getDescript(),
                product.getProMark(),
                product.getStatus() != null ? product.getStatus() : "A" // valor por defecto 'A'
        );
    }

    @Override
    public void modificarProductoProcedure(Long code, Product product) {
        productRepository.modificarProducto(
                code,
                product.getProName(),
                product.getProImg(),
                product.getProPrice(),
                product.getProductType().getTypeCode(),
                product.getDescript(),
                product.getProMark(),
                product.getStatus() != null ? product.getStatus() : "A" // opcional
        );
    }

    @Override
    public void eliminarProductoProcedure(Long code) {
        productRepository.eliminarProducto(code);
    }

    @Override
    public Product consultarProductoFunction(Long code) {
        StoredProcedureQuery query = entityManager
                .createStoredProcedureQuery("GESTION_PRODUCTO.CONSULTAR_PRODUCTO", Product.class)
                .registerStoredProcedureParameter("v_proCode", Long.class, ParameterMode.IN)
                .setParameter("v_proCode", code);

        return (Product) query.getSingleResult();
    }

    @Override
    public List<Product> listarProductosProcedure() {
        // El procedure LISTAR_PRODUCTOS solo usa DBMS_OUTPUT,
        // por lo tanto retornamos todos los productos desde JPA.
        return productRepository.findAll();
    }

}
