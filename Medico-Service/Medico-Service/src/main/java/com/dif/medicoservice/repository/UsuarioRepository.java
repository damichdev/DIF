package com.dif.medicoservice.repository;

import com.dif.medicoservice.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByCorreo(String correo);
    Optional<Usuario> findByIdMedico(Long idMedico);
    boolean existsByCorreo(String correo);
}
