package com.dif.medicoservice.repository;

import com.dif.medicoservice.entity.Medico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MedicoRepository extends JpaRepository<Medico, Long> {
    Optional<Medico> findByCorreo(String correo);
    Optional<Medico> findByCedulaProfesional(String cedulaProfesional);
    boolean existsByCorreo(String correo);
    boolean existsByCedulaProfesional(String cedulaProfesional);
}