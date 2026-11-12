package com.dif.citasservice.dto;

import com.dif.citasservice.client.dto.MedicoDTO;
import com.dif.citasservice.client.dto.PacienteDTO;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CitaResponseDTO {
    private Long idCita;
    private String motivo;
    private LocalDate fecha;
    private LocalTime hora;
    private Long idEstatus;
    private String nombreEstatus;
    private PacienteDTO paciente;
    private MedicoDTO medico;
    private SignosVitalesDTO signosVitales;
}