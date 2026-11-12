package com.dif.medicoservice.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsuarioResponseDTO {
    private Long idUsuario;
    private String nombre;
    private String correo;
    private String rol;
    private Long idMedico;
}
