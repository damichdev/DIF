package com.dif.citasservice.repository;

import com.dif.citasservice.entity.Cita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface CitaRepository extends JpaRepository<Cita, Long> {
    List<Cita> findByIdPaciente(Long idPaciente);
    List<Cita> findByIdMedico(Long idMedico);
    List<Cita> findByFechaOrderByHora(LocalDate fecha);

    // Choques de horario: ignora las citas canceladas
    boolean existsByIdMedicoAndFechaAndHoraAndEstatusIdEstatusNot(Long idMedico, LocalDate fecha, LocalTime hora, Long idEstatus);
    boolean existsByIdPacienteAndFechaAndHoraAndEstatusIdEstatusNot(Long idPaciente, LocalDate fecha, LocalTime hora, Long idEstatus);
}