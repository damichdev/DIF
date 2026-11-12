package com.dif.citasservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CitaRequestDTO {

    @NotBlank(message = "El motivo de la cita es obligatorio")
    private String motivo;

    @NotNull(message = "La fecha de la cita es obligatoria")
    private LocalDate fecha;

    @NotNull(message = "La hora de la cita es obligatoria")
    private LocalTime hora;

    @NotNull(message = "El ID del paciente es obligatorio")
    private Long idPaciente;

    @NotNull(message = "El ID del médico es obligatorio")
    private Long idMedico;

    @NotNull(message = "El ID de estatus es obligatorio")
    private Long idEstatus;

    private SignosVitalesDTO signosVitales;
}