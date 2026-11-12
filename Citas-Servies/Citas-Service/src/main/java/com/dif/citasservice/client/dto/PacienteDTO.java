package com.dif.citasservice.client.dto;

import lombok.Data;

@Data
public class PacienteDTO {
    private Long idPaciente;
    private String nombrePaciente;
    private String apPaterno;
    private String apMaterno;
    private String curp;
    private String telefono;
}