package com.dif.clinicaservice.repository;

import com.dif.clinicaservice.entity.ExpedienteClinico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ExpedienteClinicoRepository extends JpaRepository<ExpedienteClinico, Long> {
    Optional<ExpedienteClinico> findByIdPaciente(Long idPaciente);
    Optional<ExpedienteClinico> findByNoExpediente(String noExpediente);
    boolean existsByIdPaciente(Long idPaciente);
    boolean existsByNoExpediente(String noExpediente);
}