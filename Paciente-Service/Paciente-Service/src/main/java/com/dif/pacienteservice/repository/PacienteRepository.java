package com.dif.pacienteservice.repository;

import com.dif.pacienteservice.entity.Paciente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PacienteRepository extends JpaRepository<Paciente, Long> {
    Optional<Paciente> findByCurp(String curp);
    boolean existsByCurp(String curp);
}