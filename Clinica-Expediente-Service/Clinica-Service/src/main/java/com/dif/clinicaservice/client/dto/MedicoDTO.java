package com.dif.clinicaservice.client.dto;

import lombok.Data;

@Data
public class MedicoDTO {
    private Long idMedico;
    private String nombre;
    private String apPaterno;
    private String apMaterno;
    private String cedulaProfesional;
    private String areaEspecialidad;
}