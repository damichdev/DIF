package com.dif.pacienteservice.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PacienteResponseDTO {
    private Long idPaciente;
    private String nombrePaciente;
    private String apPaterno;
    private String apMaterno;
    private String curp;
    private LocalDate fechaNacimiento;
    private String telefono;
    private Long idSexo;
    private String nombreSexo;
    private Long idDerechoAmbiente;
    private String nombreDerechoAmbiente;
}