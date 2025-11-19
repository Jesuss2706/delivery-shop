package com.core.core.controllers;

import com.core.core.modules.Client;
import com.core.core.modules.ClientDetail;
import com.core.core.modules.User;
import com.core.core.modules.City;
import com.core.core.modules.Department;
import com.core.core.services.UserService;
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
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    @Lazy
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        if (users.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(users);
    }

    @GetMapping("/active")
    public ResponseEntity<List<User>> getAllActiveUsers() {
        List<User> users = userService.getAllUsersActive();
        if (users.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(users);
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<?> getUserByUsername(@PathVariable String username) {
        try {
            User user = userService.getUserByUsername(username);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("No se encontró ningún usuario con el username: " + username);
            }
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No se encontró ningún usuario con el username: " + username);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al buscar el usuario: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No se encontro ningun usuario con el id: " + id);
        }
        return ResponseEntity.ok(user);
    }

    // ============ ENDPOINTS PL/SQL ============

    @GetMapping("/plsql")
    public ResponseEntity<List<User>> getAllUsersPLSQL() {
        List<User> users = userService.getAllUsers();
        if (users.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(users);
    }

    @GetMapping("/plsql/active")
    public ResponseEntity<List<User>> getAllActiveUsersPLSQL() {
        List<User> users = userService.getAllUsersActive();
        if (users.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(users);
    }

    @GetMapping("/plsql/{id}")
    public ResponseEntity<?> getUserByIdPLSQL(@PathVariable Long id) {
        User user = userService.getUserById(id);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No se encontro ningun usuario con el id: " + id);
        }
        return ResponseEntity.ok(user);
    }

    @GetMapping("/plsql/username/{username}")
    public ResponseEntity<?> getUserByUsernamePLSQL(@PathVariable String username) {
        try {
            User user = userService.getUserByUsername(username);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("No se encontró ningún usuario con el username: " + username);
            }
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No se encontró ningún usuario con el username: " + username);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al buscar el usuario: " + e.getMessage());
        }
    }

    @PostMapping("/plsql")
    public ResponseEntity<?> createUserPLSQL(@Valid @RequestBody User user, BindingResult result) {
        if (result.hasErrors()) {
            Map<String, String> errors = result.getFieldErrors().stream()
                    .collect(Collectors.toMap(
                            fieldError -> fieldError.getField(),
                            fieldError -> fieldError.getDefaultMessage()));
            return ResponseEntity.badRequest().body(errors);
        }

        try {
            // Create default ClientDetail if not provided
            ClientDetail clientDetail = new ClientDetail();
            clientDetail.setFirstName(user.getUsername());
            clientDetail.setAddress("N/A");
            clientDetail.setDescAddress("N/A");
            
            // Set minimal required city and department (adjust based on your needs)
            // This might need to be adjusted if these are required differently
            if (clientDetail.getCity() == null) {
                City city = new City();
                city.setCityID(1L); // Default city ID - adjust as needed
                clientDetail.setCity(city);
            }
            if (clientDetail.getDepartment() == null) {
                Department department = new Department();
                department.setDepID(1L); // Default department ID - adjust as needed
                clientDetail.setDepartment(department);
            }

            User createdUser = userService.createClient(user, clientDetail);

            URI location = ServletUriComponentsBuilder
                    .fromCurrentRequest()
                    .path("/{id}")
                    .buildAndExpand(createdUser.getId())
                    .toUri();
            return ResponseEntity.created(location).body(createdUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", e.getMessage() != null ? e.getMessage() : "Error al registrar usuario")
            );
        }
    }

    @PutMapping("/plsql/{id}")
    public ResponseEntity<?> updateUserPLSQL(@PathVariable Long id, @RequestBody User user) {
        User updatedUser = userService.updateUser(id, user);

        if (updatedUser == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No se encontro ningun usuario con el id: " + id);
        }
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/plsql/{id}")
    public ResponseEntity<String> deleteUserPLSQL(@PathVariable Long id) {
        boolean deleted = userService.deleteUser(id);

        if (!deleted) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No se encontro ningun usuario con el id: " + id);
        }
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/adm")
    public ResponseEntity<?> createUserAdm(@Valid @RequestBody User user, BindingResult result) {
        if (result.hasErrors()) {
            // Extraemos todos los mensajes de error y los devolvemos
            Map<String, String> errors = result.getFieldErrors().stream()
                    .collect(Collectors.toMap(
                            fieldError -> fieldError.getField(),
                            fieldError -> fieldError.getDefaultMessage()));
            return ResponseEntity.badRequest().body(errors);
        }

        User createdUser = userService.createUser(user);

        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{code}")
                .buildAndExpand(createdUser.getId())
                .toUri();
        return ResponseEntity.created(location).body(createdUser);
    }

    @PostMapping
    public ResponseEntity<?> createClient(@Valid @RequestBody Client client, BindingResult result) {
        if (result.hasErrors()) {
            Map<String, String> errors = result.getFieldErrors().stream()
                    .collect(Collectors.toMap(
                            fieldError -> fieldError.getField(),
                            fieldError -> fieldError.getDefaultMessage()));
            return ResponseEntity.badRequest().body(errors);
        }

        try {
            User user = client.getUser();
            ClientDetail clientDetail = client.getClientDetail();

            if (user == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "El objeto 'user' es obligatorio"));
            }
            if (clientDetail == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "El objeto 'clientDetail' es obligatorio"));
            }
            if (clientDetail.getCity() == null || clientDetail.getCity().getCityID() == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "City es obligatorio y debe tener un cityID válido"));
            }
            if (clientDetail.getDepartment() == null || clientDetail.getDepartment().getDepID() == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Department es obligatorio y debe tener un depID válido"));
            }

            User createdUser = userService.createClient(user, clientDetail);

            URI location = ServletUriComponentsBuilder
                    .fromCurrentRequest()
                    .path("/{id}")
                    .buildAndExpand(createdUser.getId())
                    .toUri();

            return ResponseEntity.created(location).body(createdUser);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User user) {
        User updatedUser = userService.updateUser(id, user);

        if (updatedUser == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No se encontro ningun usuario con el id: " + id);
        }
        return ResponseEntity.ok(updatedUser);
    }

    @PutMapping("/cli/{id}")
    public ResponseEntity<?> updateClient (@PathVariable Long id, @RequestBody Client client) {
        try {


            User user = client.getUser();

            ClientDetail clientDetail = client.getClientDetail();

            User updated = userService.updateClient(id, user, clientDetail);

            return ResponseEntity.ok(updated);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        boolean deleted = userService.deleteUser(id);

        if (!deleted) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No se encontro ningun usuario con el id: " + id);
        }
        return ResponseEntity.noContent().build();
    }

}
