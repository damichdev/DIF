package com.dif.clinicaservice.repository;

import com.dif.clinicaservice.entity.ConsultaMedica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConsultaMedicaRepository extends JpaRepository<ConsultaMedica, Long> {
    Optional<ConsultaMedica> findByIdCita(Long idCita);
    List<ConsultaMedica> findByExpedienteClinicoIdExpedienteClinico(Long idExpediente);
}