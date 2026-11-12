package com.dif.clinicaservice.client.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class CitaDTO {
    private Long idCita;
    private String motivo;
    private LocalDate fecha;
    private LocalTime hora;
    private Long idEstatus;
}