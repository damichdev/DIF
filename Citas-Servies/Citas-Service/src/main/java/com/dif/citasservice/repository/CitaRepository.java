package com.dif.citasservice.repository;

import com.dif.citasservice.entity.Cita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface CitaRepository extends JpaRepository<Cita, Long> {
    List<Cita> findByIdPaciente(Long idPaciente);
    List<Cita> findByIdMedico(Long idMedico);
    List<Cita> findByFecha(LocalDate fecha);
}