package com.leadshub.controller;

import com.leadshub.dto.AuthRequest;
import com.leadshub.dto.AuthResponse;
import com.leadshub.security.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.r2dbc.core.DatabaseClient;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final DatabaseClient databaseClient;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    public AuthController(
            DatabaseClient databaseClient,
            JwtUtil jwtUtil,
            PasswordEncoder passwordEncoder
    ) {
        this.databaseClient = databaseClient;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
    }

    // =====================
    // LOGIN
    // =====================
    @PostMapping("/login")
    public Mono<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        String email = request.getEmail().toLowerCase().trim();

        return databaseClient
                .sql("""
                        SELECT id, email, password_hash
                        FROM public.users
                        WHERE LOWER(email) = :email
                     """)
                .bind("email", email)
                .map((row, meta) -> Map.of(
                        "id", row.get("id", UUID.class),
                        "email", row.get("email", String.class),
                        "password", row.get("password_hash", String.class)
                ))
                .one()
                .switchIfEmpty(Mono.error(
                        new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials")
                ))
                .flatMap(user -> {
                    UUID userId = (UUID) user.get("id");
                    String hashedPassword = (String) user.get("password");

                    if (!passwordEncoder.matches(request.getPassword(), hashedPassword)) {
                        return Mono.error(
                                new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials")
                        );
                    }

                    String token = jwtUtil.generateToken(
                            userId.toString(),               // ✅ FIX
                            user.get("email").toString()
                    );

                    return Mono.just(
                            AuthResponse.builder()
                                    .token(token)
                                    .expiresAt(jwtUtil.getExpirationMillis()) // ✅ FIX
                                    .user(Map.of(
                                            "id", userId.toString(),
                                            "email", user.get("email").toString()
                                    ))
                                    .build()
                    );
                });
    }

    // =====================
    // REGISTER
    // =====================
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<AuthResponse> register(@Valid @RequestBody AuthRequest request) {
        String email = request.getEmail().toLowerCase().trim();

        return databaseClient
                .sql("SELECT id FROM public.users WHERE LOWER(email) = :email")
                .bind("email", email)
                .fetch()
                .one()
                .flatMap(existing -> Mono.<AuthResponse>error(
                        new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered")
                ))
                .switchIfEmpty(Mono.defer(() -> {
                    UUID userId = UUID.randomUUID();
                    String passwordHash = passwordEncoder.encode(request.getPassword());

                    return databaseClient
                            .sql("""
                                INSERT INTO public.users (id, email, password_hash)
                                VALUES (:id, :email, :password)
                            """)
                            .bind("id", userId)
                            .bind("email", email)
                            .bind("password", passwordHash)
                            .fetch()
                            .rowsUpdated()
                            .map(rows -> {
                                String token = jwtUtil.generateToken(
                                        userId.toString(),    // ✅ FIX
                                        email
                                );

                                return AuthResponse.builder()
                                        .token(token)
                                        .expiresAt(jwtUtil.getExpirationMillis()) // ✅ FIX
                                        .user(Map.of(
                                                "id", userId.toString(),
                                                "email", email
                                        ))
                                        .build();
                            });
                }));
    }
}
