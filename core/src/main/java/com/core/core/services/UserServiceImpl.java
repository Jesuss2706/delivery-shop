package com.core.core.services;

import com.core.core.modules.ClientDetail;
import com.core.core.modules.User;
import com.core.core.repository.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.Key;
import io.jsonwebtoken.security.Keys;
import java.util.Date;
import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    // Clave secreta para JWT (mejor ponerla en application.properties)
    @Value("${jwt.secret}")
    private String jwtSecret;

    // Duración del token en milisegundos (ej. 2 horas)
    @Value("${jwt.expiration}")
    private long jwtExpirationMs;

    public UserServiceImpl(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public List<User> getAllUsersActive() {
        return userRepository.findByStatus("A");
    }

    @Override
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + id));
    }

    @Override
    public User createUser(User user) {
        // Encriptar contraseña antes de guardar
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        if (user.getStatus() == null)
            user.setStatus("A");
        return userRepository.save(user);
    }

    @Override
    public User updateUser(Long id, User user) {
        User userToUpdate = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + id));

        userToUpdate.setPhone(user.getPhone());
        userToUpdate.setEmail(user.getEmail());

        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            userToUpdate.setPassword(passwordEncoder.encode(user.getPassword()));
        }

        return userRepository.save(userToUpdate);
    }

    @Override
    public boolean deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + id));

        user.setStatus("I");
        userRepository.save(user);
        return true;
    }

    @Override
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con username: " + username));
    }

    @Override
    public String login(String username, String password) {
        User user = getUserByUsername(username);

        // Validar contraseña encriptada
        if (passwordEncoder.matches(password, user.getPassword())) {
            return generateJwtToken(user);
        }

        // Soporte temporal: aceptar password en texto plano y migrar
        if (password.equals(user.getPassword())) {
            user.setPassword(passwordEncoder.encode(password));
            userRepository.save(user); // Migramos automáticamente
            return generateJwtToken(user);
        }

        throw new RuntimeException("Credenciales incorrectas");
    }

    // =========================
    // Método para generar JWT
    // =========================

    // Método privado para obtener la clave en formato Key
    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    private String generateJwtToken(User user) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .setSubject(user.getUsername())
                .claim("userId", user.getId())
                .claim("role", user.getRole())
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // PL/SQL

    @Override
    public User createClient(User user, ClientDetail clientDetail) {
        // Validaciones
        if (clientDetail.getCity() == null || clientDetail.getCity().getCityID() == null) {
            throw new RuntimeException("City es obligatorio");
        }
        if (clientDetail.getDepartment() == null || clientDetail.getDepartment().getDepID() == null) {
            throw new RuntimeException("Department es obligatorio");
        }

        String encryptedPassword = passwordEncoder.encode(user.getPassword());

        userRepository.registrarUsuario(
                user.getUsername(),
                encryptedPassword,
                user.getEmail(),
                user.getPhone(),
                clientDetail.getFirstName(),
                clientDetail.getSecondName(),
                clientDetail.getFirstLastName(),
                clientDetail.getSecondLastName(),
                clientDetail.getAddress(),
                clientDetail.getDescAddress(),
                clientDetail.getCity().getCityID(),
                clientDetail.getDepartment().getDepID());

        User createdUser = userRepository.findByUsername(user.getUsername())
                .orElseThrow(() -> new RuntimeException("No se pudo recuperar el usuario creado"));

        return createdUser;
    }

    // Actualizar usuario mediante PL/SQL
    @Override
    public User updateClient(Long userId, User user, ClientDetail clientDetail) {

        String encryptedPassword = null;

        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            encryptedPassword = passwordEncoder.encode(user.getPassword());
        }

        userRepository.modificarUsuario(
                userId,
                user.getPhone(),
                user.getEmail(),
                encryptedPassword,
                clientDetail.getFirstName(),
                clientDetail.getSecondName(),
                clientDetail.getFirstLastName(),
                clientDetail.getSecondLastName(),
                clientDetail.getAddress(),
                clientDetail.getDescAddress(),
                clientDetail.getCity().getCityID(),
                clientDetail.getDepartment().getDepID()
        );

        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado después de actualizar"));
    }


}
