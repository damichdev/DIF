package com.dif.medicoservice.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicoResponseDTO {
    private Long idMedico;
    private String nombre;
    private String apPaterno;
    private String apMaterno;
    private String cedulaProfesional;
    private String areaEspecialidad;
    private String correo;
}