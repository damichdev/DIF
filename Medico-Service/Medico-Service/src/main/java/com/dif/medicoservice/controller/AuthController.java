package com.dif.medicoservice.controller;

import com.dif.medicoservice.dto.LoginRequestDTO;
import com.dif.medicoservice.dto.UsuarioRequestDTO;
import com.dif.medicoservice.dto.UsuarioResponseDTO;
import com.dif.medicoservice.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService auth;

    @PostMapping("/login")
    public ResponseEntity<UsuarioResponseDTO> login(@Valid @RequestBody LoginRequestDTO req) {
        return ResponseEntity.ok(auth.login(req));
    }

    @PostMapping("/personal")
    public ResponseEntity<UsuarioResponseDTO> crearPersonal(@Valid @RequestBody UsuarioRequestDTO req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(auth.crearPersonal(req));
    }
}
