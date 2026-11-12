package com.dif.medicoservice.service;

import com.dif.medicoservice.dto.LoginRequestDTO;
import com.dif.medicoservice.dto.UsuarioRequestDTO;
import com.dif.medicoservice.dto.UsuarioResponseDTO;
import com.dif.medicoservice.entity.Usuario;
import com.dif.medicoservice.exception.CredencialesInvalidasException;
import com.dif.medicoservice.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarios;
    private final PasswordEncoder encoder;

    @Transactional(readOnly = true)
    public UsuarioResponseDTO login(LoginRequestDTO req) {
        // Mismo error para correo inexistente y contraseña errónea: no revela qué cuentas existen
        Usuario u = usuarios.findByCorreo(req.getCorreo().trim().toLowerCase())
                .filter(x -> encoder.matches(req.getContrasena(), x.getContrasena()))
                .orElseThrow(CredencialesInvalidasException::new);
        return aDto(u);
    }

    @Transactional
    public UsuarioResponseDTO crearPersonal(UsuarioRequestDTO req) {
        String correo = req.getCorreo().trim().toLowerCase();
        if (usuarios.existsByCorreo(correo)) {
            throw new IllegalArgumentException("El correo ya está registrado");
        }
        return aDto(usuarios.save(Usuario.builder()
                .nombre(req.getNombre())
                .correo(correo)
                .contrasena(encoder.encode(req.getContrasena()))
                .rol(req.getRol())
                .build()));
    }

    private UsuarioResponseDTO aDto(Usuario u) {
        return UsuarioResponseDTO.builder()
                .idUsuario(u.getIdUsuario()).nombre(u.getNombre()).correo(u.getCorreo())
                .rol(u.getRol()).idMedico(u.getIdMedico()).build();
    }
}
